import { Permutation, PathValidator } from './Permutation';
import { Distance, Interval, Note, Chord } from 'tonal';
import {
  renderAbsoluteNotes,
  isDominantChord,
  getIntervalFromStep,
  hasDegree,
  getDegreeInChord,
  chordHasIntervals,
  semitoneDistance,
  semitoneMovement,
  semitoneDifference,
  isPitchClass,
  getDegreeFromInterval,
  isInRange,
  getDistancesToRangeEnds,
  transposeNotes,
  noteArray,
} from './util';

import { voicingDefaultOptions, lowIntervalLimits } from './defaultOptions';

import { Harmony, intervalDirection } from './Harmony';

export declare type VoicingValidation = {

  /** COPIED FROM VoiceLeadingOptions to avoid typing errors */
  range?: string[];
  maxVoices?: number;
  forceDirection?: intervalDirection;
  forceBestPick?: boolean; // if true, the best pick will always be taken even if transposed an octave
  // the lower and upper distance to the range end that is tolerated before forcing a direction
  rangeBorders?: number[];
  logging?: boolean; // if true, all voice leading infos will be logged to the console
  idleChance?: number; // if true, next voicings cant use all the same notes again (difference !== 0)
  logIdle?: boolean; // if false, nothing will be logged if the notes stayed the same
  /** COPY END */

  // NEW
  requiredPitches?: string[];
  optionalPitches?: string[];
  bottomPitches?: string[][];
  topPitches?: string[][];
  voices?: string[][];
  ignoreLowerIntervalLimits?: boolean;
  defaultDistances?: number[];
  bottomDistances?: number[][];
  topDistances?: number[][];
  preferTopDistances?: boolean;
  maxTopDistance?: number;
  notes?: number | number[];

  maxDistance?: number;
  minBottomDistance?: number;
  minDistance?: number;
  minTopDistance?: number;
  topNotes?: string[]; // accepted top notes
  topDegrees?: number[][] | number[]; // accepted top degrees
  bottomNotes?: string[]; // accepted top notes
  bottomDegrees?: number[] | number[][]; // accepted bottom degrees
  omitNotes?: string[];
  unique?: boolean; // if true, no pitch can be picked twice
  maxNotes?: number; // if true, no pitch can be picked twice
  minNotes?: number; // if true, no pitch can be picked twice
  /* custom validator for permutation of notes */
  validatePermutation?: (path: string[], next: string, array: string[]) => boolean;
  /* Custom sort function for choices. Defaults to smaller difference. */
  sortChoices?: (choiceA, choiceB) => number;
  filterChoices?: (choice) => boolean;
  noTopDrop?: boolean;
  noTopAdd?: boolean;
  noBottomDrop?: boolean;
  noBottomAdd?: boolean;
  root?: string; // validate relative to that root
};

export declare type VoiceLeading = {
  from: string[]; // previously played notes
  to: string[]; // target notes to play
  origin: string[]; // selection of from to lead from
  targets: string[]; // selection of to to lead to
  intervals: string[]; // intervals between origin/targets
  difference: number; // difference between origin/targets
  movement: number; // movement between origin/targets
  bottomInterval?: string;
  topInterval?: string;
  topNotes?: string[];
  bottomNotes?: string[];
  similar: boolean;
  contrary: boolean;
  parallel: boolean;
  oblique: string[];
  degrees: string[];
  added: string[];
  dropped: string[];
  topDropped?: boolean;
  bottomDropped?: boolean;
  topAdded?: boolean;
  bottomAdded?: boolean;
}

export declare interface VoiceLeadingOptions extends VoicingValidation {
}

export class Voicing {
  /** Returns the next voicing that should follow the previously played voicing. 
  */
  static getNextVoicing(chord, previousVoicing, options: VoiceLeadingOptions = {}) {
    let {
      range,
      forceDirection,
      forceBestPick,
      rangeBorders,
      sortChoices,
      filterChoices,
      noTopDrop,
      noTopAdd,
      topNotes,
      noBottomDrop,
      noBottomAdd,
      idleChance,
      logIdle,
      logging
    }: VoiceLeadingOptions = {
      ...voicingDefaultOptions,
      ...options
    };

    // make sure tonal can read the chord
    if (!chord || chord === 'r') {
      return null;
    }
    chord = Harmony.getTonalChord(chord);

    const exit = () => {
      const pick = [];
      if (logging) {
        //Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, logIdle, options });
      }
      return pick;
    }

    let combinations = Voicing.getAllVoicePermutations(chord, options);

    if (!combinations.length) {
      console.warn(chord, 'no combinations', options);
      return exit();
    }

    let choices = Voicing.getAllChoices(combinations, previousVoicing, options);
    const originalChoices = [].concat(choices);
    choices = choices.filter(choice => {
      return (!noTopDrop || !choice.topDropped) &&
        (!noTopAdd || !choice.topAdded) &&
        (!noBottomDrop || !choice.bottomDropped) &&
        (!noBottomAdd || !choice.bottomAdded);
    }).filter(choice => { // apply flag filters + filerChoices if any
      return (!filterChoices || filterChoices(choice))
        && (!topNotes || Voicing.hasTopNotes(choice.targets, topNotes))
    }).filter((choice, index, filtered) => {
      return (choice.difference > 0 || (filtered.length === 1 || Math.random() < idleChance))
    }).sort(sortChoices ?
      (a, b) => sortChoices(a, b) :
      (a, b) => a.difference - b.difference
    );

    if (!choices.length) {
      console.warn(chord, 'no choices', options, 'combinations', combinations, 'original choices', originalChoices);
      return exit();
    }
    let bestPick = choices[0].targets, choice;
    let direction = Voicing.getDesiredDirection(previousVoicing, range, rangeBorders) || forceDirection;

    if (direction && forceBestPick && (!isInRange(bestPick[0], range) || isInRange(bestPick[bestPick.length - 1], range))) {
      const octave = direction === 'up' ? '8P' : '-8P';
      bestPick = transposeNotes(bestPick, octave);
    }

    if (!direction || forceBestPick) {
      const pick = bestPick;
      choice = choices[0];
      if (logging) {
        //Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, direction, bestPick, choice, choices, logIdle, options });
      }
      return pick;
    }

    // sort after movement instead of difference
    choice = choices.sort((a, b) => {
      return Math.abs(a.movement) - Math.abs(b.movement)
    }).find(choice => {
      if (direction === 'up') {
        return choice.movement >= 0
      }
      return choice.movement <= 0;
    });
    if (!choice) { // keep hanging in the corner of the range..
      choice = choices[0];
    }
    const pick = choice.targets;
    if (logging) {
      //Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, direction, bestPick, choice, choices, logIdle, options });
    }
    return pick;
  }

  static hasTopNotes(pick: string[], topNotes = []) {
    return topNotes.reduce((match, note) => match && Harmony.hasSamePitch(note, pick[pick.length - 1]), true);
  }

  /** Computes all valid voice permutations for a given chord and voice number.
   * Runs getVoicePermutations for each possible selection of notes.
   */
  static getAllVoicePermutations(chord, voicingOptions: VoiceLeadingOptions = {}) {
    const root = Harmony.getBassNote(chord, true);
    return Voicing.getAllNoteSelections(chord, voicingOptions)
      .reduce((combinations, combination) => {
        return combinations.concat(
          Voicing.getVoicePermutations(combination, { ...voicingOptions, root }))
      }, []);
  }

  /** Get all permutations of the given notes that would make a good voicing. */
  static getVoicePermutations(notes, options: VoicingValidation = {}) {
    if (notes.length === 1) {
      return [notes];
    }
    const validator = options.validatePermutation || ((path, next, array) => true);
    return Permutation.permutateElements(notes,
      Permutation.combineValidators(
        validator,
        Voicing.voicingValidator(options)
      )
    );
  }


  static validators(options?: VoicingValidation): PathValidator<string>[] {
    options = {
      minTopDistance: 3, // min semitones between the two top notes
      minNotes: 3,
      ...options,
    }
    // TODO: add
    /*    Voicing.notesAtPositionValidator(options.topNotes, lastPosition),
        Voicing.notesAtPositionValidator(options.bottomNotes, 0),
        Voicing.degreesAtPositionValidator(options.topDegrees, lastPosition, options.root),
        Voicing.degreesAtPositionValidator(options.bottomDegrees, 0, options.root),
        Voicing.validateInterval(interval => Interval.semitones(interval) <= options.maxDistance),
        Voicing.validateInterval((interval, { path, array }) => array.length === 1 || path.length === 1 || Interval.semitones(interval) >= options.minDistance),
        Voicing.validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) >= options.minTopDistance),
        Voicing.validateInterval((interval, { path }) => path.length !== 1 || Interval.semitones(interval) >= options.minBottomDistance)
    */
    return [
      Permutation.validator.min(options.minNotes),
      path => {
        const interval = <string>Distance.interval(path[path.length - 2], path[path.length - 1]);
        return path.length > 1 && Interval.semitones(interval) >= options.minTopDistance
      }
    ]
  }

  static intervalCollector(validate: (interval: string, path, next) => boolean) {
    return (pitches) => (collected, solutions) => {
      if (!collected.length) { return pitches; }
      return pitches.filter(pitch => {
        const interval = Distance.interval(collected[collected.length - 1], pitch) + '';
        return validate(interval, collected[collected.length - 1], pitch);
      })
    }
  }

  static collectors(options?: VoicingValidation): any[] {
    options = {
      maxDistance: 6, // max semitones between any two sequential notes
      minDistance: 1, // min semitones between two notes
      minBottomDistance: 3, // min semitones between the two bottom notes
      unique: true,
      maxNotes: 4,
      ...options,
    }

    return [
      Permutation.collector.maxItems(options.maxNotes),
      Permutation.collector.unique(options.unique),
      Voicing.intervalCollector(Permutation.validate([
        interval => Interval.semitones(interval) <= options.maxDistance,
        interval => Interval.semitones(interval) >= options.minDistance,
        (interval, path) => path.length !== 1 || Interval.semitones(interval) >= options.minBottomDistance
      ])),
    ]
  }

  static search(pitches: string[], options: VoicingValidation = {}) {
    return Permutation.search(
      Permutation.collect(pitches, Voicing.collectors(options)),
      Permutation.validate(Voicing.validators(options))
    );
  }

  static absolute(options: VoicingValidation = {}) {
    // interval in semitones => lowest starting note
    // set default options
    options = {
      ...voicingDefaultOptions,
      ...options
    };
    const {
      requiredPitches,
      optionalPitches,
      bottomPitches,
      topPitches,
      topNotes,
      voices,
      ignoreLowerIntervalLimits,
      bottomDistances,
      topDistances,
      preferTopDistances,
    } = options;
    let {
      range,
      defaultDistances,
    } = options;
    const pitches = [...(requiredPitches || []), ...(optionalPitches || [])];
    const bottomChromas = (bottomPitches || []).map(p => (p || []).map(n => Note.chroma(n)));
    const topChromas = (topPitches || []).map((p => (p || []).map(n => Note.chroma(n))));
    if (!pitches.length) {
      throw new Error('requiredPitches or optionalPitches must be set!');
    }
    let { minNotes, maxNotes } = {
      ...Voicing.getMinMaxNotes(options),
      ...options,
    }
    if (voices) {
      // each voice has own range
      if (maxNotes && maxNotes > voices.length) {
        throw new Error('maxNotes cannot be greater than the amount of voices');
      } // but can be smaller..
      maxNotes = maxNotes || voices.length;
      range = [voices[0][0], voices[voices.length - 1][1]];
    }
    if (!range) {
      throw new Error('no range given');
    }
    if (!minNotes) {
      minNotes = pitches.length;
    }
    if (!maxNotes) {
      maxNotes = pitches.length;
    }
    const allowedNotes = Harmony.getPitchesInRange(pitches, range);
    return Permutation.search(
      (path: string[], solutions) => {
        if (!path.length) { // no notes picked yet
          /* if (bottomPitches && bottomPitches.length) {
            return allowedNotes.filter(n => bottomPitches.includes(Note.pc(n)));
          } */
          if (bottomChromas.length) {
            return allowedNotes.filter(n => bottomChromas[0].includes(Note.chroma(n)));
          }
          return allowedNotes;
        }
        if (path.length >= maxNotes) { // limit reached
          return [];
        }
        // determine min/max distance for current path
        let bottomDistance, topDistance;
        if (bottomDistances && bottomDistances[path.length - 1]) {
          bottomDistance = bottomDistances[path.length - 1];
        }
        if (minNotes === maxNotes && topDistances && topDistances[maxNotes - path.length - 1]) {
          // maybe could optimize for minNotes!==maxNotes
          topDistance = topDistances[maxNotes - path.length];
        }
        let distanceRange = [].concat(defaultDistances);
        if (bottomDistance && topDistance) { // clash
          distanceRange = preferTopDistances ? topDistance : bottomDistance;
        } else {
          distanceRange = bottomDistance || topDistance || distanceRange; //  || [minDistance, maxDistance];
        }
        return allowedNotes.filter( // only return notes above last pick
          note => {
            const noteMidi = Note.midi(note);
            const lastMidi = Note.midi(path[path.length - 1]);
            return noteMidi > lastMidi
              && (!distanceRange[1] || (noteMidi - lastMidi) <= distanceRange[1])
              && (!distanceRange[0] || (noteMidi - lastMidi) >= distanceRange[0])
              && (!bottomChromas[path.length] || bottomChromas[path.length].includes(Note.chroma(note)))
              && (ignoreLowerIntervalLimits || (!lowIntervalLimits[(noteMidi - lastMidi)] || noteMidi >= Note.midi(lowIntervalLimits[(noteMidi - lastMidi)])))
          }
        );
      },
      (solution) => {
        if (solution.length < minNotes) {
          return false;
        }
        if (requiredPitches && !requiredPitches.reduce(
          (hasAll, pitch) => hasAll && !!solution.find(n => Note.chroma(n) === Note.chroma(pitch)), true
        )) {
          return false;
        }
        /* if (topPitches && !topPitches.includes(Note.pc(solution[solution.length - 1]))) {
          return false;
        } */
        // TODO add other topChromas....
        /* if (topChromas[solution.length - 1] && !topChromas[solution.length - 1].includes(Note.chroma(solution[solution.length - 1]))) {
          return false;
        } */
        if (topNotes && !topNotes.includes(solution[solution.length - 1])) {
          return false;
        }
        if (topChromas && !topChromas.reduce((valid, chromas, i) => {
          const index = solution.length - topChromas.length + i;
          if (!index) {
            return valid;
          }
          return valid && chromas.includes(Note.chroma(solution[index]));
        }, true)) {
          //console.log('topChroma fail', topChromas, solution);
          return false;
        }

        if (topDistances && !topDistances.reduce((valid, distance, i) => {
          const index = solution.length - topDistances.length + i;
          if (!index) {
            return valid;
          }
          const d = (Note.midi(solution[index]) - Note.midi(solution[index - 1]));
          return valid && d >= distance[0] && d <= distance[1];
        }, true)) {
          return false;
        }
        if (voices && Array.isArray(voices)
          && voices.length
          && Array.isArray(voices[0])
          && Array.isArray(voices[1])
          && Voicing.allocations(solution, <string[][]>voices).length === 0) {
          return false;
        }
        return true;
      }
    );
  }

  // just a wrapper to avoid possible future refactoring: correctly named
  static getRequiredPitches(chord, voices = 2) {
    return Voicing.getRequiredNotes(chord, voices);
  }

  static getMinMaxNotes(options: VoicingValidation) {
    let notes = options.notes || voicingDefaultOptions.notes;
    let minNotes, maxNotes;
    if (typeof notes === 'number') {
      minNotes = notes;
      maxNotes = notes
    } else if (Array.isArray(notes)) {
      if (notes.length < 2) {
        throw new Error('notes must be a number or an array with two numbers (max,min)');
      }
      minNotes = notes[0];
      maxNotes = notes[1];
    }
    if (minNotes > maxNotes) {
      throw new Error('minNotes cannot be greater than maxNotes');
    }
    return { minNotes, maxNotes };
  }

  static getPitches(chord: string, options: VoicingValidation) {
    chord = Harmony.getTonalChord(chord);
    const pitches = Chord.notes(chord);
    options = {
      ...Voicing.getMinMaxNotes(options),
      ...options,
    }
    const requiredPitches = Voicing.getRequiredPitches(chord, options.maxNotes);
    const optionalPitches = pitches.filter(pitch => !requiredPitches.includes(pitch));
    return {
      requiredPitches,
      optionalPitches
    }
  }

  static getCombinations(chord, options: VoicingValidation = {}) {
    const root = Harmony.getBassNote(chord);
    if (options.bottomDegrees && options.bottomDegrees.length) {
      options.bottomPitches = (options.bottomPitches || []).concat(
        <string[][]>(<number[][]>options.bottomDegrees)
          .map(degrees => degrees.map(degree => getDegreeInChord(degree, chord)))
      );
    }
    if (options.topDegrees && options.topDegrees.length && typeof options.topDegrees[0] === 'number') {
      throw new Error('topDegrees should be a double nested array!');
    }
    if (options.topDegrees && options.topDegrees.length) {
      options.topPitches = (options.topPitches || []).concat(
        <string[][]>(<number[][]>options.topDegrees)
          .map(p => p.map(degree => getDegreeInChord(degree, chord)))
      );
    }
    return Voicing.absolute({ ...Voicing.getPitches(chord, options), ...options, root });
  }

  /* static allocations(notes: string[], voices: { [name: string]: string[] }) { */
  static allocations(notes: string[], voices: string[][]) {
    // sort voices by range top => bottom to top
    //const keys = Object.keys(voices).sort((a, b) => Note.midi(voices[a][1]) - Note.midi(voices[b][1]));
    const keys = voices.sort((a, b) => Note.midi(a[1]) - Note.midi(b[1])).map((v, i) => i);

    return Permutation.search(
      (path: number[], solutions) => {
        if (path.length > notes.length - 1) { // all notes voiced
          return [];
        }
        const note = notes[path.length];
        return keys.filter((v, i) =>
          !path.includes(i) // voice has already neem picked
          && i > keys.indexOf(keys[path.length - 1]) // voice is below last voice => would cross
          && isInRange(note, voices[i])
        );
      },
      (solution) => {
        return solution.length === notes.length;
      }
    ); //.map(solution => solution.map(v => voices.indexOf(v)));
  }


  /** Configurable Validator that sorts out note combinations with untasty intervals.  */
  static voicingValidator(options?: VoicingValidation) {
    options = {
      maxDistance: 6, // max semitones between any two sequential notes
      minDistance: 1, // min semitones between two notes
      minBottomDistance: 3, // min semitones between the two bottom notes
      minTopDistance: 2, // min semitones between the two top notes
      ...options,
    }
    return (path, next, array) => {
      const lastPosition = path.length + array.length - 1;
      return Permutation.combineValidators(
        Voicing.notesAtPositionValidator(options.topNotes, lastPosition),
        Voicing.notesAtPositionValidator(options.bottomNotes, 0),
        Voicing.degreesAtPositionValidator(options.topDegrees, lastPosition, options.root),
        Voicing.degreesAtPositionValidator(options.bottomDegrees, 0, options.root),
        Voicing.validateInterval(interval => Interval.semitones(interval) <= options.maxDistance),
        Voicing.validateInterval((interval, { path, array }) => array.length === 1 || path.length === 1 || Interval.semitones(interval) >= options.minDistance),
        Voicing.validateInterval((interval, { array }) => array.length !== 1 || Interval.semitones(interval) >= options.minTopDistance),
        Voicing.validateInterval((interval, { path }) => path.length !== 1 || Interval.semitones(interval) >= options.minBottomDistance)
      )(path, next, array);
    }
  }



  /** Validates the interval to the next note. You can write your own logic inside the validate fn. */
  static validateInterval(validate: (interval: string, { path, next, array }) => boolean) {
    return (path, next, array) => {
      if (!path.length) { return true }
      const interval = Distance.interval(path[path.length - 1], next) + '';
      return validate(interval, { path, next, array });
    }
  }

  /** Returns all possible combinations of required and optional notes for a given chord and desired length. 
   * If the voices number is higher than the required notes of the chord, the rest number will be permutated from the optional notes */
  static getAllNoteSelections(chord, options: VoiceLeadingOptions | number = {}) {
    if (typeof options === 'number') {
      options = { maxVoices: options };
    }
    let { omitNotes, topNotes, bottomNotes, maxVoices } = {
      topNotes: [],
      bottomNotes: [],
      ...options
    };
    maxVoices = maxVoices || 3;
    let required = Voicing.getRequiredNotes(chord, maxVoices);
    const extraNotes = (topNotes || []).concat(bottomNotes).map(n => Note.pc(n));
    if (extraNotes.length) {
      required = extraNotes.concat(required)
      /* .filter((n, i, a) => a.indexOf(n) === i).concat(required); */
      if (maxVoices === 1) {
        return [extraNotes];
      }
    }
    required = Voicing.withoutPitches(omitNotes, required);
    if (maxVoices === 1) {
      return required.map(note => [note]);
    }
    const fill = maxVoices - required.length;
    if (fill === 0) {
      return [required];
    }
    if (fill < 0) { // required notes are enough
      return Permutation.binomial(required, maxVoices);
    }
    let optional = Voicing.getOptionalNotes(chord, maxVoices, required);
    optional = Voicing.withoutPitches(omitNotes, optional);

    if (fill >= optional.length) {
      return [required.concat(optional)];
    }

    return Permutation.binomial(optional, Math.min(fill, optional.length))
      .map(selection => required.concat(selection))
  }

  static withoutPitches(pitches = [], voicing: string[]) {
    return voicing.filter(r => !pitches.find(o => Harmony.hasSamePitch(r, o)));
  }

  /** Get available tensions for a given chord. Omits tensions that kill the chord quality */
  static getAvailableTensions(chord) {
    chord = Harmony.getTonalChord(chord);
    const notes = Chord.notes(chord);
    if (isDominantChord(chord)) {
      return Voicing.getAllTensions(notes[0])
        // filter out tensions that are part of the chord
        .filter(note => !notes.find(n => semitoneDistance(notes[0], note) === semitoneDistance(notes[0], n)))
        // filter out tensions that are a semitone above the 3 (if exists)
        .filter(note => chordHasIntervals(chord, ['3!']) || semitoneDistance(getDegreeInChord(3, chord), note) > 1)
        // filter out tensions that are a semitone above the 4 (if exists => sus)
        .filter(note => !chordHasIntervals(chord, ['4P']) || semitoneDistance(getDegreeInChord(4, chord), note) > 1)
        // filter out tensions that are a semitone above the 7
        .filter(note => semitoneDistance(getDegreeInChord(7, chord), note) > 1)
    }
    return notes.slice(0, 4)
      // notes less than 3 semitones away from root are omitted (tensions 2M above would be in next octave)
      .filter(note => note === notes[0] || semitoneDistance(note, notes[0]) > 2)
      // all tensions are a major second above a chord note
      .map(note => Distance.transpose(note, '2M'))
      // tensions 2 semiontes below root are flat 7 => changes chord quality
      .filter(note => semitoneDistance(note, notes[0]) !== 2)
    // omit tensions that end up on a chord note again?
  }

  /** Returns all Tensions that could be in any chord */
  static getAllTensions(root) {
    return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
      .map(step => getIntervalFromStep(step))
      .map(interval => Distance.transpose(root, interval));
  }

  /** Returns all notes that are required to outline a chord */
  static getRequiredNotes(chord, voices = 2) {
    chord = Harmony.getTonalChord(chord);
    const notes = Chord.notes(chord);
    const intervals = Chord.intervals(chord);
    let requiredSteps = [3, 7, 'b5', 6].slice(0, Math.max(voices, 2)); // order is important
    if (!hasDegree(3, intervals)) {
      requiredSteps.push(4); // fixes m6 chords
    }
    let required = requiredSteps.reduce((req, degree) => {
      if (hasDegree(degree, intervals)) {
        req.push(getDegreeInChord(degree, chord));
      }
      return req;
    }, []);
    if (voices > 3 && !required.includes(notes[notes.length - 1])) {
      required.push(notes[notes.length - 1]);
    }
    return required;
  }

  /** Returns all notes that are not required */
  static getOptionalNotes(chord, voices?, required?) {
    chord = Harmony.getTonalChord(chord);
    const notes = Chord.notes(chord);
    required = required || Voicing.getRequiredNotes(chord, voices);
    return notes.filter(note => !required.includes(note));
  }

  /** Returns all possible note choices for the given combinations.
   * Takes the bottom note of the previous voicing and computes the minimal intervals up and down to the next bottom note.
   */
  static getAllChoices(combinations: Array<string[]>, previousVoicing: string[] = [], options: VoiceLeadingOptions = {}): VoiceLeading[] {
    let { range, topNotes } = options;
    range = range || voicingDefaultOptions.range;

    let choices = [];
    if (topNotes && topNotes.length) {
      const absoluteTopNotes = (topNotes || []).filter(n => !!Note.oct(n));
      const choicesWithTopNotes = absoluteTopNotes.reduce((rendered, topNote) => {
        const combinationsWithThatTopNote = combinations.filter(c => Harmony.hasSamePitch(c[c.length - 1], topNote));
        combinationsWithThatTopNote.forEach(combination =>
          rendered.push(renderAbsoluteNotes(combination.reverse(), Note.oct(topNote), 'down').reverse())
        );
        // exclude the combination from further rendering
        combinations = combinations.filter(c => !combinationsWithThatTopNote.includes(c));
        return rendered;
      }, []);
      choices = choices.concat(choicesWithTopNotes, []);
      if (!combinations.length) {
        return choices.reduce((all, targets) => {
          const leads = Voicing.voiceLeading(targets, previousVoicing);
          return all.concat(leads);
        }, [])
      } else {
        console.warn('not only top note choices', topNotes, choicesWithTopNotes, combinations);
      }
    }

    if (!previousVoicing || !previousVoicing.length) { // no previous chord
      // filter out combinations that are out of range
      combinations = combinations.filter(combination => {
        const firstNote = Harmony.getNearestNote(range[0], combination[0], 'up');
        const pick = renderAbsoluteNotes(combination, Note.oct(firstNote));
        /* const highestNote = Harmony.getNearestNote(range[1], combination[combination.length - 1], 'down');
        const pick = renderAbsoluteNotes(combination.reverse(), Note.oct(highestNote), 'down').reverse(); */
        return isInRange(pick[0], range) && isInRange(pick[pick.length - 1], range);
      });
      if (!combinations.length) {
        return [];
      }

      const firstPick = combinations[0];
      const firstNoteInRange = Harmony.getNearestNote(range[0], firstPick[0], 'up');
      const pick = renderAbsoluteNotes(firstPick, Note.oct(firstNoteInRange));

      if (topNotes && topNotes.length) {
        return Voicing.voiceLeading(pick.concat(topNotes));
      }
      return Voicing.voiceLeading(pick);
    }

    const lastPitches = previousVoicing.map(note => Note.pc(note));
    return combinations
      .map((combination) => {
        const bottomInterval = Distance.interval(lastPitches[0], combination[0]);
        let bottomNotes = [
          Distance.transpose(previousVoicing[0], Harmony.minInterval(bottomInterval, 'down')),
          Distance.transpose(previousVoicing[0], Harmony.minInterval(bottomInterval, 'up')),
        ];
        if (bottomNotes[0] === bottomNotes[1]) {
          bottomNotes = [bottomNotes[0]];
        }
        return { combination, bottomNotes }
      })
      .reduce((all, { combination, bottomNotes }) => all.concat(
        bottomNotes.map(bottomNote => renderAbsoluteNotes(combination, Note.oct(<string>bottomNote)))
      ), [])
      .filter((targets) => {
        return !range ||
          isInRange(targets[0], range) &&
          isInRange(targets[targets.length - 1], range)
      })
      .reduce((all, targets) => {
        const leads = Voicing.voiceLeading(targets, previousVoicing);
        return all.concat(leads);
      }, [])
  }

  /** Analyzes all possible voice movements for all possible transitions. Handles inequal lengths */
  static voiceLeading(targets, origin = []): VoiceLeading[] {
    // if same length > dont permutate
    if (!origin || !origin.length || origin.length === targets.length) {
      return [Voicing.analyzeVoiceLeading(targets, origin)];
    }
    const [more, less] = [origin, targets].sort((a, b) => b.length - a.length);
    return Permutation.binomial(more, less.length)
      .map(selection => {
        let from, to;
        if (origin.length < targets.length) {
          [from, to] = [origin, selection];
        } else {
          [from, to] = [selection, targets];
        }
        return Voicing.analyzeVoiceLeading(to, from, targets, origin);
      });
  }

  /** Analyzed the voice leading for the movement from > to. 
   * Origin and targets needs to be passed if the voice transition over unequal lengths
   */
  static analyzeVoiceLeading(to, from = [], targets = to, origin = from): VoiceLeading {
    [origin, targets] = [origin || from, targets || to];
    if (!from || !from.length) {
      return {
        to, targets,
        from, origin,
        intervals: [],
        degrees: [],
        oblique: [],
        difference: 0,
        movement: 0,
        similar: false,
        parallel: false,
        contrary: false,
        topNotes: [0, to[to.length - 1]],
        bottomNotes: [0, to[to[0]]],
        dropped: [],
        added: []
      };
    }
    // console.log(to, from, targets, origin);
    let intervals = Voicing.voicingIntervals(from, to, false)
      .map(interval => Harmony.fixInterval(interval, false));
    /** Interval qualities */
    const degrees = intervals.map(i => getDegreeFromInterval(i));
    /** Voices that did not move */
    const oblique = from.filter((n, i) => to.find(note => Harmony.hasSamePitch(n, note)));
    /** abs sum of semitones movements of voices */
    const difference = semitoneDifference(intervals);
    /** relative sum of semitone movements */
    const movement = semitoneMovement(intervals);
    /** voice differences did not cancel each other out > moved in same direction */
    const similar = Math.abs(movement) === Math.abs(difference);
    /** moves parallel if all interval qualities the same and in the same direction */
    const parallel = difference > 0 && similar && degrees.reduce((match, degree, index) =>
      match && (index === 0 || degrees[index - 1] === degree), true);
    // find out which notes have been dropped / added
    let dropped = [], added = [];
    if (origin.length < targets.length) {
      added = targets.filter(n => !to.includes(n));
    } else {
      dropped = origin.filter(n => !from.includes(n));
    }
    const bottomInterval = intervals[0];
    const topInterval = intervals[intervals.length - 1];
    const bottomNotes = [origin[0], targets[0]];
    const topNotes = [origin[origin.length - 1], targets[targets.length - 1]];
    return {
      from,
      to,
      origin,
      targets,
      intervals,
      difference,
      movement,
      bottomInterval,
      topInterval,
      topNotes,
      bottomNotes,
      similar,
      contrary: !similar,
      parallel,
      oblique,
      degrees,
      added,
      dropped,
      topDropped: dropped.includes(topNotes[0]),
      topAdded: added.includes(topNotes[1]),
      bottomDropped: dropped.includes(bottomNotes[0]),
      bottomAdded: added.includes(bottomNotes[1])
    }
  }

  /** Returns true if the given note is contained in the given voicing. */
  static containsPitch(note, voicing, enharmonic = true) {
    if (!enharmonic) {
      return voicing.includes(note);
    }
    return !!voicing.find(n => Harmony.hasSamePitch(note, n));
  }

  /** Returns the intervals between the given chord voicings. 
   * Can be passed pitch classes or absolute notes.
   * The two voicings should have the same length. */
  static voicingIntervals(chordA, chordB, min = true, direction?: intervalDirection) {
    if (chordA.length !== chordB.length) {
      // console.log('voicingIntervals: not the same length..');
    }
    const intervals = chordA.map((n, i) => {
      const interval = Distance.interval(n, chordB[i]);
      if (min === false) {
        return interval;
      }
      if (isPitchClass(n) && isPitchClass(chordB[i])) {
        return Harmony.minInterval(interval, direction);
      }
      return interval;
    });
    return intervals;
  }

  /** Validates the current permutation to have a note at a certain position (array index) */
  static notesAtPositionValidator(notes = [], position) {
    return (selected, note, remaining) => {
      return !notes.length || selected.length !== position || Voicing.containsPitch(note, notes)/*  notes.includes(note) */;
    }
  }

  /** Validates the current permutation to have a note at a certain position (array index) */
  static degreesAtPositionValidator(degrees = [], position, root) {
    return (selected, note, remaining) => {
      if (!degrees.length || !root || selected.length !== position) {
        return true;
      }
      const degree = getDegreeFromInterval(<string>Distance.interval(root, note));
      return degrees.includes(degree);
    }
  }

  /** Returns true if the given voicing contains its root */
  static hasTonic(voicing, chord) {
    const tokens = Chord.tokenize(Harmony.getTonalChord(chord));
    return voicing.map(n => Note.pc(n)).includes(tokens[0]);
  }

  /** Returns the best direction to move for a given voicing in a range.
   * Outputs a direction as soon as the semitone distance of one of the outer notes is below the given threshold
   */
  static getDesiredDirection(voicing, range, thresholds = [3, 3]) {
    if (!voicing) {
      return;
    }
    let distances = getDistancesToRangeEnds([voicing[0], voicing[voicing.length - 1]], range);
    if (distances[0] < thresholds[0] && distances[1] < thresholds[1]) {
      console.error('range is too small to fit the comfy zone (rangeBorders)', thresholds, range);
      return;
    }
    if (distances[0] < thresholds[0]) {
      return 'up';
    }
    if (distances[1] < thresholds[1]) {
      return 'down';
    }
  }
}

/**
 *
    static getPossibleVoicings(chord, voices = 4) {
        const required = getRequiredNotes(chord);
        const optional = getOptionalNotes(chord);
        const tensions = getAvailableTensions(chord);
        return { required, optional, tensions };
    }
    static voicingDifference(chordA, chordB, min = true) {
        return semitoneDifference(Voicing.voicingIntervals(chordA, chordB, min));
    }

    static voicingMovement(chordA, chordB, min = true, direction?: intervalDirection) {
        return semitoneMovement(Voicing.voicingIntervals(chordA, chordB, min, direction));
    }

    static bestVoiceLeading(chordA, chordB, sortFn?) {
        sortFn = sortFn || ((a, b) => a.difference - b.difference);
        const voices = Voicing.voiceLeading(chordA, chordB)
            .sort((best, current) => {
                return sortFn(best, current);
            }, null);
        return voices[0];
    }

    static minVoiceMovement(chordA, chordB) {
        [chordA, chordB] = [chordA, chordB].sort((a, b) => b.length - a.length);
        const picks = Permutation.binomial(chordA, chordB.length);
        return picks.reduce((min, current) => {
            const diff = Voicing.voicingMovement(current, chordB, false);
            if (Math.abs(diff) < Math.abs(min)) {
                return diff;
            }
            return min;
        }, 100);
    }

    static getVoices(chord, voices = 4, rootless = false, tension = 1) {
        // THE PROBLEM: TENSION MUST BE CHOSEN WHEN SELECTING THE OPTIMAL VOICING!
        chord = Harmony.getTonalChord(chord);
        const tokens = Chord.tokenize(chord);
        const required = Voicing.getRequiredNotes(chord);
        let optional = Voicing.getOptionalNotes(chord, required);
        let choices = [].concat(required);
        const remaining = () => voices - choices.length;
        if (tension > 0) {
            choices = choices.concat(Voicing.getAvailableTensions(chord).slice(0, tension));
        }
        if (remaining() > 0) {
            choices = choices.concat(optional);
        }
        if (remaining() < 0 && rootless) {
            choices = choices.filter(n => n !== tokens[0]);
        }
        if (remaining() > 0) {
            // console.warn(`${remaining} notes must be doubled!!!`);
            choices = choices.concat(required, optional).slice(0, voices);
        }
        return choices.slice(0, voices);
    }
 */