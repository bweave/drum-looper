const STORAGE_KEY = 'drum-looper-patterns';

export const getPatterns = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const savePattern = (name, pattern) => {
  const patterns = getPatterns();
  const existingIndex = patterns.findIndex(p => p.name === name);

  const patternData = {
    name,
    pattern,
    savedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    patterns[existingIndex] = patternData;
  } else {
    patterns.push(patternData);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  return patterns;
};

export const deletePattern = (name) => {
  const patterns = getPatterns().filter(p => p.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  return patterns;
};

export const loadPattern = (name) => {
  const patterns = getPatterns();
  const found = patterns.find(p => p.name === name);
  return found ? found.pattern : null;
};
