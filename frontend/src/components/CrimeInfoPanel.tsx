import React from 'react';
import type { CrimeDataResponse } from '../hooks/useCrimeDataFixed';

interface CrimeInfoPanelProps {
  crimeData: CrimeDataResponse | null;
  isLoading: boolean;
  error: string | null;
  isNavigating: boolean;
  overlayCount: number;
}

export const CrimeInfoPanel: React.FC<CrimeInfoPanelProps> = ({
  crimeData,
  isLoading,
  error,
  isNavigating,
  overlayCount,
}) => {
  if (!isNavigating) {
    return null;
  }

  return (
    <div className="absolute top-20 right-4 z-40 bg-[var(--base)]/95 backdrop-blur-sm border border-[var(--neutral)]/20 rounded-xl shadow-2xl max-w-xs">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="text-[var(--accent)] font-semibold text-sm">Crime Activity (7 Days)</h3>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-[var(--neutral)] text-xs">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading crime data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded-lg">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Failed to load crime data</span>
            </div>
          </div>
        )}

        {/* Crime Data Display */}
        {crimeData && !isLoading && (
          <div className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-[var(--neutral)] text-xs">
                <span className="text-[var(--accent)] font-medium">{crimeData.total_recent_crimes}</span> incidents detected
              </div>
              <div className="bg-[var(--neutral)]/10 p-2 rounded-lg">
                <div className="text-[var(--accent)] font-semibold">{overlayCount}</div>
                <div className="text-[var(--neutral)] text-xs">Visible Areas</div>
              </div>
            </div>

            {/* Severity Breakdown */}
            {crimeData.real_time_summary?.severity_breakdown && (
              <div className="space-y-2">
                <div className="text-[var(--neutral)] text-xs font-medium">Severity Levels</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-[var(--neutral)]">High</span>
                    </div>
                    <span className="text-[var(--accent)] font-medium">
                      {crimeData.real_time_summary.severity_breakdown.high}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-[var(--neutral)]">Medium</span>
                    </div>
                    <span className="text-[var(--accent)] font-medium">
                      {crimeData.real_time_summary.severity_breakdown.medium}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-[var(--neutral)]">Low</span>
                    </div>
                    <span className="text-[var(--accent)] font-medium">
                      {crimeData.real_time_summary.severity_breakdown.low}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="border-t border-[var(--neutral)]/20 pt-2">
              <div className="text-[var(--neutral)] text-xs font-medium mb-1">Legend</div>
              <div className="text-xs text-[var(--neutral)]/80 space-y-1">
                <div>🔴 High severity crimes (bright red)</div>
                <div>🟠 Medium severity crimes (orange)</div>
                <div>🟡 Low severity crimes (yellow)</div>
                <div className="mt-2 text-[var(--neutral)]/60">
                  Newer crimes appear brighter and larger. Click circles for details.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
