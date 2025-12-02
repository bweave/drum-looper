import LZString from 'lz-string';

// Short keys to minimize URL length
const DRUM_KEY_MAP = {
  hihat: 'h',
  'rack-tom': 'r',
  snare: 's',
  'floor-tom': 'f',
  kick: 'k'
};

const DRUM_KEY_REVERSE = {
  h: 'hihat',
  r: 'rack-tom',
  s: 'snare',
  f: 'floor-tom',
  k: 'kick'
};

/**
 * Encode a pattern state to a URL-safe compressed string
 */
export function encodePattern(state) {
  const { grid, tempo, bars, subdivision } = state;

  // Convert grid to use short keys
  const shortGrid = {};
  for (const [drum, steps] of Object.entries(grid)) {
    const shortKey = DRUM_KEY_MAP[drum] || drum;
    shortGrid[shortKey] = steps;
  }

  const data = {
    g: shortGrid,
    t: tempo,
    b: bars,
    s: subdivision
  };

  const json = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decode a compressed string back to pattern state
 * Returns null if decoding fails
 */
export function decodePattern(encoded) {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) {
      return null;
    }

    const data = JSON.parse(json);

    // Convert short keys back to full drum names
    const grid = {};
    for (const [shortKey, steps] of Object.entries(data.g)) {
      const fullKey = DRUM_KEY_REVERSE[shortKey] || shortKey;
      grid[fullKey] = steps;
    }

    return {
      grid,
      tempo: data.t,
      bars: data.b,
      subdivision: data.s
    };
  } catch (error) {
    console.warn('Failed to decode pattern from URL:', error);
    return null;
  }
}

/**
 * Get the pattern hash from the current URL
 * Returns null if no pattern hash is present
 */
export function getPatternFromURL() {
  const hash = window.location.hash;
  if (hash.startsWith('#p=')) {
    return hash.slice(3);
  }
  return null;
}

/**
 * Set the pattern hash in the URL
 */
export function setPatternInURL(encoded) {
  window.location.hash = `p=${encoded}`;
}

/**
 * Copy the current URL to clipboard
 * Returns a promise that resolves to true on success
 */
export async function copyURLToClipboard() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    return false;
  }
}
