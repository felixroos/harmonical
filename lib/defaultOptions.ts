export const voicingDefaultOptions = {
  range: ['C3', 'C5'],
  notes: 4,
  rangeBorders: [3, 3],
  maxVoices: 4,
  forceDirection: null,
  forceBestPick: false,
  maxDistance: 7,
  defaultDistances: [1, 7],
  minBottomDistance: 3, // min semitones between the two bottom notes
  minTopDistance: 2, // min semitones between the two top notes
  noTopDrop: true,
  noTopAdd: true,
  noBottomDrop: false,
  noBottomAdd: false,
  idleChance: 1,
  logIdle: false,
  logging: true,
}

export const lowIntervalLimits = {
  1: 'E3',
  2: 'Eb3',
  3: 'C3',
  4: 'Bb2',
  5: 'Bb2',
  6: 'B2',
  7: 'Bb1',
  8: 'F2',
  9: 'F2',
  10: 'F2',
  11: 'F2',
};