import React, { useState, useEffect } from 'react';
import { APIProvider, Map, useMapsLibrary } from '@vis.gl/react-google-maps';
import NavigationControls from '../components/NavigationControls';
import { RoutePolyline } from '../components/RoutePolyline';

const Navigate: React.FC = () => {
  const routesLibrary = useMapsLibrary('routes');
  const [start, setStart] = useState<google.maps.places.PlaceResult | null>(null);
  const [destination, setDestination] = useState<google.maps.places.PlaceResult | null>(null);
  const [route, setRoute] = useState<google.maps.DirectionsRoute | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCenter({ lat: 37.7749, lng: -122.4194 });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setCenter({ lat: 37.7749, lng: -122.4194 });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  if (loading || !center) {
    return <div className="h-screen w-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['routes', 'places', 'geometry']}>
      <div className="h-screen w-full relative">
        <NavigationControls
          onStartPlaceSelect={setStart}
          onDestinationPlaceSelect={setDestination}
          onGetDirectionsClick={async () => {
            if (!start?.geometry?.location || !destination?.geometry?.location) {
              console.log('Start or destination not available.');
              return;
            }

            console.log('Requesting route from:', start.name, 'to:', destination.name);

            const directionsService = new google.maps.DirectionsService();

            try {
              const response = await directionsService.route({
                origin: start.geometry.location,
                destination: destination.geometry.location,
                travelMode: google.maps.TravelMode.DRIVING,
              });

              if (response.routes.length > 0) {
                console.log('Route found:', response.routes[0]);
                setRoute(response.routes[0]);
              } else {
                console.log('No routes found.');
                setRoute(null);
              }
            } catch (error) {
              console.error('Error computing routes:', error);
            }
          }}
          isDirectionsDisabled={!start || !destination}
        />
        <Map
          center={center}
          zoom={12}
          disableDefaultUI
          gestureHandling="greedy"
          className="w-full h-full"
        >
          {route && route.overview_polyline && (
            <RoutePolyline encodedPolyline={route.overview_polyline} />
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default Navigate;