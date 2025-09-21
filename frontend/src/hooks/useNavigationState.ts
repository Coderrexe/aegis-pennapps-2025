import { useState, useRef, useCallback, useEffect } from 'react';
import apiClient from '../utils/api';

interface UseNavigationStateProps {
  map: google.maps.Map | null;
  currentLocation: { lat: number; lng: number } | null;
  directionsResponse: google.maps.DirectionsResult | null;
  setDirectionsResponse: (response: google.maps.DirectionsResult | null) => void;
  navigationSteps: google.maps.DirectionsStep[];
  setNavigationSteps: (steps: google.maps.DirectionsStep[]) => void;
}

export const useNavigationState = ({ map, currentLocation, directionsResponse, setDirectionsResponse, navigationSteps, setNavigationSteps }: UseNavigationStateProps) => {
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
  const [alternateRoute, setAlternateRoute] = useState<{ path: google.maps.LatLngLiteral[], time: number, addedTime: number } | null>(null);
  const [showAlternateRoute, setShowAlternateRoute] = useState(false);
  const dismissedCrimeIds = useRef(new Set<string | number>());

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
      const response = await apiClient.get(`/api/crime/nearby?lat=${locationForCrimeQuery.lat}&lng=${locationForCrimeQuery.lng}&radius=10000&hours=168`);
      if (response.data && response.data.total_incidents > 0) {
        const mostRelevantCrime = response.data.incidents[0];
        if (!dismissedCrimeIds.current.has(mostRelevantCrime.id)) {
          console.log('Crime detected:', mostRelevantCrime);
          setDetectedCrime(mostRelevantCrime);
        } else {
          console.log('Ignoring already dismissed crime:', mostRelevantCrime.id);
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
      console.log("Coords: ", locationForCrimeQuery.lat, locationForCrimeQuery.lng, destination.lat(), destination.lng());

      const endpoint = '/api/algorithm/find-path';
      const params = {
        start_lat: locationForCrimeQuery.lat,
        start_lon: locationForCrimeQuery.lng,
        end_lat: destination.lat(),
        end_lon: destination.lng(),
      };

      const queryString = new URLSearchParams(params as any).toString();
      console.log(`POST ${apiClient.defaults.baseURL}${endpoint}?${queryString}`);

      const response = await apiClient.post(endpoint, params);

      if (response.data && response.data.paths && response.data.paths.length > 0) {
        const safestPath = response.data.paths[0];
        console.log('Safest path selected:', safestPath);

        const startCoord = { lat: locationForCrimeQuery.lat, lng: locationForCrimeQuery.lng };
        const endCoord = { lat: destination.lat(), lng: destination.lng() };
        const unorderedPath: google.maps.LatLngLiteral[] = safestPath.path_coordinates.map((coord: [number, number]) => ({ lat: coord[0], lng: coord[1] }));

        // Simplified greedy nearest-neighbor sorting
        const sortedPath: google.maps.LatLngLiteral[] = [];
        if (unorderedPath.length > 0) {
          sortedPath.push(unorderedPath.shift()!);
          while (unorderedPath.length > 0) {
            let nearestPointIndex = -1;
            let minDistance = Infinity;
            const lastPoint = sortedPath[sortedPath.length - 1];

            unorderedPath.forEach((point: google.maps.LatLngLiteral, index: number) => {
              const distance = Math.sqrt(Math.pow(point.lat - lastPoint.lat, 2) + Math.pow(point.lng - lastPoint.lng, 2));
              if (distance < minDistance) {
                minDistance = distance;
                nearestPointIndex = index;
              }
            });

            if (nearestPointIndex !== -1) {
              sortedPath.push(unorderedPath.splice(nearestPointIndex, 1)[0]);
            } else {
              break; // Should not happen, but as a safeguard
            }
          }
        }

        const newPathCoordinates = [
          startCoord,
          ...sortedPath,
          endCoord
        ];

        const originalDuration = directionsResponse.routes[0].legs[0].duration?.value || 0;
        const addedTimeInMinutes = Math.round((safestPath.time - originalDuration) / 60);

        setAlternateRoute({
          path: newPathCoordinates,
          time: safestPath.time,
          addedTime: addedTimeInMinutes > 0 ? addedTimeInMinutes : 0,
        });
        setShowAlternateRoute(true);

        console.log(`Alternate route is ${addedTimeInMinutes > 0 ? addedTimeInMinutes : 'no'} minutes longer.`);

      } else {
        console.error('Failed to get an alternate route');
      }
    } catch (error) {
      console.error('Error switching paths:', error);
    }
  }, [locationForCrimeQuery, directionsResponse]);

  const dismissCrime = useCallback((crimeId: string | number) => {
    dismissedCrimeIds.current.add(crimeId);
    setDetectedCrime(null);
    setShowAlternateRoute(false);
    setAlternateRoute(null);
  }, []);

  const selectAlternateRoute = useCallback(() => {
    if (!alternateRoute || !map) return;

    // Immediately hide the old route for a cleaner transition
    setDirectionsResponse(null);

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: alternateRoute.path[0],
        destination: alternateRoute.path[alternateRoute.path.length - 1],
        waypoints: (() => {
          const waypoints = alternateRoute.path.slice(1, -1);
          const maxWaypoints = 25;
          if (waypoints.length <= maxWaypoints) {
            return waypoints.map(p => ({ location: p, stopover: false }));
          }

          const sampledWaypoints = [];
          const step = Math.ceil(waypoints.length / maxWaypoints);
          for (let i = 0; i < waypoints.length; i += step) {
            sampledWaypoints.push(waypoints[i]);
          }
          return sampledWaypoints.map(p => ({ location: p, stopover: false }));
        })(),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
          if (result.routes[0] && result.routes[0].legs[0]) {
            setNavigationSteps(result.routes[0].legs[0].steps);
          }
          // Reset states after selecting the new route
          setShowAlternateRoute(false);
          setAlternateRoute(null);
          if (detectedCrime) {
            dismissCrime(detectedCrime.id);
          }
        } else {
          console.error(`Error fetching new directions: ${status}`);
        }
      }
    );
  }, [alternateRoute, map, setDirectionsResponse, detectedCrime, dismissCrime, setNavigationSteps]);

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
    alternateRoute,
    showAlternateRoute,
    selectAlternateRoute,
    dismissCrime,
  };
};
