export const getSynthConfig = (drumType) => {
  const configs = {
    hihat: {
      type: 'hihat',
      config: {
        noise: {
          type: 'white'
        },
        envelope: {
          attack: 0.001,
          decay: 0.05,
          sustain: 0,
          release: 0.05
        }
      }
    },
    rack: {
      type: 'tom',
      config: {
        pitchDecay: 0.02,
        octaves: 1.5,
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0,
          release: 0.1
        }
      },
      note: 'A3',
      noiseConfig: {
        noise: {
          type: 'brown'
        },
        envelope: {
          attack: 0.001,
          decay: 0.02,
          sustain: 0
        }
      }
    },
    snare: {
      type: 'snare',
      bodyConfig: {
        pitchDecay: 0.05,
        octaves: 3,
        oscillator: {
          type: 'triangle'
        },
        envelope: {
          attack: 0.001,
          decay: 0.15,
          sustain: 0
        }
      },
      bodyNote: 'C3',
      noiseConfig: {
        noise: {
          type: 'white'
        },
        envelope: {
          attack: 0.001,
          decay: 0.15,
          sustain: 0
        }
      }
    },
    floor: {
      type: 'tom',
      config: {
        pitchDecay: 0.02,
        octaves: 1.5,
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.001,
          decay: 0.25,
          sustain: 0,
          release: 0.15
        }
      },
      note: 'D3',
      noiseConfig: {
        noise: {
          type: 'brown'
        },
        envelope: {
          attack: 0.001,
          decay: 0.02,
          sustain: 0
        }
      }
    },
    kick: {
      type: 'kick',
      config: {
        pitchDecay: 0.03,
        octaves: 8,
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.001,
          decay: 0.3,
          sustain: 0,
          release: 0.2
        }
      },
      note: 'C1'
    }
  };

  return configs[drumType];
};
