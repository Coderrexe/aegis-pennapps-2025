#!/usr/bin/env python3
"""
Example usage of the Crime Data API for navigation integration

This shows how you would integrate the crime data API with your navigation app.
"""

import requests
import json
from typing import List, Dict, Tuple

class NavigationSafetyIntegrator:
    """
    Example class showing how to integrate crime data with navigation
    """
    
    def __init__(self, api_base_url: str = "http://localhost:5001"):
        self.api_base = api_base_url
    
    def check_route_safety(self, waypoints: List[Dict[str, float]], 
                          confidence_threshold: float = 0.7) -> Dict:
        """
        Check if a route is safe based on crime data
        
        Args:
            waypoints: List of {"lat": float, "lng": float} coordinates
            confidence_threshold: Risk threshold for route rejection
            
        Returns:
            Dict with safety assessment and recommendations
        """
        try:
            response = requests.post(
                f"{self.api_base}/api/crime/route-safety",
                json={
                    "waypoints": waypoints,
                    "buffer_meters": 500,
                    "time_window_hours": 24
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                route_analysis = data['route_analysis']
                risk_score = route_analysis['overall_risk_score']
                
                # Determine if route should be avoided
                should_avoid = risk_score > confidence_threshold
                
                return {
                    'safe': not should_avoid,
                    'risk_score': risk_score,
                    'confidence': risk_score,
                    'risk_level': route_analysis['overall_risk_level'],
                    'recommendation': route_analysis['recommendation'],
                    'total_incidents': route_analysis['total_incidents'],
                    'high_risk_segments': len(data.get('high_risk_segments', [])),
                    'alternative_suggested': data.get('alternative_route_suggested', False),
                    'message': self._generate_user_message(risk_score, route_analysis)
                }
            else:
                return {'safe': True, 'error': 'Unable to assess route safety'}
                
        except Exception as e:
            print(f"Error checking route safety: {e}")
            return {'safe': True, 'error': str(e)}
    
    def get_area_safety_alert(self, lat: float, lng: float, 
                            radius: int = 1000) -> Dict:
        """
        Get safety alert for a specific area (for real-time navigation alerts)
        """
        try:
            response = requests.get(
                f"{self.api_base}/api/crime/nearby",
                params={
                    'lat': lat,
                    'lng': lng,
                    'radius': radius,
                    'hours': 6,  # Recent crimes only
                    'severity': 'high'  # Only high-severity crimes
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data['total_incidents'] > 0 and data['risk_score'] > 0.6:
                    return {
                        'alert': True,
                        'severity': data['risk_level'],
                        'incident_count': data['total_incidents'],
                        'confidence': data['risk_score'],
                        'message': f"⚠️ {data['total_incidents']} recent high-severity incidents detected in area"
                    }
                else:
                    return {'alert': False}
            else:
                return {'alert': False, 'error': 'Unable to check area safety'}
                
        except Exception as e:
            print(f"Error getting safety alert: {e}")
            return {'alert': False, 'error': str(e)}
    
    def find_safer_route_suggestion(self, start: Dict[str, float], 
                                  end: Dict[str, float]) -> Dict:
        """
        Suggest a safer route by analyzing multiple path options
        """
        # This is a simplified example - in practice, you'd integrate with
        # a routing service like Google Maps API, OpenRouteService, etc.
        
        # Example: Check multiple intermediate waypoints
        potential_routes = [
            # Direct route
            [start, end],
            # Route via safer areas (example coordinates)
            [start, {"lat": start["lat"] + 0.005, "lng": start["lng"] + 0.005}, end],
            [start, {"lat": start["lat"] - 0.005, "lng": start["lng"] - 0.005}, end]
        ]
        
        route_assessments = []
        
        for i, route in enumerate(potential_routes):
            assessment = self.check_route_safety(route)
            assessment['route_id'] = i
            assessment['route_type'] = ['direct', 'northern', 'southern'][i]
            route_assessments.append(assessment)
        
        # Find safest route
        safest_route = min(route_assessments, key=lambda x: x.get('risk_score', 1.0))
        
        return {
            'recommended_route': safest_route,
            'all_options': route_assessments,
            'safety_improvement': route_assessments[0]['risk_score'] - safest_route['risk_score']
        }
    
    def _generate_user_message(self, risk_score: float, route_analysis: Dict) -> str:
        """
        Generate user-friendly message for the navigation UI
        """
        if risk_score >= 0.8:
            return f"🚨 High crime area detected! {route_analysis['total_incidents']} recent incidents. New route recommended."
        elif risk_score >= 0.6:
            return f"⚠️ Moderate risk area. {route_analysis['total_incidents']} recent incidents. Consider alternative route."
        elif risk_score >= 0.4:
            return f"ℹ️ Some criminal activity in area. {route_analysis['total_incidents']} recent incidents. Exercise caution."
        else:
            return "✅ Route appears safe based on recent crime data."

def demo_navigation_integration():
    """
    Demo showing how to use the crime data API in a navigation app
    """
    print("🗺️  Crime-Aware Navigation Demo")
    print("=" * 50)
    
    # Initialize the integrator
    safety = NavigationSafetyIntegrator()
    
    # Example route: UPenn to Center City Philadelphia
    route_waypoints = [
        {"lat": 39.9526, "lng": -75.1652},  # UPenn area
        {"lat": 39.9496, "lng": -75.1503}   # Center City
    ]
    
    print("📍 Checking route safety...")
    route_safety = safety.check_route_safety(route_waypoints)
    
    print(f"Route Safety Assessment:")
    print(f"  Safe: {route_safety['safe']}")
    print(f"  Risk Score: {route_safety.get('risk_score', 'N/A')}")
    print(f"  Risk Level: {route_safety.get('risk_level', 'N/A')}")
    print(f"  Message: {route_safety.get('message', 'N/A')}")
    
    if route_safety.get('high_risk_segments', 0) > 0:
        print(f"  ⚠️  High risk segments: {route_safety['high_risk_segments']}")
    
    # Check for real-time alerts along the route
    print("\n🚨 Checking for real-time safety alerts...")
    
    for i, waypoint in enumerate(route_waypoints):
        alert = safety.get_area_safety_alert(waypoint['lat'], waypoint['lng'])
        
        if alert.get('alert'):
            print(f"  Alert at waypoint {i+1}: {alert['message']}")
        else:
            print(f"  Waypoint {i+1}: No immediate alerts")
    
    # Demonstrate route alternatives
    if not route_safety['safe']:
        print("\n🔄 Finding safer route alternatives...")
        alternatives = safety.find_safer_route_suggestion(
            route_waypoints[0], 
            route_waypoints[-1]
        )
        
        recommended = alternatives['recommended_route']
        improvement = alternatives.get('safety_improvement', 0)
        
        print(f"  Recommended route: {recommended['route_type']}")
        print(f"  Safety improvement: {improvement:.2f} risk reduction")
        print(f"  New risk level: {recommended['risk_level']}")

def demo_ui_integration():
    """
    Demo showing UI integration patterns
    """
    print("\n📱 UI Integration Demo")
    print("=" * 30)
    
    safety = NavigationSafetyIntegrator()
    
    # Simulate navigation app checking current location
    current_location = {"lat": 39.9526, "lng": -75.1652}
    
    alert = safety.get_area_safety_alert(
        current_location['lat'], 
        current_location['lng'],
        radius=500
    )
    
    # This is what you'd show in your navigation UI
    if alert.get('alert'):
        confidence = alert.get('confidence', 0)
        
        print("🔔 Navigation Alert:")
        print(f"   {alert['message']}")
        print(f"   Confidence: {confidence:.0%}")
        
        # Example UI decision logic
        if confidence > 0.8:
            print("   UI Action: Show prominent warning with route change option")
        elif confidence > 0.6:
            print("   UI Action: Show moderate warning")
        else:
            print("   UI Action: Show subtle notification")
    else:
        print("✅ No safety alerts for current area")

if __name__ == "__main__":
    print("🚀 Crime Data API Integration Examples")
    print("Make sure the API server is running: python run.py")
    print()
    
    try:
        demo_navigation_integration()
        demo_ui_integration()
        
        print("\n" + "=" * 50)
        print("💡 Integration Tips for Your PennApps Project:")
        print("   1. Call check_route_safety() before finalizing routes")
        print("   2. Use get_area_safety_alert() for real-time warnings")
        print("   3. Show confidence intervals in your UI alerts")
        print("   4. Cache results for better performance")
        print("   5. Provide clear user messaging about route changes")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server.")
        print("   Make sure to run: python run.py")
    except Exception as e:
        print(f"❌ Demo error: {e}")
