import React from 'react';

export const ErrorDisplay: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--base)] text-[var(--neutral)]">
      <div className="text-center">
        <div className="text-secondary text-xl mb-2">⚠️</div>
        <h2 className="text-xl mb-2">Error Loading Map</h2>
        <p>Please check your internet connection and try again.</p>
      </div>
    </div>
  );
};
