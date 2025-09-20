import React from 'react';
import { Link } from 'react-router-dom';
import AutocompleteInput from './AutocompleteInput';

interface NavigationControlsProps {
  onStartPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  onDestinationPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  onGetDirectionsClick: () => void;
  isDirectionsDisabled: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onStartPlaceSelect,
  onDestinationPlaceSelect,
  onGetDirectionsClick,
  isDirectionsDisabled,
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-4 w-96">
      <Link to="/" className="w-full">
        <button className="w-full bg-[var(--base)] text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-[var(--primary)] transition-colors duration-300">
          Home
        </button>
      </Link>
      <div className="bg-[var(--base)] bg-opacity-90 p-6 rounded-lg shadow-lg flex flex-col gap-4">
        <AutocompleteInput onPlaceSelect={onStartPlaceSelect} placeholder="Enter start location" />
        <AutocompleteInput onPlaceSelect={onDestinationPlaceSelect} placeholder="Enter destination" />
        <button
          onClick={onGetDirectionsClick}
          className="w-full bg-[var(--accent)] text-[var(--primary)] font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-yellow-400 disabled:bg-[var(--neutral)] disabled:cursor-not-allowed transition-colors duration-300"
          disabled={isDirectionsDisabled}
        >
          Get Directions
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;