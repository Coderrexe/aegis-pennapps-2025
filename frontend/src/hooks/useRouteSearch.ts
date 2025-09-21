import { useState, useRef, useCallback } from 'react';

interface UseRouteSearchProps {
  map: google.maps.Map | null;
  isLoaded: boolean;
  currentLocation: { lat: number; lng: number } | null;
  setDirectionsResponse: React.Dispatch<React.SetStateAction<google.maps.DirectionsResult | null>>;
  setRouteInfo: React.Dispatch<React.SetStateAction<{ distance: string; duration: string; } | null>>;
  setNavigationSteps: React.Dispatch<React.SetStateAction<google.maps.DirectionsStep[]>>;
  setSearchPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useRouteSearch = ({
  map,
  isLoaded,
  currentLocation,
  setDirectionsResponse,
  setRouteInfo,
  setNavigationSteps,
  setSearchPanelOpen,
}: UseRouteSearchProps) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const startAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const endAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onStartPlaceChanged = useCallback(() => {
    if (startAutocompleteRef.current) {
      const place = startAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setStartLocation(place.formatted_address);
      }
    }
  }, []);

  const onEndPlaceChanged = useCallback(() => {
    if (endAutocompleteRef.current) {
      const place = endAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setEndLocation(place.formatted_address);
      }
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!startLocation || !endLocation || !isLoaded) {
      return;
    }

    setIsCalculatingRoute(true);

    console.log('Calculating route with:', { startLocation, endLocation });

    try {
      const directionsService = new google.maps.DirectionsService();
      const request = {
        origin: startLocation,
        destination: endLocation,
        travelMode: google.maps.TravelMode.WALKING,
      };

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      setDirectionsResponse(result);

      const route = result.routes[0];
      const leg = route.legs[0];

      const routeData = {
        distance: leg.distance?.text || 'Unknown distance',
        duration: leg.duration?.text || 'Unknown duration',
      };

      setRouteInfo(routeData);

      const steps = leg.steps || [];
      setNavigationSteps(steps);

      if (map && route.bounds) {
        map.fitBounds(route.bounds);
      }

      setSearchPanelOpen(false);
    } catch (error) {
      console.error('Route calculation error:', error);
      alert(`Route calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [startLocation, endLocation, isLoaded, map, setDirectionsResponse, setRouteInfo, setNavigationSteps, setSearchPanelOpen]);

  const handleUseCurrentLocation = useCallback(async () => {
    if (!currentLocation || !isLoaded) {
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: currentLocation }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const address = results[0].formatted_address;
          setStartLocation(address);
        } else {
          const coordString = `${currentLocation.lat.toFixed(4)}°, ${currentLocation.lng.toFixed(4)}°`;
          setStartLocation(coordString);
        }
      });
    } catch (error) {
      const coordString = `${currentLocation.lat.toFixed(4)}°, ${currentLocation.lng.toFixed(4)}°`;
      setStartLocation(coordString);
    }
  }, [currentLocation, isLoaded]);

  return {
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
  };
};
