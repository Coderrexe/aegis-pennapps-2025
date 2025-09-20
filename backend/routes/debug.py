from flask import Blueprint, jsonify, request
import requests
from utils.query_loader import load_sql_query

debug_bp = Blueprint('debug_bp', __name__)

@debug_bp.route('/api/debug/philadelphia-data', methods=['GET'])
def debug_philadelphia_data():
    try:
        test_query = load_sql_query('test_data')
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
                'raw_response': response.text[:500]
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

@debug_bp.route('/api/debug/check-columns', methods=['GET'])
def debug_check_columns():
    try:
        query = load_sql_query('check_columns')
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
