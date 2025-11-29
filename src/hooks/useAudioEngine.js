import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { getSynthConfig } from '../utils/audioConfig';
import { DRUM_ORDER } from '../utils/constants';
import { getToneSubdivision } from '../utils/gridHelpers';

export function useAudioEngine() {
  const synthsRef = useRef(null);
  const loopRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    const synths = {};

    DRUM_ORDER.forEach(drumType => {
      const config = getSynthConfig(drumType);

      if (config.type === 'hihat') {
        const noiseSynth = new Tone.NoiseSynth(config.config);
        const filter = new Tone.Filter({
          type: 'highpass',
          frequency: 7000,
          rolloff: -12
        });
        noiseSynth.connect(filter);
        filter.toDestination();
        synths[drumType] = noiseSynth;
      } else if (config.type === 'tom') {
        const membrane = new Tone.MembraneSynth(config.config);
        const noise = new Tone.NoiseSynth(config.noiseConfig);
        const gain = new Tone.Gain(0.8).toDestination();
        const noiseGain = new Tone.Gain(0.08).toDestination();
        membrane.connect(gain);
        noise.connect(noiseGain);
        synths[drumType] = { membrane, noise };
      } else if (config.type === 'snare') {
        const body = new Tone.MembraneSynth(config.bodyConfig);
        const noise = new Tone.NoiseSynth(config.noiseConfig);
        const bodyGain = new Tone.Gain(0.3).toDestination();
        const noiseGain = new Tone.Gain(0.5).toDestination();
        body.connect(bodyGain);
        noise.connect(noiseGain);
        synths[drumType] = { body, noise };
      } else if (config.type === 'kick') {
        const membrane = new Tone.MembraneSynth(config.config);
        const gain = new Tone.Gain(1.2).toDestination();
        membrane.connect(gain);
        synths[drumType] = membrane;
      }
    });

    synthsRef.current = synths;
    isInitializedRef.current = true;

    return () => {
      if (synthsRef.current) {
        Object.values(synthsRef.current).forEach(synth => {
          if (synth.dispose) {
            synth.dispose();
          } else if (typeof synth === 'object') {
            Object.values(synth).forEach(subSynth => {
              if (subSynth && subSynth.dispose) {
                subSynth.dispose();
              }
            });
          }
        });
        synthsRef.current = null;
      }
      if (loopRef.current) {
        loopRef.current.dispose();
        loopRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []);

  const initializeAudio = useCallback(async () => {
    await Tone.start();
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }
  }, []);

  const startPlayback = useCallback((gridRef, tempo, subdivision, totalSteps, onStepChange) => {
    if (!synthsRef.current) return;

    Tone.Transport.bpm.value = tempo;
    Tone.Transport.cancel();

    const toneSubdivision = getToneSubdivision(subdivision);

    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current.dispose();
      loopRef.current = null;
    }

    const loop = new Tone.Sequence((time, step) => {
      Tone.Draw.schedule(() => {
        onStepChange(step);
      }, time);

      DRUM_ORDER.forEach(drumType => {
        const grid = gridRef.current;
        const stepData = grid[drumType][step];
        if (stepData && stepData.active) {
          const synth = synthsRef.current[drumType];
          const velocity = stepData.velocity;
          const config = getSynthConfig(drumType);

          if (config.type === 'hihat') {
            synth.triggerAttackRelease('32n', time, velocity);
          } else if (config.type === 'tom') {
            synth.membrane.triggerAttackRelease(config.note, '8n', time, velocity);
            synth.noise.triggerAttackRelease('64n', time, velocity * 0.6);
          } else if (config.type === 'snare') {
            synth.body.triggerAttackRelease(config.bodyNote, '16n', time, velocity);
            synth.noise.triggerAttackRelease('16n', time, velocity);
          } else if (config.type === 'kick') {
            synth.triggerAttackRelease(config.note, '8n', time, velocity);
          }
        }
      });
    }, Array.from({ length: totalSteps }, (_, i) => i), toneSubdivision);

    loopRef.current = loop;
    loop.start(0);
    Tone.Transport.start();
  }, []);

  const stopPlayback = useCallback((onStop) => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    if (loopRef.current) {
      loopRef.current.dispose();
      loopRef.current = null;
    }
    if (onStop) {
      onStop();
    }
  }, []);

  const updateTempo = useCallback((tempo) => {
    Tone.Transport.bpm.value = tempo;
  }, []);

  return {
    initializeAudio,
    startPlayback,
    stopPlayback,
    updateTempo
  };
}
