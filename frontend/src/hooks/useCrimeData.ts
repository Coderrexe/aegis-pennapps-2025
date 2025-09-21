import { useState, useEffect, useCallback } from 'react';

export interface CrimeIncident {
  crime_id: number;
  datetime: string;
  date: string;
  time: string;
  hour: number;
  crime_type: string;
  crime_category: 'violent' | 'property' | 'drug' | 'other';
  severity: 'high' | 'medium' | 'low';
  address: string;
  latitude: number;
  longitude: number;
  coordinates: [number, number]; // [lng, lat] GeoJSON format
  district: string;
  police_service_area: string;
  incident_key: number;
  minutes_ago?: number;
  is_breaking?: boolean;
}

export interface CrimeDataResponse {
  total_crimes: number;
  crimes: CrimeIncident[];
  summary: {
    crime_types: Record<string, number>;
    districts: Record<string, number>;
    severity_breakdown: {
      high: number;
      medium: number;
      low: number;
    };
    hourly_pattern: Record<string, number>;
  };
}

interface UseCrimeDataProps {
  isNavigating: boolean;
  currentLocation: { lat: number; lng: number } | null;
  map: google.maps.Map | null;
}

export const useCrimeData = ({ isNavigating, currentLocation, map }: UseCrimeDataProps) => {
  const [crimeData, setCrimeData] = useState<CrimeDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crimeOverlays, setCrimeOverlays] = useState<google.maps.Circle[]>([]);

  // Fetch crime data from API
  const fetchCrimeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get recent crimes in the area (last 7 days, more data for better visualization)
      const response = await fetch(
        `http://localhost:5001/api/crimes/recent?hours=168&limit=1000&format=json`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch crime data: ${response.statusText}`);
      }

      const data: CrimeDataResponse = await response.json();
      setCrimeData(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching crime data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create crime overlays on the map with improved visualization
  const createCrimeOverlays = useCallback((crimes: CrimeIncident[], mapInstance: google.maps.Map) => {
    // Safety check - don't proceed if map is not ready
    if (!mapInstance || !crimes || crimes.length === 0) {
      console.log('Map not ready or no crimes to display');
      return;
    }

    // Clear existing overlays
    crimeOverlays.forEach(overlay => {
      try {
        overlay.setMap(null);
      } catch (error) {
        console.warn('Error clearing overlay:', error);
      }
    });

    const newOverlays: google.maps.Circle[] = [];

    crimes.forEach((crime) => {
      // Skip crimes that are too far from current view
      if (!mapInstance.getBounds()?.contains(new google.maps.LatLng(crime.latitude, crime.longitude))) {
        return;
      }

      // Enhanced color scheme and effects based on severity and recency
      let fillColor: string;
      let strokeColor: string;
      let radius: number;
      let fillOpacity: number;
      let strokeOpacity: number;
      let strokeWeight: number;

      // Calculate age factor (newer crimes are more prominent)
      const hoursAgo = crime.minutes_ago ? crime.minutes_ago / 60 : 168; // Default to 7 days if no minutes_ago
      const ageFactor = Math.max(0.3, 1 - (hoursAgo / 168)); // Fade over 7 days

      switch (crime.severity) {
        case 'high':
          fillColor = '#ff1744'; // Bright red
          strokeColor = '#d50000'; // Dark red
          radius = 200 * ageFactor + 100; // 100-300m based on age
          fillOpacity = 0.6 * ageFactor + 0.2; // 0.2-0.8 opacity
          strokeOpacity = 0.9;
          strokeWeight = 3;
          break;
        case 'medium':
          fillColor = '#ff9800'; // Bright orange
          strokeColor = '#f57c00'; // Dark orange
          radius = 150 * ageFactor + 75; // 75-225m based on age
          fillOpacity = 0.5 * ageFactor + 0.15; // 0.15-0.65 opacity
          strokeOpacity = 0.8;
          strokeWeight = 2;
          break;
        case 'low':
          fillColor = '#ffc107'; // Bright yellow
          strokeColor = '#ff8f00'; // Dark yellow
          radius = 100 * ageFactor + 50; // 50-150m based on age
          fillOpacity = 0.4 * ageFactor + 0.1; // 0.1-0.5 opacity
          strokeOpacity = 0.7;
          strokeWeight = 2;
          break;
        default:
          fillColor = '#9e9e9e';
          strokeColor = '#616161';
          radius = 75;
          fillOpacity = 0.2;
          strokeOpacity = 0.6;
          strokeWeight = 1;
      }

      // Create main circle with gradient-like effect
      const circle = new google.maps.Circle({
        strokeColor: strokeColor,
        strokeOpacity: strokeOpacity,
        strokeWeight: strokeWeight,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        map: mapInstance,
        center: { lat: crime.latitude, lng: crime.longitude },
        radius: radius,
        clickable: true,
      });

      // Add a smaller, brighter inner circle for "shiny dot" effect
      const innerCircle = new google.maps.Circle({
        strokeColor: '#ffffff',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: fillColor,
        fillOpacity: Math.min(1.0, fillOpacity + 0.3),
        map: mapInstance,
        center: { lat: crime.latitude, lng: crime.longitude },
        radius: radius * 0.3, // 30% of main circle
        clickable: true,
      });

      // Enhanced info window with better styling
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="
            color: #333; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 280px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          ">
            <div style="
              background: ${strokeColor}; 
              color: white; 
              padding: 8px 12px; 
              margin: -12px -12px 12px -12px; 
              border-radius: 8px 8px 0 0;
              font-weight: bold;
              font-size: 14px;
            ">
              🚨 ${crime.crime_type}
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="
                background: ${fillColor}; 
                color: white; 
                padding: 2px 8px; 
                border-radius: 12px; 
                font-size: 11px; 
                font-weight: bold;
                text-transform: uppercase;
              ">
                ${crime.severity}
              </span>
              <span style="margin-left: 8px; font-size: 12px; color: #666;">
                District ${crime.district}
              </span>
            </div>
            <p style="margin: 6px 0; font-size: 12px; color: #555;">
              📍 <strong>${crime.address}</strong>
            </p>
            <p style="margin: 6px 0; font-size: 12px; color: #555;">
              🕒 ${new Date(crime.datetime).toLocaleString()}
            </p>
            ${crime.minutes_ago && crime.minutes_ago < 1440 ? `
              <div style="
                background: #ffebee; 
                border-left: 4px solid #f44336; 
                padding: 8px; 
                margin-top: 8px;
                border-radius: 0 4px 4px 0;
              ">
                <strong style="color: #d32f2f;">
                  ⚡ ${crime.minutes_ago < 60 ? 
                    `${crime.minutes_ago} minutes ago` : 
                    `${Math.round(crime.minutes_ago / 60)} hours ago`
                  }
                </strong>
              </div>
            ` : ''}
          </div>
        `,
      });

      // Add click listeners to both circles
      const openInfoWindow = () => {
        infoWindow.setPosition({ lat: crime.latitude, lng: crime.longitude });
        infoWindow.open(mapInstance);
      };

      circle.addListener('click', openInfoWindow);
      innerCircle.addListener('click', openInfoWindow);

      newOverlays.push(circle, innerCircle);
    });

    setCrimeOverlays(newOverlays);
    console.log(`Created ${newOverlays.length / 2} crime visualizations on map`);
  }, [crimeOverlays]);

  // Clear all crime overlays
  const clearCrimeOverlays = useCallback(() => {
    crimeOverlays.forEach(overlay => overlay.setMap(null));
    setCrimeOverlays([]);
  }, [crimeOverlays]);

  // Load crime data when navigation starts
  useEffect(() => {
    console.log('Crime data effect triggered:', { isNavigating, hasLocation: !!currentLocation, hasMap: !!map });
    
    if (isNavigating && currentLocation && map) {
      console.log('Fetching crime data for navigation...');
      
      // Add a delay to ensure map is fully loaded before adding overlays
      setTimeout(() => {
        fetchCrimeData().then(data => {
          if (data && data.crimes) {
            console.log(`Received ${data.crimes.length} crimes, creating overlays...`);
            try {
              createCrimeOverlays(data.crimes, map);
            } catch (error) {
              console.error('Error creating crime overlays:', error);
              // Don't let crime overlay errors break navigation
            }
          } else {
            console.log('No crime data received');
          }
        }).catch(error => {
          console.error('Error fetching crime data:', error);
          // Don't let crime data errors break navigation
        });
      }, 1000); // Wait 1 second after navigation starts
      
    } else if (!isNavigating) {
      // Clear overlays when navigation stops
      console.log('Navigation stopped, clearing crime overlays');
      try {
        clearCrimeOverlays();
      } catch (error) {
        console.error('Error clearing crime overlays:', error);
      }
    }
  }, [isNavigating, currentLocation, map, fetchCrimeData, createCrimeOverlays, clearCrimeOverlays]);

  // Update overlays when map bounds change
  useEffect(() => {
    if (map && crimeData && isNavigating) {
      const boundsChangedListener = map.addListener('bounds_changed', () => {
        // Debounce the overlay update
        setTimeout(() => {
          if (crimeData.crimes) {
            createCrimeOverlays(crimeData.crimes, map);
          }
        }, 500);
      });

      return () => {
        google.maps.event.removeListener(boundsChangedListener);
      };
    }
  }, [map, crimeData, isNavigating, createCrimeOverlays]);

  return {
    crimeData,
    isLoading,
    error,
    fetchCrimeData,
    clearCrimeOverlays,
    crimeOverlays: crimeOverlays.length,
  };
};
