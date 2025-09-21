#!/usr/bin/env python3
"""
Quick test to verify the API code structure without running the server
"""

import sys
import os

def test_imports():
    """Test if all modules can be imported"""
    print("🔍 Testing module imports...")
    
    try:
        # Test main app
        from app import app
        print("✅ Main app module imported successfully")
        
        # Test crime data service
        from crime_data_service import CrimeDataService
        print("✅ Crime data service imported successfully")
        
        # Test utilities
        from utils.cache_manager import CacheManager
        from utils.rate_limiter import RateLimiter
        print("✅ Utility modules imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_service_initialization():
    """Test if services can be initialized"""
    print("\n🔍 Testing service initialization...")
    
    try:
        from crime_data_service import CrimeDataService
        from utils.cache_manager import CacheManager
        from utils.rate_limiter import RateLimiter
        
        # Initialize services
        crime_service = CrimeDataService()
        cache_manager = CacheManager()
        rate_limiter = RateLimiter()
        
        print("✅ All services initialized successfully")
        
        # Test basic functionality
        print(f"   Cache stats: {cache_manager.get_stats()}")
        print(f"   Rate limiter stats: {rate_limiter.get_stats()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Service initialization error: {e}")
        return False

def test_api_routes():
    """Test if Flask routes are properly defined"""
    print("\n🔍 Testing API routes...")
    
    try:
        from app import app
        
        # Get all routes
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'rule': str(rule)
            })
        
        print(f"✅ Found {len(routes)} API routes:")
        for route in routes:
            if route['rule'] != '/static/<path:filename>':  # Skip static files
                print(f"   {route['rule']} - {route['methods']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Route testing error: {e}")
        return False

def check_file_structure():
    """Check if all required files exist"""
    print("\n🔍 Checking file structure...")
    
    required_files = [
        'app.py',
        'crime_data_service.py',
        'requirements.txt',
        '.env.example',
        '.env',
        'README.md',
        'run.py',
        'test_api.py',
        'example_usage.py',
        'utils/__init__.py',
        'utils/cache_manager.py',
        'utils/rate_limiter.py'
    ]
    
    missing_files = []
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            missing_files.append(file_path)
    
    if not missing_files:
        print("✅ All required files present")
        return True
    else:
        print(f"❌ Missing {len(missing_files)} files")
        return False

def main():
    """Run all tests"""
    print("🚀 Crime Data API Structure Test")
    print("=" * 50)
    
    tests = [
        ("File Structure", check_file_structure),
        ("Module Imports", test_imports),
        ("Service Initialization", test_service_initialization),
        ("API Routes", test_api_routes)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Structure Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 API structure is complete and ready!")
        print("\n💡 Next steps:")
        print("   1. Install dependencies: pip install -r requirements.txt")
        print("   2. Start the server: python3 run.py")
        print("   3. Test endpoints: python3 test_api.py")
        print("   4. Check example usage: python3 example_usage.py")
    else:
        print("⚠️  Some structure issues found. Check the errors above.")

if __name__ == "__main__":
    main()
