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
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 left-2 right-2 md:left-4 md:right-4 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Plan Your Safe Route</h2>
        
        <div className="space-y-4">
          {/* Start Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </Autocomplete>
            )}
          </div>

          {/* End Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </Autocomplete>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            disabled={!startLocation || !endLocation}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md"
          >
            Find Safe Route
          </button>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={onUseCurrentLocation}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                Use current location
              </button>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors">
                Recent searches
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
