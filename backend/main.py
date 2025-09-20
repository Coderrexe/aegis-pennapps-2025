import os
import sys
from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    print(f"api is up on http://localhost:{port}!")
    app.run(host='0.0.0.0', port=port, debug=debug)
