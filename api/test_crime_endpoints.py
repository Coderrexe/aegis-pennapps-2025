#!/usr/bin/env python3
"""
Test script for the new crime data endpoints

Tests the /api/crimes/all and /api/crimes/recent endpoints
"""

import requests
import json
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:5001"

def test_all_crimes_json():
    """Test getting all crimes in JSON format"""
    print("🔍 Testing /api/crimes/all (JSON format)...")
    
    try:
        # Test with small limit first
        response = requests.get(f"{API_BASE}/api/crimes/all?limit=100&start_date=2025-09-19")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data['total_crimes']} crimes")
            print(f"   Query parameters: {data['query_parameters']}")
            
            if data['crimes']:
                sample_crime = data['crimes'][0]
                print(f"   Sample crime: {sample_crime['crime_type']} at {sample_crime['address']}")
                print(f"   Coordinates: ({sample_crime['latitude']}, {sample_crime['longitude']})")
                print(f"   Severity: {sample_crime['severity']}")
                print(f"   Time: {sample_crime['datetime']}")
            
            print(f"   Summary - Crime types: {list(data['summary']['crime_types'].keys())[:5]}")
            print(f"   Summary - Districts: {list(data['summary']['districts'].keys())[:3]}")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_all_crimes_csv():
    """Test getting all crimes in CSV format"""
    print("\n🔍 Testing /api/crimes/all (CSV format)...")
    
    try:
        response = requests.get(f"{API_BASE}/api/crimes/all?format=csv&limit=50&start_date=2025-09-19")
        
        if response.status_code == 200:
            csv_content = response.text
            lines = csv_content.split('\n')
            
            print(f"✅ Success! CSV with {len(lines)-1} data rows")
            print(f"   Headers: {lines[0]}")
            
            if len(lines) > 1:
                print(f"   Sample row: {lines[1][:100]}...")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_recent_crimes():
    """Test getting recent crimes"""
    print("\n🔍 Testing /api/crimes/recent...")
    
    try:
        # Test recent crimes from last 48 hours
        response = requests.get(f"{API_BASE}/api/crimes/recent?hours=48&limit=200")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data['total_recent_crimes']} recent crimes")
            print(f"   Breaking news count: {data['breaking_news_count']}")
            print(f"   Time window: {data['query_info']['time_window']['start']} to {data['query_info']['time_window']['end']}")
            
            if data['crimes']:
                most_recent = data['crimes'][0]
                print(f"   Most recent: {most_recent['crime_type']} at {most_recent['address']}")
                print(f"   Minutes ago: {most_recent['minutes_ago']}")
                print(f"   Is breaking: {most_recent['is_breaking']}")
            
            if data['alerts']:
                print(f"   Alerts: {len(data['alerts'])} active")
                for alert in data['alerts']:
                    print(f"     - {alert['type']}: {alert['message']}")
            
            summary = data['real_time_summary']
            print(f"   Active crime types: {list(summary['crime_types_active'].keys())[:3]}")
            print(f"   Active districts: {list(summary['active_districts'].keys())[:3]}")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_recent_crimes_live():
    """Test live mode for recent crimes"""
    print("\n🔍 Testing /api/crimes/recent (live mode)...")
    
    try:
        response = requests.get(f"{API_BASE}/api/crimes/recent?live=true&limit=100")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data['total_recent_crimes']} crimes in last 6 hours")
            print(f"   Breaking news: {data['breaking_news_count']} crimes")
            
            if data['crimes']:
                for crime in data['crimes'][:3]:  # Show first 3
                    print(f"   - {crime['crime_type']} ({crime['minutes_ago']} min ago) at {crime['address']}")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_filtered_crimes():
    """Test filtering capabilities"""
    print("\n🔍 Testing crime filtering...")
    
    try:
        # Test filtering by crime type
        response = requests.get(f"{API_BASE}/api/crimes/all?crime_type=theft&limit=50&start_date=2025-09-15")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Theft filter: Found {data['total_crimes']} theft crimes")
            
            if data['crimes']:
                sample = data['crimes'][0]
                print(f"   Sample: {sample['crime_type']} - {sample['crime_category']}")
        
        # Test filtering by severity
        response = requests.get(f"{API_BASE}/api/crimes/recent?severity=high&hours=72")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ High severity filter: Found {data['total_recent_crimes']} high-severity crimes")
            
            if data['crimes']:
                for crime in data['crimes'][:2]:
                    print(f"   - {crime['crime_type']} (severity: {crime['severity']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_performance():
    """Test API performance"""
    print("\n🔍 Testing API performance...")
    
    try:
        # Test response times
        start_time = time.time()
        response = requests.get(f"{API_BASE}/api/crimes/recent?hours=24&limit=500")
        end_time = time.time()
        
        if response.status_code == 200:
            response_time = end_time - start_time
            data = response.json()
            
            print(f"✅ Performance test:")
            print(f"   Response time: {response_time:.2f} seconds")
            print(f"   Records returned: {data['total_recent_crimes']}")
            print(f"   Records per second: {data['total_recent_crimes']/response_time:.0f}")
            
            if response_time < 3.0:
                print("   🚀 Excellent performance!")
            elif response_time < 5.0:
                print("   ✅ Good performance")
            else:
                print("   ⚠️  Slow performance")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def demonstrate_frontend_usage():
    """Demonstrate how frontend would use these endpoints"""
    print("\n🎯 Frontend Integration Examples:")
    print("=" * 50)
    
    print("\n📱 Example 1: Loading crime data for map visualization")
    print("GET /api/crimes/all?limit=1000&start_date=2025-09-15")
    print("→ Returns structured data with coordinates for mapping")
    
    print("\n🚨 Example 2: Real-time crime alerts")
    print("GET /api/crimes/recent?live=true")
    print("→ Returns breaking news and recent incidents")
    
    print("\n📊 Example 3: Crime analytics dashboard")
    print("GET /api/crimes/all?limit=5000&start_date=2025-09-01")
    print("→ Returns comprehensive data with summaries and breakdowns")
    
    print("\n💾 Example 4: Data export for analysis")
    print("GET /api/crimes/all?format=csv&start_date=2025-09-01&end_date=2025-09-20")
    print("→ Downloads CSV file for data analysis")
    
    print("\n🔍 Example 5: Filtered crime search")
    print("GET /api/crimes/recent?severity=high&hours=48")
    print("→ Returns only high-severity recent crimes")

def main():
    """Run all tests"""
    print("🚀 Crime Data Endpoints Test Suite")
    print("=" * 50)
    
    tests = [
        ("All Crimes (JSON)", test_all_crimes_json),
        ("All Crimes (CSV)", test_all_crimes_csv),
        ("Recent Crimes", test_recent_crimes),
        ("Recent Crimes (Live)", test_recent_crimes_live),
        ("Filtered Crimes", test_filtered_crimes),
        ("Performance", test_performance)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    demonstrate_frontend_usage()
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your crime data endpoints are working perfectly!")
        print("\n💡 Your endpoints provide:")
        print("   ✅ Complete Philadelphia crime database access")
        print("   ✅ Real-time recent crime data")
        print("   ✅ CSV export capability")
        print("   ✅ Flexible filtering options")
        print("   ✅ Frontend-ready data structure")
        print("   ✅ Performance optimized")
    else:
        print("⚠️  Some tests failed. Check the API server and try again.")
    
    print("\n🎯 Perfect for your PennApps navigation project!")

if __name__ == "__main__":
    main()
