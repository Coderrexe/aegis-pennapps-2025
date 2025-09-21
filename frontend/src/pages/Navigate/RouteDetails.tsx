import React from 'react';

type RoutePreference = 'fastest' | 'lighting' | 'balanced';

interface RouteDetailsProps {
  routeInfo: { distance: string; duration: string; } | null;
  directionsResponse: google.maps.DirectionsResult | null;
  isNavigating: boolean;
  setDirectionsResponse: (response: google.maps.DirectionsResult | null) => void;
  setRouteInfo: (info: { distance: string; duration: string; } | null) => void;
  handleStartNavigation: () => void;
  setSearchPanelOpen: (open: boolean) => void;
  routePreference: RoutePreference;
  setRoutePreference: (preference: RoutePreference) => void;
}

export const RouteDetails: React.FC<RouteDetailsProps> = ({
  routeInfo,
  directionsResponse,
  isNavigating,
  setDirectionsResponse,
  setRouteInfo,
  handleStartNavigation,
  setSearchPanelOpen,
  routePreference,
  setRoutePreference,
}) => {
  if (!routeInfo || !directionsResponse || isNavigating) {
    return null;
  }

  return (
    <div className="absolute top-18 right-3 w-11/12 max-w-2xl z-40 bg-[var(--base)] text-[var(--neutral)] rounded-xl shadow-2xl border border-[var(--neutral)]/20 overflow-hidden max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold text-[var(--neutral)] mb-4">Route Details</h2>
          <button
            onClick={() => {
              setDirectionsResponse(null);
              setRouteInfo(null);
            }}
            className="text-[var(--neutral)]/50 hover:text-[var(--neutral)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative flex-1">
              <label className="block text-sm font-medium text-[var(--neutral)] mb-2">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent)] mr-2"></div>
                  Distance
                </span>
              </label>
              <p className="w-full px-4 py-2 border border-[var(--neutral)]/50 rounded-lg bg-[var(--base)] text-[var(--neutral)]">{routeInfo.distance}</p>
            </div>
            <div className="relative flex-1">
              <label className="block text-sm font-medium text-[var(--neutral)] mb-2">
                <span className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[var(--accent)] mr-2"></div>
                  Duration
                </span>
              </label>
              <p className="w-full px-4 py-2 border border-[var(--neutral)]/50 rounded-lg bg-[var(--base)] text-[var(--neutral)]">{routeInfo.duration}</p>
            </div>
        </div>

        <div className="border-t border-[var(--neutral)]/20">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-[var(--base)]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[var(--base)]">
            <button
              onClick={() => setRoutePreference('fastest')}
              className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                routePreference === 'fastest'
                  ? 'bg-[var(--primary)] text-[var(--neutral)] shadow-md'
                  : 'bg-gray-100 text-[var(--base)] hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Fastest</span>
              </div>
            </button>

            <button
              onClick={() => setRoutePreference('balanced')}
              className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                routePreference === 'balanced'
                  ? 'bg-[var(--secondary)] text-[var(--neutral)] shadow-md'
                  : 'bg-gray-100 text-[var(--base)] hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Balanced</span>
              </div>
            </button>

            <button
              onClick={() => setRoutePreference('lighting')}
              className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                routePreference === 'lighting'
                  ? 'bg-[var(--accent)] text-[var(--base)] shadow-md'
                  : 'bg-gray-100 text-[var(--base)] hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Most Lighting</span>
              </div>
            </button>
          </div>
          <div className="mt-2 p-2 rounded text-xs text-[var(--neutral)]/70 bg-[var(--base)]">
            {routePreference === 'fastest' && <span>🚀 Prioritizes speed and shortest distance</span>}
            {routePreference === 'balanced' && <span>⚖️ Balances safety and efficiency (Recommended)</span>}
            {routePreference === 'lighting' && <span>💡 Prioritizes well-lit areas and safety</span>}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleStartNavigation}
            className="w-full bg-[var(--primary)] hover:bg-opacity-80 text-[var(--neutral)] py-3 px-4 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Start Navigating</span>
          </button>

          <button
            onClick={() => setSearchPanelOpen(true)}
            className="w-full bg-[var(--neutral)]/20 hover:bg-[var(--neutral)]/40 text-[var(--neutral)] py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Route</span>
          </button>
        </div>
      </div>
    </div>
  );
};
