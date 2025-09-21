import logging
import pandas as pd
import numpy as np
from flask import Blueprint, jsonify, request
from algorithm.astar_solver import run_astar_solver
import os

algorithm_bp = Blueprint('algorithm_bp', __name__)
logger = logging.getLogger(__name__)

# Load the OSM data once when the module is imported
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'OSM-NTL-CRIME_combined.csv')
EDGES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'edges.csv')
osm_data = None
edges_data = None

def load_osm_data():
    global osm_data
    if osm_data is None:
        try:
            osm_data = pd.read_csv(DATA_PATH)
            logger.info(f"Loaded OSM data with {len(osm_data)} nodes")
        except Exception as e:
            logger.error(f"Failed to load OSM data: {e}")
            raise
    return osm_data

def load_edges_data():
    global edges_data
    if edges_data is None:
        try:
            edges_data = pd.read_csv(EDGES_PATH)
            logger.info(f"Loaded edges data with {len(edges_data)} edges")
        except Exception as e:
            logger.error(f"Failed to load edges data: {e}")
            raise
    return edges_data

def create_circular_bounds(start_lat, start_lon, end_lat, end_lon, buffer_factor=1.6):
    """
    Create a circular bounding region around start and end points
    
    Args:
        start_lat, start_lon: Start coordinates
        end_lat, end_lon: End coordinates  
        buffer_factor: How much to expand the circle (1.6 = 60% larger than direct distance)
    
    Returns:
        dict with circle parameters for filtering
    """
    # Calculate midpoint
    mid_lat = (start_lat + end_lat) / 2
    mid_lon = (start_lon + end_lon) / 2
    
    # Calculate distance between start and end points
    direct_distance = haversine_distance(start_lat, start_lon, end_lat, end_lon)
    
    # Radius is half the distance plus buffer
    radius = (direct_distance / 2) * buffer_factor
    
    return {
        'center_lat': mid_lat,
        'center_lon': mid_lon,
        'radius': radius,
        'direct_distance': direct_distance
    }

def point_in_circle(lat, lon, bounds):
    """Check if a point is within the circular bounds"""
    distance = haversine_distance(lat, lon, bounds['center_lat'], bounds['center_lon'])
    return distance <= bounds['radius']

def extract_path_coordinates(path_nodes, node_df):
    """Extract lat/lon coordinates for a list of node indices"""
    try:
        # Get coordinates for the path nodes
        coords = node_df.loc[path_nodes, ["lat", "lon"]]
        # Convert to list of [lat, lon] pairs
        coordinates = coords.values.tolist()
        return coordinates
    except Exception as e:
        logger.error(f"Error extracting coordinates for path: {e}")
        return []

def process_algorithm_results(results, node_df, node_mapping=None):
    """Process algorithm results to include coordinates for each path"""
    processed_results = []
    
    for path_result in results:
        try:
            # Extract the path nodes (these are compact indices if remapping was used)
            compact_path = path_result.get('path', [])
            
            # Convert compact indices back to original indices if mapping exists
            if node_mapping and 'new_to_old' in node_mapping:
                new_to_old = node_mapping['new_to_old']
                original_path = [new_to_old[compact_idx] for compact_idx in compact_path]
                logger.info(f"Remapped path: {compact_path[:3]}...{compact_path[-3:]} -> {original_path[:3]}...{original_path[-3:]}")
            else:
                original_path = compact_path
            
            # Get coordinates for all nodes in the path using original indices
            path_coordinates = extract_path_coordinates(original_path, node_df)
            
            # Create enhanced result with coordinates
            enhanced_result = {
                'name': path_result.get('name', ''),
                'path_nodes': original_path,  # Original indices for frontend
                'path_coordinates': path_coordinates,
                'time': path_result.get('time', 0),
                'dark': path_result.get('dark', 0),
                'path_length': len(original_path)
            }
            
            processed_results.append(enhanced_result)
            
        except Exception as e:
            logger.error(f"Error processing path result: {e}")
            # Include original result if processing fails
            processed_results.append(path_result)
    
    return processed_results

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the earth in meters"""
    from math import radians, cos, sin, asin, sqrt
    
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371000  # Radius of earth in meters
    return c * r

def find_closest_node(target_lat, target_lon, df):
    """Find the closest OSM node to the given coordinates"""
    distances = df.apply(
        lambda row: haversine_distance(target_lat, target_lon, row['lat'], row['lon']), 
        axis=1
    )
    closest_idx = distances.idxmin()
    closest_distance = distances.iloc[closest_idx]
    return closest_idx, closest_distance

def prepare_algorithm_data(start_lat, start_lon, end_lat, end_lon):
    """Prepare data for the A* algorithm from lat/lng coordinates"""
    df = load_osm_data()
    
    # Create circular bounds to filter the graph
    bounds = create_circular_bounds(start_lat, start_lon, end_lat, end_lon)
    logger.info(f"Created circular bounds: center=({bounds['center_lat']:.4f}, {bounds['center_lon']:.4f}), radius={bounds['radius']:.0f}m")
    
    # Find closest nodes to start and end points in the full dataset
    start_idx, start_dist = find_closest_node(start_lat, start_lon, df)
    end_idx, end_dist = find_closest_node(end_lat, end_lon, df)
    
    logger.info(f"Start point ({start_lat}, {start_lon}) -> node {start_idx} (distance: {start_dist:.2f}m)")
    logger.info(f"End point ({end_lat}, {end_lon}) -> node {end_idx} (distance: {end_dist:.2f}m)")
    
    # Keep original dataset size and all original node indices
    N = len(df)
    
    # Extract light values (NTL column) from full dataset
    light = df['NTL'].tolist()
    
    # Extract crime data from full dataset
    crime = df['near_crime_100m'].fillna(False).astype(int).tolist()
    
    # Identify nodes within circular bounds for edge filtering
    df['in_bounds'] = df.apply(
        lambda row: point_in_circle(row['lat'], row['lon'], bounds), 
        axis=1
    )
    nodes_in_bounds = set(df[df['in_bounds']].index)
    
    # Always include start and end nodes in bounds
    nodes_in_bounds.add(start_idx)
    nodes_in_bounds.add(end_idx)
    
    logger.info(f"Nodes in bounds: {len(nodes_in_bounds)} out of {len(df)} ({len(nodes_in_bounds)/len(df)*100:.1f}%)")
    
    # CREATE COMPACT REMAPPING - This is the key optimization!
    nodes_list = sorted(list(nodes_in_bounds))  # [84138, 84137, 67404, ...]
    old_to_new = {old_idx: new_idx for new_idx, old_idx in enumerate(nodes_list)}
    new_to_old = {new_idx: old_idx for old_idx, new_idx in old_to_new.items()}
    
    # COMPACT DATA ARRAYS - Only keep data for participating nodes
    compact_N = len(nodes_list)
    compact_light = [light[old_idx] for old_idx in nodes_list]
    compact_crime = [crime[old_idx] for old_idx in nodes_list]
    
    logger.info(f"Remapped {N} nodes -> {compact_N} compact nodes ({compact_N/N*100:.2f}%)")
    
    # Load and remap edges
    edges_df = load_edges_data()
    
    # Filter edges to only include those where both nodes are within bounds
    valid_edges = edges_df[
        (edges_df['u_idx'].isin(nodes_in_bounds)) & 
        (edges_df['v_idx'].isin(nodes_in_bounds))
    ]
    
    # REMAP EDGES to use compact indices
    compact_edges = []
    for _, edge in valid_edges.iterrows():
        u_old, v_old, weight = edge['u_idx'], edge['v_idx'], edge['length_m']
        if u_old in old_to_new and v_old in old_to_new:
            u_new = old_to_new[u_old]
            v_new = old_to_new[v_old]
            compact_edges.append([u_new, v_new, weight])
    
    M = len(compact_edges)
    logger.info(f"Remapped edges: {len(edges_df)} -> {len(valid_edges)} -> {M} compact edges")
    
    # Remap start and end indices
    compact_start = old_to_new[start_idx]
    compact_end = old_to_new[end_idx]
    
    logger.info(f"Remapped indices: start {start_idx}->{compact_start}, end {end_idx}->{compact_end}")
    
    return {
        'N': compact_N,  # Now ~493 instead of 100k!
        'M': M,
        'light': compact_light,  # Compact array
        'crime': compact_crime,  # Compact array
        'input': compact_edges,  # Edges with remapped indices
        's': compact_start,      # Remapped start (e.g., 0)
        't': compact_end,        # Remapped end (e.g., 245)
        'start_coords': (df.iloc[start_idx]['lat'], df.iloc[start_idx]['lon']),
        'end_coords': (df.iloc[end_idx]['lat'], df.iloc[end_idx]['lon']),
        'start_distance': start_dist,
        'end_distance': end_dist,
        'node_mapping': {
            'old_to_new': old_to_new,
            'new_to_old': new_to_old,
            'nodes_list': nodes_list,
            'original_N': N,
            'compact_N': compact_N
        },
        'bounds_info': {
            'center': (bounds['center_lat'], bounds['center_lon']),
            'radius': bounds['radius'],
            'nodes_in_bounds': len(nodes_in_bounds),
            'edges_filtered': M
        }
    }

@algorithm_bp.route('/api/algorithm/find-path', methods=['POST'])
def find_path_from_coordinates():
    """Find optimal path between two lat/lng coordinates"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON payload'}), 400
    
    required_params = ['start_lat', 'start_lon', 'end_lat', 'end_lon']
    missing_params = [p for p in required_params if p not in data]
    if missing_params:
        return jsonify({'error': f'Missing required parameters: {", ".join(missing_params)}'}), 400
    
    try:
        # Prepare algorithm input data
        algo_data = prepare_algorithm_data(
            data['start_lat'], data['start_lon'],
            data['end_lat'], data['end_lon']
        )
        logger.info(f"Prepared algorithm data: N={algo_data['N']}, M={algo_data['M']}, start_node={algo_data['s']}, end_node={algo_data['t']}")
        # Run the A* algorithm
        results = run_astar_solver(
            algo_data['N'],
            algo_data['M'], 
            algo_data['light'],
            algo_data['crime'],
            algo_data['input'],
            algo_data['s'],
            algo_data['t']
        )
        
        # Get the node dataframe for coordinate extraction
        node_df = load_osm_data()
        
        # Process results to include coordinates (with node remapping)
        processed_paths = process_algorithm_results(results, node_df, algo_data.get('node_mapping'))
        
        return jsonify({
            'status': 'success',
            'start_node': {
                'index': algo_data['s'],  # This is now compact index
                'original_index': algo_data['node_mapping']['new_to_old'][algo_data['s']],
                'coordinates': algo_data['start_coords'],
                'distance_from_input': algo_data['start_distance']
            },
            'end_node': {
                'index': algo_data['t'],  # This is now compact index
                'original_index': algo_data['node_mapping']['new_to_old'][algo_data['t']],
                'coordinates': algo_data['end_coords'],
                'distance_from_input': algo_data['end_distance']
            },
            'algorithm_input': {
                'N': algo_data['N'],  # Compact N (~493)
                'M': algo_data['M']
            },
            'optimization': {
                'original_nodes': algo_data['node_mapping']['original_N'],
                'compact_nodes': algo_data['node_mapping']['compact_N'],
                'compression_ratio': round(algo_data['node_mapping']['compact_N'] / algo_data['node_mapping']['original_N'], 4),
                'bounds_center': algo_data['bounds_info']['center'],
                'bounds_radius': algo_data['bounds_info']['radius']
            },
            'paths': processed_paths
        })
        
    except Exception as e:
        logger.error(f"Error in find_path_from_coordinates: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@algorithm_bp.route('/api/algorithm/run-astar', methods=['POST'])
def run_astar_endpoint():
    """Original endpoint for direct algorithm input"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON payload'}), 400
    required_params = ['N', 'M', 'light', 'crime', 'input', 's', 't']
    missing_params = [p for p in required_params if p not in data]
    if missing_params:
        return jsonify({'error': f'Missing required parameters: {", ".join(missing_params)}'}), 400

    try:
        results = run_astar_solver(
            data['N'],
            data['M'],
            data['light'],
            data['crime'],
            data['input'],
            data['s'],
            data['t']
        )

        # Get the node dataframe for coordinate extraction
        node_df = load_osm_data()
        
        # Process results to include coordinates (no remapping for direct input)
        processed_paths = process_algorithm_results(results, node_df, None)

        return jsonify({
            'status': 'success',
            'results': processed_paths
        })

    except (TypeError, ValueError) as e:
        logger.error(f"Data type error calling Cython module: {e}")
        return jsonify({'error': 'Invalid data types in request payload', 'details': str(e)}), 400
    except Exception as e:
        logger.error(f"An unexpected error occurred in the A* solver: {e}")
        return jsonify({'error': 'An internal error occurred in the solver', 'details': str(e)}), 500