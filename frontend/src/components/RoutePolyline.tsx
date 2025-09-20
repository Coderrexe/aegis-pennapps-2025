import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface RoutePolylineProps {
  encodedPolyline: string;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({ encodedPolyline }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);
    const newPolyline = new google.maps.Polyline({
      path: decodedPath,
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 6,
      map: map,
    });

    return () => {
      newPolyline.setMap(null);
    };
  }, [map, encodedPolyline]);

  return null;
};
