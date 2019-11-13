# harmonical

harmonical is lib for musical _harmonic_ *cal*culation.

- Generate all chord voicings for a chord symbol for certain rules
- Find the best voice leading between two voicings
- built on top of tonal.js

## Demo

Clone Repo and run `npm i && npm run demo`

## Installation

```sh
npm i harmonical
```

## Voicing.getCombinations

returns all possible voicings for the given chord:

```js
import { Voicing } from 'harmonical';

const combinations = Voicing.getCombinations('C-7');
```

returns

```json
[
  ["Bb2", "Eb3", "G3", "Bb3"],
  ["Bb2", "Eb3", "G3", "C4"],
  ["C3", "Eb3", "G3", "Bb3"],
  ["Eb3", "G3", "Bb3", "C4"],
  ["Eb3", "G3", "Bb3", "Eb4"],
  ["G3", "Bb3", "C4", "Eb4"],
  ["G3", "Bb3", "Eb4", "G4"],
  ["Bb3", "C4", "Eb4", "G4"],
  ["Bb3", "Eb4", "G4", "Bb4"],
  ["Bb3", "Eb4", "G4", "C5"],
  ["C4", "Eb4", "G4", "Bb4"],
  ["Eb4", "G4", "Bb4", "C5"]
]
```

- see [all available chord symbols](lib/Harmony.ts#L12)
- see [default options](lib/defaultOptions.ts)

You can pass options to the second parameter of getCominations:

### options.range

array of min and max notes a voicing can contain

```js
Voicing.getCombinations('C-7', { range: ['C3', 'C4'] });
```

yields

```js
[
  ['C3', 'Eb3', 'G3', 'Bb3'],
  ['C3', 'Eb3', 'Bb3', 'C4'],
  ['Eb3', 'G3', 'Bb3', 'C4']
];
```

### options.notes

Amount of notes in the voicing. Either number or array with two numbers for `[min, max]`:

```js
Voicing.getCombinations('C-7', { notes: 2 });
```

yields

```json
["Eb3", "Bb3"],
["Bb3", "Eb4"],
["Eb4", "Bb4"],
```

As you can see, the pitches C and G are never picked. This is because the 3rd and 7ths are the most important degrees of a C-7 chord. If you would omit them, the voicing would no longer resemble a C-7 chord. See Voicing.getRequiredPitches for further info on how the importance of a degree is decided.

When picking 3 notes:

```js
Voicing.getCombinations('C-7', { notes: 3 });
```

```json
[
  ["C3", "Eb3", "Bb3"],
  ["Eb3", "G3", "Bb3"],
  ["Eb3", "Bb3", "C4"],
  ["Eb3", "Bb3", "Eb4"],
  ["G3", "Bb3", "Eb4"],
  ["Bb3", "C4", "Eb4"],
  ["Bb3", "Eb4", "G4"],
  ["Bb3", "Eb4", "Bb4"],
  ["C4", "Eb4", "Bb4"],
  ["Eb4", "G4", "Bb4"],
  ["Eb4", "Bb4", "C5"]
]
```

Here, the 3rd and 7th degrees are supplemented by one of the less important "optional" pitches C and G.

When picking more notes than the chord has pitches:

```js
Voicing.getCombinations('C', { notes: [3, 4] });
```

```json
[
  ["C3", "E3", "G3", "C4"],
  ["C3", "G3", "C4", "E4"],
  ["E3", "G3", "C4", "E4"],
  ["E3", "G3", "C4", "G4"],
  ["G3", "C4", "E4", "G4"],
  ["C4", "E4", "G4", "C5"]
]
```

This time, pitches must be doubled to receive the desired amount of notes.

You can also pass an array with min, max notes:

```js
Voicing.getCombinations('C', { notes: [3, 4] });
```

which gives:

```json
[
  ["C3", "E3", "G3"],
  ["C3", "E3", "G3", "C4"],
  ["C3", "G3", "C4", "E4"],
  ["E3", "G3", "C4"],
  ["E3", "G3", "C4", "E4"],
  ["E3", "G3", "C4", "G4"],
  ["G3", "C4", "E4"],
  ["G3", "C4", "E4", "G4"],
  ["C4", "E4", "G4"],
  ["C4", "E4", "G4", "C5"],
  ["E4", "G4", "C5"]
]
```

### options.defaultDistances

Sets the default minimum and maximum distance between notes:

```js
Voicing.getCombinations('C', {
  defaultDistances: [1, 4], // 4 = major 3rd
  notes: 3
});
```

Now, only voicings with inter note distances from 1 to 4 will be received:

```json
[
  ["C3", "E3", "G3"],
  ["C4", "E4", "G4"]
]
```

As you see, the first and second inversions are not outputted because they exceed the max distance. When choosing:

```js
Voicing.getCombinations('C', {
  defaultDistances: [1, 5], // 5 = perfect fourth
  notes: 3
});
```

now the inversions are also valid:

```json
[
  ["C3", "E3", "G3"],
  ["E3", "G3", "C4"],
  ["G3", "C4", "E4"],
  ["C4", "E4", "G4"],
  ["E4", "G4", "C5"]
]
```

### options.bottomDistances

To control the bottom part of the voicing:

```js
expect(
  Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    defaultDistances: [3, 5],
    bottomDistances: [[4, 4]]
  })
).toEqual([
  ['C4', 'E4', 'G4'],
  ['G4', 'C5', 'E5']
]);
```

The combination `['E4', 'G4', 'C5']` is filtered out its less than 4 semitones at the bottom.

- You can pass multiple semitone ranges to bottomDistances:

```js
expect(
  Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    bottomDistances: [
      [4, 5],
      [4, 4]
    ]
  })
).toEqual([['G4', 'C5', 'E5']]);
```

The combination `['C4', 'E4', 'G4']` is now filtered because the second distance is below 4 semitones.
Note that defaultDistances can now be removed because everything is handled by bottomDistances.

### options.topDistances

To control the upper part of the voicing. This is the same format like bottomDistances, but the validation happens from right to left:

```js
expect(
  Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    defaultDistances: [3, 5],
    topDistances: [[3, 4]]
  })
).toEqual([
  ['C4', 'E4', 'G4'],
  ['G4', 'C5', 'E5']
]);

expect(
  Voicing.absolute({
    range: ['C4', 'E5'],
    notes: 3,
    requiredPitches: ['C', 'E', 'G'],
    topDistances: [
      [3, 4],
      [3, 4]
    ]
  })
).toEqual([['C4', 'E4', 'G4']]);
```

Note that bottomDistances is much quicker than topDistances, because it can already sort out voicings that do not fit before a candidate is generated. This is because voicings are generated from the bottom up. It could be possible to set a flag to generate from the top down, for optimizing top heavy uses.

### options.topDegrees / options.bottomDegrees

TBD

### options.bottomPitches / options.topPitches

TBD

### options.topNotes / options.bottomNotes

TBD

### options.voices

Enables setting voices with specific ranges:

```js
const femaleChoir = {
  alt: ['G3', 'E5'],
  mezzosopran: ['A3', 'F5'],
  sopran: ['C4', 'A5']
};
Voicing.getCombinations('C', {
  notes: 3,
  voices: [femaleChoir.alt, femaleChoir.mezzosopran, femaleChoir.sopran]
});
```

outputs

```json
[
  ["G3", "C4", "E4"],
  ["C4", "E4", "G4"],
  ["E4", "G4", "C5"],
  ["G4", "C5", "E5"],
  ["C5", "E5", "G5"]
]
```

those are all C major chords that can be sung by a female choir.

- Note that the voices must be passed bottom to top.
- See Voicing.allocations on how to distribute notes to voices

### options.ignoreLowerIntervalLimits

By default, all voicings respect the common lowInterval limits, see [default options](lib/voicingDefaultOptions.ts). If you dont want that, you can set `ignoreLowerIntervalLimits` to true.

## Voicing.allocations

Outputs all possible distributions of notes over given voices:

```js
const femaleChoir = {
  alt: ['G3', 'E5'],
  mezzosopran: ['A3', 'F5'],
  sopran: ['C4', 'A5']
};
Voicing.allocations(
  ['A3', 'C4'],
  [femaleChoir.alt, femaleChoir.mezzosopran, femaleChoir.sopran]
);
```

outputs

```json
[
  [0, 1],
  [0, 2],
  [1, 2]
]
```

## Voicing.absolute

Essentially, this function is like `getCombinations`, but you can pass required and optional notes directly, without using chord symbols:

```js
expect(
  Voicing.absolute({
    range: ['G2', 'C4'],
    notes: 3,
    maxDistance: 6,
    requiredPitches: ['E'],
    optionalPitches: ['C', 'E', 'G']
  })
).toEqual([
  ['G2', 'C3', 'E3'],
  ['C3', 'E3', 'G3'],
  ['E3', 'G3', 'C4']
]);
```

The options are like already described + requiredPitches and optionalPitches.

## Voicing.getPitches

Returns required and optionalPitches for a given chord symbol:

```js
expect(Voicing.getPitches('C-7')).toEqual({
  requiredPitches: ['Eb', 'Bb'],
  optionalPitches: ['C', 'G']
});
```

## Voice Leading

TBD
