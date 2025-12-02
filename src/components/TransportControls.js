import React from 'react';
import PatternSelector from './PatternSelector';
import './TransportControls.css';

function TransportControls({ isPlaying, onPlay, onStop, onReset, onSave, onShare, patterns, onLoad, onDeletePattern }) {
  const handleSave = () => {
    const name = window.prompt('Enter a name for this pattern:');
    if (name && name.trim()) {
      onSave(name.trim());
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
        onClick={onReset}
      >
        ↺ Clear
      </button>
      <button
        className="transport-button save-button"
        onClick={handleSave}
      >
        💾 Save
      </button>
      <button
        className="transport-button share-button"
        onClick={onShare}
      >
        🔗 Share
      </button>
      <PatternSelector
        patterns={patterns}
        onLoad={onLoad}
        onDelete={onDeletePattern}
      />
    </div>
  );
}

export default TransportControls;
