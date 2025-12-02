import React, { useEffect, useRef } from 'react';
import { VexFlow } from 'vexflow';
import { DRUM_ORDER, DRUM_TYPES, SUBDIVISIONS } from '../utils/constants';
import { getStepsPerBar } from '../utils/gridHelpers';
import './SheetMusic.css';

const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Articulation, Parenthesis, ModifierPosition, Annotation, BarNote } = VexFlow;

// Map drum types to staff positions with noteheads
// Format: 'note/octave/notehead' for percussion staff
const DRUM_STAFF_POSITIONS = {
  [DRUM_TYPES.HIHAT]: 'g/5/x2',   // Top line with X notehead
  [DRUM_TYPES.RACK]: 'e/5',       // Upper space
  [DRUM_TYPES.SNARE]: 'c/5',      // Middle line (standard snare)
  [DRUM_TYPES.FLOOR]: 'a/4',      // Lower space
  [DRUM_TYPES.KICK]: 'f/4'        // Bottom space
};

// Get how many grid positions per beat for each subdivision
const getGridPositionsPerBeat = (subdivision) => {
  switch (subdivision) {
    case SUBDIVISIONS.EIGHTH:
      return 2;
    case SUBDIVISIONS.EIGHTH_TRIPLET:
      return 3;
    case SUBDIVISIONS.SIXTEENTH:
      return 4;
    case SUBDIVISIONS.SIXTEENTH_TRIPLET:
      return 6;
    case SUBDIVISIONS.THIRTYSECOND:
      return 8;
    default:
      return 4;
  }
};

// Check if subdivision is a triplet
const isTripletSubdivision = (subdivision) => {
  return subdivision === SUBDIVISIONS.EIGHTH_TRIPLET ||
         subdivision === SUBDIVISIONS.SIXTEENTH_TRIPLET;
};

// Convert gap (in grid positions) to VexFlow duration string
const getDurationFromGap = (gap, subdivision) => {
  const isTriplet = isTripletSubdivision(subdivision);

  if (isTriplet) {
    // Triplet subdivisions
    if (subdivision === SUBDIVISIONS.EIGHTH_TRIPLET) {
      // 3 positions per beat, each is an 8th triplet
      if (gap >= 3) return '4';  // quarter note (full beat)
      return '8';  // 8th triplet
    } else {
      // 16th triplet: 6 positions per beat
      if (gap >= 6) return '4';  // quarter note
      if (gap >= 3) return '8';  // 8th note (half beat)
      return '16'; // 16th triplet
    }
  } else {
    // Non-triplet subdivisions
    if (subdivision === SUBDIVISIONS.EIGHTH) {
      // 2 positions per beat
      if (gap >= 2) return '4';  // quarter note
      return '8';  // 8th note
    } else if (subdivision === SUBDIVISIONS.SIXTEENTH) {
      // 4 positions per beat
      if (gap >= 4) return '4';  // quarter note
      if (gap >= 2) return '8';  // 8th note
      return '16'; // 16th note
    } else if (subdivision === SUBDIVISIONS.THIRTYSECOND) {
      // 8 positions per beat
      if (gap >= 8) return '4';  // quarter note
      if (gap >= 4) return '8';  // 8th note
      if (gap >= 2) return '16'; // 16th note
      return '32'; // 32nd note
    }
  }
  return '16'; // fallback
};

// Analyze a beat and return note events with calculated durations
const analyzeBeat = (grid, beatStartStep, subdivision) => {
  const positionsPerBeat = getGridPositionsPerBeat(subdivision);
  const events = [];

  // Collect all active positions in this beat
  const activePositions = [];
  for (let pos = 0; pos < positionsPerBeat; pos++) {
    const globalStep = beatStartStep + pos;
    const activeDrums = [];

    DRUM_ORDER.forEach(drum => {
      const stepData = grid[drum]?.[globalStep];
      if (stepData && stepData.active) {
        activeDrums.push({
          drum,
          velocity: stepData.velocity
        });
      }
    });

    if (activeDrums.length > 0) {
      activePositions.push({
        position: pos,
        globalStep,
        drums: activeDrums
      });
    }
  }

  // If no notes in this beat, return a single rest for the whole beat
  if (activePositions.length === 0) {
    events.push({
      type: 'rest',
      duration: '4',  // quarter rest for empty beat
      globalStep: beatStartStep
    });
    return events;
  }

  // Add leading rest if first note isn't on the downbeat
  if (activePositions[0].position > 0) {
    const gap = activePositions[0].position;
    events.push({
      type: 'rest',
      duration: getDurationFromGap(gap, subdivision),
      globalStep: beatStartStep
    });
  }

  // Process each active position
  for (let i = 0; i < activePositions.length; i++) {
    const current = activePositions[i];
    const nextPosition = i < activePositions.length - 1
      ? activePositions[i + 1].position
      : positionsPerBeat;

    const gap = nextPosition - current.position;
    const duration = getDurationFromGap(gap, subdivision);

    events.push({
      type: 'note',
      duration,
      drums: current.drums,
      globalStep: current.globalStep
    });
  }

  return events;
};

function SheetMusic({ grid, subdivision, bars, currentStep }) {
  const wrapperRef = useRef(null);
  const svgContainerRef = useRef(null);
  const playheadRef = useRef(null);
  const vfRef = useRef(null);
  const staveNotesRef = useRef([]);
  const staveBoundsRef = useRef(null);

  useEffect(() => {
    if (!svgContainerRef.current) return;

    // Clear previous rendering
    svgContainerRef.current.innerHTML = '';

    const stepsPerBar = getStepsPerBar(subdivision);
    const totalSteps = stepsPerBar * bars;

    // Calculate width based on number of steps
    const widthPerStep = 40;
    const staveWidth = Math.max(600, totalSteps * widthPerStep);
    const width = staveWidth + 100;
    const height = 200;

    // Create renderer
    const renderer = new Renderer(svgContainerRef.current, Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont('Arial', 10);
    vfRef.current = renderer;

    // Create percussion staff
    const stave = new Stave(10, 20, staveWidth);
    stave.addClef('percussion');
    stave.addTimeSignature('4/4');
    stave.setContext(context).draw();

    // Convert grid data to notes, processing beat by beat
    const notes = [];
    const beatNoteGroups = [];  // Track notes per beat for beaming
    staveNotesRef.current = [];

    const positionsPerBeat = getGridPositionsPerBeat(subdivision);
    const totalBeats = 4 * bars;

    for (let beat = 0; beat < totalBeats; beat++) {
      const beatStartStep = beat * positionsPerBeat;
      const beatEvents = analyzeBeat(grid, beatStartStep, subdivision);
      const beatNotes = [];

      beatEvents.forEach(event => {
        if (event.type === 'rest') {
          const rest = new StaveNote({
            clef: 'percussion',
            keys: ['c/5'],
            duration: event.duration + 'r'
          });
          notes.push(rest);
          beatNotes.push(rest);
          staveNotesRef.current.push({ step: event.globalStep, note: rest });
        } else {
          // Create a chord with all active drums
          const keys = event.drums.map(d => DRUM_STAFF_POSITIONS[d.drum]);

          const staveNote = new StaveNote({
            clef: 'percussion',
            keys: keys,
            duration: event.duration,
            stem_direction: 1  // 1 = UP
          });

          // Apply styling based on velocity
          event.drums.forEach((drumInfo, index) => {
            if (drumInfo.velocity <= 0.35) {
              // Ghost notes - add parentheses around the notehead
              const leftParen = new Parenthesis(ModifierPosition.LEFT);
              const rightParen = new Parenthesis(ModifierPosition.RIGHT);
              staveNote.addModifier(leftParen, index);
              staveNote.addModifier(rightParen, index);
            } else if (drumInfo.velocity >= 0.95) {
              // Mark this note as accented (we'll add accent marks via SVG later)
              staveNote.setAttribute('accent', true);
            }
          });

          notes.push(staveNote);
          beatNotes.push(staveNote);
          staveNotesRef.current.push({ step: event.globalStep, note: staveNote });
        }
      });

      beatNoteGroups.push(beatNotes);

      // Add bar line after each complete bar (except the last one)
      if ((beat + 1) % 4 === 0 && beat < totalBeats - 1) {
        const barLine = new BarNote();
        notes.push(barLine);
      }
    }

    if (notes.length > 0) {
      // Create beams BEFORE drawing (so notes know they're beamed and don't draw flags)
      const beams = [];

      beatNoteGroups.forEach(beatNotes => {
        // Filter to only beamable notes (8th notes or smaller, not rests, not quarter notes)
        const beamableNotes = beatNotes.filter(n => {
          if (n.isRest()) return false;
          const duration = n.getDuration();
          // Quarter notes and longer shouldn't be beamed
          return duration !== 'q' && duration !== 'h' && duration !== 'w' &&
                 duration !== '4' && duration !== '2' && duration !== '1';
        });

        // Only create beam if we have 2+ beamable notes
        if (beamableNotes.length >= 2) {
          // Create beam with auto_stem=false to respect stem_direction on notes
          const beam = new Beam(beamableNotes, false);
          // Enable flat beams for horizontal rendering (camelCase property names)
          beam.renderOptions.flatBeams = true;
          beam.renderOptions.flatBeamOffset = 40;
          beams.push(beam);
        }
      });

      // Create voice and format notes
      const voice = new Voice({ num_beats: 4 * bars, beat_value: 4 });
      voice.setStrict(false);
      voice.addTickables(notes);

      // Format and draw with proper spacing
      new Formatter()
        .joinVoices([voice])
        .format([voice], staveWidth - 80);

      // Fixed beam y position (lower y = higher on screen in SVG coordinates)
      // This is the absolute Y coordinate where all beams will be drawn
      const fixedBeamY = 22;

      // Set stem extension on beamed notes BEFORE drawing
      // Calculate extensions based on note position to reach the fixed beam
      beams.forEach(beam => {
        const beamNotes = beam.getNotes();
        beamNotes.forEach(note => {
          // Get the topmost key's line position to calculate stem length needed
          const keys = note.getKeys();
          // For stems up, we need to extend from the top note to the beam
          // The hi-hat (g/5) is at line 5, kick (f/4) is at line -1 in treble
          // For percussion, we need a consistent extension to reach fixedBeamY
          // Set a large extension to ensure all stems reach the beam
          const stem = note.getStem();
          if (stem) {
            stem.setExtension(50);  // Large extension to reach beam
          }
        });
      });

      // Draw the voice with extended stems
      voice.draw(context, stave);

      // Draw beams at fixed height
      beams.forEach(beam => {
        beam.postFormat();
        beam.renderOptions.flatBeams = true;
        beam.renderOptions.flatBeamOffset = fixedBeamY;
        beam.setContext(context).draw();
      });

      // Post-render: adjust SVG stem lines to exactly match beam position
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (svgElement) {
        // Find all stem elements (vf-stem class is on the <g> group, path is inside)
        const stemGroups = svgElement.querySelectorAll('g.vf-stem');
        stemGroups.forEach(stemGroup => {
          const stemPath = stemGroup.querySelector('path');
          if (stemPath) {
            const d = stemPath.getAttribute('d');
            if (d) {
              // Stem paths are "M x1 y1 L x2 y2" format (can include negative values)
              const match = d.match(/M\s*([\d.-]+)\s+([\d.-]+)\s*L\s*([\d.-]+)\s+([\d.-]+)/);
              if (match) {
                const [, x1, y1, x2, y2] = match;
                const y1Val = parseFloat(y1);
                const y2Val = parseFloat(y2);
                // For upward stems, smaller y is the top (y increases downward in SVG)
                const topY = Math.min(y1Val, y2Val);
                const bottomY = Math.max(y1Val, y2Val);

                // Clamp stem top to beam position (don't extend past beam, don't fall short)
                if (topY !== fixedBeamY) {
                  const newD = `M ${x1} ${fixedBeamY} L ${x1} ${bottomY}`;
                  stemPath.setAttribute('d', newD);
                }
              }
            }
          }
        });

        // Add accent marks above beam for accented notes
        notes.forEach(note => {
          if (note.getAttribute && note.getAttribute('accent')) {
            try {
              const bbox = note.getBoundingBox();
              if (bbox) {
                // Create accent mark (>) above the beam
                const accentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                accentText.setAttribute('x', bbox.x + bbox.w / 2);
                accentText.setAttribute('y', fixedBeamY - 5);  // Position above the beam
                accentText.setAttribute('text-anchor', 'middle');
                accentText.setAttribute('font-size', '16');
                accentText.setAttribute('font-weight', 'bold');
                accentText.setAttribute('fill', '#000');
                accentText.textContent = '>';
                svgElement.appendChild(accentText);
              }
            } catch (e) {
              console.debug('Could not add accent mark:', e);
            }
          }
        });

        // Store note positions for playhead after rendering
        // Get the bounding box of each note to map steps to x positions
        const notePositions = [];
        staveNotesRef.current.forEach(({ step, note }) => {
          try {
            const bbox = note.getBoundingBox();
            if (bbox) {
              notePositions.push({
                step,
                x: bbox.x + bbox.w / 2  // Center of the note
              });
            }
          } catch (e) {
            // Note may not have been rendered yet
          }
        });

        // Sort by step and store
        notePositions.sort((a, b) => a.step - b.step);
        staveBoundsRef.current = { notePositions };
      }
    }

  }, [grid, subdivision, bars]);

  // Update playhead position based on current step
  useEffect(() => {
    if (!playheadRef.current || !staveBoundsRef.current) return;

    const { notePositions } = staveBoundsRef.current;
    if (!notePositions || notePositions.length === 0) {
      playheadRef.current.style.display = 'none';
      return;
    }

    const stepsPerBar = getStepsPerBar(subdivision);
    const totalSteps = stepsPerBar * bars;

    if (currentStep < 0 || currentStep >= totalSteps) {
      playheadRef.current.style.display = 'none';
      return;
    }

    // Find the note positions surrounding the current step
    let playheadX;

    // Find notes before and after current step for interpolation
    let prevNote = null;
    let nextNote = null;

    for (const pos of notePositions) {
      if (pos.step <= currentStep) {
        prevNote = pos;
      }
      if (pos.step >= currentStep && !nextNote) {
        nextNote = pos;
      }
    }

    if (prevNote && nextNote && prevNote.step !== nextNote.step) {
      // Interpolate between the two notes
      const stepsBetween = nextNote.step - prevNote.step;
      const stepsFromPrev = currentStep - prevNote.step;
      const fraction = stepsFromPrev / stepsBetween;
      playheadX = prevNote.x + (nextNote.x - prevNote.x) * fraction;
    } else if (prevNote && prevNote.step === currentStep) {
      // Exact match
      playheadX = prevNote.x;
    } else if (nextNote && nextNote.step === currentStep) {
      // Exact match
      playheadX = nextNote.x;
    } else if (prevNote) {
      // Past the last note, extrapolate
      const avgStepWidth = notePositions.length > 1
        ? (notePositions[notePositions.length - 1].x - notePositions[0].x) / (notePositions[notePositions.length - 1].step - notePositions[0].step)
        : 20;
      playheadX = prevNote.x + (currentStep - prevNote.step) * avgStepWidth;
    } else if (nextNote) {
      // Before the first note, extrapolate
      const avgStepWidth = notePositions.length > 1
        ? (notePositions[notePositions.length - 1].x - notePositions[0].x) / (notePositions[notePositions.length - 1].step - notePositions[0].step)
        : 20;
      playheadX = nextNote.x - (nextNote.step - currentStep) * avgStepWidth;
    } else {
      playheadRef.current.style.display = 'none';
      return;
    }

    // Update playhead position
    // playheadX is the center of the note bounding box in SVG coordinates
    // Add 15px for container padding, subtract 2px (half playhead width) to center
    // Add 5px additional offset to align with visual center of X noteheads
    playheadRef.current.style.display = 'block';
    playheadRef.current.style.left = `${playheadX + 15 - 2 + 5}px`;

    // Auto-scroll to keep playhead visible
    if (wrapperRef.current) {
      const containerWidth = wrapperRef.current.clientWidth;
      const scrollLeft = wrapperRef.current.scrollLeft;

      // Calculate playhead position relative to visible area
      const playheadRelativeX = playheadX + 15 - scrollLeft;

      // Scroll when playhead gets close to edges
      const margin = containerWidth * 0.3;
      if (playheadRelativeX < margin || playheadRelativeX > containerWidth - margin) {
        const targetScrollLeft = playheadX - (containerWidth * 0.4);
        wrapperRef.current.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      }
    }
  }, [currentStep, subdivision, bars]);

  return (
    <div className="sheet-music-container">
      <h3 className="sheet-music-title">Sheet Music Preview</h3>
      <div
        ref={wrapperRef}
        className="sheet-music-content"
      >
        <div
          ref={svgContainerRef}
          id="sheet-music-output"
          className="sheet-music-svg"
        />
        <div ref={playheadRef} className="playhead" />
      </div>
    </div>
  );
}

export default React.memo(SheetMusic);
