## Idea 1: numbers as lengths

`[2,1,1]` could be half, quarter quarter

```js
rhythmPermutations(4);
```

could yield:

```json
[[1, 1, 1, 1], [1, 1, 2], [1, 2, 1], [1, 3], [2, 1, 1], [2, 2], [3, 1], [4]]
```

Which runs the permutator with all numbers that fit into the grid size (4).
The result can be interpreted as all possible rhythms inside a grid of 4 units.

### restrict sizes

```js
rhythmPermutations(4, { allowedSizes: [1, 2, 4] });
```

could yield:

```json
[[1, 1, 1, 1], [1, 1, 2], [1, 2, 1], [2, 1, 1], [2, 2], [4]]
```

### forbid syncopation

to be able to test if a rhythm syncopates, we need those two helpers:

```js
function sum(path) {
  return path.reduce((sum, size) => sum + size, 0);
}
function positionInGroup(path, groupSize) {
  return sum(path) % groupSize;
}
```

- sum just adds all given numbers
- positionInGroup tells the position inside a given group size:

```js
positionInGroup([2, 1], 2); // 1 e.g. in quarter grid: after half and quarter note
positionInGroup([1, 1], 2); // 0
positionInGroup([1, 1], 3); // 2
positionInGroup([1, 1, 1], 4); // 3 e.g. in 8ths grid: offbeat on 4ths 8th note (= index 3)
positionInGroup([1, 1, 1, 1], 3); // 1 e.g. 2 of second measure in 3/4
```

To tell if a syncopation would happen, we can do this:

```js
function exceedsGroup(groupSize) {
  return (path, next) => return positionInGroup(path, groupSize) + next <= groupSize;
}

function isSyncopating(path, next) {
  return (groupSize) => return positionInGroup(path, groupSize) + next <= groupSize;
}
```

examples:

```js
isSyncopating([1], 2)();
```

```js
rhythmPermutations(4, { validate: (path, next) =>  });
```
