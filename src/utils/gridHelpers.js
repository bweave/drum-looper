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

export const createDefaultBeatGrid = () => {
  const grid = createEmptyGrid(16);

  // Hi-hat on 8th notes (every other 16th note: 0, 2, 4, 6, 8, 10, 12, 14)
  [0, 2, 4, 6, 8, 10, 12, 14].forEach(step => {
    grid.hihat[step] = { active: true, velocity: DEFAULT_VELOCITY };
  });

  // Snare on beats 2 and 4 (steps 4 and 12 in 16th notes)
  [4, 12].forEach(step => {
    grid.snare[step] = { active: true, velocity: DEFAULT_VELOCITY };
  });

  // Kick on beat 1, beat 3, and the & of 3 (steps 0, 8, and 10)
  [0, 8, 10].forEach(step => {
    grid.kick[step] = { active: true, velocity: DEFAULT_VELOCITY };
  });

  return grid;
};
