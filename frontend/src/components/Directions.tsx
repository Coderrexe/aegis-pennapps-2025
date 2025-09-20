import { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface DirectionsProps {
  directionsResult: google.maps.DirectionsResult;
}

export const Directions: React.FC<DirectionsProps> = ({ directionsResult }) => {
  const map = useMap();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;
    setDirectionsRenderer(new google.maps.DirectionsRenderer({ map }));
  }, [map]);

  useEffect(() => {
    if (!directionsRenderer) return;
    console.log('Rendering directions:', directionsResult);
    directionsRenderer.setDirections(directionsResult);
  }, [directionsRenderer, directionsResult]);

  return null;
};
