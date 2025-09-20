import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { MapControls } from '../components/MapControls';
import { SearchPanel } from '../components/SearchPanel';
import { StatusBar } from '../components/StatusBar';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 39.952413, // Philadelphia coordinates
  lng: -75.191351,
};

const mapOptions = {
  disableDefaultUI: true,
  gestureHandling: 'greedy',
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const Navigate: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const { location: currentLocation, loading: locationLoading } = useGeolocation();
  
  // Real-time location tracking
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<google.maps.LatLng | null>(null);
  
  // Demo mode for testing (simulates movement)
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [zoom, setZoom] = useState(13);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  
  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [remainingDistance, setRemainingDistance] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [navigationSteps, setNavigationSteps] = useState<google.maps.DirectionsStep[]>([]);
  
  const startAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const endAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom + 1);
      setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom - 1);
      setZoom(currentZoom - 1);
    }
  };

  const handleMyLocation = () => {
    if (currentLocation && map) {
      map.panTo(currentLocation);
      map.setZoom(16);
      setZoom(16);
    }
  };

  const onStartPlaceChanged = () => {
    if (startAutocompleteRef.current) {
      const place = startAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setStartLocation(place.formatted_address);
      }
    }
  };

  const onEndPlaceChanged = () => {
    if (endAutocompleteRef.current) {
      const place = endAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setEndLocation(place.formatted_address);
      }
    }
  };

  const handleSearch = async () => {
    if (!startLocation || !endLocation || !isLoaded) {
      console.warn('❌ Missing required data for route calculation');
      console.log('Start:', startLocation, 'End:', endLocation, 'Loaded:', isLoaded);
      return;
    }

    setIsCalculatingRoute(true);
    console.log('🚗 Starting route calculation...');
    console.log('📍 From:', startLocation);
    console.log('📍 To:', endLocation);

    try {
      const directionsService = new google.maps.DirectionsService();
      console.log('🔧 DirectionsService created');
      
      const request = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.WALKING,
      };
      
      console.log('📋 Request details:', request);
      
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          console.log('📡 Directions API response status:', status);
          console.log('📡 Directions API result:', result);
          
          if (status === google.maps.DirectionsStatus.OK && result) {
            console.log('✅ Route calculation successful!');
            resolve(result);
          } else {
            console.error('❌ Directions request failed with status:', status);
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      console.log('🗺️ Setting directions response...');
      setDirectionsResponse(result);
      
      // Extract route information
      const route = result.routes[0];
      const leg = route.legs[0];
      
      const routeData = {
        distance: leg.distance?.text || 'Unknown distance',
        duration: leg.duration?.text || 'Unknown duration'
      };
      
      console.log('📊 Route info:', routeData);
      setRouteInfo(routeData);
      
      // Extract navigation steps for turn-by-turn directions
      const steps = leg.steps || [];
      setNavigationSteps(steps);
      console.log('🧭 Navigation steps extracted:', steps.length, 'steps');

      // Fit the map to show the entire route
      if (map && route.bounds) {
        console.log('🗺️ Fitting map bounds...');
        map.fitBounds(route.bounds);
      }

      console.log('✅ Route setup complete!');
      console.log('📍 Distance:', leg.distance?.text);
      console.log('⏱️ Duration:', leg.duration?.text);
      
      // Close search panel after successful route calculation
      console.log('🔄 Closing search panel...');
      setSearchPanelOpen(false);
      
    } catch (error) {
      console.error('❌ Error calculating route:', error);
      alert(`Route calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('🏁 Route calculation finished');
      setIsCalculatingRoute(false);
    }
  };

  // Real-time location tracking functions
  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      setIsTrackingLocation(true);
      
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log('📍 Location updated:', newLocation);
          
          // Calculate heading from movement if we have a previous location
          if (lastLocationRef.current) {
            const heading = calculateHeadingFromMovement(lastLocationRef.current, new google.maps.LatLng(newLocation.lat, newLocation.lng));
            console.log('🧭 Calculated heading from movement:', heading);
            setUserHeading(heading);
            
            if (map && isNavigating) {
              map.setHeading(heading);
            }
          }
          
          // Update map center to follow user
          if (map && isNavigating) {
            map.setCenter(newLocation);
          }
          
          // Store current location for next heading calculation
          lastLocationRef.current = new google.maps.LatLng(newLocation.lat, newLocation.lng);
          
          // Use GPS heading if available (mobile devices)
          if (position.coords.heading !== null && position.coords.heading !== undefined) {
            const gpsHeading = position.coords.heading;
            console.log('📱 GPS heading available:', gpsHeading);
            setUserHeading(gpsHeading);
            
            if (map && isNavigating) {
              map.setHeading(gpsHeading);
            }
          }
        },
        (error) => {
          console.error('❌ Location tracking error:', error);
        },
        options
      );
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTrackingLocation(false);
    }
  };

  // Start Navigation Function
  const handleStartNavigation = () => {
    if (!currentLocation || !directionsResponse || !navigationSteps.length) {
      console.warn('❌ Cannot start navigation: missing required data');
      return;
    }

    console.log('🚀 Starting navigation mode...');
    console.log('📍 Navigation steps:', navigationSteps.map((step, i) => ({
      step: i + 1,
      instruction: step.instructions,
      distance: step.distance?.text,
      duration: step.duration?.text
    })));
    
    setIsNavigating(true);
    setCurrentStepIndex(0);
    
    // Initialize remaining distance and time
    const route = directionsResponse.routes[0];
    const leg = route.legs[0];
    setRemainingDistance(leg.distance?.text || '');
    setRemainingTime(leg.duration?.text || '');

    // Zoom in and center on user location for navigation
    if (map) {
      map.setZoom(17); // Good zoom for navigation (not too close)
      map.setCenter(currentLocation);
    }
    
    // Start real-time tracking
    startLocationTracking();
    startHeadingTracking();
    
    // Start demo mode for testing on laptops (comment out for mobile)
    startDemoMode();

    console.log('✅ Navigation started with', navigationSteps.length, 'steps');
  };

  // Stop Navigation Function
  const handleStopNavigation = () => {
    console.log('🛑 Stopping navigation...');
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setUserHeading(0);
    
    if (map) {
      map.setZoom(13); // Return to normal zoom
      map.setHeading(0); // Reset map rotation
    }
    
    // Stop all tracking
    stopLocationTracking();
    stopHeadingTracking();
    console.log('✅ Navigation stopped');
  };

  // Heading tracking functions
  const startHeadingTracking = () => {
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  };

  const stopHeadingTracking = () => {
    if ('DeviceOrientationEvent' in window) {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }
  };

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      // Convert compass heading to map heading (compass is opposite direction)
      let heading = 360 - event.alpha;
      if (heading >= 360) heading -= 360;
      
      console.log('🧭 Device orientation:', event.alpha, '→ Map heading:', heading);
      setUserHeading(heading);
      
      // Rotate map to match user's heading in navigation mode
      if (map && isNavigating) {
        map.setHeading(heading);
      }
    }
  };

  // Alternative heading detection using GPS movement direction
  const calculateHeadingFromMovement = (oldPos: google.maps.LatLng, newPos: google.maps.LatLng): number => {
    const lat1 = oldPos.lat() * Math.PI / 180;
    const lat2 = newPos.lat() * Math.PI / 180;
    const deltaLng = (newPos.lng() - oldPos.lng()) * Math.PI / 180;
    
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Demo mode for testing on laptops (simulates heading changes)
  const startDemoMode = () => {
    setIsDemoMode(true);
    let demoHeading = 0;
    
    const demoInterval = setInterval(() => {
      if (!isNavigating) {
        clearInterval(demoInterval);
        setIsDemoMode(false);
        return;
      }
      
      demoHeading = (demoHeading + 10) % 360;
      console.log('🎮 Demo mode heading:', demoHeading);
      setUserHeading(demoHeading);
      
      if (map) {
        map.setHeading(demoHeading);
      }
    }, 1000); // Rotate 10 degrees every second
  };

  const handleUseCurrentLocation = async () => {
    if (!currentLocation) {
      console.warn('Current location not available');
      return;
    }

    if (!isLoaded) {
      console.warn('Google Maps API not loaded yet');
      return;
    }

    try {
      // Convert coordinates to address (reverse geocoding)
      const geocoder = new google.maps.Geocoder();
      
      console.log('Attempting to geocode:', currentLocation);
      
      geocoder.geocode({ location: currentLocation }, (results, status) => {
        console.log('Geocoding status:', status);
        console.log('Geocoding results:', results);
        
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const address = results[0].formatted_address;
          setStartLocation(address);
          console.log('✅ Address found:', address);
        } else {
          console.error('❌ Geocoding failed with status:', status);
          
          // Enhanced fallback with better formatting
          const coordString = `${currentLocation.lat.toFixed(4)}°, ${currentLocation.lng.toFixed(4)}°`;
          setStartLocation(coordString);
          console.log('🔄 Using coordinates as fallback:', coordString);
        }
      });
    } catch (error) {
      console.error('Error during geocoding:', error);
      // Fallback to coordinates
      const coordString = `${currentLocation.lat.toFixed(4)}°, ${currentLocation.lng.toFixed(4)}°`;
      setStartLocation(coordString);
    }
  };

  if (loadError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Map</h2>
          <p className="text-gray-600">Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  return isLoaded ? (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || defaultCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* User Location Marker - shows different icons based on navigation state */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: 'data:image/svg+xml;base64,' + btoa(
                isNavigating 
                  ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(${userHeading})">
                      <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="2"/>
                      <path d="M12 6 L16 18 L12 15 L8 18 Z" fill="white"/>
                    </svg>`
                  : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
                      <circle cx="12" cy="12" r="3" fill="white"/>
                    </svg>`
              ),
              scaledSize: new window.google.maps.Size(isNavigating ? 32 : 24, isNavigating ? 32 : 24),
              anchor: new window.google.maps.Point(isNavigating ? 16 : 12, isNavigating ? 16 : 12),
            }}
          />
        )}

        {/* Route Display */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: isNavigating, // Hide default markers during navigation to show custom user marker
              polylineOptions: {
                strokeColor: isNavigating ? '#10b981' : '#2563eb', // Green during navigation, blue during planning
                strokeWeight: isNavigating ? 8 : 6,
                strokeOpacity: 0.8,
              },
              markerOptions: {
                icon: {
                  url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#dc2626" stroke="white" stroke-width="2"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(24, 24),
                  anchor: new window.google.maps.Point(12, 24),
                }
              }
            }}
          />
        )}
      </GoogleMap>

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-3 md:px-4 py-3">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/" className="flex items-center space-x-1 md:space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium text-sm md:text-base">Back</span>
            </Link>
            <div className="h-4 md:h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">Aegis Navigation</h1>
          </div>
          <button
            onClick={() => setSearchPanelOpen(!searchPanelOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-colors shadow-md text-sm md:text-base"
          >
            {searchPanelOpen ? 'Close' : 'Plan Route'}
          </button>
        </div>
      </div>

      {/* Search Panel */}
      <SearchPanel
        isOpen={searchPanelOpen}
        startLocation={startLocation}
        endLocation={endLocation}
        onStartLocationChange={setStartLocation}
        onEndLocationChange={setEndLocation}
        onStartPlaceChanged={onStartPlaceChanged}
        onEndPlaceChanged={onEndPlaceChanged}
        onStartAutocompleteLoad={(autocomplete) => {
          startAutocompleteRef.current = autocomplete;
        }}
        onEndAutocompleteLoad={(autocomplete) => {
          endAutocompleteRef.current = autocomplete;
        }}
        onSearch={handleSearch}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLoaded={isLoaded}
        hasCurrentLocation={!!currentLocation}
        isCalculatingRoute={isCalculatingRoute}
      />

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMyLocation={handleMyLocation}
      />

      {/* Enhanced Navigation Panel - Premium UI */}
      {isNavigating && navigationSteps.length > 0 && (
        <div className="absolute top-4 left-4 right-4 z-50 max-w-md mx-auto">
          {/* Main Navigation Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl overflow-hidden border border-blue-500/20">
            {/* Header Section */}
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Navigation Active</div>
                  <div className="text-blue-100 text-xs">Step {currentStepIndex + 1} of {navigationSteps.length}</div>
                </div>
              </div>
              <button
                onClick={handleStopNavigation}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Instruction */}
            {navigationSteps[currentStepIndex] && (
              <div className="px-4 py-3 bg-white">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{currentStepIndex + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-gray-900 font-medium text-sm leading-tight mb-1"
                      dangerouslySetInnerHTML={{ 
                        __html: navigationSteps[currentStepIndex].instructions 
                      }}
                    />
                    <div className="text-blue-600 text-xs font-medium">
                      In {navigationSteps[currentStepIndex].distance?.text}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="px-4 pb-2">
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-white h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / navigationSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="mt-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-600">Distance</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">{remainingDistance}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-600">ETA</span>
                  </div>
                  <div className="text-lg font-bold text-orange-600">{remainingTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-2 flex items-center justify-center space-x-2">
            {isTrackingLocation && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Live Tracking</span>
              </div>
            )}
            {isDemoMode && (
              <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
                <span>Demo Mode</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Route Information Panel - Compact Bottom Panel */}
      {routeInfo && directionsResponse && !isNavigating && (
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-md mx-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-800">Route Found</h3>
              <button
                onClick={() => {
                  setDirectionsResponse(null);
                  setRouteInfo(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{routeInfo.distance}</div>
                <div className="text-xs text-gray-600">Distance</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{routeInfo.duration}</div>
                <div className="text-xs text-gray-600">Walking Time</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleStartNavigation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Start Navigating</span>
              </button>
              
              <button
                onClick={() => setSearchPanelOpen(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Route</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <StatusBar
        zoom={zoom}
        hasLocation={!!currentLocation}
        isLoading={locationLoading}
      />
    </div>
  ) : (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Aegis Navigation</h2>
        <p className="text-gray-600">Preparing your safe navigation experience...</p>
      </div>
    </div>
  );
};

export default React.memo(Navigate);
