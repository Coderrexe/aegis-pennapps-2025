import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Add the project root to the Python path
# This is necessary to ensure that the backend can be run as a script
# and that the imports are resolved correctly.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.routes.main import main_bp
from backend.routes.crime import crime_bp
from backend.routes.debug import debug_bp
from backend.routes.algorithm import algorithm_bp
load_dotenv()
app = Flask(__name__)
# Configure CORS to allow requests from any origin
# This is a simple setup for development. For production, you might want to
# restrict the origins to your actual frontend domains.
CORS(app, resources={r"/api/*": {"origins": "*"}})
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
app.register_blueprint(main_bp)
app.register_blueprint(crime_bp)
app.register_blueprint(debug_bp)
app.register_blueprint(algorithm_bp)
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal Server Error: {error}')
    return jsonify({'error': 'Internal server error'}), 500
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    logger.info(f"Starting Crime Data API on port {port} with debug mode {'on' if debug else 'off'}")
    app.run(host='0.0.0.0', port=port, debug=debug)