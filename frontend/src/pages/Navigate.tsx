import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: 39.952413,
  lng: -75.191351,
};

const Navigate: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [_map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback((mapInstance: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds(center);
    mapInstance.fitBounds(bounds);
    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
    alert('Map unmounted');
  }, []);

  if (loadError) {
    alert('Error loading Google Maps API');
    return <div className="h-screen w-full flex items-center justify-center">Error loading map</div>;
  }

  return isLoaded ? (
    <div className="relative h-screen w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        options={{ disableDefaultUI: true, gestureHandling: 'greedy' }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <></>
      </GoogleMap>

      <div className="absolute top-4 left-4 z-20">
        <Link to="/">
          <button className="bg-white text-black px-4 py-2 rounded-md shadow-md">
            Home
          </button>
        </Link>
      </div>
    </div>
  ) : (
    <div className="h-screen w-full flex items-center justify-center">Loading map...</div>
  );
};

export default React.memo(Navigate);
