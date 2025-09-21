import React from 'react';
import { Marker } from '@react-google-maps/api';

interface UserMarkerProps {
  currentLocation: { lat: number; lng: number } | null;
  isNavigating: boolean;
  userHeading: number;
}

export const UserMarker: React.FC<UserMarkerProps> = ({ currentLocation, isNavigating, userHeading }) => {
  if (!currentLocation) {
    return null;
  }

  const getIcon = () => {
    const svg = isNavigating
      ? `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(${userHeading})">
          <circle cx="12" cy="12" r="10" fill="#011F5B" stroke="white" stroke-width="2"/>
          <path d="M12 6 L16 18 L12 15 L8 18 Z" fill="white"/>
        </svg>`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="#011F5B" stroke="white" stroke-width="3"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>`;

    return {
      url: 'data:image/svg+xml;base64,' + btoa(svg),
      scaledSize: new window.google.maps.Size(isNavigating ? 32 : 24, isNavigating ? 32 : 24),
      anchor: new window.google.maps.Point(isNavigating ? 16 : 12, isNavigating ? 16 : 12),
    };
  };

  return <Marker position={currentLocation} icon={getIcon()} />;
};
