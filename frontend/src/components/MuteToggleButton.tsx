import React from 'react';
import { useAudio } from '../context/AudioContext';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export const MuteToggleButton: React.FC = () => {
  const { isMuted, toggleMute } = useAudio();

  return (
    <button onClick={toggleMute} className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-opacity">
      {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
    </button>
  );
};
