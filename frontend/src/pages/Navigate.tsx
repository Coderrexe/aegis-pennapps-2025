import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
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

  const handleSearch = () => {
    console.log('Searching route from:', startLocation, 'to:', endLocation);
    // TODO: Implement route calculation with safety data integration
    setSearchPanelOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      // Convert coordinates to address (reverse geocoding)
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: currentLocation }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setStartLocation(results[0].formatted_address);
        }
      });
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
        {/* Current Location Marker */}
        {currentLocation && (
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
      />

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMyLocation={handleMyLocation}
      />

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
