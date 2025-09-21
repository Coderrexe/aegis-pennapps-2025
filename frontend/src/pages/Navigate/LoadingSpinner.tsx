import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--base)] text-[var(--neutral)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
        <h2 className="text-xl mb-2">Loading Aegis Navigation</h2>
        <p>Preparing your safe navigation experience...</p>
      </div>
    </div>
  );
};
