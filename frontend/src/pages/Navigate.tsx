import React, { useState, useEffect } from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';

const Navigate: React.FC = () => {
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
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="h-screen w-full relative">
        <Map
          center={center}
          zoom={12}
          disableDefaultUI
          gestureHandling="greedy"
          className="w-full h-full"
        />
        <div className="absolute top-4 left-4 z-20">
          <Link to="/">
            <button className="bg-white text-black px-4 py-2 rounded-md shadow-md">
              Home
            </button>
          </Link>
        </div>
      </div>
    </APIProvider>
  );
};

export default Navigate;