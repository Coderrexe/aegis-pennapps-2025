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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [zoom, setZoom] = useState(13);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  
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
        {/* Current Location Marker - only show if no route is displayed */}
        {currentLocation && !directionsResponse && (
          <Marker
            position={currentLocation}
            icon={{
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="3"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12),
            }}
          />
        )}

        {/* Route Display */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#2563eb', // Blue color for the route
                strokeWeight: 6,
                strokeOpacity: 0.8,
              },
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

      {/* Route Information Panel - Compact Bottom Panel */}
      {routeInfo && directionsResponse && (
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
                onClick={() => {
                  console.log('🚀 Starting navigation...');
                  // TODO: Implement actual navigation
                }}
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
