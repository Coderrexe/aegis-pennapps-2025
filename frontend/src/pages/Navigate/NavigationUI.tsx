import React from 'react';

interface NavigationUIProps {
  isNavigating: boolean;
  navigationSteps: google.maps.DirectionsStep[];
  currentStepIndex: number;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  handleStopNavigation: () => void;
  remainingDistance: string;
  remainingTime: string;
}

export const NavigationUI: React.FC<NavigationUIProps> = ({
  isNavigating,
  navigationSteps,
  currentStepIndex,
  handleNextStep,
  handlePrevStep,
  handleStopNavigation,
  remainingDistance,
  remainingTime,
}) => {

  if (!isNavigating || navigationSteps.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-md bg-[var(--base)] text-primary rounded-lg overflow-hidden shadow-2xl border border-[var(--neutral)]/10">
      <div className="bg-accent shadow-2xl overflow-hidden border-[var(--neutral)]/20">
        <div className="bg-accent px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer" onClick={handlePrevStep}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer" onClick={handleNextStep}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <div className="nav-link-style mt-1">Navigation Active</div>
              <div className="text-primary/80 text-xs">Step {currentStepIndex + 1} of {navigationSteps.length}</div>
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
          <div className="px-4 pb-4 pt-2 bg-base">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/90 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[var(--base)] text-sm">{currentStepIndex + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-primary text-sm leading-tight mb-1"
                  dangerouslySetInnerHTML={{
                    __html: navigationSteps[currentStepIndex].instructions
                  }}
                />
                <div className="text-[var(--neutral)] text-xs">
                  In {navigationSteps[currentStepIndex].distance?.text}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-base shadow-lg border-[var(--neutral)]/20 overflow-hidden">
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-primary/80 mb-1">Distance</div>
              <div className="text-lg text-[var(--accent)]">{remainingDistance}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-primary/80 mb-1">ETA</div>
              <div className="text-lg text-[var(--accent)]">{remainingTime}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
