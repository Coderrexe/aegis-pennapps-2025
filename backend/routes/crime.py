from flask import Blueprint, request, jsonify, Response
import logging
import io
import csv
from datetime import datetime, timedelta
import requests
from crime_data_service import CrimeDataService
from datetime import datetime
from utils.cache_manager import CacheManager
from utils.rate_limiter import RateLimiter
from utils.helpers import (
    _categorize_crime, _get_crime_severity, _calculate_minutes_ago,
    _get_crime_type_summary, _get_district_summary, _get_severity_breakdown,
    _get_hourly_pattern, _generate_real_time_alerts
)
from utils.query_loader import load_sql_query
crime_bp = Blueprint('crime_bp', __name__)
logger = logging.getLogger(__name__)
crime_service = CrimeDataService()
cache_manager = CacheManager()
rate_limiter = RateLimiter()

@crime_bp.route('/api/crime/nearby', methods=['GET'])
def get_nearby_crimes():
    try:
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({'error': 'Rate limit exceeded'}), 429
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        if lat is None or lng is None:
            return jsonify({'error': 'Missing required parameters: lat and lng'}), 400
        radius = request.args.get('radius', default=1000, type=int)
        hours = request.args.get('hours', default=24, type=int)
        minutes = request.args.get('minutes', type=int)
        severity = request.args.get('severity', type=str)
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return jsonify({'error': 'Invalid coordinates'}), 400
        if radius > 10000:
            return jsonify({'error': 'Radius too large (max 10000m)'}), 400
        cache_key = f"crimes_{lat}_{lng}_{radius}_{hours}_{minutes}_{severity}"
        cached_result = cache_manager.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for location ({lat}, {lng})")
            return jsonify(cached_result)
        crime_data = crime_service.get_nearby_crimes(
            lat=lat, lng=lng, radius=radius, hours=hours, minutes=minutes, severity=severity
        )
        cache_manager.set(cache_key, crime_data)
        logger.info(f"Fetched {len(crime_data.get('incidents', []))} crimes for ({lat}, {lng})")
        return jsonify(crime_data)
    except Exception as e:
        logger.error(f"Error in get_nearby_crimes: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@crime_bp.route('/api/crime/route-safety', methods=['POST'])
def analyze_route_safety():
    try:
        client_ip = request.remote_addr
        if not rate_limiter.is_allowed(client_ip):
            return jsonify({'error': 'Rate limit exceeded'}), 429
        data = request.get_json()
        if not data or 'waypoints' not in data:
            return jsonify({'error': 'Missing waypoints in request body'}), 400
        waypoints = data['waypoints']
        buffer_meters = data.get('buffer_meters', 500)
        time_window_hours = data.get('time_window_hours', 24)
        if not isinstance(waypoints, list) or len(waypoints) < 2:
            return jsonify({'error': 'At least 2 waypoints required'}), 400
        safety_analysis = crime_service.analyze_route_safety(
            waypoints=waypoints, buffer_meters=buffer_meters, time_window_hours=time_window_hours
        )
        return jsonify(safety_analysis)
    except Exception as e:
        logger.error(f"Error in analyze_route_safety: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@crime_bp.route('/api/crime/hotspots', methods=['GET'])
def get_crime_hotspots():
    try:
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
            lat=lat, lng=lng, radius=radius, days=days
        )
        return jsonify(hotspots)
    except Exception as e:
        logger.error(f"Error in get_crime_hotspots: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@crime_bp.route('/api/crime/stats', methods=['GET'])
def get_crime_statistics():
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', default=1000, type=int)
        days = request.args.get('days', default=30, type=int)
        if lat is None or lng is None:
            return jsonify({'error': 'Missing required parameters: lat and lng'}), 400
        stats = crime_service.get_crime_statistics(
            lat=lat, lng=lng, radius=radius, days=days
        )
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error in get_crime_statistics: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@crime_bp.route('/api/crimes/all', methods=['GET'])
def get_all_crimes():
    try:
        format_type = request.args.get('format', 'json').lower()
        limit = min(int(request.args.get('limit', 10000)), 50000)
        start_date = request.args.get('start_date', '2024-01-01')
        end_date = request.args.get('end_date', '2025-12-31')
        crime_type = request.args.get('crime_type')
        district = request.args.get('district')
        base_query = load_sql_query('get_all_crimes')
        query = base_query.format(
            start_date=start_date,
            end_date=end_date
        )
        if crime_type:
            query += f" AND text_general_code ILIKE '%{crime_type}%'"
        if district:
            query += f" AND dc_dist = '{district}'"
        query += f" ORDER BY dispatch_date_time DESC LIMIT {limit}"
        response = requests.get(
            'https://phl.carto.com/api/v2/sql',
            params={'q': query, 'format': 'json'},
            timeout=30
        )
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch crime data'}), 500
        data = response.json()
        crimes = data.get('rows', [])
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
            if processed_crime['latitude'] and processed_crime['longitude']:
                processed_crime['coordinates'] = [processed_crime['longitude'], processed_crime['latitude']]
            processed_crimes.append(processed_crime)
        if format_type == 'csv':
            output = io.StringIO()
            if processed_crimes:
                fieldnames = processed_crimes[0].keys()
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                for crime in processed_crimes:
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

@crime_bp.route('/api/crimes/recent', methods=['GET'])
def get_recent_crimes():
    try:
        hours = min(int(request.args.get('hours', 24)), 168)
        format_type = request.args.get('format', 'json').lower()
        limit = min(int(request.args.get('limit', 1000)), 5000)
        severity_filter = request.args.get('severity')
        live_mode = request.args.get('live', 'false').lower() == 'true'
        if live_mode:
            hours = 6
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        base_query = load_sql_query('get_recent_crimes')
        query = base_query.format(
            start_time=start_time.strftime('%Y-%m-%dT%H:%M:%S'),
            end_time=end_time.strftime('%Y-%m-%dT%H:%M:%S'),
            limit=limit
        )
        response = requests.get(
            'https://phl.carto.com/api/v2/sql',
            params={'q': query, 'format': 'json'},
            timeout=15
        )
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch recent crime data'}), 500
        data = response.json()
        crimes = data.get('rows', [])
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
                'is_breaking': _calculate_minutes_ago(crime.get('datetime')) < 60
            }
            if processed_crime['latitude'] and processed_crime['longitude']:
                processed_crime['coordinates'] = [processed_crime['longitude'], processed_crime['latitude']]
            processed_crimes.append(processed_crime)
        if severity_filter:
            processed_crimes = [c for c in processed_crimes if c['severity'].lower() == severity_filter.lower()]
        if format_type == 'csv':
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