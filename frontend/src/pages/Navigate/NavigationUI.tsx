import React from 'react';

interface NavigationUIProps {
  isNavigating: boolean;
  navigationSteps: google.maps.DirectionsStep[];
  currentStepIndex: number;
  handleStopNavigation: () => void;
  remainingDistance: string;
  remainingTime: string;
  isTrackingLocation: boolean;
  isDemoMode: boolean;
}

export const NavigationUI: React.FC<NavigationUIProps> = ({
  isNavigating,
  navigationSteps,
  currentStepIndex,
  handleStopNavigation,
  remainingDistance,
  remainingTime,
  isTrackingLocation,
  isDemoMode,
}) => {
  if (!isNavigating || navigationSteps.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-24 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/90 rounded-2xl shadow-2xl overflow-hidden border border-[var(--primary)]/20">
        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <div className="text-[var(--neutral)] text-sm">Navigation Active</div>
              <div className="text-gray-200 text-xs">Step {currentStepIndex + 1} of {navigationSteps.length}</div>
            </div>
          </div>
          <button
            onClick={handleStopNavigation}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {navigationSteps[currentStepIndex] && (
          <div className="px-4 py-3 bg-[var(--neutral)]">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)]/90 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[var(--neutral)] text-sm">{currentStepIndex + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[var(--base)] text-sm leading-tight mb-1"
                  dangerouslySetInnerHTML={{
                    __html: navigationSteps[currentStepIndex].instructions
                  }}
                />
                <div className="text-[var(--primary)] text-xs">
                  In {navigationSteps[currentStepIndex].distance?.text}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pb-2">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / navigationSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 bg-[var(--neutral)]/95 backdrop-blur-sm rounded-xl shadow-lg border border-[var(--neutral)]/50 overflow-hidden">
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <svg className="w-4 h-4 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-xs text-[var(--base)]">Distance</span>
              </div>
              <div className="text-lg text-[var(--secondary)]">{remainingDistance}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-[var(--base)]">ETA</span>
              </div>
              <div className="text-lg text-[var(--accent)]">{remainingTime}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center space-x-2">
        {isTrackingLocation && (
          <div className="bg-[var(--secondary)] text-[var(--neutral)] px-3 py-1 rounded-full text-xs flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Live Tracking</span>
          </div>
        )}
        {isDemoMode && (
          <div className="bg-[var(--primary)] text-[var(--neutral)] px-3 py-1 rounded-full text-xs flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-spin"></div>
            <span>Demo Mode</span>
          </div>
        )}
      </div>
    </div>
  );
};
