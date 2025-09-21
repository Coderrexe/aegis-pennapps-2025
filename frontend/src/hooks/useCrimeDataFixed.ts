import { useState, useEffect, useCallback, useRef } from 'react';

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
  total_recent_crimes: number;
  crimes: CrimeIncident[];
  status: string;
  timestamp: string;
  alerts?: any[];
  breaking_news_count?: number;
  query_info?: any;
  real_time_summary?: {
    severity_breakdown: {
      high: number;
      medium: number;
      low: number;
    };
    crime_types_active: Record<string, number>;
    active_districts: Record<string, number>;
    hourly_pattern: Record<string, number>;
  };
}

interface UseCrimeDataProps {
  isNavigating: boolean;
  currentLocation: { lat: number; lng: number } | null;
  map: google.maps.Map | null;
}

export const useCrimeDataFixed = ({ isNavigating, currentLocation, map }: UseCrimeDataProps) => {
  const [crimeData, setCrimeData] = useState<CrimeDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crimeOverlays, setCrimeOverlays] = useState<google.maps.Circle[]>([]);
  const crimeDataLoadedRef = useRef(false); // Track if we've already loaded crime data

  // Fetch crime data from API
  const fetchCrimeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get recent crimes in the area (last 7 days, more data for better visualization)
      const response = await fetch(
        `http://localhost:8000/api/crimes/recent?hours=168&limit=1000&format=json`
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
      // Show all crimes for better coverage (bounds checking removed for smoother UX)
      // This ensures users see crime data even when zoomed out

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
          radius = 60 * ageFactor + 30; // 30-90m based on age (70% reduction from original)
          fillOpacity = 0.6 * ageFactor + 0.2; // 0.2-0.8 opacity
          strokeOpacity = 0.9;
          strokeWeight = 1;
          break;
        case 'medium':
          fillColor = '#ff9800'; // Bright orange
          strokeColor = '#f57c00'; // Dark orange
          radius = 45 * ageFactor + 22.5; // 22.5-67.5m based on age (70% reduction from original)
          fillOpacity = 0.5 * ageFactor + 0.15; // 0.15-0.65 opacity
          strokeOpacity = 0.8;
          strokeWeight = 1;
          break;
        case 'low':
          fillColor = '#ffc107'; // Bright yellow
          strokeColor = '#ff8f00'; // Dark yellow
          radius = 30 * ageFactor + 15; // 15-45m based on age (70% reduction from original)
          fillOpacity = 0.4 * ageFactor + 0.1; // 0.1-0.5 opacity
          strokeOpacity = 0.7;
          strokeWeight = 1;
          break;
        default:
          fillColor = '#9e9e9e';
          strokeColor = '#616161';
          radius = 22.5; // 70% reduction from original 75m
          fillOpacity = 0.2;
          strokeOpacity = 0.6;
          strokeWeight = 1;
      }

      try {
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
      } catch (error) {
        console.warn('Error creating crime overlay:', error);
      }
    });

    setCrimeOverlays(newOverlays);
    console.log(`✅ ${newOverlays.length / 2} crime areas displayed`);
  }, [crimeOverlays]);

  // Clear all crime overlays
  const clearCrimeOverlays = useCallback(() => {
    crimeOverlays.forEach(overlay => {
      try {
        overlay.setMap(null);
      } catch (error) {
        console.warn('Error clearing overlay:', error);
      }
    });
    setCrimeOverlays([]);
  }, [crimeOverlays]);

  // Load crime data ONLY ONCE when navigation starts
  useEffect(() => {
    if (!isNavigating) {
      // Reset the flag when navigation stops
      crimeDataLoadedRef.current = false;
      // Clear overlays when navigation stops
      try {
        clearCrimeOverlays();
      } catch (error) {
        console.error('Error clearing crime overlays:', error);
      }
      return;
    }
    
    // Only load if we haven't loaded before AND we have all requirements
    if (isNavigating && currentLocation && map && !crimeDataLoadedRef.current) {
      console.log('🔍 Loading crime data for navigation (one time only)...');
      crimeDataLoadedRef.current = true; // Mark as loaded immediately to prevent re-runs
      
      // Add a delay to ensure map is fully loaded before adding overlays
      const timeoutId = setTimeout(() => {
        fetchCrimeData().then(data => {
          if (data && data.crimes) {
            console.log(`✅ Crime data loaded: ${data.crimes.length} crimes (static display)`);
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
      }, 2000); // Wait 2 seconds for smoother experience
      
      return () => clearTimeout(timeoutId);
    }
  }, [isNavigating, currentLocation, map, fetchCrimeData, createCrimeOverlays, clearCrimeOverlays]);

  // Removed bounds change listener for smoother experience
  // Crime overlays are now static once loaded during navigation

  return {
    crimeData,
    isLoading,
    error,
    fetchCrimeData,
    clearCrimeOverlays,
    crimeOverlays: crimeOverlays.length,
  };
};
