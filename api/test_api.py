#!/usr/bin/env python3
"""
Test script for Crime Data API

Run this to test all endpoints and verify the API is working correctly.
"""

import requests
import json
import time
from typing import Dict, Any

API_BASE = "http://localhost:5001"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    
    try:
        response = requests.get(f"{API_BASE}/")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_nearby_crimes():
    """Test the nearby crimes endpoint"""
    print("\n🔍 Testing nearby crimes endpoint...")
    
    # Test with Philadelphia coordinates (near UPenn)
    params = {
        'lat': 39.9526,
        'lng': -75.1652,
        'radius': 1000,
        'hours': 24
    }
    
    try:
        response = requests.get(f"{API_BASE}/api/crime/nearby", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data['total_incidents']} crimes")
            print(f"   Risk Score: {data['risk_score']} ({data['risk_level']})")
            
            if data['incidents']:
                print(f"   Sample crime: {data['incidents'][0]['type']} at {data['incidents'][0]['location']['address']}")
            
            return True
        else:
            print(f"❌ Nearby crimes failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Nearby crimes error: {e}")
        return False

def test_route_safety():
    """Test the route safety analysis endpoint"""
    print("\n🔍 Testing route safety analysis...")
    
    # Test route from UPenn to Center City Philadelphia
    route_data = {
        "waypoints": [
            {"lat": 39.9526, "lng": -75.1652},  # UPenn area
            {"lat": 39.9500, "lng": -75.1667},  # Intermediate point
            {"lat": 39.9496, "lng": -75.1503}   # Center City
        ],
        "buffer_meters": 500,
        "time_window_hours": 24
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/api/crime/route-safety",
            json=route_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            analysis = data['route_analysis']
            
            print(f"✅ Route analysis completed")
            print(f"   Total incidents: {analysis['total_incidents']}")
            print(f"   Overall risk: {analysis['overall_risk_score']} ({analysis['overall_risk_level']})")
            print(f"   Recommendation: {analysis['recommendation']}")
            print(f"   Segments analyzed: {len(data['segment_analyses'])}")
            
            if data['high_risk_segments']:
                print(f"   ⚠️  High risk segments: {len(data['high_risk_segments'])}")
            
            return True
        else:
            print(f"❌ Route safety failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Route safety error: {e}")
        return False

def test_crime_hotspots():
    """Test the crime hotspots endpoint"""
    print("\n🔍 Testing crime hotspots...")
    
    params = {
        'lat': 39.9526,
        'lng': -75.1652,
        'radius': 2000,
        'days': 7
    }
    
    try:
        response = requests.get(f"{API_BASE}/api/crime/hotspots", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data['hotspots'])} hotspots")
            print(f"   Total crimes analyzed: {data['total_crimes']}")
            
            if data['hotspots']:
                top_hotspot = data['hotspots'][0]
                print(f"   Top hotspot: {top_hotspot['crime_count']} crimes, risk {top_hotspot['risk_score']}")
            
            return True
        else:
            print(f"❌ Crime hotspots failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Crime hotspots error: {e}")
        return False

def test_crime_statistics():
    """Test the crime statistics endpoint"""
    print("\n🔍 Testing crime statistics...")
    
    params = {
        'lat': 39.9526,
        'lng': -75.1652,
        'radius': 1000,
        'days': 30
    }
    
    try:
        response = requests.get(f"{API_BASE}/api/crime/stats", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statistics generated")
            print(f"   Total incidents: {data['total_incidents']}")
            print(f"   Crimes per day: {data['crimes_per_day']}")
            print(f"   Risk level: {data['risk_assessment']['level']}")
            
            if data['crime_types']:
                top_crime = max(data['crime_types'].items(), key=lambda x: x[1])
                print(f"   Most common crime: {top_crime[0]} ({top_crime[1]} incidents)")
            
            return True
        else:
            print(f"❌ Crime statistics failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Crime statistics error: {e}")
        return False

def test_rate_limiting():
    """Test rate limiting functionality"""
    print("\n🔍 Testing rate limiting...")
    
    # Make multiple rapid requests
    success_count = 0
    rate_limited_count = 0
    
    for i in range(5):
        try:
            response = requests.get(f"{API_BASE}/api/crime/nearby?lat=39.9526&lng=-75.1652")
            
            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 429:
                rate_limited_count += 1
                
        except Exception as e:
            print(f"   Request {i+1} error: {e}")
    
    print(f"✅ Rate limiting test: {success_count} successful, {rate_limited_count} rate limited")
    return True

def test_error_handling():
    """Test error handling"""
    print("\n🔍 Testing error handling...")
    
    # Test missing parameters
    try:
        response = requests.get(f"{API_BASE}/api/crime/nearby")
        
        if response.status_code == 400:
            print("✅ Missing parameters handled correctly")
        else:
            print(f"❌ Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False
    
    # Test invalid coordinates
    try:
        response = requests.get(f"{API_BASE}/api/crime/nearby?lat=999&lng=999")
        
        if response.status_code == 400:
            print("✅ Invalid coordinates handled correctly")
        else:
            print(f"❌ Expected 400 for invalid coords, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Invalid coordinates test failed: {e}")
        return False
    
    return True

def run_performance_test():
    """Run a simple performance test"""
    print("\n🔍 Running performance test...")
    
    start_time = time.time()
    
    # Make 10 requests
    for i in range(10):
        try:
            response = requests.get(
                f"{API_BASE}/api/crime/nearby?lat=39.9526&lng=-75.1652",
                timeout=5
            )
            
            if response.status_code != 200:
                print(f"   Request {i+1} failed: {response.status_code}")
                
        except Exception as e:
            print(f"   Request {i+1} error: {e}")
    
    end_time = time.time()
    avg_time = (end_time - start_time) / 10
    
    print(f"✅ Performance test: Average {avg_time:.2f}s per request")
    
    if avg_time < 2.0:
        print("   🚀 Good performance!")
    elif avg_time < 5.0:
        print("   ⚠️  Acceptable performance")
    else:
        print("   🐌 Slow performance - check caching")
    
    return True

def main():
    """Run all tests"""
    print("🚀 Crime Data API Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Nearby Crimes", test_nearby_crimes),
        ("Route Safety", test_route_safety),
        ("Crime Hotspots", test_crime_hotspots),
        ("Crime Statistics", test_crime_statistics),
        ("Rate Limiting", test_rate_limiting),
        ("Error Handling", test_error_handling),
        ("Performance", run_performance_test)
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
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is ready for PennApps!")
    else:
        print("⚠️  Some tests failed. Check the API server and try again.")
    
    print("\n💡 Next steps:")
    print("   1. Integrate with your navigation frontend")
    print("   2. Test with real Philadelphia routes")
    print("   3. Add more data sources if needed")
    print("   4. Deploy for the hackathon!")

if __name__ == "__main__":
    main()
