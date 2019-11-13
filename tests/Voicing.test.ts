import { Voicing } from '../lib/Voicing';
import { Permutation } from '../lib/Permutation';
import { Chord, Note } from 'tonal';
import { Harmony } from '../lib/Harmony';
import { Distance } from 'tonal';
import { renderAbsoluteNotes, isInRange, getDegreeInChord, isDominantChord, findDegree } from '../lib/util';

/** NEW ALGORHYTHM */
/* test('Voicing.search', () => {
  expect(
    Voicing.search(['D', 'F', 'A'], { maxNotes: 4, minNotes: 4, unique: false })
  ).toEqual([
    ['D', 'F', 'A', 'D'],
    ['F', 'A', 'D', 'F'],
    ['A', 'D', 'F', 'A']
  ]
  );

  expect(
    Voicing.search(['D', 'F', 'A'], { maxNotes: 2, minNotes: 2, unique: true })
  ).toEqual([
    ['D', 'F'],
    ['F', 'A'],
    ['A', 'D'],
  ]
  );

  expect(
    Voicing.search(['D', 'F', 'A'], { defaultDistances: [1, 7], maxNotes: 2, minNotes: 2, unique: true })
  ).toEqual([
    ['D', 'F'],
    ['D', 'A'],
    ['F', 'A'],
    ['A', 'D'],
  ]
  );
}); */


test('Voicing.getAllNoteSelections', () => {
  expect(Voicing.getAllNoteSelections('C', 1)).toEqual([['E']]);

  expect(Voicing.getAllNoteSelections('C7', 2)).toEqual([['E', 'Bb']])
  expect(Voicing.getAllNoteSelections('C7', 3))
    .toEqual([
      ['E', 'Bb', 'C'],
      ['E', 'Bb', 'G']
    ]);
  expect(Voicing.getAllNoteSelections('C7', 4))
    .toEqual([
      ['E', 'Bb', 'C', 'G']
    ]);
  expect(Voicing.getAllNoteSelections('C7', 5))
    .toEqual([
      ['E', 'Bb', 'C', 'G']
    ]);
});

test('Voicing.getAllVoicePermutations', () => {
  expect(Voicing.getRequiredNotes('C')).toEqual(['E']);
  expect(Voicing.getAllNoteSelections('C', 1)).toEqual([['E']]);

  expect(Voicing.getAllVoicePermutations('C', { maxVoices: 1 })).toEqual([
    ['E'],
  ]);
  expect(Voicing.getAllNoteSelections('C7', 1)).toEqual([['E'], ['Bb']])

  expect(Voicing.getVoicePermutations(['E'])).toEqual([['E']]);

  expect(Voicing.getAllVoicePermutations('C7', { maxVoices: 1 })).toEqual([
    ['E'],
    ['Bb'],
  ]);
  expect(Voicing.getAllVoicePermutations('C', { maxVoices: 2 })).toEqual([
    ['C', 'E'],
    ['E', 'G'],
  ]);
  expect(Voicing.getOptionalNotes('C')).toEqual(['C', 'G']);

  expect(Voicing.getAllVoicePermutations('C', { maxVoices: 3 })).toEqual([
    ['E', 'G', 'C'],
    ['C', 'E', 'G'],
    ['G', 'C', 'E'],
  ]);

  expect(Voicing.getAllVoicePermutations('C7', { maxVoices: 2 })).toEqual([
    ['E', 'Bb'],
    ['Bb', 'E'],
  ]);

  expect(Voicing.getAllVoicePermutations('C7', { maxVoices: 3 })).toEqual([
    ['E', 'Bb', 'C'],
    ['C', 'E', 'Bb'],
    ['E', 'G', 'Bb'],
    ['Bb', 'E', 'G'],
    ['G', 'Bb', 'E']
  ]);

  expect(Voicing.getAllVoicePermutations('C7', { maxVoices: 4 })).toEqual([
    ['E', 'G', 'Bb', 'C'],
    ['Bb', 'E', 'G', 'C'],
    ['C', 'E', 'G', 'Bb'],
    ['G', 'Bb', 'C', 'E'],
    ['G', 'C', 'E', 'Bb']
  ]);

  expect(Voicing.getAllVoicePermutations('C7', { maxVoices: 4, minTopDistance: 3 })).toEqual([
    ['Bb', 'E', 'G', 'C'],
    ['C', 'E', 'G', 'Bb'],
    ['G', 'Bb', 'C', 'E'],
    ['G', 'C', 'E', 'Bb']
  ]);

  expect(Voicing.getAllVoicePermutations('C7', { maxVoices: 4, minTopDistance: 3, maxDistance: 6 })).toEqual([
    ['Bb', 'E', 'G', 'C'],
    ['C', 'E', 'G', 'Bb'],
    ['G', 'Bb', 'C', 'E'],
    ['G', 'C', 'E', 'Bb']
  ]);

  expect(Voicing.getAllVoicePermutations('C7', { maxVoices: 4, maxDistance: 7 })).toEqual([
    ['E', 'Bb', 'C', 'G'],
    ['E', 'G', 'Bb', 'C'],
    ['Bb', 'E', 'G', 'C'],
    ['C', 'E', 'G', 'Bb'],
    ['C', 'G', 'Bb', 'E'],
    ['G', 'Bb', 'C', 'E'],
    ['G', 'C', 'E', 'Bb']
  ]);

  // left hand voicings
  /* expect(Voicing.getAllVoicePermutations('D-9', 4, {
      bottomDegrees: [3, 7]
  })).toEqual([
      ['F', 'A', 'C', 'E'],
      ['C', 'E', 'F', 'A'],
  ]);

  expect(Voicing.getAllVoicePermutations('G13', 4, {
      bottomDegrees: [3, 7],
      defaultDistances: [1,6]
  })).toEqual([
      ['B', 'E', 'F', 'G'],
      ['F', 'B', 'E', 'G'],
      ['F', 'B', 'D', 'E'],
      ['B', 'E', 'F', 'A'],
      ['F', 'B', 'E', 'A'],
      ['F', 'A', 'B', 'E'],
  ]); */
});

test('Voicing.getAvailableTensions', () => {
  expect(Chord.notes('C9b5')).toEqual(['C', 'E', 'Gb', 'Bb', 'D']);
  let combinations = [
    ['E', 'Bb', 'D', 'Gb'],
    ['Bb', 'D', 'E', 'Gb'],
    ['Gb', 'Bb', 'D', 'E'],
    ['D', 'Gb', 'Bb', 'E'],
  ];
  const range = ['C3', 'C6'];
  expect(Voicing.getAllVoicePermutations('C9b5', { maxVoices: 4 })).toEqual(combinations);
  combinations = combinations.filter(combination => {
    const firstNote = Harmony.getNearestNote(range[0], combination[0], 'up');
    const pick = renderAbsoluteNotes(combination, Note.oct(firstNote));
    return isInRange(pick[0], range) && isInRange(pick[pick.length - 1], range);
  });
  const firstPick = combinations[0];
  const firstNoteInRange = Harmony.getNearestNote(range[0], firstPick[0], 'up');
  const pick = renderAbsoluteNotes(firstPick, Note.oct(firstNoteInRange));
  expect(pick).toEqual(['E3', 'Bb3', 'D4', 'Gb4']);

  expect(Voicing.getAvailableTensions('C')).toEqual(['D', 'F#', 'A']);
  expect(Voicing.getAvailableTensions('C^7')).toEqual(['D', 'F#', 'A']);
  expect(Voicing.getAvailableTensions('C^13')).toEqual(['D', 'F#', 'A']);
  expect(Voicing.getAvailableTensions('C-7')).toEqual(['D', 'F', 'A']);
  expect(Voicing.getAvailableTensions('D-7')).toEqual(['E', 'G', 'B']);
  expect(Voicing.getAvailableTensions('C-11')).toEqual(['D', 'F', 'A']);
  expect(Voicing.getAvailableTensions('C-7b5')).toEqual(['D', 'F', 'Ab']);
  expect(Voicing.getAvailableTensions('C-^7')).toEqual(['D', 'F', 'A']);
  expect(Voicing.getAvailableTensions('C^7#5')).toEqual(['D', 'F#']);
  expect(Voicing.getAvailableTensions('Co7')).toEqual(['D', 'F', 'Ab', 'B']);
  expect(Voicing.getAvailableTensions('C^7#5')).toEqual(['D', 'F#']);
  expect(Voicing.getAvailableTensions('C7')).toEqual(['Db', 'D', 'D#', 'F#', 'Ab', 'A']);
  expect(isDominantChord('C7sus')).toBe(true);
  expect(getDegreeInChord(4, 'C7sus')).toBe('F');
  expect(Chord.notes('C7sus')).toEqual(['C', 'F', 'G', 'Bb']);
  expect(Voicing.getAvailableTensions('C7sus4')).toEqual(['Db', 'D', 'D#', 'E', 'Ab', 'A']);
  expect(Voicing.getAvailableTensions('C7#5')).toEqual(['Db', 'D', 'D#', 'F#', 'A']);
});
test('Voicing.getRequiredNotes', () => {
  /* expect(Voicing.getRequiredNotes('C7#9#5')).toEqual(['E', 'Bb', 'D#']); */
  expect(Voicing.getRequiredNotes('C^7')).toEqual(['E', 'B']);
  expect(Voicing.getRequiredNotes('C7')).toEqual(['E', 'Bb']);
  expect(Voicing.getRequiredNotes('C7sus')).toEqual(['Bb', 'F']);
  expect(Voicing.getRequiredNotes('C')).toEqual(['E']);
  expect(Voicing.getRequiredNotes('D-')).toEqual(['F']);
  expect(Voicing.getRequiredNotes('D-7')).toEqual(['F', 'C']);
  expect(Voicing.getRequiredNotes('D-11', 2)).toEqual(['F', 'C']);
  expect(Voicing.getRequiredNotes('D-11', 4)).toEqual(['F', 'C', 'G']);
  expect(Chord.notes('C13')).toEqual(['C', 'E', 'G', 'Bb', 'D', 'A']);
  expect(Voicing.getRequiredNotes('C13', 2)).toEqual(['E', 'Bb']);
  expect(Voicing.getRequiredNotes('C13', 4)).toEqual(['E', 'Bb', 'A']);
  expect(Voicing.getRequiredNotes('C6', 2)).toEqual(['E']);
  expect(Voicing.getRequiredNotes('C6', 4)).toEqual(['E', 'A']);
  expect(Voicing.getRequiredNotes('Ch7', 2)).toEqual(['Eb', 'Bb']);
  expect(Voicing.getRequiredNotes('Ch7', 4)).toEqual(['Eb', 'Bb', 'Gb']);
  expect(Voicing.getRequiredNotes('Ebo', 2)).toEqual(['Gb']);
  expect(Voicing.getRequiredNotes('Ebo', 4)).toEqual(['Gb', 'Bbb']);
  expect(Voicing.getRequiredNotes('G')).toEqual(['B']);
  expect(Harmony.getTonalChord('F69')).toBe('FM69');
  expect(Harmony.getTonalChord('FM69')).toBe('FM69');
  expect(Chord.intervals('FM69')).toEqual(['1P', '3M', '5P', '6M', '9M']);
  expect(findDegree(3, ['1P', '3M', '5P', '6M', '9M'])).toBe('3M');
  expect(Chord.tokenize('FM69')[0]).toEqual('F');
  expect(Distance.transpose('F', '3M')).toBe('A');
  expect(getDegreeInChord(3, 'FM69')).toBe('A');
  expect(Voicing.getRequiredNotes('F69', 2)).toEqual(['A']);
  expect(Voicing.getRequiredNotes('F69', 4)).toEqual(['A', 'D', 'G']);
});

test('Voicing.getOptionalNotes', () => {
  expect(Voicing.getOptionalNotes('C^7')).toEqual(['C', 'G']);
  expect(Voicing.getOptionalNotes('C7')).toEqual(['C', 'G']);
  expect(Voicing.getOptionalNotes('C7sus')).toEqual(['C', 'G']);
  expect(Voicing.getOptionalNotes('C')).toEqual(['C', 'G']);
  expect(Voicing.getOptionalNotes('D-')).toEqual(['D', 'A']);
  expect(Voicing.getOptionalNotes('G-')).toEqual(['G', 'D']);
  expect(Voicing.getOptionalNotes('D-7')).toEqual(['D', 'A']);
  expect(Voicing.getOptionalNotes('D-11', 2)).toEqual(['D', 'A', 'E', 'G']);
  expect(Voicing.getOptionalNotes('D-11', 4)).toEqual(['D', 'A', 'E']);
  expect(Chord.notes('C13')).toEqual(['C', 'E', 'G', 'Bb', 'D', 'A']);
  expect(Voicing.getOptionalNotes('C13', 2)).toEqual(['C', 'G', 'D', 'A']);
  expect(Voicing.getOptionalNotes('C13', 4)).toEqual(['C', 'G', 'D']);
  expect(Voicing.getOptionalNotes('C6', 2)).toEqual(['C', 'G', 'A']);
  expect(Voicing.getOptionalNotes('C6', 4)).toEqual(['C', 'G']);
  expect(Voicing.getOptionalNotes('Ch7', 2)).toEqual(['C', 'Gb']);
  expect(Voicing.getOptionalNotes('Ch7', 4)).toEqual(['C']);

  expect(Voicing.getOptionalNotes('G')).toEqual(['G', 'D']);
});

/* test('Voicing.getVoices', () => {

    expect(Voicing.getRequiredNotes('D-6')).toEqual(['F', 'B']);
    expect(Voicing.getOptionalNotes('D-6')).toEqual(['D', 'G', 'A']);
    expect(Voicing.getVoices('D-6', 4, true, 0)).toEqual(['F', 'B', 'G', 'A']);

    expect(Voicing.getVoices('D-7', 4, false, 0)).toEqual(['F', 'C', 'D', 'A']);
    expect(Voicing.getVoices('D-7', 4, true, 1)).toEqual(['F', 'C', 'E', 'A']);
    expect(Voicing.getVoices('C7', 4, false, 0)).toEqual(['E', 'Bb', 'C', 'G']);
    // TODO: make 13 be the first tension choice..
    expect(Voicing.getVoices('C7', 4, false, 1)).toEqual(['E', 'Bb', 'Db', 'C']);
    expect(Voicing.getVoices('C7', 4, true, 1)).toEqual(['E', 'Bb', 'Db', 'G']);
    expect(Voicing.getVoices('C7', 4, true, 0)).toEqual(['E', 'Bb', 'C', 'G']);

    expect(Voicing.getVoices('Dh7', 4, false, 1)).toEqual(['F', 'C', 'Ab', 'E']);
    expect(Voicing.getVoices('Dh7', 4, true, 1)).toEqual(['F', 'C', 'Ab', 'E']); // root stays because b5 needs root!

    expect(Voicing.getVoices('G', 4, false, 0)).toEqual(['B', 'G', 'D', 'B']);
    expect(Voicing.getVoices('D-7', 3, false, 0)).toEqual(['F', 'C', 'D']);
    expect(Voicing.getVoicePermutations(['F', 'C', 'D'])).toEqual([]);

    // C7b9#5 hat keine kombi !?!? E7#9#5 auch nicht?!
    // A7b9b5 auch nettttttt
    // Ebm6 hat auch wenig
    // D13sus hat auch wenig..
    // A9#11 auch
    // hat nur eine kombination...
    // expect(Voicing.getVoicePermutations(['C', 'E', 'Bb', 'Db'])).toEqual([['C', 'E', 'Bb', 'Db']]);

    // B7b9b5
    // A-9 ???
    // D7b9 hat nur eine kombination!? (Siehe You Won't Forget Me)

}); */


test('Voicing.getVoicePermutations', () => {

  // this is just sugar for permutationComplexity with voicing validator
  expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'])).toEqual(
    [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A'], ['E', 'A', 'C', 'F']]
  );
  expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'], { topNotes: ['A', 'E'] })).toEqual(
    [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A']]
  );
  expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'], { bottomNotes: ['E'] }))
    .toEqual([['E', 'A', 'C', 'F']]);

  expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'], { bottomNotes: ['A'], minTopDistance: 0 }))
    .toEqual([['A', 'C', 'E', 'F']]);

  expect(Voicing.getVoicePermutations(['B', 'D', 'F', 'A'])).toEqual(
    [['B', 'D', 'F', 'A'],
    ['B', 'F', 'A', 'D'],
    ['D', 'F', 'A', 'B'],
    ['F', 'A', 'B', 'D'],
    ['A', 'D', 'F', 'B'],
    ]);

  expect(Voicing.getVoicePermutations(['E', 'G', 'C'])).toEqual(
    [['E', 'G', 'C'], ['G', 'C', 'E'], ['C', 'E', 'G']]
  );
  expect(Permutation.permutateElements(['E', 'G', 'C'],
    Voicing.voicingValidator({
      defaultDistances: [1, 6]
    }))
  ).toEqual(
    [['E', 'G', 'C'], ['G', 'C', 'E'], ['C', 'E', 'G']]
  );
});

test('getAllNoteSelections', () => {
  expect(Voicing.getAllNoteSelections('E7b13', 4)).toEqual([['G#', 'D', 'C', 'E']]);
  expect(Voicing.getRequiredNotes('C13', 2)).toEqual(['E', 'Bb']);
  expect(Voicing.getRequiredNotes('C', 3)).toEqual(['E']);
  expect(Voicing.getRequiredNotes('C', 4)).toEqual(['E', 'G']);
  expect(Voicing.getAllNoteSelections('C', 4)).toEqual([['E', 'G', 'C']]);
  expect(Voicing.getRequiredNotes('C')).toEqual(['E']);
  expect(Voicing.getOptionalNotes('C')).toEqual(['C', 'G']);
  expect(Voicing.getAllNoteSelections('C', 3))
    //.toEqual([['E', 'G', 'C']]);
    .toEqual([['E', 'C', 'G']]);
  expect(Voicing.getAllNoteSelections('C', 2))
    .toEqual([['E', 'C'], ['E', 'G']]);
  expect(Voicing.getAllNoteSelections('C', 1))
    .toEqual([['E']]);
  expect(Voicing.getAllNoteSelections('C', 4))
    .toEqual([['E', 'G', 'C']]);
  expect(Voicing.getAllNoteSelections('C7', 1))
    .toEqual([['E'], ['Bb']]);
  expect(Voicing.getAllNoteSelections('C7', 2))
    .toEqual([['E', 'Bb']]);
  expect(Voicing.getAllNoteSelections('C7', 3))
    .toEqual([['E', 'Bb', 'C'], ['E', 'Bb', 'G']]);
  expect(Voicing.getAllNoteSelections('C7', 4))
    .toEqual([['E', 'Bb', 'C', 'G']]);
  expect(Voicing.getAllNoteSelections('C-9', 1))
    .toEqual([['Eb'], ['Bb']]);
  expect(Voicing.getAllNoteSelections('C-9', 2))
    .toEqual([['Eb', 'Bb']]);
  expect(Voicing.getAllNoteSelections('C-9', 3))
    //.toEqual([['Eb', 'Bb', 'D']]);
    .toEqual([['Eb', 'Bb', 'C'], ['Eb', 'Bb', 'G'], ['Eb', 'Bb', 'D']]);
  expect(Voicing.getAllNoteSelections('C-9', 4))
    //.toEqual([['Eb', 'Bb', 'D']]);
    .toEqual([['Eb', 'Bb', 'D', 'C'], ['Eb', 'Bb', 'D', 'G'],]);
});

test('containsPitch', () => {
  expect(Voicing.containsPitch('C', ['G', 'C', 'E'])).toBe(true);
  expect(Voicing.containsPitch('C', ['G', 'B', 'D'])).toBe(false);
  expect(Voicing.containsPitch('C', ['G#', 'B#', 'D#'])).toBe(true);
  expect(Voicing.containsPitch('C', ['G#', 'B#', 'D#'], false)).toBe(false);
});


test('voicingIntervals', () => {
  expect(Voicing.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toEqual(['1P', '-1A', '1P']);
  expect(Voicing.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G'], false)).toEqual(['1P', '8d', '1P']);
  expect(Voicing.voicingIntervals(['C', 'E3', 'G'], ['C', 'Eb3', 'G'])).toEqual(['1P', '-1A', '1P']);
  expect(Voicing.voicingIntervals(['C', 'E3', 'G'], ['C', 'Eb2', 'G'])).toEqual(['1P', '-8A', '1P']);
  expect(Voicing.voicingIntervals(['C', 'E', 'G'], ['C', 'Eb', 'G', 'Bb'])).toEqual(['1P', '-1A', '1P']);
});

test('hasTonic', () => {
  expect(Voicing.hasTonic(['E', 'G', 'Bb'], 'C7')).toBe(false);
  expect(Voicing.hasTonic(['C', 'E', 'Bb'], 'C7')).toBe(true);
  expect(Voicing.hasTonic(['D', 'F#', 'A'], 'D')).toBe(true);
  expect(Voicing.hasTonic(['D2', 'F#2', 'A2'], 'D7')).toBe(true);
  expect(Voicing.hasTonic(['D2', 'F#2', 'A2'], 'E7')).toBe(false);
});


test('getDesiredDirection', () => {
  expect(Voicing.getDesiredDirection(['C3', 'E3', 'G3'], ['C3', 'C4'], [3, 3]))
    .toEqual('up');
  expect(Voicing.getDesiredDirection(['C3', 'E3', 'G3'], ['C2', 'C4'], [3, 3]))
    .toEqual(undefined);
  expect(Voicing.getDesiredDirection(['C3', 'E3', 'G3'], ['C2', 'C3'], [3, 3]))
    .toEqual('down');
  expect(Voicing.getDesiredDirection(['C3', 'E3', 'G3'], ['C3', 'C4'], [0, 3]))
    .toEqual(undefined);
  expect(Voicing.getDesiredDirection(['C3', 'E3', 'G3'], ['C3', 'C4'], [1, 3]))
    .toEqual('up');
});

test('getNextVoicing', () => {
  /* expect(getNextVoicing('C-7', ['D4', 'F4', 'A4', 'C5'])).toEqual(['Bb3', 'Eb4', 'G4', 'C5']); */
  /* expect(getNextVoicing('C-7', ['A3', 'C4', 'D4', 'F4'])).toEqual(['G3', 'Bb3', 'C4', 'Eb4']); */

  expect(Voicing.getRequiredNotes('G')).toEqual(['B']);
  expect(Voicing.getAllNoteSelections('G', { maxVoices: 1 })).toEqual([['B']]);
  expect(Voicing.getAllNoteSelections('G', { maxVoices: 2 })).toEqual([['B', 'G'], ['B', 'D']]);
  expect(Voicing.getAllNoteSelections('G', { maxVoices: 3 })).toEqual([['B', 'G', 'D']]);
  expect(Voicing.getAllNoteSelections('G', { maxVoices: 4 })).toEqual([['B', 'D', 'G']]);

  expect(Voicing.getAllNoteSelections('G', {})).toEqual([['B', 'G', 'D']]);
  expect(Harmony.getBassNote('G')).toEqual('G');
  expect(Voicing.getAllVoicePermutations('G', {})).toEqual([['B', 'D', 'G'], ['G', 'B', 'D'], ['D', 'G', 'B']]);

  expect(Voicing.getVoicePermutations(['B', 'G'], { root: 'G' })).toEqual([['G', 'B']]);
  expect(Voicing.getNextVoicing('G', ['C4', 'E4', 'G4'])).toEqual(['B3', 'D4', 'G4']);
  /* let voicing;
  let times = 5;
  for (let i = 0; i < times; ++i) {
      Note.names(' ').concat(['C']).forEach(note => {
          voicing = getNextVoicing(note + '-7', voicing, ['F3', 'C5']);
      });
  }  */
});



/* test('bestCombination', () => {
    const c = [['C', 'E', 'G'], ['E', 'G', 'C'], ['G', 'C', 'E']];
    const g = [['G', 'B', 'D'], ['B', 'D', 'G'], ['D', 'G', 'B']];
    expect(Voicing.getVoicePermutations(['C', 'E', 'G'])).toEqual(c);
    expect(Voicing.getVoicePermutations(['G', 'B', 'D'])).toEqual(g);
    expect(bestCombination(c[0], g)).toEqual(g[1]);
    expect(bestCombination(c[1], g)).toEqual(g[2]);
    expect(bestCombination(c[2], g)).toEqual(g[0]);

    const dmin = [['F', 'A', 'C', 'E'], ['C', 'E', 'F', 'A'], ['E', 'A', 'C', 'F']];
    const g7 = [['B', 'D', 'F', 'A'], ['B', 'F', 'A', 'D'], ['F', 'A', 'B', 'D'], ['A', 'D', 'F', 'B']]
    expect(Voicing.getVoicePermutations(['F', 'A', 'C', 'E'])).toEqual(dmin);
    expect(Voicing.getVoicePermutations(['B', 'D', 'F', 'A'])).toEqual(g7);

    expect(bestCombination(dmin[0], g7)).toEqual(['F', 'A', 'B', 'D']);
    expect(bestCombination(dmin[1], g7)).toEqual(['B', 'D', 'F', 'A']);
    expect(bestCombination(dmin[2], g7)).toEqual(['F', 'A', 'B', 'D']);

    expect(bestCombination(dmin[0], g7)).toEqual(['F', 'A', 'B', 'D']);
}); */


/*
test('voicingDifference', () => {
    expect(Voicing.voicingDifference(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toBe(1);
    expect(Voicing.voicingDifference(['C', 'E', 'G'], ['D', 'F#', 'A'])).toBe(6);
    expect(Voicing.voicingDifference(['C', 'E', 'G'], ['E', 'G#', 'B'])).toBe(12);
    expect(Voicing.voicingDifference(['C', 'E', 'G', 'B'], ['C', 'Eb', 'G'])).toEqual(1);
});

test('voicingMovement', () => {
    expect(Voicing.voicingMovement(['C', 'E', 'G'], ['C', 'Eb', 'G'])).toBe(-1);
    expect(Voicing.voicingMovement(['C', 'E', 'G'], ['D', 'F#', 'A'])).toBe(6);
    expect(Voicing.voicingMovement(['C', 'E', 'G'], ['B', 'E', 'G#'])).toBe(0);
    expect(Voicing.voicingMovement(['F#', 'A#', 'C#'], ['C', 'E', 'G'])).toBe(18);
    expect(Voicing.voicingMovement(['C', 'E', 'C'], ['E', 'C', 'C'])).toBe(0);
    expect(Voicing.voicingMovement(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(-3);
    expect(Voicing.voicingMovement(['C', 'E', 'F', 'A'], ['B', 'D', 'F', 'A'])).toBe(-3);
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['A', 'D', 'F', 'B'])).toBe(21);
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['B', 'F', 'A', 'D'])).toBe(-15);

    expect(Voicing.voicingMovement(['D2', 'F2', 'A2'], ['D3', 'F3', 'A3'], false)).toBe(36);

});

test('voicingMovement #2', () => {
    expect(Voicing.voicingMovement(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(-3); // A -> E
    expect(Voicing.voicingDifference(['F', 'A', 'C', 'E'], ['F', 'A', 'B', 'D'])).toBe(3);
    expect(Voicing.voicingMovement(['C', 'E', 'F', 'A'], ['B', 'D', 'F', 'A'])).toBe(-3); // B -> D
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['A', 'D', 'F', 'B'])).toBe(21);
    expect(Voicing.voicingMovement(['E', 'A', 'C', 'F'], ['B', 'F', 'A', 'D'])).toBe(-15);
    expect(Voicing.voicingMovement(['F', 'A', 'C', 'E'], ['B', 'F', 'A', 'D'])).toBe(-3);
    expect(Voicing.voicingDifference(['F', 'A', 'C', 'E'], ['B', 'F', 'A', 'D'])).toBe(15);
});

*/

test('absolute', () => {
  expect(Voicing.absolute({
    range: ['G2', 'C4'],
    optionalPitches: ['C', 'E', 'G'],
    requiredPitches: [],
    notes: 3, //, ignoreLowerIntervalLimits: false,
    defaultDistances: [1, 12],
  })).toEqual([
    [
      "G2",
      "C3",
      "E3",
    ],
    [
      "G2",
      "C3",
      "G3",
    ],
    [
      "G2",
      "C3",
      "C4",
    ],
    [
      "G2",
      "E3",
      "G3",
    ],
    [
      "G2",
      "E3",
      "C4",
    ],
    [
      "G2",
      "G3",
      "C4",
    ],
    [
      "C3",
      "E3",
      "G3",
    ],
    [
      "C3",
      "E3",
      "C4",
    ],
    [
      "C3",
      "G3",
      "C4",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
  ])
  expect(Voicing.absolute({
    range: ['G2', 'C4'],
    notes: 3,
    optionalPitches: ['C', 'E', 'G'],
    requiredPitches: ['E'],
    defaultDistances: [1, 12],
  })).toEqual([
    [
      "G2",
      "C3",
      "E3",
    ],
    [
      "G2",
      "E3",
      "G3",
    ],
    [
      "G2",
      "E3",
      "C4",
    ],
    [
      "C3",
      "E3",
      "G3",
    ],
    [
      "C3",
      "E3",
      "C4",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
  ]);

  expect(Voicing.absolute({
    range: ['G2', 'C4'],
    notes: 3,
    defaultDistances: [1, 6],
    requiredPitches: ['E'],
    optionalPitches: ['C', 'E', 'G']
  })).toEqual([

    [
      "G2",
      "C3",
      "E3",
    ],
    [
      "C3",
      "E3",
      "G3",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
  ]);
  expect(Voicing.absolute({
    range: ['G2', 'C4'],
    notes: 3,
    defaultDistances: [5, 12],
    requiredPitches: ['E'],
    optionalPitches: ['C', 'E', 'G'],
  })).toEqual([
    [
      "G2",
      "E3",
      "C4",
    ],
  ]);

  expect(Voicing.absolute({
    range: ['G2', 'C4'],
    notes: 2,
    defaultDistances: [1, 6],
    requiredPitches: ['E'],
    optionalPitches: ['C', 'E', 'G']
  })).toEqual([

    [
      "C3",
      "E3",
    ],
    [
      "E3",
      "G3",
    ],
  ]);

  expect(Voicing.absolute({
    range: ['G2', 'C4'],
    notes: [2, 3],
    defaultDistances: [1, 6],
    requiredPitches: ['E'],
    optionalPitches: ['C', 'E', 'G']
  })).toEqual([
    [
      "G2",
      "C3",
      "E3",
    ],
    [
      "C3",
      "E3",
    ],
    [
      "C3",
      "E3",
      "G3",
    ],
    [
      "E3",
      "G3",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
  ]);

  expect(Voicing.absolute({
    range: ['G2', 'C4'],
    notes: 3,
    defaultDistances: [1, 6],
    requiredPitches: ['E'],
    optionalPitches: ['C', 'E', 'G'],
    topPitches: [['C', 'E']]
  })).toEqual([
    [
      "G2",
      "C3",
      "E3",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
  ]);


  expect(Voicing.absolute({
    requiredPitches: ['E'],
    optionalPitches: ['C', 'E', 'G'],
    range: ['G2', 'C4'],
    notes: 3,
    defaultDistances: [1, 6],
    topNotes: ['G3', 'C4']
  })).toEqual([
    [
      "C3",
      "E3",
      "G3",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
  ]);


});

test('bottomDistances + topDistances', () => {
  expect(Voicing.absolute({
    range: ['E4', 'F5'],
    notes: 3,
    requiredPitches: ['E', 'F', 'G'],
    defaultDistances: [1, 9],
  })).toEqual([
    ['E4', 'F4', 'G4'],
    ["F4", "G4", "E5"],
    ["G4", "E5", "F5"],
  ]);
  expect(Voicing.absolute({
    range: ['E4', 'F5'],
    notes: 3,
    requiredPitches: ['E', 'F', 'G'],
    defaultDistances: [1, 9],
    bottomDistances: [[1, 1]]
  })).toEqual([
    ['E4', 'F4', 'G4']
  ]);

  expect(Voicing.absolute({
    range: ['E4', 'F5'],
    notes: 3,
    requiredPitches: ['E', 'F', 'G'],
    defaultDistances: [3, 9],
    bottomDistances: [[1, 2]]
  })).toEqual([
    ['F4', 'G4', 'E5']
  ]);

  expect(Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    defaultDistances: [3, 5],
  })).toEqual([
    ['C4', 'E4', 'G4'],
    ['E4', 'G4', 'C5'],
    ['G4', 'C5', 'E5'],
  ]);

  expect(Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    defaultDistances: [3, 5],
    bottomDistances: [[4, 5]]
  })).toEqual([
    ['C4', 'E4', 'G4'],
    ['G4', 'C5', 'E5'],
  ]);

  expect(Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    bottomDistances: [[4, 5], [4, 4]]
  })).toEqual([
    ['G4', 'C5', 'E5'],
  ])

  expect(Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    defaultDistances: [3, 5],
    topDistances: [[3, 4]]
  })).toEqual([
    ['C4', 'E4', 'G4'],
    ['G4', 'C5', 'E5'],
  ]);

  expect(Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    topDistances: [[3, 4], [3, 4]]
  })).toEqual([
    ['C4', 'E4', 'G4'],
  ]);
});

test('lowerIntervalLimits', () => {
  // half step
  expect(Voicing.absolute({
    range: ['E2', 'F4'],
    notes: 2,
    defaultDistances: [1, 6],
    optionalPitches: ['E', 'F'],
  })).toEqual([
    // E2, F2 is missing due to lower interval limit
    [
      'E3', 'F3',
    ],
    [
      'E4', 'F4'
    ]
  ]);
  // whole step
  expect(Voicing.absolute({
    optionalPitches: ['Eb', 'F'],
    range: ['Eb2', 'F4'],
    notes: 2,
    defaultDistances: [1, 6],
  })).toEqual([
    // Eb2, F2 is missing due to lower interval limit
    [
      'Eb3', 'F3',
    ],
    [
      'Eb4', 'F4'
    ]
  ]);
});

test('allocations', () => {
  const chor = {
    bass: ['E2', 'E4'],
    bariton: ['G2', 'G4'],
    tenor: ['C3', 'A4'],
    alt: ['G3', 'E5'],
    mezzosopran: ['A3', 'F5'],
    sopran: ['C4', 'A5'],
  };

  const herrenchor = [chor.bass, chor.bariton, chor.tenor];
  const frauenchor = [chor.alt, chor.mezzosopran, chor.sopran];

  expect(Voicing.allocations(['A3', 'C4'], frauenchor)).toEqual([
    [0, 1],
    [0, 2],
    [1, 2],
  ]);

  expect(Voicing.allocations(['A3', 'G5'], frauenchor)).toEqual([
    [0, 2],
    [1, 2]
  ]);

  expect(Voicing.allocations(['A3', 'B3'], frauenchor)).toEqual([
    [0, 1]
  ]);

  expect(Voicing.allocations(['C4', 'E4', 'G4'], frauenchor)).toEqual([
    [0, 1, 2]
  ]);

  expect(Voicing.absolute({
    requiredPitches: ['C', 'E', 'G'],
    voices: herrenchor,
    notes: 3,
    defaultDistances: [1, 5]
  })).toEqual([
    [
      "G2",
      "C3",
      "E3",
    ],
    [
      "C3",
      "E3",
      "G3",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
    [
      "G3",
      "C4",
      "E4",
    ],
    [
      "C4",
      "E4",
      "G4",
    ],
  ]);

  expect(Voicing.absolute({
    requiredPitches: ['C', 'E', 'G'],
    voices: herrenchor,
    notes: 3,
    ignoreLowerIntervalLimits: true,
    defaultDistances: [1, 5]
  })).toEqual([
    [
      "E2",
      "G2",
      "C3",
    ],
    [
      "G2",
      "C3",
      "E3",
    ],
    [
      "C3",
      "E3",
      "G3",
    ],
    [
      "E3",
      "G3",
      "C4",
    ],
    [
      "G3",
      "C4",
      "E4",
    ],
    [
      "C4",
      "E4",
      "G4",
    ],
  ]);

  expect(Voicing.absolute({
    requiredPitches: ['C', 'E', 'G'],
    voices: frauenchor,
    notes: 3,
    defaultDistances: [1, 5]
  })).toEqual([
    [
      "G3",
      "C4",
      "E4",
    ],
    [
      "C4",
      "E4",
      "G4",
    ],
    [
      "E4",
      "G4",
      "C5",
    ],
    [
      "G4",
      "C5",
      "E5",
    ],
    [
      "C5",
      "E5",
      "G5",
    ],
  ]);

  const brass = {
    trumpet: ['E3', 'Bb5'],
    tenorTrombone: ['E3', 'Bb5'],
    bassTrombone: ['E3', 'Bb5'],
  }

  const reed = {
    altoSax: ['E3', 'Bb5'],
    tenorSax: ['E3', 'Bb5'],
    baritonSax: ['E3', 'Bb5']
  }

  const bigBand = [
    brass.trumpet, brass.trumpet, brass.trumpet, brass.trumpet,
    brass.tenorTrombone, brass.tenorTrombone, brass.tenorTrombone, brass.bassTrombone,
    reed.altoSax, reed.altoSax, reed.tenorSax, reed.tenorSax, reed.baritonSax,
  ];
});

test('getPitches', () => {
  expect(Voicing.getPitches('C-7', { maxNotes: 4 })).toEqual({
    requiredPitches: ['Eb', 'Bb'],
    optionalPitches: ['C', 'G'],
  });
  expect(Voicing.getPitches('C-', { maxNotes: 3 })).toEqual({
    requiredPitches: ['Eb'],
    optionalPitches: ['C', 'G'],
  });
  expect(Voicing.getPitches('C', { maxNotes: 3 })).toEqual({
    requiredPitches: ['E'],
    optionalPitches: ['C', 'G'],
  });
  expect(Voicing.getPitches('C', { maxNotes: 4 })).toEqual({
    requiredPitches: ['E', 'G'], // voices > 3 => require highest degree...
    optionalPitches: ['C'],
  });
})

test('getCombinations', () => {
  expect(Voicing.getCombinations('C7', { defaultDistances: [1, 7], range: ['C1', 'C4'] })).toEqual(
    [
      [
        "G2",
        "C3",
        "E3",
        "Bb3",
      ],
      [
        "Bb2",
        "E3",
        "G3",
        "Bb3",
      ],
      [
        "Bb2",
        "E3",
        "G3",
        "C4",
      ],
      [
        "Bb2",
        "E3",
        "Bb3",
        "C4",
      ],
      [
        "C3",
        "E3",
        "G3",
        "Bb3",
      ],
      [
        "C3",
        "E3",
        "Bb3",
        "C4",
      ],
      [
        "E3",
        "G3",
        "Bb3",
        "C4",
      ]
    ]);
})