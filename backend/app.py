import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Add project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import blueprints
from backend.routes.main import main_bp
from backend.routes.crime import crime_bp
from backend.routes.debug import debug_bp
from backend.routes.algorithm import algorithm_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# === CORS Setup ===
def get_allowed_origins():
    origins = ["http://localhost:3000"]
    ngrok_url = os.environ.get("NGROK_URL")
    if ngrok_url:
        origins.append(ngrok_url)
    return origins

CORS(
    app,
    resources={r"/*": {"origins": get_allowed_origins()}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# === Logging ===
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# === Register Blueprints ===
app.register_blueprint(main_bp)
app.register_blueprint(crime_bp)
app.register_blueprint(debug_bp)
app.register_blueprint(algorithm_bp)

# === Error Handlers ===
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal Server Error: {error}")
    return jsonify({"error": "Internal server error"}), 500

# === List all endpoints (ngrok-ready) ===
def list_endpoints():
    ngrok_url = os.environ.get("NGROK_URL", f"http://localhost:{os.environ.get('PORT', 5002)}")
    
    print("\n=== Available API Endpoints ===\n")
    for rule in app.url_map.iter_rules():
        if "static" in rule.endpoint:
            continue
        methods = ",".join(rule.methods)
        full_url = f"{ngrok_url}{rule.rule}"
        print(f"{methods:20} -> {full_url}")
    print("\n===============================\n")

# === Run Server ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() == "true"

    logger.info(f"Starting Crime Data API on port {port} with debug mode {'on' if debug else 'off'}")

    # Print all endpoints before running
    list_endpoints()

    app.run(host="0.0.0.0", port=port, debug=debug)
