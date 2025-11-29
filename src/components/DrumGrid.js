import React from 'react';
import DrumRow from './DrumRow';
import { DRUM_ORDER, DRUM_LABELS } from '../utils/constants';
import './DrumGrid.css';

function DrumGrid({ grid, currentStep, onToggle }) {
  return (
    <div className="drum-grid">
      {DRUM_ORDER.map(drumType => (
        <DrumRow
          key={drumType}
          drumType={drumType}
          label={DRUM_LABELS[drumType]}
          steps={grid[drumType]}
          currentStep={currentStep}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default DrumGrid;
