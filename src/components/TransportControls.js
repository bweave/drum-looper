import React from 'react';
import './TransportControls.css';

function TransportControls({ isPlaying, onPlay, onStop, onReset }) {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire pattern? This cannot be undone.')) {
      onReset();
    }
  };

  return (
    <div className="transport-controls">
      <button
        className="transport-button play-button"
        onClick={onPlay}
        disabled={isPlaying}
      >
        ▶ Play
      </button>
      <button
        className="transport-button stop-button"
        onClick={onStop}
        disabled={!isPlaying}
      >
        ◼ Stop
      </button>
      <button
        className="transport-button reset-button"
        onClick={handleReset}
      >
        ↺ Clear
      </button>
    </div>
  );
}

export default TransportControls;
