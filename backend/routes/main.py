from flask import Blueprint, jsonify
from datetime import datetime

main_bp = Blueprint('main_bp', __name__)

@main_bp.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Crime Data API',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })