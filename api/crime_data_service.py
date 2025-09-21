"""
Crime Data Service

Aggregates crime data from multiple sources:
1. Philadelphia Police Department Open Data
2. FBI Crime Data API
3. Other city open data portals
"""

import requests
# import pandas as pd  # Commented out to avoid compilation issues
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
import math
from geopy.distance import geodesic
import os

logger = logging.getLogger(__name__)

class CrimeDataService:
    def __init__(self):
        self.philadelphia_api_base = os.getenv('PHILADELPHIA_API_BASE', 'https://phl.carto.com/api/v2/sql')
        self.fbi_api_base = os.getenv('FBI_API_BASE', 'https://api.usa.gov/crime/fbi/cde')
        
        # Crime severity mapping
        self.severity_mapping = {
            'HOMICIDE': 'high',
            'RAPE': 'high',
            'ROBBERY': 'high',
            'AGGRAVATED ASSAULT': 'high',
            'BURGLARY': 'medium',
            'THEFT': 'medium',
            'MOTOR VEHICLE THEFT': 'medium',
            'ARSON': 'medium',
            'SIMPLE ASSAULT': 'low',
            'VANDALISM': 'low',
            'DRUG VIOLATIONS': 'low'
        }
    
    def get_nearby_crimes(self, lat: float, lng: float, radius: int = 1000, 
                         hours: int = 24, severity: Optional[str] = None) -> Dict[str, Any]:
        """
        Get crime incidents near a specific location
        """
        try:
            # Calculate time window
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=hours)
            
            # Try Philadelphia data first (since UPenn is in Philly)
            philadelphia_crimes = self._get_philadelphia_crimes(lat, lng, radius, start_time, end_time)
            
            # Get FBI data as backup/supplement
            fbi_crimes = self._get_fbi_crimes(lat, lng, radius, start_time, end_time)
            
            # Combine and process data
            all_crimes = philadelphia_crimes + fbi_crimes
            
            # Filter by severity if specified
            if severity:
                all_crimes = [crime for crime in all_crimes 
                            if crime.get('severity', '').lower() == severity.lower()]
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(all_crimes, radius)
            
            return {
                'location': {'lat': lat, 'lng': lng},
                'radius_meters': radius,
                'time_window_hours': hours,
                'total_incidents': len(all_crimes),
                'risk_score': risk_score,
                'risk_level': self._get_risk_level(risk_score),
                'incidents': all_crimes[:50],  # Limit to 50 most recent
                'summary': self._generate_summary(all_crimes),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error fetching nearby crimes: {str(e)}")
            return {
                'location': {'lat': lat, 'lng': lng},
                'error': 'Failed to fetch crime data',
                'incidents': [],
                'total_incidents': 0,
                'risk_score': 0,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _get_philadelphia_crimes(self, lat: float, lng: float, radius: int, 
                               start_time: datetime, end_time: datetime) -> List[Dict]:
        """
        Fetch crime data from Philadelphia Police Department
        """
        try:
            # Convert radius from meters to degrees (approximate)
            radius_deg = radius / 111000  # 1 degree ≈ 111km
            
            # SQL query for Philadelphia crime data
            query = f"""
            SELECT 
                objectid,
                dc_dist,
                psa,
                dispatch_date_time,
                dispatch_date,
                dispatch_time,
                hour_,
                dc_key,
                location_block,
                ucr_general,
                text_general_code,
                point_x,
                point_y,
                lat,
                lng
            FROM incidents_part1_part2 
            WHERE 
                dispatch_date_time >= '{start_time.strftime('%Y-%m-%d %H:%M:%S')}'
                AND dispatch_date_time <= '{end_time.strftime('%Y-%m-%d %H:%M:%S')}'
                AND lat BETWEEN {lat - radius_deg} AND {lat + radius_deg}
                AND lng BETWEEN {lng - radius_deg} AND {lng + radius_deg}
            ORDER BY dispatch_date_time DESC
            LIMIT 100
            """
            
            response = requests.get(
                self.philadelphia_api_base,
                params={'q': query, 'format': 'json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                crimes = []
                
                for row in data.get('rows', []):
                    try:
                        crime_lat = float(row.get('lat', 0))
                        crime_lng = float(row.get('lng', 0))
                        
                        # Calculate actual distance
                        distance = geodesic((lat, lng), (crime_lat, crime_lng)).meters
                        
                        if distance <= radius:
                            crime_type = row.get('text_general_code', 'Unknown')
                            severity = self.severity_mapping.get(crime_type.upper(), 'medium')
                            
                            crimes.append({
                                'id': row.get('objectid'),
                                'type': crime_type,
                                'severity': severity,
                                'location': {
                                    'lat': crime_lat,
                                    'lng': crime_lng,
                                    'address': row.get('location_block', 'Unknown')
                                },
                                'datetime': row.get('dispatch_date_time'),
                                'distance_meters': round(distance, 2),
                                'source': 'Philadelphia PD'
                            })
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Error processing Philadelphia crime record: {e}")
                        continue
                
                logger.info(f"Fetched {len(crimes)} crimes from Philadelphia PD")
                return crimes
            else:
                logger.warning(f"Philadelphia API returned status {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching Philadelphia crimes: {str(e)}")
            return []
    
    def _get_fbi_crimes(self, lat: float, lng: float, radius: int, 
                       start_time: datetime, end_time: datetime) -> List[Dict]:
        """
        Fetch crime data from FBI Crime Data API
        Note: FBI data is more aggregated and less real-time
        """
        try:
            # FBI API has different structure - this is a simplified implementation
            # In practice, you'd need to map coordinates to FBI reporting areas
            
            # For now, return empty list as FBI data requires more complex mapping
            # This would be expanded based on specific FBI API documentation
            return []
            
        except Exception as e:
            logger.error(f"Error fetching FBI crimes: {str(e)}")
            return []
    
    def analyze_route_safety(self, waypoints: List[Dict], buffer_meters: int = 500, 
                           time_window_hours: int = 24) -> Dict[str, Any]:
        """
        Analyze safety along a route
        """
        try:
            route_crimes = []
            segment_analyses = []
            
            # Analyze each segment of the route
            for i in range(len(waypoints) - 1):
                start_point = waypoints[i]
                end_point = waypoints[i + 1]
                
                # Get crimes along this segment
                segment_crimes = self._get_crimes_along_segment(
                    start_point, end_point, buffer_meters, time_window_hours
                )
                
                route_crimes.extend(segment_crimes)
                
                segment_analysis = {
                    'segment': i + 1,
                    'start': start_point,
                    'end': end_point,
                    'crime_count': len(segment_crimes),
                    'risk_score': self._calculate_risk_score(segment_crimes, buffer_meters),
                    'high_risk_areas': self._identify_high_risk_areas(segment_crimes)
                }
                
                segment_analyses.append(segment_analysis)
            
            # Calculate overall route safety
            overall_risk = self._calculate_risk_score(route_crimes, buffer_meters)
            
            return {
                'route_analysis': {
                    'total_incidents': len(route_crimes),
                    'overall_risk_score': overall_risk,
                    'overall_risk_level': self._get_risk_level(overall_risk),
                    'recommendation': self._get_route_recommendation(overall_risk),
                },
                'segment_analyses': segment_analyses,
                'high_risk_segments': [s for s in segment_analyses if s['risk_score'] > 0.7],
                'alternative_route_suggested': overall_risk > 0.8,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing route safety: {str(e)}")
            return {'error': 'Failed to analyze route safety'}
    
    def _get_crimes_along_segment(self, start_point: Dict, end_point: Dict, 
                                buffer_meters: int, time_window_hours: int) -> List[Dict]:
        """
        Get crimes along a route segment
        """
        crimes = []
        
        # Sample points along the route
        num_samples = max(3, int(geodesic(
            (start_point['lat'], start_point['lng']),
            (end_point['lat'], end_point['lng'])
        ).meters / 500))  # Sample every 500m
        
        for i in range(num_samples):
            ratio = i / (num_samples - 1) if num_samples > 1 else 0
            
            # Interpolate coordinates
            sample_lat = start_point['lat'] + ratio * (end_point['lat'] - start_point['lat'])
            sample_lng = start_point['lng'] + ratio * (end_point['lng'] - start_point['lng'])
            
            # Get crimes near this sample point
            nearby_crimes = self.get_nearby_crimes(
                sample_lat, sample_lng, buffer_meters, time_window_hours
            )
            
            crimes.extend(nearby_crimes.get('incidents', []))
        
        # Remove duplicates based on crime ID
        unique_crimes = []
        seen_ids = set()
        
        for crime in crimes:
            crime_id = crime.get('id')
            if crime_id and crime_id not in seen_ids:
                seen_ids.add(crime_id)
                unique_crimes.append(crime)
        
        return unique_crimes
    
    def get_crime_hotspots(self, lat: float, lng: float, radius: int = 2000, 
                          days: int = 7) -> Dict[str, Any]:
        """
        Identify crime hotspots in an area
        """
        try:
            # Get crimes for the specified time period
            crimes_data = self.get_nearby_crimes(
                lat, lng, radius, hours=days * 24
            )
            
            crimes = crimes_data.get('incidents', [])
            
            # Create grid for hotspot analysis
            grid_size = 200  # 200m grid cells
            hotspots = self._create_hotspot_grid(crimes, lat, lng, radius, grid_size)
            
            return {
                'center': {'lat': lat, 'lng': lng},
                'analysis_radius': radius,
                'time_period_days': days,
                'total_crimes': len(crimes),
                'hotspots': hotspots,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting crime hotspots: {str(e)}")
            return {'error': 'Failed to analyze crime hotspots'}
    
    def get_crime_statistics(self, lat: float, lng: float, radius: int = 1000, 
                           days: int = 30) -> Dict[str, Any]:
        """
        Get crime statistics for an area
        """
        try:
            crimes_data = self.get_nearby_crimes(
                lat, lng, radius, hours=days * 24
            )
            
            crimes = crimes_data.get('incidents', [])
            
            # Analyze crime types
            crime_types = {}
            severity_counts = {'high': 0, 'medium': 0, 'low': 0}
            hourly_distribution = {str(i): 0 for i in range(24)}
            
            for crime in crimes:
                # Count by type
                crime_type = crime.get('type', 'Unknown')
                crime_types[crime_type] = crime_types.get(crime_type, 0) + 1
                
                # Count by severity
                severity = crime.get('severity', 'medium')
                severity_counts[severity] += 1
                
                # Hourly distribution
                try:
                    crime_datetime = crime.get('datetime', '')
                    if crime_datetime:
                        hour = datetime.fromisoformat(crime_datetime.replace('Z', '+00:00')).hour
                        hourly_distribution[str(hour)] += 1
                except:
                    pass
            
            return {
                'location': {'lat': lat, 'lng': lng},
                'analysis_period_days': days,
                'total_incidents': len(crimes),
                'crime_types': crime_types,
                'severity_breakdown': severity_counts,
                'hourly_distribution': hourly_distribution,
                'crimes_per_day': round(len(crimes) / days, 2),
                'risk_assessment': {
                    'score': crimes_data.get('risk_score', 0),
                    'level': crimes_data.get('risk_level', 'unknown')
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting crime statistics: {str(e)}")
            return {'error': 'Failed to generate crime statistics'}
    
    def _calculate_risk_score(self, crimes: List[Dict], radius: int) -> float:
        """
        Calculate risk score based on crime data
        """
        if not crimes:
            return 0.0
        
        # Base score from crime count
        crime_density = len(crimes) / (math.pi * (radius / 1000) ** 2)  # crimes per km²
        base_score = min(crime_density / 100, 0.5)  # Normalize to 0-0.5
        
        # Severity weighting
        severity_weights = {'high': 3, 'medium': 2, 'low': 1}
        weighted_score = 0
        
        for crime in crimes:
            severity = crime.get('severity', 'medium')
            weight = severity_weights.get(severity, 2)
            
            # Distance weighting (closer crimes have more impact)
            distance = crime.get('distance_meters', radius)
            distance_factor = max(0.1, 1 - (distance / radius))
            
            weighted_score += weight * distance_factor
        
        # Normalize weighted score
        if crimes:
            weighted_score = weighted_score / (len(crimes) * 3)  # Max weight is 3
        
        # Combine scores
        final_score = min((base_score + weighted_score) / 2, 1.0)
        
        return round(final_score, 3)
    
    def _get_risk_level(self, risk_score: float) -> str:
        """
        Convert risk score to risk level
        """
        if risk_score >= 0.8:
            return 'very_high'
        elif risk_score >= 0.6:
            return 'high'
        elif risk_score >= 0.4:
            return 'medium'
        elif risk_score >= 0.2:
            return 'low'
        else:
            return 'very_low'
    
    def _generate_summary(self, crimes: List[Dict]) -> Dict[str, Any]:
        """
        Generate a summary of crime data
        """
        if not crimes:
            return {'message': 'No recent crimes in this area'}
        
        # Most common crime type
        crime_types = {}
        for crime in crimes:
            crime_type = crime.get('type', 'Unknown')
            crime_types[crime_type] = crime_types.get(crime_type, 0) + 1
        
        most_common = max(crime_types.items(), key=lambda x: x[1]) if crime_types else ('Unknown', 0)
        
        # Severity breakdown
        severity_counts = {'high': 0, 'medium': 0, 'low': 0}
        for crime in crimes:
            severity = crime.get('severity', 'medium')
            severity_counts[severity] += 1
        
        return {
            'most_common_crime': most_common[0],
            'most_common_count': most_common[1],
            'severity_breakdown': severity_counts,
            'recent_high_severity': severity_counts['high'] > 0
        }
    
    def _get_route_recommendation(self, risk_score: float) -> str:
        """
        Get route recommendation based on risk score
        """
        if risk_score >= 0.8:
            return "High risk route - strongly recommend finding alternative"
        elif risk_score >= 0.6:
            return "Moderate risk - consider alternative route if available"
        elif risk_score >= 0.4:
            return "Some risk present - exercise normal caution"
        else:
            return "Low risk route - safe to proceed"
    
    def _identify_high_risk_areas(self, crimes: List[Dict]) -> List[Dict]:
        """
        Identify specific high-risk areas along a route
        """
        high_risk_areas = []
        
        # Group crimes by proximity
        crime_clusters = []
        processed = set()
        
        for i, crime in enumerate(crimes):
            if i in processed:
                continue
            
            cluster = [crime]
            processed.add(i)
            
            for j, other_crime in enumerate(crimes[i+1:], i+1):
                if j in processed:
                    continue
                
                distance = geodesic(
                    (crime['location']['lat'], crime['location']['lng']),
                    (other_crime['location']['lat'], other_crime['location']['lng'])
                ).meters
                
                if distance <= 100:  # 100m cluster radius
                    cluster.append(other_crime)
                    processed.add(j)
            
            if len(cluster) >= 2:  # At least 2 crimes to be considered a cluster
                crime_clusters.append(cluster)
        
        # Convert clusters to high-risk areas
        for cluster in crime_clusters:
            if len(cluster) >= 2:
                center_lat = sum(c['location']['lat'] for c in cluster) / len(cluster)
                center_lng = sum(c['location']['lng'] for c in cluster) / len(cluster)
                
                high_severity_count = sum(1 for c in cluster if c.get('severity') == 'high')
                
                high_risk_areas.append({
                    'location': {'lat': center_lat, 'lng': center_lng},
                    'crime_count': len(cluster),
                    'high_severity_count': high_severity_count,
                    'radius_meters': 100
                })
        
        return high_risk_areas
    
    def _create_hotspot_grid(self, crimes: List[Dict], center_lat: float, 
                           center_lng: float, radius: int, grid_size: int) -> List[Dict]:
        """
        Create a grid-based hotspot analysis
        """
        hotspots = []
        
        # Calculate grid bounds
        radius_deg = radius / 111000  # Convert meters to degrees
        
        # Create grid cells
        cells_per_side = int((2 * radius) / grid_size)
        
        for i in range(cells_per_side):
            for j in range(cells_per_side):
                # Calculate cell center
                cell_lat = center_lat - radius_deg + (i + 0.5) * (2 * radius_deg / cells_per_side)
                cell_lng = center_lng - radius_deg + (j + 0.5) * (2 * radius_deg / cells_per_side)
                
                # Count crimes in this cell
                cell_crimes = []
                for crime in crimes:
                    distance = geodesic(
                        (cell_lat, cell_lng),
                        (crime['location']['lat'], crime['location']['lng'])
                    ).meters
                    
                    if distance <= grid_size / 2:
                        cell_crimes.append(crime)
                
                # Only include cells with crimes
                if cell_crimes:
                    risk_score = self._calculate_risk_score(cell_crimes, grid_size // 2)
                    
                    if risk_score > 0.3:  # Only include significant hotspots
                        hotspots.append({
                            'location': {'lat': cell_lat, 'lng': cell_lng},
                            'crime_count': len(cell_crimes),
                            'risk_score': risk_score,
                            'risk_level': self._get_risk_level(risk_score),
                            'grid_size_meters': grid_size
                        })
        
        # Sort by risk score
        hotspots.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return hotspots[:20]  # Return top 20 hotspots
