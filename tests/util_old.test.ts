import * as util from '../lib/util_old';
import { Note, Scale } from 'tonal';


test('getIntervals', () => {
  expect(util.getIntervals(['C3', 'D3', 'F3', 'C4'])).toEqual(['2M', '3m', '5P']);
});

test('smallestInterval', () => {
  expect(util.smallestInterval(util.getIntervals(['C3', 'D3', 'F3', 'C4']))).toEqual('2M');
});

test('sortNotes', () => {
  expect(util.sortNotes(['C3', 'C2', 'F3', 'F1'])).toEqual(['F1', 'C2', 'C3', 'F3']);
  expect(util.sortNotes(['C3', 'C2', 'C6', 'C1'])).toEqual(['C1', 'C2', 'C3', 'C6']);
});

test('analyzeVoicing', () => {
  const analyzed = util.analyzeVoicing(['D3', 'F3', 'A3', 'C4']);
  expect(analyzed.spread).toBe('7m');
  expect(analyzed.minInterval).toBe('3m');
  expect(analyzed.maxInterval).toBe('3M');
});



test('sortByDegree', () => {
  const cmaj = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  expect(util.sortByDegree(cmaj, 1))
    .toEqual(cmaj);
  expect(util.sortByDegree(cmaj, 2))
    .toEqual(cmaj);
  expect(util.sortByDegree(cmaj, 3))
    .toEqual(['C', 'E', 'G', 'B', 'D', 'F', 'A']);
  expect(util.sortByDegree(cmaj, 4))
    .toEqual(['C', 'F', 'B', 'E', 'A', 'D', 'G']);
  expect(util.sortByDegree(cmaj, 5))
    .toEqual(['C', 'G', 'D', 'A', 'E', 'B', 'F']);
  expect(util.sortByDegree(cmaj, 6))
    .toEqual(['C', 'A', 'F', 'D', 'B', 'G', 'E']);
  expect(util.sortByDegree(cmaj, 7))
    .toEqual(['C', 'B', 'A', 'G', 'F', 'E', 'D']);
  expect(util.sortByDegree(cmaj, -1))
    .toEqual(['C', 'B', 'A', 'G', 'F', 'E', 'D']);
  expect(util.sortByDegree(['B', 'C', 'D', 'E', 'F', 'G', 'A'], 4))
    .toEqual(['B', 'E', 'A', 'D', 'G', 'C', 'F']);
  expect(util.sortByDegree(['D', 'F', 'A', 'C'], 4))
    .toEqual(['D', 'A', 'C', 'F']);
  expect(util.sortByDegree(['C', 'D', 'F', 'A'], 4))
    .toEqual(['C', 'F', 'A', 'D']);
  expect(util.sortByDegree(['E', 'G', 'A', 'B', 'D'], 4))
    .toEqual(['E', 'A', 'D', 'G', 'B']);
});


test('getAverageMidi', () => {
  expect(util.getAverageMidi(['C3', 'C4'])).toBe(Note.midi('F#3'));
  expect(util.getAverageMidi(['C3', 'B3'])).toBe(Note.midi('F#3') - .5);
})

test('getRangePosition', () => {
  expect(util.getRangePosition('C2', ['C3', 'C4'])).toBe(-1);
  expect(util.getRangePosition('C5', ['C3', 'C4'])).toBe(2);
  expect(util.getRangePosition('C3', ['C3', 'C4'])).toBe(0);
  expect(util.getRangePosition('F#3', ['C3', 'C4'])).toBe(.5);
  expect(util.getRangePosition('C4', ['C3', 'C4'])).toBe(1);
  expect(util.getRangePosition('G#3', ['C3', 'C4'])).toBe(8 / 12);
  expect(util.getRangePosition('A3', ['C3', 'C4'])).toBe(9 / 12);
  expect(util.getRangePosition('D3', ['C3', 'C4'])).toBe(2 / 12);
  const range = ['C3', 'C4'];
  expect(util.getRangePosition(util.getAverageMidi(range), range)).toBe(.5);
});

test('getRangeDirection', () => {
  const fn = util.getRangeDirection;
  expect(fn('C2', ['C3', 'C4']).direction).toBe('up');
  expect(fn(Note.midi('C2'), ['C3', 'C4']).direction).toBe('up');
  expect(fn('C2', ['C3', 'C4']).force).toBe(true);
  expect(fn('C5', ['C3', 'C4']).direction).toBe('down');
  expect(fn('C3', ['C3', 'C4']).direction).toBe('up');
  expect(fn('C3', ['C3', 'C4']).force).toBe(true);
  expect(fn('F#3', ['C3', 'C4']).direction).toBe('down');
  expect(fn('F#3', ['C3', 'C4']).force).toBe(false);
  expect(fn('C4', ['C3', 'C4']).direction).toBe('down');
  expect(fn('G#3', ['C3', 'C4']).direction).toBe('down');
  expect(fn('A3', ['C3', 'C4']).direction).toBe('down');
  expect(fn('D3', ['C3', 'C4']).direction).toBe('down');
});

test('isFirstInPath', () => {
  expect(util.isFirstInPath([0, 0, 0], 1)).toBe(true);
  expect(util.isFirstInPath([0, 1, 0], 1)).toBe(false);
  expect(util.isFirstInPath([0, 0, 1], 1)).toBe(false);
  expect(util.isFirstInPath([0, 1, 1], 1)).toBe(false);
  expect(util.isFirstInPath([0, 0, 0], 2)).toBe(true);
  expect(util.isFirstInPath([0, 0, 1], 2)).toBe(false);
  expect(util.isFirstInPath([0, 1, 0], 2)).toBe(true);
  expect(util.isFirstInPath([1, 1, 0], 2)).toBe(true);

  expect(util.isFirstInPath([1, 0, 0, 0, 0], 0)).toBe(false);
  expect(util.isFirstInPath([1, 0, 0, 0, 0], 1)).toBe(true);
  expect(util.isFirstInPath([1, 0, 0, 0, 0], 2)).toBe(true);
  expect(util.isFirstInPath([1, 0, 0, 0, 0], 3)).toBe(true);
  expect(util.isFirstInPath([1, 0, 0, 0, 0], 4)).toBe(true);
});


test('getVoicing', () => {
  expect(util.getVoicing('C7#5')).toEqual(['C', 'E', 'G#', 'Bb']);
});


test('hasAllDegrees', () => {
  expect(util.hasAllDegrees([1, 5, 3], ['1', 'b3', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 5, 2], ['1', 'b3', '5'])).toBe(false);
  expect(util.hasAllDegrees([1, 2], ['1', 'b9', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 'b2'], ['1', 'b9', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 'b9'], ['1', 'b9', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 'b9'], ['1', 'b2', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 9], ['1', 'b9', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 9], ['1', 'b2', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 2], ['1', 'b2', '5'])).toBe(true);
  expect(util.hasAllDegrees([1, 2], ['1', 'b9', '5'])).toBe(true);
});


test('getScaleDegree', () => {
  expect(util.getScaleDegree(1, 'major')).toBe('1P');
  expect(util.getScaleDegree(2, 'major')).toBe('2M');
  expect(util.getScaleDegree(2, 'phrygian')).toBe('2m');
  expect(util.getScaleDegree(3, 'major')).toBe('3M');
  expect(util.getScaleDegree(3, 'minor')).toBe('3m');
  expect(util.getScaleDegree('3', 'minor')).toBe('3m');
  expect(util.getScaleDegree('b3', 'minor')).toBe('3m');
  expect(util.getScaleDegree('b3', 'major')).toBe(undefined);
});

test('getScalePattern', () => {
  expect(util.getScalePattern([1, 2, 3, 5], 'major')).toEqual(['1P', '2M', '3M', '5P']);
  expect(util.getScalePattern([1, 3, 4, 5], 'minor')).toEqual(['1P', '3m', '4P', '5P']);
})

test('permutateIntervals', () => {
  expect(util.permutateIntervals(Scale.intervals('major'), [1, 5, 3, 7])).toEqual(['1P', '5P', '3M', '7M']);
  expect(util.permutateIntervals(Scale.intervals('minor'), [1, 5, 3, 7])).toEqual(['1P', '5P', '3m', '7m']);
})
test('renderIntervals', () => {
  expect(util.renderIntervals(['1P', '3m', '7m'], 'C')).toEqual(['C', 'Eb', 'Bb']);
});
test('renderSteps', () => {
  expect(util.renderSteps(['1', 'b3', 'b7'], 'C')).toEqual(['C', 'Eb', 'Bb']);
});

test('getChordNotes', () => {
  expect(util.getChordNotes('C#-7')).toEqual(['C#', 'E', 'G#', 'B']);
  expect(util.getChordNotes('C#-7', (note, { degree }) => degree !== 1)).toEqual(['E', 'G#', 'B']);
  expect(util.getChordNotes('C#-7', util.validateWithoutRoot)).toEqual(['E', 'G#', 'B']);
});

/** The following tests are commented out because they indirectly use symbols.ts of jazzband,
 * which should not be part of this package */

/* test('renderDigitalPattern', () => {
  expect(util.renderDigitalPattern('7')).toEqual(['1P', '2M', '3M', '5P']);
  expect(util.renderDigitalPattern('-7')).toEqual(['1P', '3m', '4P', '5P']);
  expect(util.renderDigitalPattern('C-7')).toEqual(['C', 'Eb', 'F', 'G']);
  expect(util.renderDigitalPattern('F7')).toEqual(['F', 'G', 'A', 'C']);
  expect(util.renderDigitalPattern('F^7')).toEqual(['F', 'G', 'A', 'C']);
});

test('getGuideTones', () => {
  expect(util.getGuideTones('C7')).toEqual(['E', 'Bb']);
  expect(util.getGuideTones('D-7')).toEqual(['F', 'C']);
  expect(util.getGuideTones('Ab-7')).toEqual(['Cb', 'Gb']);
});



test('getChordScales', () => {
  expect(util.getChordScales('D-')).toEqual(
    ["dorian",
      "phrygian",
      "aeolian",
      "harmonic minor",
      "dorian #4",
      "melodic minor",
      "melodic minor second mode"]
  );
  expect(util.getChordScales('D-', 'Basic')).toEqual(
    ["minor pentatonic",
      "minor blues",
      "dorian",
      "phrygian",
      "aeolian"]
  );
  expect(util.getChordScales('D7#11', 'Diatonic')).toEqual(
    ["lydian dominant"]
  );
  expect(util.getChordScales('C6', 'Diatonic')).toEqual(
    ["major", "lydian", "mixolydian", "lydian dominant"]
  );
});

test('getPatternInChord', () => {
  expect(util.getPatternInChord([1, 5, 3, 7], '7')).toEqual(['1P', '5P', '3M', '7m']);
  expect(util.getPatternInChord([1, 5, 3, 7], '-7')).toEqual(['1P', '5P', '3m', '7m']);

  expect(Harmony.getTonalChord('-7')).toBe('m7');
  expect(Chord.intervals('m7')).toEqual(['1P', '3m', '5P', '7m']);
  expect(Chord.tokenize('m7')).toEqual(['', 'm7']);

  expect(util.getPatternInChord([1, 9, 3, 7], '-7')).toEqual(['1P', '2M', '3m', '7m']);
  expect(util.getPatternInChord([7, 9, 3, 5], '-7b5')).toEqual(['7m', '2m', '3m', '5d']);
  expect(util.getPatternInChord([7, 9, 3, 5], 'D-7b5')).toEqual(['C', 'Eb', 'F', 'Ab']);
  expect(util.getPatternInChord([3, 5, 7, 9], '-7b5')).toEqual(['3m', '5d', '7m', '2m']);
  expect(util.getPatternInChord([3, 5, 7, 9], 'D-7b5')).toEqual(['F', 'Ab', 'C', 'Eb']);
}); */