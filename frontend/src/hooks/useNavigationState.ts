import { useState, useRef, useCallback, useEffect } from 'react';

interface UseNavigationStateProps {
  map: google.maps.Map | null;
  currentLocation: { lat: number; lng: number } | null;
  directionsResponse: google.maps.DirectionsResult | null;
  navigationSteps: google.maps.DirectionsStep[];
}

export const useNavigationState = ({ map, currentLocation, directionsResponse, navigationSteps }: UseNavigationStateProps) => {
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
    if (!locationForCrimeQuery) return;

    try {
      console.log(locationForCrimeQuery.lat, locationForCrimeQuery.lng);
      const response = await fetch(`/api/crime/nearby?lat=${locationForCrimeQuery.lat}&lng=${locationForCrimeQuery.lng}&radius=1609&minutes=30`);
      if (response.ok) {
        const data = await response.json();
        alert(`Crime data updated: ${data.total_incidents} incidents found in the last 30 minutes within a 9.99-mile radius.`);
      }
    } catch (error) {
      console.error('Error checking for nearby crimes:', error);
    }
  }, [locationForCrimeQuery]);

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
  };
};
