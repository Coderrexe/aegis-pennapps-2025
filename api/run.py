#!/usr/bin/env python3
"""
Simple runner script for the Crime Data API
"""

import os
import sys
from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"🚀 Starting Crime Data API on http://localhost:{port}")
    print("📍 Perfect for PennApps navigation project!")
    print("📚 Check README.md for API documentation")
    print("-" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
