import { Chord, Distance, Interval, Note } from 'tonal';
import { Harmony, intervalDirection } from './Harmony';

const steps = {
  '1P': ['1', '8'],
  '2m': ['b9', 'b2'],
  '2M': ['9', '2',],
  '2A': ['#9', '#2'],
  '3m': ['b3'],
  '3M': ['3'],
  '4P': ['11', '4'],
  '4A': ['#11', '#4'],
  '5d': ['b5'],
  '5P': ['5'],
  '5A': ['#5'],
  '6m': ['b13', 'b6'],
  '6M': ['13', '6'],
  '7m': ['b7'],
  '7M': ['7', '^7', 'maj7']
};

/** Returns true if the given string is a valid pitch class */
export function isPitchClass(note) {
  return Note.pc(note) === note;
}

/** Returns the given notes with octaves either moving bottom up or top down */
export function renderAbsoluteNotes(notes, octave = 3, direction: intervalDirection = 'up'): string[] {
  return notes.reduce((absolute, current, index, notes) => {
    if (index === 0) {
      return [current + octave];
    }
    let interval = Distance.interval(notes[index - 1], current);
    interval = Harmony.minInterval(interval, direction);
    if (interval === '1P') {
      interval = direction === 'down' ? '-8P' : '8P';
    }
    absolute.push(Distance.transpose(absolute[index - 1], interval + ''));
    return absolute;
  }, []);
}

/** Returns true if the given chord is dominant = either 3 and b7 or sus with 4 and b7 */
export function isDominantChord(chord) {
  return chordHasIntervals(chord, ['3M', '7m']) || chordHasIntervals(chord, ['!3', '4P', '7m']);
}
/** Returns true if the given chord is a major type chord with 3 and optional ^7 */
export function isMajorChord(chord) {
  return chordHasIntervals(chord, ['3M', '7M?']);
}
/** Returns true if the given chord is minor */
export function isMinorChord(chord) {
  return chordHasIntervals(chord, ['3m']);
}
/** Returns true if the given chord is a minor tonic chord = either -6 or -^7 */
export function isMinorTonic(chord) {
  return chordHasIntervals(chord, ['3m', '5P', '13M?', '7M?']);
}
/** Returns the chord type based on methods above */
export function getChordType(chord) {
  if (isDominantChord(chord)) {
    return 'dominant';
  }
  if (isMajorChord(chord)) {
    return 'major';
  }
  if (isMinorTonic(chord)) {
    return 'minor-tonic';
  }
  if (isMinorChord(chord)) {
    return 'minor';
  }
}

/* Returns true if the given intervals are all present in the chords interval structure
Intervals can be appendend with "?" to indicate that those degrees could also be omitted 
(but when present they should match)
*/
export function chordHasIntervals(chord, intervals) {
  chord = Harmony.getTonalChord(chord);
  const has = Chord.intervals(chord);
  return intervals.reduce((match, current) => {
    const isOptional = current.includes('?');
    const isForbidden = current.includes('!');
    if (isOptional) {
      current = current.replace('?', '');
      return (!hasDegree(getDegreeFromInterval(current), has) ||
        has.includes(current)) && match;
    }
    if (isForbidden) {
      current = current.replace('!', '');
      return !hasDegree(getDegreeFromInterval(current), has);
    }
    return has.includes(current) && match;
  }, true);
}
/** Returns true if the given degree is present in the intervals */
export function hasDegree(degree, intervals) {
  return !!findDegree(degree, intervals);
}
/** Returns interval that matches the given degree/step */
export function findDegree(degreeOrStep: number | string, intervalsOrSteps: string[]) {
  const intervals = intervalsOrSteps.map(i => isInterval(i) ? i : getIntervalFromStep(i));
  if (typeof degreeOrStep === 'number') { // is degree
    const degree = Math.abs(degreeOrStep);
    return intervals.find(i => {
      i = Harmony.minInterval(i, 'up');
      if (!steps[i]) {
        console.error('interval', i, 'is not valid', intervals);
      }
      return !!(steps[i].find(step => getDegreeFromStep(step) === degree));
    });
  }
  // is step
  const step = getStep(degreeOrStep);
  return intervals.find(i => i.includes(step) ||
    i === getIntervalFromStep(step));
}
/** Returns true if the given string is a valid interval */
export function isInterval(interval) {
  return typeof Interval.semitones(interval) === 'number';
}
/** Returns interval from step */
export function getIntervalFromStep(step: string | number) {
  step = getStep(step);
  const interval = Object.keys(steps)
    .find(i => steps[i].includes(step));
  if (!interval) {
    // console.warn(`step ${step} has no defined inteval`);
  }
  return interval;
}

export function getStepFromInterval(interval, min = false) {
  const step = steps[interval] || [];
  if (min) {
    return step[1] || step[0] || 0;
  }
  return step[0] || 0;
}

export function noteArray(range) {
  const slots = Interval.semitones(Distance.interval(range[0], range[1]) + '');
  return new Array(slots + 1)
    .fill('')
    .map((v, i) => Distance.transpose(range[0], Interval.fromSemitones(i)) + '')
    .map(n => Note.simplify(n))
}

export function noteArrayMidi(range) {
  const slots = range[1] - range[0];
  return new Array(slots + 1)
    .fill('')
    .map((v, i) => Distance.transpose(Note.fromMidi(range[0]), Interval.fromSemitones(i)) + '')
    .map(n => Note.simplify(n))
}

// accepts both strings or numbers where negative means minor, 
// returns unified step string that can be turned into an interval
export function getStep(step: string | number) {
  if (typeof step === 'number' && step < 0) {
    step = 'b' + (step * -1);
  }
  return step + ''; // to string
}
/** Returns degree from step */
export function getDegreeFromStep(step: string) {
  step = getStep(step);
  const match = step.match(/([1-9])+/);
  if (!match || !match.length) {
    return 0;
  }
  return parseInt(match[0], 10);
}
export function getDegreeInChord(degree, chord) {
  chord = Harmony.getTonalChord(chord);
  const intervals = Chord.intervals(chord);
  const tokens = Chord.tokenize(chord);
  return Distance.transpose(tokens[0], findDegree(degree, intervals));
}

/** Yields the semitones of the interval (can be negative) */
export function semitoneDifference(intervals) {
  return intervals.reduce((semitones, interval) => {
    return semitones + Math.abs(Interval.semitones(interval))
  }, 0);
}
/** yields the absolute semitones of the interval (always positive) */
export function semitoneMovement(intervals) {
  return intervals.reduce((semitones, interval) => {
    return semitones + Interval.semitones(interval)
  }, 0);
}
/** returns the distance of semitones between two notes */
export function semitoneDistance(noteA, noteB) {
  return Interval.semitones(Distance.interval(noteA, noteB) + '');
}
/** Turns an interval into a degree */
export function getDegreeFromInterval(interval = '-1', simplify = false) {
  const fixed = Harmony.fixInterval(interval + '', simplify) || '';
  const match = fixed.match(/[-]?([1-9])+/);
  if (!match) {
    return 0;
  }
  return Math.abs(parseInt(match[0], 10));
}

/** Returns true if the given note is inside the given range */
export function isInRange(note, range) {
  return Distance.semitones(note, range[0]) <= 0 && Distance.semitones(note, range[1]) >= 0;
}
/** Returns array of distances from the given notes to the range ends  */
export function getDistancesToRangeEnds(notes: string[], range: string[]) {
  if (notes.length > 2) {
    notes = [notes[0], notes[notes.length - 1]];
  }
  const midi = notes.map(n => Harmony.getMidi(n));
  const rangeMidi = range.map(n => Harmony.getMidi(n));
  return [midi[0] - rangeMidi[0], rangeMidi[1] - midi[1]];
}


export function transposeNotes(notes, interval) {
  return notes.map(note => Distance.transpose(note, interval));
}

export function measureTime(fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}