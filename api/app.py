"""
Crime Data API for Navigation Safety
PennApps Hackathon Project

This API aggregates crime data from multiple sources to provide
real-time safety information for navigation algorithms.
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta
import requests

# Import our custom modules
from crime_data_service import CrimeDataService
from utils.cache_manager import CacheManager
from utils.rate_limiter import RateLimiter

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize services
crime_service = CrimeDataService()
cache_manager = CacheManager()
rate_limiter = RateLimiter()

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Crime Data API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/crime/nearby', methods=['GET'])
def get_nearby_crimes():
    """
    Get crime incidents near a specific location
    
    Query Parameters:
    - lat: Latitude (required)
    - lng: Longitude (required)
    - radius: Search radius in meters (default: 1000)
    - hours: Time window in hours (default: 24)
    - severity: Filter by crime severity (optional)
    """
    try:
        # Rate limiting
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({'error': 'Rate limit exceeded'}), 429
        
        # Validate required parameters
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        
        if lat is None or lng is None:
            return jsonify({
                'error': 'Missing required parameters: lat and lng'
            }), 400
        
        # Optional parameters
        radius = request.args.get('radius', default=1000, type=int)
        hours = request.args.get('hours', default=24, type=int)
        severity = request.args.get('severity', type=str)
        
        # Validate ranges
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return jsonify({'error': 'Invalid coordinates'}), 400
        
        if radius > 10000:  # Max 10km radius
            return jsonify({'error': 'Radius too large (max 10000m)'}), 400
        
        # Check cache first
        cache_key = f"crimes_{lat}_{lng}_{radius}_{hours}_{severity}"
        cached_result = cache_manager.get(cache_key)
        
        if cached_result:
            logger.info(f"Cache hit for location ({lat}, {lng})")
            return jsonify(cached_result)
        
        # Fetch crime data
        crime_data = crime_service.get_nearby_crimes(
            lat=lat,
            lng=lng,
            radius=radius,
            hours=hours,
            severity=severity
        )
        
        # Cache the result
        cache_manager.set(cache_key, crime_data)
        
        logger.info(f"Fetched {len(crime_data.get('incidents', []))} crimes for ({lat}, {lng})")
        return jsonify(crime_data)
        
    except Exception as e:
        logger.error(f"Error in get_nearby_crimes: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/crime/route-safety', methods=['POST'])
def analyze_route_safety():
    """
    Analyze safety along a route
    
    Request Body:
    {
        "waypoints": [
            {"lat": 39.9526, "lng": -75.1652},
            {"lat": 39.9500, "lng": -75.1667}
        ],
        "buffer_meters": 500,
        "time_window_hours": 24
    }
    """
    try:
        # Rate limiting
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({'error': 'Rate limit exceeded'}), 429
        
        data = request.get_json()
        if not data or 'waypoints' not in data:
            return jsonify({'error': 'Missing waypoints in request body'}), 400
        
        waypoints = data['waypoints']
        buffer_meters = data.get('buffer_meters', 500)
        time_window_hours = data.get('time_window_hours', 24)
        
        # Validate waypoints
        if not isinstance(waypoints, list) or len(waypoints) < 2:
            return jsonify({'error': 'At least 2 waypoints required'}), 400
        
        # Analyze route safety
        safety_analysis = crime_service.analyze_route_safety(
            waypoints=waypoints,
            buffer_meters=buffer_meters,
            time_window_hours=time_window_hours
        )
        
        return jsonify(safety_analysis)
        
    except Exception as e:
        logger.error(f"Error in analyze_route_safety: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/crime/hotspots', methods=['GET'])
def get_crime_hotspots():
    """
    Get crime hotspots in a given area
    
    Query Parameters:
    - lat: Center latitude
    - lng: Center longitude
    - radius: Search radius in meters
    - days: Time window in days (default: 7)
    """
    try:
        # Rate limiting
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({'error': 'Rate limit exceeded'}), 429
        
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', default=2000, type=int)
        days = request.args.get('days', default=7, type=int)
        
        if lat is None or lng is None:
            return jsonify({'error': 'Missing required parameters: lat and lng'}), 400
        
        hotspots = crime_service.get_crime_hotspots(
            lat=lat,
            lng=lng,
            radius=radius,
            days=days
        )
        
        return jsonify(hotspots)
        
    except Exception as e:
        logger.error(f"Error in get_crime_hotspots: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/crime/stats', methods=['GET'])
def get_crime_statistics():
    """
    Get crime statistics for an area
    
    Query Parameters:
    - lat: Latitude
    - lng: Longitude
    - radius: Search radius in meters
    - days: Time window in days
    """
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', default=1000, type=int)
        days = request.args.get('days', default=30, type=int)
        
        if lat is None or lng is None:
            return jsonify({'error': 'Missing required parameters: lat and lng'}), 400
        
        stats = crime_service.get_crime_statistics(
            lat=lat,
            lng=lng,
            radius=radius,
            days=days
        )
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error in get_crime_statistics: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/debug/philadelphia-data', methods=['GET'])
def debug_philadelphia_data():
    """Debug endpoint to check Philadelphia API directly"""
    try:
        # Test the Philadelphia API directly
        test_query = """
        SELECT COUNT(*) as total_crimes,
               MAX(dispatch_date_time) as latest_crime,
               MIN(dispatch_date_time) as earliest_crime
        FROM incidents_part1_part2 
        WHERE dispatch_date_time >= '2024-01-01'
        """
        
        response = requests.get(
            'https://phl.carto.com/api/v2/sql',
            params={'q': test_query, 'format': 'json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'philadelphia_api_status': 'working',
                'data': data,
                'raw_response': response.text[:500]  # First 500 chars
            })
        else:
            return jsonify({
                'philadelphia_api_status': 'error',
                'status_code': response.status_code,
                'response': response.text[:500]
            })
            
    except Exception as e:
        return jsonify({
            'philadelphia_api_status': 'exception',
            'error': str(e)
        })

@app.route('/api/debug/check-columns', methods=['GET'])
def debug_check_columns():
    """Debug endpoint to check available columns"""
    try:
        # Query to get column information
        query = "SELECT * FROM incidents_part1_part2 LIMIT 1"
        
        response = requests.get(
            'https://phl.carto.com/api/v2/sql',
            params={'q': query, 'format': 'json'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'status': 'success',
                'columns': list(data.get('fields', {}).keys()),
                'sample_row': data.get('rows', [{}])[0] if data.get('rows') else {},
                'field_info': data.get('fields', {})
            })
        else:
            return jsonify({
                'status': 'error',
                'status_code': response.status_code,
                'response': response.text[:500]
            })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        })

@app.route('/api/crimes/all', methods=['GET'])
def get_all_crimes():
    """
    Get all Philadelphia crimes with comprehensive data
    
    Query Parameters:
    - format: 'json' (default) or 'csv'
    - limit: max number of records (default: 10000, max: 50000)
    - start_date: start date filter (YYYY-MM-DD format)
    - end_date: end date filter (YYYY-MM-DD format)
    - crime_type: filter by specific crime type
    - district: filter by police district
    """
    try:
        # Get query parameters
        format_type = request.args.get('format', 'json').lower()
        limit = min(int(request.args.get('limit', 10000)), 50000)
        start_date = request.args.get('start_date', '2024-01-01')
        end_date = request.args.get('end_date', '2025-12-31')
        crime_type = request.args.get('crime_type')
        district = request.args.get('district')
        
        # Build SQL query
        query = f"""
        SELECT 
            objectid as crime_id,
            dispatch_date_time as datetime,
            dispatch_date as date,
            dispatch_time as time,
            hour as hour,
            text_general_code as crime_type,
            ucr_general as ucr_code,
            location_block as address,
            point_y as latitude,
            point_x as longitude,
            dc_dist as district,
            psa as police_service_area,
            dc_key as incident_key
        FROM incidents_part1_part2 
        WHERE dispatch_date_time >= '{start_date}T00:00:00'
        AND dispatch_date_time <= '{end_date}T23:59:59'
        AND point_x IS NOT NULL 
        AND point_y IS NOT NULL
        AND point_x != 0 
        AND point_y != 0
        AND point_y BETWEEN 39.8 AND 40.2
        AND point_x BETWEEN -75.4 AND -74.9
        """
        
        # Add optional filters
        if crime_type:
            query += f" AND text_general_code ILIKE '%{crime_type}%'"
        if district:
            query += f" AND dc_dist = '{district}'"
            
        query += f" ORDER BY dispatch_date_time DESC LIMIT {limit}"
        
        # Execute query
        response = requests.get(
            'https://phl.carto.com/api/v2/sql',
            params={'q': query, 'format': 'json'},
            timeout=30
        )
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch crime data'}), 500
            
        data = response.json()
        crimes = data.get('rows', [])
        
        # Process and enhance the data
        processed_crimes = []
        for crime in crimes:
            processed_crime = {
                'crime_id': crime.get('crime_id'),
                'datetime': crime.get('datetime'),
                'date': crime.get('date'),
                'time': crime.get('time'),
                'hour': crime.get('hour'),
                'crime_type': crime.get('crime_type', '').title(),
                'crime_category': _categorize_crime(crime.get('crime_type', '')),
                'severity': _get_crime_severity(crime.get('crime_type', '')),
                'address': crime.get('address', ''),
                'latitude': float(crime.get('latitude', 0)) if crime.get('latitude') else None,
                'longitude': float(crime.get('longitude', 0)) if crime.get('longitude') else None,
                'district': crime.get('district'),
                'police_service_area': crime.get('police_service_area'),
                'incident_key': crime.get('incident_key')
            }
            
            # Add derived fields useful for frontend
            if processed_crime['latitude'] and processed_crime['longitude']:
                processed_crime['coordinates'] = [processed_crime['longitude'], processed_crime['latitude']]  # GeoJSON format
                
            processed_crimes.append(processed_crime)
        
        # Return based on format
        if format_type == 'csv':
            # Convert to CSV format
            import io
            import csv
            
            output = io.StringIO()
            if processed_crimes:
                fieldnames = processed_crimes[0].keys()
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                for crime in processed_crimes:
                    # Handle coordinates field for CSV
                    csv_crime = crime.copy()
                    if 'coordinates' in csv_crime:
                        del csv_crime['coordinates']
                    writer.writerow(csv_crime)
            
            return Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment; filename=philadelphia_crimes_{start_date}_to_{end_date}.csv'}
            )
        else:
            # Return JSON
            return jsonify({
                'status': 'success',
                'total_crimes': len(processed_crimes),
                'query_parameters': {
                    'start_date': start_date,
                    'end_date': end_date,
                    'limit': limit,
                    'crime_type': crime_type,
                    'district': district
                },
                'crimes': processed_crimes,
                'summary': {
                    'crime_types': _get_crime_type_summary(processed_crimes),
                    'districts': _get_district_summary(processed_crimes),
                    'severity_breakdown': _get_severity_breakdown(processed_crimes),
                    'date_range': {
                        'earliest': min([c['datetime'] for c in processed_crimes]) if processed_crimes else None,
                        'latest': max([c['datetime'] for c in processed_crimes]) if processed_crimes else None
                    }
                }
            })
            
    except Exception as e:
        logger.error(f"Error in get_all_crimes: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/crimes/recent', methods=['GET'])
def get_recent_crimes():
    """
    Get recent Philadelphia crimes (last 24-48 hours)
    
    Query Parameters:
    - hours: number of hours back to look (default: 24, max: 168)
    - format: 'json' (default) or 'csv'
    - limit: max number of records (default: 1000, max: 5000)
    - severity: filter by severity ('high', 'medium', 'low')
    - live: if 'true', gets crimes from last 6 hours only
    """
    try:
        # Get query parameters
        hours = min(int(request.args.get('hours', 24)), 168)  # Max 1 week
        format_type = request.args.get('format', 'json').lower()
        limit = min(int(request.args.get('limit', 1000)), 5000)
        severity_filter = request.args.get('severity')
        live_mode = request.args.get('live', 'false').lower() == 'true'
        
        # Adjust hours for live mode
        if live_mode:
            hours = 6
            
        # Calculate time window
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        # Build SQL query for recent crimes
        query = f"""
        SELECT 
            objectid as crime_id,
            dispatch_date_time as datetime,
            dispatch_date as date,
            dispatch_time as time,
            hour as hour,
            text_general_code as crime_type,
            ucr_general as ucr_code,
            location_block as address,
            point_y as latitude,
            point_x as longitude,
            dc_dist as district,
            psa as police_service_area,
            dc_key as incident_key
        FROM incidents_part1_part2 
        WHERE dispatch_date_time >= '{start_time.strftime('%Y-%m-%dT%H:%M:%S')}'
        AND dispatch_date_time <= '{end_time.strftime('%Y-%m-%dT%H:%M:%S')}'
        AND point_x IS NOT NULL 
        AND point_y IS NOT NULL
        AND point_x != 0 
        AND point_y != 0
        AND point_y BETWEEN 39.8 AND 40.2
        AND point_x BETWEEN -75.4 AND -74.9
        ORDER BY dispatch_date_time DESC
        LIMIT {limit}
        """
        
        # Execute query
        response = requests.get(
            'https://phl.carto.com/api/v2/sql',
            params={'q': query, 'format': 'json'},
            timeout=15
        )
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch recent crime data'}), 500
            
        data = response.json()
        crimes = data.get('rows', [])
        
        # Process and enhance the data
        processed_crimes = []
        for crime in crimes:
            processed_crime = {
                'crime_id': crime.get('crime_id'),
                'datetime': crime.get('datetime'),
                'date': crime.get('date'),
                'time': crime.get('time'),
                'hour': crime.get('hour'),
                'crime_type': crime.get('crime_type', '').title(),
                'crime_category': _categorize_crime(crime.get('crime_type', '')),
                'severity': _get_crime_severity(crime.get('crime_type', '')),
                'address': crime.get('address', ''),
                'latitude': float(crime.get('latitude', 0)) if crime.get('latitude') else None,
                'longitude': float(crime.get('longitude', 0)) if crime.get('longitude') else None,
                'district': crime.get('district'),
                'police_service_area': crime.get('police_service_area'),
                'incident_key': crime.get('incident_key'),
                'minutes_ago': _calculate_minutes_ago(crime.get('datetime')),
                'is_breaking': _calculate_minutes_ago(crime.get('datetime')) < 60  # Less than 1 hour ago
            }
            
            # Add coordinates in GeoJSON format for mapping
            if processed_crime['latitude'] and processed_crime['longitude']:
                processed_crime['coordinates'] = [processed_crime['longitude'], processed_crime['latitude']]
                
            processed_crimes.append(processed_crime)
        
        # Filter by severity if requested
        if severity_filter:
            processed_crimes = [c for c in processed_crimes if c['severity'].lower() == severity_filter.lower()]
        
        # Return based on format
        if format_type == 'csv':
            # Convert to CSV format
            import io
            import csv
            
            output = io.StringIO()
            if processed_crimes:
                fieldnames = [k for k in processed_crimes[0].keys() if k != 'coordinates']
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                for crime in processed_crimes:
                    csv_crime = {k: v for k, v in crime.items() if k != 'coordinates'}
                    writer.writerow(csv_crime)
            
            return Response(
                output.getvalue(),
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment; filename=philadelphia_recent_crimes_{hours}h.csv'}
            )
        else:
            # Return JSON with real-time insights
            return jsonify({
                'status': 'success',
                'query_info': {
                    'hours_back': hours,
                    'live_mode': live_mode,
                    'time_window': {
                        'start': start_time.isoformat(),
                        'end': end_time.isoformat()
                    }
                },
                'total_recent_crimes': len(processed_crimes),
                'breaking_news_count': len([c for c in processed_crimes if c.get('is_breaking')]),
                'crimes': processed_crimes,
                'real_time_summary': {
                    'most_recent_crime': processed_crimes[0] if processed_crimes else None,
                    'crime_types_active': _get_crime_type_summary(processed_crimes),
                    'severity_breakdown': _get_severity_breakdown(processed_crimes),
                    'active_districts': _get_district_summary(processed_crimes),
                    'hourly_pattern': _get_hourly_pattern(processed_crimes)
                },
                'alerts': _generate_real_time_alerts(processed_crimes),
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Error in get_recent_crimes: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

# Helper functions for crime data processing
def _categorize_crime(crime_type):
    """Categorize crime into broad categories"""
    crime_type = crime_type.upper()
    
    if any(word in crime_type for word in ['HOMICIDE', 'MURDER']):
        return 'violent'
    elif any(word in crime_type for word in ['RAPE', 'SEXUAL']):
        return 'violent'
    elif any(word in crime_type for word in ['ROBBERY', 'ARMED']):
        return 'violent'
    elif any(word in crime_type for word in ['ASSAULT', 'BATTERY']):
        return 'violent'
    elif any(word in crime_type for word in ['BURGLARY', 'BREAKING']):
        return 'property'
    elif any(word in crime_type for word in ['THEFT', 'LARCENY', 'STOLEN']):
        return 'property'
    elif any(word in crime_type for word in ['VEHICLE', 'AUTO']):
        return 'property'
    elif any(word in crime_type for word in ['DRUG', 'NARCOTIC']):
        return 'drug'
    elif any(word in crime_type for word in ['VANDALISM', 'DAMAGE']):
        return 'property'
    else:
        return 'other'

def _get_crime_severity(crime_type):
    """Get severity level for crime type"""
    crime_type = crime_type.upper()
    
    # High severity crimes
    if any(word in crime_type for word in ['HOMICIDE', 'MURDER', 'RAPE', 'ROBBERY', 'ARMED']):
        return 'high'
    # Medium severity crimes
    elif any(word in crime_type for word in ['ASSAULT', 'BURGLARY', 'VEHICLE', 'AUTO']):
        return 'medium'
    # Low severity crimes
    else:
        return 'low'

def _calculate_minutes_ago(datetime_str):
    """Calculate minutes since crime occurred"""
    if not datetime_str:
        return None
    
    try:
        crime_time = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        now = datetime.now(crime_time.tzinfo) if crime_time.tzinfo else datetime.now()
        diff = now - crime_time
        return int(diff.total_seconds() / 60)
    except:
        return None

def _get_crime_type_summary(crimes):
    """Get summary of crime types"""
    crime_counts = {}
    for crime in crimes:
        crime_type = crime.get('crime_type', 'Unknown')
        crime_counts[crime_type] = crime_counts.get(crime_type, 0) + 1
    
    return dict(sorted(crime_counts.items(), key=lambda x: x[1], reverse=True))

def _get_district_summary(crimes):
    """Get summary of crimes by district"""
    district_counts = {}
    for crime in crimes:
        district = crime.get('district', 'Unknown')
        if district:
            district_counts[district] = district_counts.get(district, 0) + 1
    
    return dict(sorted(district_counts.items(), key=lambda x: x[1], reverse=True))

def _get_severity_breakdown(crimes):
    """Get breakdown of crimes by severity"""
    severity_counts = {'high': 0, 'medium': 0, 'low': 0}
    for crime in crimes:
        severity = crime.get('severity', 'low')
        severity_counts[severity] += 1
    
    return severity_counts

def _get_hourly_pattern(crimes):
    """Get hourly pattern of crimes"""
    hourly_counts = {str(i): 0 for i in range(24)}
    for crime in crimes:
        hour = crime.get('hour')
        if hour is not None:
            hourly_counts[str(hour)] += 1
    
    return hourly_counts

def _generate_real_time_alerts(crimes):
    """Generate real-time alerts based on recent crime patterns"""
    alerts = []
    
    # Check for breaking news (crimes in last hour)
    breaking_crimes = [c for c in crimes if c.get('is_breaking')]
    if breaking_crimes:
        alerts.append({
            'type': 'breaking',
            'message': f'{len(breaking_crimes)} crimes reported in the last hour',
            'severity': 'high' if len(breaking_crimes) > 3 else 'medium'
        })
    
    # Check for high-severity crime clusters
    high_severity_crimes = [c for c in crimes if c.get('severity') == 'high']
    if len(high_severity_crimes) > 5:
        alerts.append({
            'type': 'cluster',
            'message': f'{len(high_severity_crimes)} high-severity crimes in recent period',
            'severity': 'high'
        })
    
    # Check for active districts
    district_summary = _get_district_summary(crimes)
    if district_summary:
        most_active_district = max(district_summary.items(), key=lambda x: x[1])
        if most_active_district[1] > 10:
            alerts.append({
                'type': 'hotspot',
                'message': f'District {most_active_district[0]} has {most_active_district[1]} recent incidents',
                'severity': 'medium'
            })
    
    return alerts

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Crime Data API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
