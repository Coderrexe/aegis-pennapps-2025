import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchWithHeaders } from '../utils/api';

interface UseNavigationStateProps {
  map: google.maps.Map | null;
  currentLocation: { lat: number; lng: number } | null;
  directionsResponse: google.maps.DirectionsResult | null;
  setDirectionsResponse: (response: google.maps.DirectionsResult | null) => void;
  navigationSteps: google.maps.DirectionsStep[];
}

export const useNavigationState = ({ map, currentLocation, directionsResponse, setDirectionsResponse, navigationSteps }: UseNavigationStateProps) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [remainingDistance, setRemainingDistance] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<google.maps.LatLng | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const crimeCheckIntervalRef = useRef<number | null>(null);
  const [simulatedLocation, setSimulatedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationForCrimeQuery, setLocationForCrimeQuery] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedCrime, setDetectedCrime] = useState<any | null>(null); // Using 'any' for now for simplicity

  useEffect(() => {
    if (simulatedLocation) {
      setLocationForCrimeQuery(simulatedLocation);
    } else if (currentLocation) {
      setLocationForCrimeQuery(currentLocation);
    }
  }, [simulatedLocation, currentLocation]);

  useEffect(() => {
    if (isNavigating && navigationSteps.length > 0) {
      const remainingSteps = navigationSteps.slice(currentStepIndex);
      const totalDistance = remainingSteps.reduce((sum, step) => sum + (step.distance?.value || 0), 0);
      const totalDuration = remainingSteps.reduce((sum, step) => sum + (step.duration?.value || 0), 0);

      const distanceInMiles = (totalDistance / 1000) * 0.621371;
      setRemainingDistance(`${distanceInMiles.toFixed(1)} mi`);

      const durationInMinutes = Math.round(totalDuration / 60);
      setRemainingTime(`${durationInMinutes} min`);
    }
  }, [currentStepIndex, isNavigating, navigationSteps]);

  const calculateHeadingFromMovement = (oldPos: google.maps.LatLng, newPos: google.maps.LatLng): number => {
    const lat1 = oldPos.lat() * Math.PI / 180;
    const lat2 = newPos.lat() * Math.PI / 180;
    const deltaLng = (newPos.lng() - oldPos.lng()) * Math.PI / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const startLocationTracking = useCallback(() => {
    if ('geolocation' in navigator) {
      setIsTrackingLocation(true);

      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (lastLocationRef.current) {
            const heading = calculateHeadingFromMovement(lastLocationRef.current, new google.maps.LatLng(newLocation.lat, newLocation.lng));
            setUserHeading(heading);
            if (map && isNavigating) {
              map.setHeading(heading);
            }
          }

          if (map && isNavigating) {
            map.setCenter(newLocation);
          }

          lastLocationRef.current = new google.maps.LatLng(newLocation.lat, newLocation.lng);

          if (position.coords.heading !== null && position.coords.heading !== undefined) {
            const gpsHeading = position.coords.heading;
            setUserHeading(gpsHeading);
            if (map && isNavigating) {
              map.setHeading(gpsHeading);
            }
          }
        },
        () => {},
        options
      );
    }
  }, [map, isNavigating]);

  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTrackingLocation(false);
    }
  }, []);

  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      let heading = 360 - event.alpha;
      if (heading >= 360) heading -= 360;
      setUserHeading(heading);
      if (map && isNavigating) {
        map.setHeading(heading);
      }
    }
  }, [map, isNavigating]);

  const startHeadingTracking = useCallback(() => {
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  }, [handleDeviceOrientation]);

  const stopHeadingTracking = useCallback(() => {
    if ('DeviceOrientationEvent' in window) {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    }
  }, [handleDeviceOrientation]);

  const startDemoMode = useCallback(() => {
    setIsDemoMode(true);
    let demoHeading = 0;

    const demoInterval = setInterval(() => {
      if (!isNavigating) {
        clearInterval(demoInterval);
        setIsDemoMode(false);
        return;
      }

      demoHeading = (demoHeading + 10) % 360;
      setUserHeading(demoHeading);

      if (map) {
        map.setHeading(demoHeading);
      }
    }, 1000);
  }, [map, isNavigating]);

  const checkNearbyCrimes = useCallback(async () => {
    // Don't check for crimes if a modal is already open
    if (detectedCrime) return;
    if (!locationForCrimeQuery) return;

    try {
      console.log(locationForCrimeQuery.lat, locationForCrimeQuery.lng);
      const response = await fetchWithHeaders(`/api/crime/nearby?lat=${locationForCrimeQuery.lat}&lng=${locationForCrimeQuery.lng}&radius=1609&minutes=30`);
      if (response.ok) {
        const data = await response.json();
        if (data.total_incidents > 0) {
          // For simplicity, we'll just show the first incident in the modal.
          // In a real app, you might want to find the most severe or closest one.
          const mostRelevantCrime = data.incidents[0];
          setDetectedCrime(mostRelevantCrime);
        }
      }
    } catch (error) {
      console.error('Error checking for nearby crimes:', error);
    }
  }, [locationForCrimeQuery, detectedCrime]);

  const handleSwitchPath = useCallback(async () => {
    if (!locationForCrimeQuery || !directionsResponse) return;

    const destination = directionsResponse.routes[0].legs[0].end_location;

    try {
      const response = await fetchWithHeaders('/api/algorithm/astar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: {
            lat: locationForCrimeQuery.lat,
            lng: locationForCrimeQuery.lng,
          },
          destination: {
            lat: destination.lat(),
            lng: destination.lng(),
          },
          preference: 'safety',
        }),
      });

      if (response.ok) {
        const newDirections = await response.json();
        console.log('New directions from API:', newDirections);
        setDirectionsResponse(newDirections);
        setDetectedCrime(null);
      } else {
        console.error('Failed to get a safer route');
      }
    } catch (error) {
      console.error('Error switching paths:', error);
    }
  }, [locationForCrimeQuery, directionsResponse, setDirectionsResponse, setDetectedCrime]);

  const handleStartNavigation = useCallback(() => {
    if (!currentLocation || !directionsResponse || !navigationSteps.length) {
      return;
    }

    setIsNavigating(true);
    setCurrentStepIndex(0);

    const route = directionsResponse.routes[0];
    const leg = route.legs[0];
    setRemainingDistance(leg.distance?.text || '');
    setRemainingTime(leg.duration?.text || '');

    if (map) {
      map.setZoom(17);
      map.setCenter(currentLocation);
    }
    setSimulatedLocation(currentLocation);

    startLocationTracking();
    startHeadingTracking();
    startDemoMode();

    if (crimeCheckIntervalRef.current) {
      clearInterval(crimeCheckIntervalRef.current);
    }
    crimeCheckIntervalRef.current = window.setInterval(checkNearbyCrimes, 5000);
  }, [currentLocation, directionsResponse, navigationSteps, map, startLocationTracking, startHeadingTracking, startDemoMode]);

  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setUserHeading(0);

    if (map) {
      map.setZoom(13);
      map.setHeading(0);
    }

    stopLocationTracking();
    stopHeadingTracking();

    if (crimeCheckIntervalRef.current) {
      clearInterval(crimeCheckIntervalRef.current);
      crimeCheckIntervalRef.current = null;
    }
  }, [map, stopLocationTracking, stopHeadingTracking]);

  const handleNextStep = () => {
    if (currentStepIndex < navigationSteps.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      const nextStep = navigationSteps[nextStepIndex];
      if (nextStep && nextStep.start_location) {
        const newLocation = { lat: nextStep.start_location.lat(), lng: nextStep.start_location.lng() };
        setSimulatedLocation(newLocation);
        if (map) {
          map.setCenter(newLocation);
        }
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevStepIndex);
      const prevStep = navigationSteps[prevStepIndex];
      if (prevStep && prevStep.start_location) {
        const newLocation = { lat: prevStep.start_location.lat(), lng: prevStep.start_location.lng() };
        setSimulatedLocation(newLocation);
        if (map) {
          map.setCenter(newLocation);
        }
      }
    }
  };

  return {
    isNavigating,
    currentStepIndex,
    userHeading,
    remainingDistance,
    remainingTime,
    isTrackingLocation,
    isDemoMode,
    handleStartNavigation,
    handleStopNavigation,
    handleNextStep,
    handlePrevStep,
    simulatedLocation,
    locationForCrimeQuery,
    detectedCrime,
    setDetectedCrime,
    handleSwitchPath,
  };
};
