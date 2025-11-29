import React from 'react';
import './GridCell.css';

function GridCell({ active, velocity, isCurrentStep, onClick }) {
  const getVelocityClass = () => {
    if (!active) return '';
    if (velocity >= 0.95) return 'accent';
    if (velocity <= 0.35) return 'ghost';
    return 'regular';
  };

  const getTitle = () => {
    if (!active) return 'Click: Add note (70%)';
    if (velocity >= 0.95) return 'Click: Ghost note (30%)';
    if (velocity <= 0.35) return 'Click: Remove note';
    return 'Click: Accent (100%)';
  };

  return (
    <div
      className={`grid-cell ${active ? 'active' : ''} ${getVelocityClass()} ${isCurrentStep ? 'current-step' : ''}`}
      onClick={onClick}
      title={getTitle()}
    />
  );
}

export default React.memo(GridCell);
