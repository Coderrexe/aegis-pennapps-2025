import React, { useState, useEffect, useRef } from 'react';
import { formatTimeAgo } from '../../utils/time';

// Assuming a basic crime data structure. Adjust as needed.
interface Crime {
  id: number | string;
  type: string;
  severity: string;
  location: {
    lat: number;
    lng: number;
  };
  datetime: string;
}

interface CrimeDetectedModalProps {
  crime: Crime | null;
  onClose: () => void;
  onSwitchPath: () => void;
  currentUserLocation: { lat: number; lng: number } | null;
  alternateRoute: { path: google.maps.LatLngLiteral[], time: number, addedTime: number } | null;
  onSelectSaferRoute: () => void;
}

export const CrimeDetectedModal: React.FC<CrimeDetectedModalProps> = ({ crime, onClose, onSwitchPath, currentUserLocation, alternateRoute, onSelectSaferRoute }) => {
    const [progress, setProgress] = useState(100);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState<string | null>(null);
  const playedSoundForCrimeIdRef = useRef<number | string | null>(null);

  useEffect(() => {
    if (crime && playedSoundForCrimeIdRef.current !== crime.id) {
      const audio = new Audio('/alert.mp3');
      audio.play().catch(error => console.error('Error playing audio:', error));
      playedSoundForCrimeIdRef.current = crime.id;
      setProgress(100); // Reset progress when a new crime is shown
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 50); // 50ms * 100 steps = 5000ms = 5s

      return () => clearInterval(timer);
    }
  }, [crime, onClose]);

  useEffect(() => {
    if (crime) {
      // Reverse geocode the crime location
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: crime.location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setPlaceName(results[0].formatted_address);
        } else {
          setPlaceName(null); // Fallback to coordinates
        }
      });
    }

    if (crime && currentUserLocation) {
      // Calculate distance
      const crimeLatLng = new window.google.maps.LatLng(crime.location.lat, crime.location.lng);
      const userLatLng = new window.google.maps.LatLng(currentUserLocation.lat, currentUserLocation.lng);
      const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(userLatLng, crimeLatLng);
      const distanceInMiles = distanceInMeters * 0.000621371;
      setDistance(`${distanceInMiles.toFixed(2)} mi away`);
    }

    if (crime) {
      setTimeAgo(formatTimeAgo(crime.datetime));
    }
  }, [crime, currentUserLocation]);

  if (!crime) {
    return null;
  }

  return (
    <div className="w-full max-w-md bg-[var(--base)] text-primary rounded-lg overflow-hidden shadow-2xl border border-[var(--neutral)]/10">
      {/* Progress Bar */}
      <div className="w-full bg-neutral/20 h-1">
        <div className="bg-secondary h-1" style={{ width: `${progress}%`, transition: 'width 0.05s linear' }} />
      </div>
      {/* Header */}
      <div className="bg-red-500/10 px-4 py-2 flex items-center justify-between">
        <h3 className="font-semibold text-red-400">Alert: Crime Detected</h3>
        <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm text-neutral/80">A <span className="font-bold text-accent">{crime.severity}-severity</span> crime (<span className="font-bold text-accent">{crime.type}</span>) was reported near your location. A safer route is available.</p>
          <p className="text-xs text-neutral/60 mt-1">
            {placeName ? placeName : `Lat: ${crime.location.lat.toFixed(4)}, Lng: ${crime.location.lng.toFixed(4)}`}
            {distance && <span className="text-accent font-semibold"> ({distance} • {timeAgo})</span>}
          </p>
        </div>

        <button 
          onClick={alternateRoute ? onSelectSaferRoute : onSwitchPath} 
          className="w-full px-4 py-3 bg-secondary text-base-content font-semibold rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 cursor-pointer hover:bg-white/10 active:bg-white/20"
          disabled={!crime}
        >
          {alternateRoute ? `Switch to Safer Route (+${alternateRoute.addedTime} min)` : 'Find Safer Route'}
        </button>
      </div>

    </div>
  );
};
