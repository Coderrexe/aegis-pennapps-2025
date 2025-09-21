import React from 'react';
import { Link } from 'react-router-dom';
import { MuteToggleButton } from '../../components/MuteToggleButton';

interface NavigationHeaderProps {
  searchPanelOpen: boolean;
  setSearchPanelOpen: (open: boolean) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ searchPanelOpen, setSearchPanelOpen }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-[var(--base)]/95 backdrop-blur-sm border-b border-[var(--neutral)]/20">
      <div className="flex items-center justify-between px-3 md:px-4 py-3">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link to="/" className="flex items-center space-x-1 md:space-x-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="h-4 md:h-6 w-px bg-transparent"></div>
          <h1 className="text-lg md:text-xl text-[var(--neutral)]">Aegis Navigation</h1>
        </div>
        <div className="flex items-center space-x-4">
          <MuteToggleButton />
          <button
            onClick={() => setSearchPanelOpen(!searchPanelOpen)}
            className="nav-link-style"
          >
            {searchPanelOpen ? 'Close' : 'Plan Route'}
          </button>
        </div>
      </div>
    </div>
  );
};
