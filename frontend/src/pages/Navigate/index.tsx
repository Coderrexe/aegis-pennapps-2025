import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useMapControls } from '../../hooks/useMapControls';
import { useRouteSearch } from '../../hooks/useRouteSearch';
import { useNavigationState } from '../../hooks/useNavigationState';
import { MapControls } from '../../components/MapControls';
import { SearchPanel } from '../../components/SearchPanel';
import { StatusBar } from '../../components/StatusBar';
import { NavigationHeader } from './NavigationHeader';
import { NavigationUI } from './NavigationUI';
import { RouteDetails } from './RouteDetails';
import { UserMarker } from './UserMarker';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { libraries, containerStyle, defaultCenter, mapOptions } from '../../config/map.config';


const Navigate: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const { location: currentLocation, loading: locationLoading } = useGeolocation();
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  
  const [navigationSteps, setNavigationSteps] = useState<google.maps.DirectionsStep[]>([]);

  type RoutePreference = 'fastest' | 'lighting' | 'balanced';
  const [routePreference, setRoutePreference] = useState<RoutePreference>('balanced');
  
  

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const {
    startLocation,
    endLocation,
    setStartLocation,
    setEndLocation,
    isCalculatingRoute,
    startAutocompleteRef,
    endAutocompleteRef,
    onStartPlaceChanged,
    onEndPlaceChanged,
    handleSearch,
    handleUseCurrentLocation,
  } = useRouteSearch({
    map,
    isLoaded,
    currentLocation,
    setDirectionsResponse,
    setRouteInfo,
    setNavigationSteps,
    setSearchPanelOpen,
  });

  const {
    isNavigating,
    currentStepIndex,
    userHeading,
    remainingDistance,
    remainingTime,
    isTrackingLocation,
    isDemoMode,
    handleStartNavigation,
    handleStopNavigation,
  } = useNavigationState({
    map,
    currentLocation,
    directionsResponse,
    navigationSteps,
  });

  const { handleZoomIn, handleZoomOut, handleMyLocation } = useMapControls({
    map,
    currentLocation,
    setZoom,
  });



  if (loadError) {
    return <ErrorDisplay />;
  }

  return isLoaded ? (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--base)] text-[var(--neutral)]">
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || defaultCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        
        <UserMarker currentLocation={currentLocation} isNavigating={isNavigating} userHeading={userHeading} />

        
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: isNavigating,
              polylineOptions: {
                strokeColor: isNavigating ? '#990000' : '#011F5B',
                strokeWeight: isNavigating ? 8 : 6,
                strokeOpacity: 0.8,
              },
              markerOptions: {
                icon: {
                  url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#990000" stroke="white" stroke-width="2"/>
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

      
      <NavigationHeader searchPanelOpen={searchPanelOpen} setSearchPanelOpen={setSearchPanelOpen} />

      
      <SearchPanel
        isOpen={searchPanelOpen && !isNavigating}
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

      
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onMyLocation={handleMyLocation}
      />

      
      <NavigationUI
        isNavigating={isNavigating}
        navigationSteps={navigationSteps}
        currentStepIndex={currentStepIndex}
        handleStopNavigation={handleStopNavigation}
        remainingDistance={remainingDistance}
        remainingTime={remainingTime}
        isTrackingLocation={isTrackingLocation}
        isDemoMode={isDemoMode}
      />

      
      <RouteDetails
        routeInfo={routeInfo}
        directionsResponse={directionsResponse}
        isNavigating={isNavigating}
        setDirectionsResponse={setDirectionsResponse}
        setRouteInfo={setRouteInfo}
        handleStartNavigation={handleStartNavigation}
        setSearchPanelOpen={setSearchPanelOpen}
        routePreference={routePreference}
        setRoutePreference={setRoutePreference}
      />

      
      <StatusBar
        zoom={zoom}
        hasLocation={!!currentLocation}
        isLoading={locationLoading}
      />
    </div>
  ) : <LoadingSpinner />;
};

export default React.memo(Navigate);
