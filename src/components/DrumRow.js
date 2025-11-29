import React from 'react';
import GridCell from './GridCell';
import './DrumRow.css';

function DrumRow({ drumType, label, steps, currentStep, onToggle }) {
  return (
    <div className="drum-row">
      <div className="drum-label">{label}</div>
      <div className="drum-cells">
        {steps.map((step, idx) => (
          <GridCell
            key={idx}
            active={step.active}
            velocity={step.velocity}
            isCurrentStep={currentStep === idx}
            onClick={() => onToggle(drumType, idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(DrumRow);
