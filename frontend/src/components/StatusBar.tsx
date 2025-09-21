import React from 'react';

interface StatusBarProps {
  zoom: number;
  hasLocation: boolean;
  isLoading?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ zoom, hasLocation, isLoading = false }) => {
  return (
    <div className="absolute bottom-6 md:bottom-4 left-2 right-2 md:left-4 md:right-4 z-30">
      <div className="bg-[var(--base)]/95 backdrop-blur-sm rounded-lg shadow-lg border border-[var(--neutral)]/20 px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-[var(--accent)]' : 'bg-[var(--secondary)]'} animate-pulse`}></div>
              <span className="text-xs md:text-sm font-medium text-[var(--neutral)]">
                {isLoading ? 'Loading Safety Data' : 'Live Safety Data'}
              </span>
            </div>
            <div className="h-3 md:h-4 w-px bg-[var(--base)]/50"></div>
            <span className="text-xs md:text-sm text-[var(--neutral)]/70">
              Zoom: {zoom}x
            </span>
          </div>
          <div className="text-xs md:text-sm text-[var(--neutral)]/70 flex items-center space-x-1">
            {hasLocation ? (
              <>
                <svg className="w-3 h-3 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Location detected</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 border-2 border-[var(--neutral)]/50 border-t-transparent rounded-full animate-spin"></div>
                <span>Getting location...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
