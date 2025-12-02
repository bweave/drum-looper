import React from 'react';
import TransportControls from './TransportControls';
import TempoControl from './TempoControl';
import BarSelector from './BarSelector';
import SubdivisionSelector from './SubdivisionSelector';
import './Controls.css';

function Controls({
  isPlaying,
  tempo,
  bars,
  subdivision,
  patterns,
  onPlay,
  onStop,
  onReset,
  onSave,
  onLoad,
  onDeletePattern,
  onTempoChange,
  onBarsChange,
  onSubdivisionChange
}) {
  return (
    <div className="controls">
      <div className="controls-row">
        <TransportControls
          isPlaying={isPlaying}
          onPlay={onPlay}
          onStop={onStop}
          onReset={onReset}
          onSave={onSave}
          patterns={patterns}
          onLoad={onLoad}
          onDeletePattern={onDeletePattern}
        />
        <TempoControl tempo={tempo} onChange={onTempoChange} />
      </div>
      <div className="controls-row">
        <BarSelector bars={bars} onChange={onBarsChange} />
        <SubdivisionSelector subdivision={subdivision} onChange={onSubdivisionChange} />
      </div>
    </div>
  );
}

export default Controls;
