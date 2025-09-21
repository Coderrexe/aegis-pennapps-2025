import { useCallback } from 'react';

interface UseMapControlsProps {
  map: google.maps.Map | null;
  currentLocation: { lat: number; lng: number } | null;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
}

export const useMapControls = ({ map, currentLocation, setZoom }: UseMapControlsProps) => {
  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      const newZoom = currentZoom + 1;
      map.setZoom(newZoom);
      setZoom(newZoom);
    }
  }, [map, setZoom]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      const newZoom = currentZoom - 1;
      map.setZoom(newZoom);
      setZoom(newZoom);
    }
  }, [map, setZoom]);

  const handleMyLocation = useCallback(() => {
    if (currentLocation && map) {
      map.panTo(currentLocation);
      map.setZoom(16);
      setZoom(16);
    }
  }, [map, currentLocation, setZoom]);

  return { handleZoomIn, handleZoomOut, handleMyLocation };
};
