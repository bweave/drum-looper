import React from 'react';
import { SUBDIVISIONS, SUBDIVISION_LABELS } from '../utils/constants';
import './SubdivisionSelector.css';

function SubdivisionSelector({ subdivision, onChange }) {
  const subdivisionOptions = Object.values(SUBDIVISIONS);

  return (
    <div className="subdivision-selector">
      <label htmlFor="subdivision">Subdivision:</label>
      <div className="subdivision-buttons">
        {subdivisionOptions.map(sub => (
          <button
            key={sub}
            className={`subdivision-button ${subdivision === sub ? 'active' : ''}`}
            onClick={() => onChange(sub)}
          >
            {SUBDIVISION_LABELS[sub]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SubdivisionSelector;
