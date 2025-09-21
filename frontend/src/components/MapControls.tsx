import React from 'react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onMyLocation,
}) => {
  return (
    <div className="absolute right-2 md:right-4 top-20 md:top-24 z-30 flex flex-col space-y-2">
      <div className="bg-[var(--base)]/95 backdrop-blur-sm rounded-lg shadow-lg border border-[var(--neutral)]/20 overflow-hidden">
        <button
          onClick={onZoomIn}
          className="block w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/20 transition-colors border-b border-[var(--neutral)]/20 touch-manipulation cursor-pointer"
          aria-label="Zoom in"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--neutral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={onZoomOut}
          className="block w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/20 transition-colors touch-manipulation cursor-pointer"
          aria-label="Zoom out"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--neutral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>
      <button
        onClick={onMyLocation}
        className="w-8 h-8 md:w-10 md:h-10 bg-[var(--base)]/95 backdrop-blur-sm rounded-lg shadow-lg border border-[var(--neutral)]/20 flex items-center justify-center active:bg-[var(--primary)]/20 transition-colors touch-manipulation cursor-pointer"
        aria-label="Go to my location"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--neutral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};
