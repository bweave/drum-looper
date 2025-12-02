import React, { useState, useRef, useEffect } from 'react';
import './PatternSelector.css';

function PatternSelector({ patterns, onLoad, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoad = (name) => {
    onLoad(name);
    setIsOpen(false);
  };

  const handleDelete = (e, name) => {
    e.stopPropagation();
    onDelete(name);
  };

  return (
    <div className="pattern-selector" ref={dropdownRef}>
      <button
        className="pattern-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        Load Pattern
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="pattern-dropdown">
          {patterns.length === 0 ? (
            <div className="pattern-dropdown-empty">No saved patterns</div>
          ) : (
            patterns.map((pattern) => (
              <div
                key={pattern.name}
                className="pattern-dropdown-item"
                onClick={() => handleLoad(pattern.name)}
              >
                <span className="pattern-dropdown-name">{pattern.name}</span>
                <button
                  className="pattern-dropdown-delete"
                  onClick={(e) => handleDelete(e, pattern.name)}
                  title={`Delete "${pattern.name}"`}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PatternSelector;
