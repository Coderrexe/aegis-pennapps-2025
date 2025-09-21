import React from 'react';
import { Autocomplete } from '@react-google-maps/api';

interface SearchPanelProps {
  isOpen: boolean;
  startLocation: string;
  endLocation: string;
  onStartLocationChange: (value: string) => void;
  onEndLocationChange: (value: string) => void;
  onStartPlaceChanged: () => void;
  onEndPlaceChanged: () => void;
  onStartAutocompleteLoad: (autocomplete: google.maps.places.Autocomplete) => void;
  onEndAutocompleteLoad: (autocomplete: google.maps.places.Autocomplete) => void;
  onSearch: () => void;
  onUseCurrentLocation: () => void;
  isLoaded: boolean;
  hasCurrentLocation?: boolean;
  isCalculatingRoute?: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  isOpen,
  startLocation,
  endLocation,
  onStartLocationChange,
  onEndLocationChange,
  onStartPlaceChanged,
  onEndPlaceChanged,
  onStartAutocompleteLoad,
  onEndAutocompleteLoad,
  onSearch,
  onUseCurrentLocation,
  isLoaded,
  hasCurrentLocation = false,
  isCalculatingRoute = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-18 left-3 w-11/12 max-w-2xl z-40 bg-[var(--base)] text-[var(--neutral)] rounded-xl shadow-2xl border border-[var(--neutral)]/20 overflow-hidden max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-[var(--neutral)] mb-4">Plan Your Safe Route</h2>
  
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
            <div className="relative flex-1">
              <label className="block text-sm font-medium text-[var(--neutral)] mb-2">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent)] mr-2"></div>
                  From
                </span>
              </label>
              {isLoaded && (
                <Autocomplete
                  onLoad={onStartAutocompleteLoad}
                  onPlaceChanged={onStartPlaceChanged}
                >
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => onStartLocationChange(e.target.value)}
                    placeholder="Enter starting location"
                    className="w-full px-4 py-2 border border-[var(--neutral)]/50 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all bg-[var(--base)] text-[var(--neutral)]"
                  />
                </Autocomplete>
              )}
            </div>
            
            <div className="relative flex-1">
              <label className="block text-sm font-medium text-[var(--neutral)] mb-2">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent)] mr-2"></div>
                  To
                </span>
              </label>
              {isLoaded && (
                <Autocomplete
                  onLoad={onEndAutocompleteLoad}
                  onPlaceChanged={onEndPlaceChanged}
                >
                  <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => onEndLocationChange(e.target.value)}
                    placeholder="Enter destination"
                    className="w-full px-4 py-2 border border-[var(--neutral)]/50 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all bg-[var(--base)] text-[var(--neutral)]"
                  />
                </Autocomplete>
              )}
            </div>
          </div>

          <button
            onClick={onSearch}
            disabled={!startLocation || !endLocation || isCalculatingRoute}
            className="w-full bg-[var(--primary)] hover:bg-opacity-80 disabled:bg-[var(--neutral)]/50 disabled:cursor-not-allowed text-[var(--neutral)] py-3 px-4 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            {isCalculatingRoute && (
              <div className="w-4 h-4 border-2 border-[var(--neutral)] border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isCalculatingRoute ? 'Calculating Route...' : 'Find Safe Route'}</span>
          </button>

          
          <div className="pt-2 border-t border-[var(--neutral)]/20">
            <p className="text-xs text-[var(--neutral)]/70 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={onUseCurrentLocation}
                disabled={!hasCurrentLocation}
                className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center space-x-1 ${
                  hasCurrentLocation 
                    ? 'bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--accent)] hover:shadow-sm' 
                    : 'bg-[var(--neutral)]/20 text-[var(--neutral)]/50 cursor-not-allowed'
                }`}
                title={hasCurrentLocation ? 'Fill start location with your current address' : 'Location not available'}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Use current location</span>
              </button>
              <button className="text-xs bg-[var(--neutral)]/20 hover:bg-[var(--neutral)]/40 text-[var(--neutral)] px-3 py-1 rounded-full transition-colors">
                Recent searches
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
