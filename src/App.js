import React, { useState, useCallback, useEffect, useRef } from 'react';
import DrumGrid from './components/DrumGrid';
import Controls from './components/Controls';
import SheetMusic from './components/SheetMusic';
import { SUBDIVISIONS, DEFAULT_TEMPO, MIN_BARS } from './utils/constants';
import { getTotalSteps, createEmptyGrid, createDefaultBeatGrid, resizeGrid } from './utils/gridHelpers';
import { getPatterns, savePattern, deletePattern, loadPattern } from './utils/patternStorage';
import { encodePattern, decodePattern, getPatternFromURL, setPatternInURL, copyURLToClipboard } from './utils/patternEncoder';
import { useAudioEngine } from './hooks/useAudioEngine';
import './App.css';

// Parse URL pattern once at module load
const initialURLPattern = (() => {
  const urlPattern = getPatternFromURL();
  if (urlPattern) {
    return decodePattern(urlPattern);
  }
  return null;
})();

function App() {
  const [bars, setBars] = useState(initialURLPattern?.bars ?? MIN_BARS);
  const [subdivision, setSubdivision] = useState(initialURLPattern?.subdivision ?? SUBDIVISIONS.SIXTEENTH);
  const [tempo, setTempo] = useState(initialURLPattern?.tempo ?? DEFAULT_TEMPO);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [savedPatterns, setSavedPatterns] = useState(() => getPatterns());
  const [shareMessage, setShareMessage] = useState('');

  const totalSteps = getTotalSteps(bars, subdivision);

  // Initialize grid from URL or default beat
  const [grid, setGrid] = useState(() => initialURLPattern?.grid ?? createDefaultBeatGrid());
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

  const handleSavePattern = (name) => {
    const patternData = {
      grid,
      bars,
      subdivision,
      tempo
    };
    const updated = savePattern(name, patternData);
    setSavedPatterns(updated);
  };

  const handleLoadPattern = (name) => {
    const patternData = loadPattern(name);
    if (patternData) {
      if (isPlaying) {
        handleStop();
      }
      setBars(patternData.bars);
      setSubdivision(patternData.subdivision);
      setTempo(patternData.tempo);
      setGrid(patternData.grid);
      setCurrentStep(0);
    }
  };

  const handleDeletePattern = (name) => {
    const updated = deletePattern(name);
    setSavedPatterns(updated);
  };

  const handleShare = async () => {
    const patternData = {
      grid,
      tempo,
      bars,
      subdivision
    };
    const encoded = encodePattern(patternData);
    setPatternInURL(encoded);

    const copied = await copyURLToClipboard();
    if (copied) {
      setShareMessage('Link copied to clipboard!');
    } else {
      setShareMessage('URL updated - copy from address bar');
    }

    // Clear message after 3 seconds
    setTimeout(() => setShareMessage(''), 3000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Drum Looper</h1>
        <p className="subtitle">Click cells to cycle: Regular → Accent (bright) → Ghost (dark) → Remove</p>
      </header>

      <main className="App-main">
        {shareMessage && (
          <div className="share-toast">{shareMessage}</div>
        )}
        <Controls
          isPlaying={isPlaying}
          tempo={tempo}
          bars={bars}
          subdivision={subdivision}
          patterns={savedPatterns}
          onPlay={handlePlay}
          onStop={handleStop}
          onReset={handleReset}
          onSave={handleSavePattern}
          onShare={handleShare}
          onLoad={handleLoadPattern}
          onDeletePattern={handleDeletePattern}
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
