import React, { useState, useCallback, useEffect, useRef } from 'react';
import DrumGrid from './components/DrumGrid';
import Controls from './components/Controls';
import SheetMusic from './components/SheetMusic';
import { SUBDIVISIONS, DEFAULT_TEMPO, MIN_BARS } from './utils/constants';
import { getTotalSteps, createEmptyGrid, resizeGrid } from './utils/gridHelpers';
import { useAudioEngine } from './hooks/useAudioEngine';
import './App.css';

function App() {
  const [bars, setBars] = useState(MIN_BARS);
  const [subdivision, setSubdivision] = useState(SUBDIVISIONS.SIXTEENTH);
  const [tempo, setTempo] = useState(DEFAULT_TEMPO);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = getTotalSteps(bars, subdivision);
  const [grid, setGrid] = useState(() => createEmptyGrid(totalSteps));
  const gridRef = useRef(grid);

  const { initializeAudio, startPlayback, stopPlayback, updateTempo } = useAudioEngine();

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    const newStepCount = getTotalSteps(bars, subdivision);
    setGrid(prevGrid => resizeGrid(prevGrid, newStepCount));
    if (currentStep >= newStepCount) {
      setCurrentStep(0);
    }
  }, [bars, subdivision, currentStep]);

  useEffect(() => {
    if (isPlaying) {
      updateTempo(tempo);
    }
  }, [tempo, isPlaying, updateTempo]);

  const toggleCell = useCallback((drum, stepIndex) => {
    setGrid(prevGrid => {
      const currentStep = prevGrid[drum][stepIndex];
      let newStep;

      if (!currentStep.active) {
        // Not active -> Regular (70%)
        newStep = { active: true, velocity: 0.7 };
      } else if (currentStep.velocity >= 0.6 && currentStep.velocity <= 0.8) {
        // Regular (70%) -> Accent (100%)
        newStep = { active: true, velocity: 1.0 };
      } else if (currentStep.velocity >= 0.9) {
        // Accent (100%) -> Ghost (30%)
        newStep = { active: true, velocity: 0.3 };
      } else {
        // Ghost (30%) -> Remove
        newStep = { active: false, velocity: 0.7 };
      }

      return {
        ...prevGrid,
        [drum]: prevGrid[drum].map((step, idx) =>
          idx === stepIndex ? newStep : step
        )
      };
    });
  }, []);

  const handlePlay = async () => {
    try {
      await initializeAudio();
      setIsPlaying(true);
      startPlayback(gridRef, tempo, subdivision, totalSteps, (step) => {
        setCurrentStep(step);
      });
    } catch (error) {
      console.error('Failed to start audio:', error);
      alert('Failed to start audio. Please try clicking Play again.');
    }
  };

  const handleStop = () => {
    stopPlayback(() => {
      setCurrentStep(0);
      setIsPlaying(false);
    });
  };

  const handleReset = () => {
    if (isPlaying) {
      handleStop();
    }
    setGrid(createEmptyGrid(totalSteps));
    setCurrentStep(0);
  };

  const handleBarsChange = (newBars) => {
    if (isPlaying) {
      handleStop();
    }
    setBars(newBars);
  };

  const handleSubdivisionChange = (newSubdivision) => {
    if (isPlaying) {
      handleStop();
    }
    setSubdivision(newSubdivision);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Drum Looper</h1>
        <p className="subtitle">Click cells to cycle: Regular → Accent (bright) → Ghost (dark) → Remove</p>
      </header>

      <main className="App-main">
        <Controls
          isPlaying={isPlaying}
          tempo={tempo}
          bars={bars}
          subdivision={subdivision}
          onPlay={handlePlay}
          onStop={handleStop}
          onReset={handleReset}
          onTempoChange={setTempo}
          onBarsChange={handleBarsChange}
          onSubdivisionChange={handleSubdivisionChange}
        />
        <DrumGrid
          grid={grid}
          currentStep={currentStep}
          onToggle={toggleCell}
        />
        <SheetMusic
          grid={grid}
          subdivision={subdivision}
          bars={bars}
          currentStep={currentStep}
        />
      </main>
    </div>
  );
}

export default App;
