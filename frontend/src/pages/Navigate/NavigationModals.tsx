import React from 'react';
import { NavigationUI } from './NavigationUI';
import { CrimeDetectedModal } from './CrimeDetectedModal';

interface NavigationModalsProps {
  isNavigating: boolean;
  navigationSteps: google.maps.DirectionsStep[];
  currentStepIndex: number;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  handleStopNavigation: () => void;
  remainingDistance: string;
  remainingTime: string;
  crime: any | null;
  onCloseCrimeModal: () => void;
  onSwitchPath: () => void;
  currentUserLocation: { lat: number; lng: number } | null;
  alternateRoute: { path: google.maps.LatLngLiteral[], time: number, addedTime: number } | null;
  onSelectSaferRoute: () => void;
}

export const NavigationModals: React.FC<NavigationModalsProps> = (props) => {
  if (!props.isNavigating) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-4 right-4 z-50 flex flex-col-reverse items-end gap-4 md:items-start">
      <NavigationUI
        isNavigating={props.isNavigating}
        navigationSteps={props.navigationSteps}
        currentStepIndex={props.currentStepIndex}
        handleNextStep={props.handleNextStep}
        handlePrevStep={props.handlePrevStep}
        handleStopNavigation={props.handleStopNavigation}
        remainingDistance={props.remainingDistance}
        remainingTime={props.remainingTime}
      />
      <CrimeDetectedModal
        crime={props.crime}
        onClose={props.onCloseCrimeModal}
        onSwitchPath={props.onSwitchPath}
        currentUserLocation={props.currentUserLocation}
        alternateRoute={props.alternateRoute}
        onSelectSaferRoute={props.onSelectSaferRoute}
      />
    </div>
  );
};
