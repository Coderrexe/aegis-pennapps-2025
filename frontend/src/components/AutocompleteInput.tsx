import React, { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface AutocompleteInputProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  placeholder: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ onPlaceSelect, placeholder }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address']
    });
    setPlaceAutocomplete(autocomplete);
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    const listener = placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace();
      console.log('Place selected:', place);
      onPlaceSelect(place);
    });

    return () => {
      listener.remove();
    };
  }, [placeAutocomplete, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className="border border-gray-300 p-2 rounded-md w-full"
    />
  );
};

export default AutocompleteInput;
