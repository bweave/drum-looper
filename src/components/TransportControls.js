import React from 'react';
import './TransportControls.css';

function TransportControls({ isPlaying, onPlay, onStop, onReset }) {
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
        onClick={onReset}
      >
        ↺ Clear
      </button>
    </div>
  );
}

export default TransportControls;
