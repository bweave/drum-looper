import React from 'react';
import { MIN_TEMPO, MAX_TEMPO } from '../utils/constants';
import './TempoControl.css';

function TempoControl({ tempo, onChange }) {
  return (
    <div className="tempo-control">
      <label htmlFor="tempo">Tempo:</label>
      <input
        id="tempo"
        type="range"
        min={MIN_TEMPO}
        max={MAX_TEMPO}
        value={tempo}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="tempo-slider"
      />
      <span className="tempo-value">{tempo} BPM</span>
    </div>
  );
}

export default TempoControl;
