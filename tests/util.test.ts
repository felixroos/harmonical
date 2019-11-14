import * as util from '../src/util';

import { Scale, Chord, Interval, Distance, Note } from 'tonal';
import { Harmony } from '../src/Harmony';
import { semitoneDifference } from '../src/util';

test('getIntervalFromStep: undefined', () => {
  expect(util.getIntervalFromStep('d3g2g3')).toEqual(undefined);
});

test('getIntervalFromStep: numbers', () => {
  expect(util.getIntervalFromStep(1)).toEqual('1P');
  expect(util.getIntervalFromStep(2)).toEqual('2M');
  expect(util.getIntervalFromStep(-2)).toEqual('2m');
  expect(util.getIntervalFromStep(3)).toEqual('3M');
  expect(util.getIntervalFromStep(-3)).toEqual('3m');
  expect(util.getIntervalFromStep(4)).toEqual('4P');
  expect(util.getIntervalFromStep(5)).toEqual('5P');
  expect(util.getIntervalFromStep(6)).toEqual('6M');
  expect(util.getIntervalFromStep(7)).toEqual('7M');
});

test('getIntervalFromStep: strings', () => {
  expect(util.getIntervalFromStep('1')).toEqual('1P');
  expect(util.getIntervalFromStep('b2')).toEqual('2m');
  expect(util.getIntervalFromStep('b3')).toEqual('3m');
});

test('getDegreeFromStep', () => {
  const fn = util.getDegreeFromStep;
  expect(fn('b3')).toBe(3);
  expect(fn('#9')).toBe(9);
  expect(fn('b9')).toBe(9);
  expect(fn('b2')).toBe(2);
  expect(fn('^7')).toBe(7);
});
test('findDegree', () => {
  expect(util.findDegree(1, Scale.intervals('major'))).toBe('1P');
  expect(util.findDegree(9, Scale.intervals('major'))).toBe('2M');
  expect(util.findDegree(2, Scale.intervals('phrygian'))).toBe('2m');
  expect(util.findDegree(9, Scale.intervals('phrygian'))).toBe('2m');
  expect(util.findDegree(9, Scale.intervals('locrian'))).toBe('2m');
  expect(util.findDegree(3, Scale.intervals('major'))).toBe('3M');
  expect(util.findDegree(3, Scale.intervals('minor'))).toBe('3m');
  expect(util.findDegree('3', Scale.intervals('minor'))).toBe('3m');
  expect(util.findDegree('b3', Scale.intervals('minor'))).toBe('3m');
  expect(util.findDegree('b3', Scale.intervals('major'))).toBe(undefined);
});

test('hasDegree', () => {
  expect(util.hasDegree(3, ['1', 'b3', '5'])).toBe(true);
  expect(util.hasDegree(2, ['1', 'b3', '5'])).toBe(false);
  expect(util.hasDegree(9, ['1', '2M', 'b3', '5'])).toBe(true);
  expect(util.hasDegree(9, ['1', 'b3', '5'])).toBe(false);
});

test('fixInterval', () => {
  expect(Harmony.fixInterval('8P')).toBe('8P');
  expect(Harmony.fixInterval('8P', true)).toBe('1P');
  expect(Harmony.fixInterval('-8P')).toBe('-8P');
  expect(Harmony.fixInterval('-8P', true)).toBe('1P');
  expect(Harmony.fixInterval('1P')).toBe('1P');
  expect(Harmony.fixInterval('0A')).toBe('1P');
  expect(Harmony.fixInterval('-0A')).toBe('1P');
  expect(Harmony.fixInterval('2A')).toBe('2A');
  expect(Harmony.fixInterval('5A')).toBe('5A');
  expect(Harmony.fixInterval('9M', true)).toBe('2M');
  expect(Harmony.fixInterval('-9M', true)).toBe('-2M');
  expect(Harmony.fixInterval('-2M')).toBe('-2M');
});

test('minInterval', () => {
  expect(Harmony.minInterval('9M')).toBe('2M');
  expect(Harmony.minInterval('9M')).toBe('2M');
  expect(Harmony.minInterval('8P')).toBe('1P');
  expect(Harmony.minInterval('2m')).toBe('2m');
  expect(Harmony.minInterval('-7M')).toBe('2m');
  expect(Harmony.minInterval('-7M', 'up')).toBe('2m');
  expect(Harmony.minInterval('-7M', 'down')).toBe('-7M');
  expect(Harmony.minInterval('2m', 'down')).toBe('-7M');
  expect(Harmony.minInterval('2m', 'up')).toBe('2m');
  expect(Harmony.minInterval('13M', 'up')).toBe('6M');
  expect(Harmony.minInterval('1P')).toBe('1P');
  expect(Harmony.minInterval('1P', 'down')).toBe('1P');
  expect(Harmony.minInterval('1P', 'up')).toBe('1P');
  expect(Harmony.minInterval('1P', 'up', true)).toBe('8P');
  expect(Harmony.minInterval('1P', 'down', true)).toBe('-8P');
  expect(Interval.simplify('3')).toBe(null);
  expect(Harmony.minInterval('3')).toBe(null);
});


test('isInterval', () => {
  expect(util.isInterval('XY')).toBe(false);
  expect(util.isInterval('6M')).toBe(true);
  expect(util.isInterval('3')).toBe(false);
  expect(util.isInterval('2m')).toBe(true);
  expect(util.isInterval('3m')).toBe(true);
  expect(util.isInterval('3')).toBe(false);
  expect(util.isInterval('13M')).toBe(true);
  expect(util.isInterval('-13m')).toBe(true);
})

test('mapMinInterval', () => {
  expect(['2M', '2m', '7M', '4P']
    .map(Harmony.mapMinInterval('up')))
    .toEqual(['2M', '2m', '7M', '4P']);
  expect(['2M', '2m', '7M', '4P']
    .map(Harmony.mapMinInterval('down')))
    .toEqual(['-7m', '-7M', '-2m', '-5P']);

  expect(Harmony.minInterval('7M')).toBe('-2m');

  expect(['2M', '2m', '7M', '4P']
    .map(Harmony.mapMinInterval()))
    .toEqual(['2M', '2m', '-2m', '4P']);
});

test('sortMinIntervals', () => {
  expect(['2M', '2m', '-2m', '4P']
    .sort(Harmony.sortMinInterval()))
    .toEqual(['2m', '-2m', '2M', '4P']);
});

test('invertInterval', () => {
  expect(Harmony.invertInterval('1A')).toEqual('-8d');
  expect(Harmony.invertInterval('-1A')).toEqual('8d');
});

test('forceDirection', () => {
  expect(Harmony.forceDirection('-2M', 'up')).toEqual('7m');
  expect(Harmony.forceDirection('-2M', 'down')).toEqual('-2M');
  expect(Harmony.forceDirection('3M', 'up')).toEqual('3M');
  expect(Harmony.forceDirection('3M', 'down')).toEqual('-6m');
  expect(Harmony.forceDirection('-8A', 'down')).toEqual('-8A');
  expect(Harmony.forceDirection('-8P', 'up')).toEqual('1P');
  /* expect(Harmony.forceDirection('-8P', 'up',true)).toEqual('8P'); */
  expect(Harmony.forceDirection('1A', 'down')).toEqual('-8d');
});

test('getNearestNote', () => {
  expect(Distance.interval('C', 'G')).toBe('5P');
  expect(Harmony.intervalComplement('5P')).toBe('4P');
  expect(Harmony.invertInterval('5P')).toBe('-4P');
  expect(Harmony.minInterval('5P')).toBe('-4P');

  expect(Harmony.getNearestNote('C4', 'G')).toBe('G3');
  expect(Harmony.getNearestNote('C4', 'G2')).toBe('G3');
  expect(Harmony.getNearestNote('C4', 'F')).toBe('F4');
  expect(Harmony.getNearestNote('C4', 'F', 'down')).toBe('F3');
  expect(Harmony.getNearestNote('C4', 'F', 'up')).toBe('F4');

  expect(Harmony.intervalComplement('8P')).toBe('1P');
  expect(Harmony.intervalComplement('8A')).toBe('1d');
  expect(Harmony.intervalComplement('8d')).toBe('1A');

  expect(Interval.invert('7m')).toBe('2M');


  expect(Harmony.invertInterval('8d')).toBe('-1A');
  expect(Harmony.minInterval('8d')).toBe('-1A');

  expect(Harmony.getNearestNote('D5', 'Db')).toBe('Db5');
  expect(Harmony.getNearestNote('D5', 'Db', 'down')).toBe('Db5');
  expect(Harmony.getNearestNote('D5', 'Db', 'up')).toBe('Db6');

  expect(Harmony.getNearestNote('D5', 'D#')).toBe('D#5');

  expect(Distance.interval('D', 'D#')).toBe('1A');

  expect(Harmony.minInterval('1A')).toBe('1A');
  expect(Harmony.intervalComplement('1A')).toBe('8d');
  expect(Harmony.invertInterval('1A')).toBe('-8d');
  expect(Harmony.intervalComplement('5A')).toBe('4d');
  expect(Harmony.intervalComplement('5d')).toBe('4A');
  expect(Harmony.intervalComplement('4d')).toBe('5A');
  expect(Harmony.intervalComplement('4A')).toBe('5d');

  expect(Harmony.minInterval('1A', 'down')).toBe('-8d');

  expect(Harmony.minInterval('5d')).toBe('5d');
  expect(Harmony.minInterval('5d', 'down')).toBe('-4A');
  expect(Harmony.minInterval('5d', 'up')).toBe('5d');

  expect(Harmony.getNearestNote('D5', 'D#', 'down')).toBe('D#4');

  expect(Harmony.getNearestNote('D5', 'Db')).toBe('Db5');
  expect(Harmony.getNearestNote('D5', 'Db', 'up')).toBe('Db6');
  expect(Harmony.getNearestNote('D5', 'Db', 'down')).toBe('Db5');
});


test('getNearestTargets', () => {
  expect(Harmony.getNearestTargets('C4', ['F', 'G'])[0]).toBe('G3');
  expect(Harmony.getNearestTargets('E5', ['G', 'D'])[0]).toBe('D5');
  expect(Harmony.getNearestTargets('C4', ['F', 'G'], 'up')[0]).toBe('F4');
  expect(Harmony.getNearestTargets('C4', ['F', 'G'], 'down')[0]).toBe('G3');
  expect(Harmony.getNearestTargets('C4', ['F', 'Gb'], 'down')[0]).toBe('Gb3');
  expect(Harmony.getNearestTargets('C4', ['F', 'F#'], 'down')[0]).toBe('F#3');
  expect(Harmony.getNearestTargets('D5', ['Db', 'Ab'], 'down')[0]).toBe('Db5');
  expect(Harmony.getNearestTargets('C4', ['D', 'E'], 'down')[0]).toBe('E3');
  expect(Harmony.getNearestTargets('C4', ['D', 'Db'], 'down')[0]).toBe('D3');
  expect(Harmony.getNearestTargets('C4', ['D', 'C#'], 'down')[0]).toBe('D3');
  expect(Harmony.getNearestTargets('C4', ['Db', 'C#'], 'down')[0]).toBe('C#3');
  expect(Harmony.getNearestTargets('B3', ['Bb', 'E'], 'down')[0]).toBe('Bb3');
});

test('getDegreeFromInterval', () => {
  expect(util.getDegreeFromInterval(Distance.interval('C', 'C') + '')).toBe(1);
  expect(util.getDegreeFromInterval(Distance.interval('C', 'E') + '')).toBe(3);
  expect(util.getDegreeFromInterval(Distance.interval('C', 'Eb') + '')).toBe(3);
  expect(util.getDegreeFromInterval(Distance.interval('C', 'F') + '')).toBe(4);
  expect(util.getDegreeFromInterval(Distance.interval('C', 'G') + '')).toBe(5);
  expect(util.getDegreeFromInterval(Distance.interval('D', 'C') + '')).toBe(7);
  expect(util.getDegreeFromInterval('13M')).toBe(13);
  expect(util.getDegreeFromInterval('6M')).toBe(6);
});

test('renderAbsoluteNotes', () => {
  expect(util.renderAbsoluteNotes(['D', 'F', 'G', 'Bb'], 3)).toEqual(['D3', 'F3', 'G3', 'Bb3']);
  expect(util.renderAbsoluteNotes(['C', 'F', 'D', 'C'])).toEqual(['C3', 'F3', 'D4', 'C5']);
  expect(util.renderAbsoluteNotes(['C', 'F', 'D', 'C'], 4, 'down')).toEqual(['C4', 'F3', 'D3', 'C3']);
  expect(util.renderAbsoluteNotes(['C', 'C', 'C'])).toEqual(['C3', 'C4', 'C5']);
  expect(util.renderAbsoluteNotes(['C', 'C', 'C'], 5, 'down')).toEqual(['C5', 'C4', 'C3']);
  expect(util.renderAbsoluteNotes(['F', 'A', 'C', 'E'].reverse(), 4, 'down').reverse()).toEqual(['F3', 'A3', 'C4', 'E4']);
});

test('minIntervals', () => {
  expect(Harmony.minIntervals(['C', 'E', 'G'], ['C', 'E', 'G'])).toEqual(['1P', '1P', '1P']);
  expect(Harmony.minIntervals(['C', 'E', 'G'], ['C', 'F', 'G'])).toEqual(['1P', '2m', '1P']);
  expect(Harmony.minIntervals(['C', 'F', 'G'], ['C', 'E', 'G'])).toEqual(['1P', '-2m', '1P']);
});
test('semitoneDifference', () => {
  expect(util.semitoneDifference(['1P', '1P'])).toBe(0);
  expect(util.semitoneDifference(['2M', '2m'])).toBe(3);
  expect(util.semitoneDifference(['-2M', '4A'])).toBe(8);
  expect(semitoneDifference(['1P', '-1A', '1P', null])).toBe(1); // uper interval is ignored
});
test('semitoneMovement', () => {
  expect(util.semitoneMovement(['1P', '1P'])).toBe(0);
  expect(util.semitoneMovement(['2M', '2m'])).toBe(3);
  expect(util.semitoneMovement(['2M', '-2m'])).toBe(1);
  expect(util.semitoneMovement(['-2M', '4A'])).toBe(4);
});

test('chordHasIntervals', () => {
  expect(util.chordHasIntervals('C^7', ['3M', '7M'])).toBe(true);
  expect(util.chordHasIntervals('C', ['3M', '7M'])).toBe(false);
  expect(util.chordHasIntervals('C', ['3M', '7M?'])).toBe(true);
  expect(util.chordHasIntervals('C^7', ['3m'])).toBe(false);
  expect(util.chordHasIntervals('C^7', ['3M', '7m'])).toBe(false);

  expect(util.chordHasIntervals('C7sus4', ['3M!', '4P', '7m'])).toBe(true);
  expect(util.chordHasIntervals('C-7', ['3!', '7m'])).toBe(false);

  expect(util.chordHasIntervals('C7sus', ['4P'])).toBe(true);
  expect(util.chordHasIntervals('C7sus', ['4'])).toBe(false);
  expect(util.chordHasIntervals('C7', ['3!'])).toBe(false);
});
test('isDominantChord', () => {
  expect(util.isDominantChord('C^7')).toBe(false);
  expect(util.isDominantChord('C7')).toBe(true);
  expect(util.isDominantChord('C7#5')).toBe(true);
  expect(util.isDominantChord('C7sus')).toBe(true);
  expect(util.isDominantChord('C13')).toBe(true);
  expect(util.isDominantChord('C')).toBe(false);
  expect(util.isDominantChord('G7b9b13')).toBe(true);
  expect(util.isDominantChord('Eb-7')).toBe(false);
  expect(util.isDominantChord('F69')).toBe(false);
});
test('isMajorChord', () => {
  expect(util.isMajorChord('D^7')).toBe(true);
  expect(util.isMajorChord('D7')).toBe(false);
  expect(util.isMajorChord('D')).toBe(true);
  expect(util.isMajorChord('Eb-7')).toBe(false);
  expect(util.isMajorChord('F69')).toBe(true);
});
test('isMinorChord', () => {
  expect(util.isMinorChord('D^7')).toBe(false);
  expect(util.isMinorChord('D7')).toBe(false);
  expect(util.isMinorChord('D')).toBe(false);
  expect(util.isMinorChord('Eb-7')).toBe(true);
  expect(util.isMinorChord('Eb-')).toBe(true);
  expect(util.isMinorChord('Eb-^7')).toBe(true);
  expect(util.isMinorChord('Eb-7b5')).toBe(true);
  expect(util.isMinorChord('F69')).toBe(false);
});
test('isMinorChord', () => {
  expect(util.isMinorChord('D^7')).toBe(false);
  expect(util.isMinorChord('D7')).toBe(false);
  expect(util.isMinorChord('D')).toBe(false);
  expect(util.isMinorChord('Eb-7')).toBe(true);
  expect(util.isMinorChord('Eb-')).toBe(true);
  expect(util.isMinorChord('Eb-^7')).toBe(true);
  expect(util.isMinorChord('Eb-7b5')).toBe(true);
  expect(util.isMinorChord('F69')).toBe(false);
});

test('isMinorTonic', () => {
  expect(util.isMinorTonic('D^7')).toBe(false);
  expect(util.isMinorTonic('D7')).toBe(false);
  expect(util.isMinorTonic('D')).toBe(false);
  expect(util.isMinorTonic('Eb-7')).toBe(false);
  expect(util.isMinorTonic('Eb-')).toBe(true);
  expect(util.isMinorTonic('Eb-^7')).toBe(true);
  expect(util.isMinorTonic('Eb-7b5')).toBe(false);
  expect(util.isMinorTonic('Eb-6')).toBe(true);
});

test('getChordType', () => {
  const fn = util.getChordType;
  expect(fn('C7')).toBe('dominant');
  expect(fn('C-7')).toBe('minor');
  expect(fn('C^7')).toBe('major');
  expect(fn('F69')).toBe('major');
  expect(fn('C-6')).toBe('minor-tonic');
});

