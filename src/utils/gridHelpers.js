import { SUBDIVISIONS, DRUM_ORDER, DEFAULT_VELOCITY } from './constants';

export const getStepsPerBar = (subdivision) => {
  const stepsMap = {
    [SUBDIVISIONS.EIGHTH]: 8,
    [SUBDIVISIONS.EIGHTH_TRIPLET]: 12,
    [SUBDIVISIONS.SIXTEENTH]: 16,
    [SUBDIVISIONS.SIXTEENTH_TRIPLET]: 24,
    [SUBDIVISIONS.THIRTYSECOND]: 32
  };
  return stepsMap[subdivision] || 16;
};

export const getTotalSteps = (bars, subdivision) => {
  return getStepsPerBar(subdivision) * bars;
};

export const createEmptyGrid = (totalSteps) => {
  const grid = {};
  DRUM_ORDER.forEach(drum => {
    grid[drum] = Array(totalSteps).fill(null).map(() => ({
      active: false,
      velocity: DEFAULT_VELOCITY
    }));
  });
  return grid;
};

export const resizeGrid = (currentGrid, newStepCount) => {
  const newGrid = {};
  DRUM_ORDER.forEach(drum => {
    newGrid[drum] = Array(newStepCount).fill(null).map((_, idx) => {
      if (currentGrid[drum] && currentGrid[drum][idx]) {
        return currentGrid[drum][idx];
      }
      return { active: false, velocity: DEFAULT_VELOCITY };
    });
  });
  return newGrid;
};

export const getToneSubdivision = (subdivision) => {
  const toneMap = {
    [SUBDIVISIONS.EIGHTH]: '8n',
    [SUBDIVISIONS.EIGHTH_TRIPLET]: '8t',
    [SUBDIVISIONS.SIXTEENTH]: '16n',
    [SUBDIVISIONS.SIXTEENTH_TRIPLET]: '16t',
    [SUBDIVISIONS.THIRTYSECOND]: '32n'
  };
  return toneMap[subdivision] || '16n';
};
