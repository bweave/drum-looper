import React from 'react';
import { MIN_BARS, MAX_BARS } from '../utils/constants';
import './BarSelector.css';

function BarSelector({ bars, onChange }) {
  const barOptions = [];
  for (let i = MIN_BARS; i <= MAX_BARS; i++) {
    barOptions.push(i);
  }

  return (
    <div className="bar-selector">
      <label htmlFor="bars">Bars:</label>
      <div className="bar-buttons">
        {barOptions.map(num => (
          <button
            key={num}
            className={`bar-button ${bars === num ? 'active' : ''}`}
            onClick={() => onChange(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

export default BarSelector;
