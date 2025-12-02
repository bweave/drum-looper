export const DRUM_TYPES = {
  HIHAT: 'hihat',
  RACK: 'rack',
  SNARE: 'snare',
  FLOOR: 'floor',
  KICK: 'kick'
};

export const DRUM_LABELS = {
  [DRUM_TYPES.HIHAT]: 'Hi-Hat',
  [DRUM_TYPES.RACK]: 'Rack Tom',
  [DRUM_TYPES.SNARE]: 'Snare',
  [DRUM_TYPES.FLOOR]: 'Floor Tom',
  [DRUM_TYPES.KICK]: 'Kick'
};

export const DRUM_ORDER = [
  DRUM_TYPES.HIHAT,
  DRUM_TYPES.RACK,
  DRUM_TYPES.SNARE,
  DRUM_TYPES.FLOOR,
  DRUM_TYPES.KICK
];

export const SUBDIVISIONS = {
  EIGHTH: '8th',
  EIGHTH_TRIPLET: '8th-triplet',
  SIXTEENTH: '16th',
  SIXTEENTH_TRIPLET: '16th-triplet',
  THIRTYSECOND: '32nd'
};

export const SUBDIVISION_LABELS = {
  [SUBDIVISIONS.EIGHTH]: '8th Notes',
  [SUBDIVISIONS.EIGHTH_TRIPLET]: '8th Triplets',
  [SUBDIVISIONS.SIXTEENTH]: '16th Notes',
  [SUBDIVISIONS.SIXTEENTH_TRIPLET]: '16th Triplets',
  [SUBDIVISIONS.THIRTYSECOND]: '32nd Notes'
};

export const DEFAULT_TEMPO = 96;
export const MIN_TEMPO = 40;
export const MAX_TEMPO = 240;
export const DEFAULT_VELOCITY = 0.7;
export const MIN_BARS = 1;
export const MAX_BARS = 2;
