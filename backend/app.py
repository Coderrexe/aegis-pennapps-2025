from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from routes.main import main_bp
from routes.crime import crime_bp
from routes.debug import debug_bp
from routes.algorithm import algorithm_bp
load_dotenv()
app = Flask(__name__)
CORS(app)
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
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    logger.info(f"Starting Crime Data API on port {port} with debug mode {'on' if debug else 'off'}")
    app.run(host='0.0.0.0', port=port, debug=debug)