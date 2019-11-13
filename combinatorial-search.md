# Combinatorial Search

This document explains an algorithm that is used to determine piano voicings (and more).

## Goal

The goal of the algorithm is to generate permutations of any items by following certain rules. For example we could want all possible voicings of a c major chord, with a minimum of two notes and a maximum of four notes:

```ts
voicings(['C', 'E', 'G'], {
  minNotes: 2,
  minNotes: 4,
  minDistance: 1, // semitones
  maxDistance: 7, //semitones
  required: ['E']
});
```

All possible voicings, by following the above rules, would be:

```js
[
  ['C', 'E'],
  ['E', 'G'],
  ['C', 'E', 'G'],
  ['E', 'G', 'C'],
  ['G', 'C', 'E'],
  ['C', 'E', 'G', 'C'],
  ['C', 'G', 'C', 'E'],
  ['E', 'G', 'C', 'G'],
  ['E', 'G', 'C', 'E'],
  ['G', 'C', 'E', 'G']
];
```

## The algorithm

```ts
class Permutation {
  static search<T>(
    finder: (path: T[], solutions: T[][]) => T[],
    validator: (path: T[], solutions: T[][]) => boolean,
    concatFn = (_path: T[], _candidate: T): T[] => [..._path, _candidate],
    path: T[] = [],
    solutions: T[][] = []
  ): T[][] {
    // get candidates for current path
    const candidates = finder(path, solutions);
    // runs current path through validator to either get a new solution or nothing
    if (validator(path, solutions)) {
      solutions.push(path);
    }
    // if no candidates found, we cannot go deeper => either solution or dead end
    if (!candidates.length) {
      return solutions;
    }
    // go deeper
    return candidates.reduce(
      (_, candidate) =>
        Permutation.search(
          finder,
          validator,
          concatFn,
          concatFn(path, candidate),
          solutions
        ),
      []
    );
  }
}
```

## Classic Combinatorics: Urn model

Let's implement the classic combinatoric urn model. Imagining an urn, where we pull balls.

### Basic Urn Implementation

- Order is important
- Balls can be pulled once
- We pull till its "empty"

```js
function urn(items) {
  return Permutation.search(
    collected => items.filter(ball => !collected.includes(ball)),
    collected => collected.length === items.length
  );
}
```

Here, we pass two functions:

- The first function returns a set of items we can pull at a given state. In this case, we return all items that have not been collected yet
- The second function returns a validation function for a given collection to be accepted as "solution". In this case, we only accept collections of the items length

Test:

```js
const balls = [1, 2, 3];
expect(Permutation.urn(balls)).toEqual([
  [1, 2, 3],
  [1, 3, 2],
  [2, 1, 3],
  [2, 3, 1],
  [3, 1, 2],
  [3, 2, 1]
]);
```

### Extension 1: pull sample

We can extend the implementation by passing a number of balls that should be pulled:

```js
function urn(items, number = items.length) {
  return Permutation.search(
    collected => items.filter(ball => !collected.includes(ball)),
    collected => collected.length === number
  );
}
```

Test:

```js
expect(urn(balls, 2)).toEqual([[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]]);
```

The above implementation works, but has a performance flaw: The first function does not include the sample so it will always run till the end, despite the fact that it won't find new valid combinations. Fix:

```js
function urn(items, number = items.length) {
  return Permutation.search(
    collected =>
      collected.length >= number
        ? []
        : items.filter(ball => !collected.includes(ball)),
    collected => collected.length === number
  );
}
```

Returning an empty array means, we have no candidates that could be added => recursion stops.

### Extension 2: ignore order

We could also ignore the order of items:

```js
function isEqual(collectionA, collectionB) {
  return collectionA.sort().join('-') === collectionB.sort().join('-');
}

function urn(items, number = items.length, strictOrder = true) {
  return Permutation.search(
    collected =>
      collected.length >= number
        ? []
        : items.filter(ball => !collected.includes(ball)),
    (collected, solutions) =>
      collected.length === number &&
      (strictOrder ||
        !solutions.find(solution => Permutation.isEqual(collected, solution)))
  );
}
```

Test:

```js
expect(Permutation.isEqual([1, 2, 3], [3, 2, 1])).toEqual(true);
expect(Permutation.isEqual([1, 3], [2, 1])).toEqual(false);
expect(Permutation.urn(balls, 2, false)).toEqual([[1, 2], [1, 3], [2, 3]]);
```

This could be useful for card games

### Extension 3: Balls can be pulled multiple times:

Lets add a flag called _unique_. If we switch it to false, a ball can be picked multiple times:

```js
function urn(
  items,
  number = items.length,
  strictOrder = true,
  unique = true
) {
  return Permutation.search(
    collected =>
      collected.length >= number
        ? []
        : unique
        ? items.filter(ball => !collected.includes(ball)),
        : items
    (collected, solutions) =>
      collected.length === number &&
      (strictOrder ||
        !solutions.find(solution => Permutation.isEqual(collected, solution)))
  );
}
```

Test:

```js
expect(urn(balls, 2, false, false)).toEqual([
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 2],
  [2, 3],
  [3, 3]
]);
```

## Abstraction

The final urn method is pretty heavy to read. Lets encapsulate the logic in seperate methods:

### unique

```js
function unique() {
  return (collected, next) => !collected.includes(next);
}
```

used in the original urn method:

```js
function urn(items) {
  return Permutation.search(
    collected => items.filter(ball => unique()(collected, ball)),
    collected => collected.length === items.length
  );
}
```

the double call might seem irritating, but we'll get to that later.

### sample

```js
function sample(n) {
  return collected => collected.length === n;
}
```

usage:

```js
function urn(items, number = items.length) {
  return Permutation.search(
    collected =>
      collected.length >= number
        ? []
        : items.filter(ball => unique()(collected, ball)),
    sample(number)
  );
}
```

### strictOrder

lets wrap the ordering rule to a seperate method:

```js
function strictOrder(active = true, equalityFn = Permutation.isEqual) {
  return (path, solutions) =>
    active || !solutions.find(solution => equalityFn(path, solution));
}
```

```js
function isEqual(collectionA, collectionB) {
  return collectionA.sort().join('-') === collectionB.sort().join('-');
}

function urn(items, number = items.length, strictOrder = true) {
  return Permutation.search(
    collected =>
      collected.length >= number
        ? []
        : items.filter(ball => unique()(collected, ball)),
    (collected, solutions) =>
      sample(number)(collected) &&
      strictOrder(strictOrder, isEqual)(collected, solutions)
  );
}
```

### with unique flag

For now, we will not abstract the unique flag. The final method looks like this:

```js
function urn(
  items,
  number = items.length,
  strictOrder = true,
  unique = true
) {
  return Permutation.search(
    collected =>
      collected.length >= number
        ? []
        : unique
        ? items.filter(ball => unique()(collected, ball)),
        : items
    (collected, solutions) =>
      sample(number)(collected) &&
      strictOrder(strictOrder, isEqual)(collected, solutions)
  );
}
```

Compared to the version without encapsulation, this is pretty readable. But what's still not perfect is the double function calls, which we can unify:

### validate Helper

This method is useful to fuse existing boolean emitting methods together:

```ts
function validate(filters: ((...args) => boolean)[]) {
  return (...args) =>
    filters.reduce((result, filter) => result && filter(...args), true);
}
```

Usage for combining filters:

```js
const names = ['Clementine', 'Max', 'Camilla', 'Tom', 'Cleo'];
function min(characters) {
  return name => name.length >= characters;
}
function startsWith(character) {
  return name => name[0] === character;
}
const longNamesWithC = names.filter(validate([min(5), startsWith('C')]));
expect(longNamesWithC).toEqual(['Clementine', 'Camilla']);
```

#### usage in urn function

```js
function urn(
  items,
  number = items.length,
  strictOrder = true,
  unique = true
) {
  return Permutation.search(
    collected =>
      collected.length >= number
        ? []
        : unique
        ? items.filter(ball => unique()(collected, ball)),
        : items
    validate([sample(number), strictOrder(strictOrder, isEqual)])
  );
}
```

the second function argument is now pretty slick, and could easily be extended.

### collect Helper

In our urn function, the first method is still pretty cluttered with logic. It would be easier to pass an a set of rules that should be applied. This is where the collect function comes in:

```js
function collect<T>(
  items,
  collectors: ((items: T[]) => (collected, solutions) => T[])[]
) {
  return (collected, solutions) => {
    return collectors.reduce(
      (filtered, collector) => collector(filtered)(collected, solutions),
      items
    );
  };
}
```

If you still don't understand what it does, no worries, first check out the example collectors:

```js
function maxItems(n) {
  return items => (collected, solutions) => {
    n = n || items.length;
    return collected.length >= n ? [] : items;
  };
}

function unique(active = true) {
  items => (collected, solutions) => {
    return active ? items.filter(item => !collected.includes(item)) : items;
  };
}
```

- maxItems: Returns an empty array as soon as the collected length reaches the max
- unique: Returns only the items that have not been picked yet (if active)

... and the usage in our urn function

```js
function urn(items, number = items.length, strictOrder = true, unique = true) {
  return Permutation.search(
    collect(items, [maxItems(number), unique(unique)]),
    validate([sample(number), strictOrder(strictOrder)])
  );
}
```

Now we have a pretty high level functional thing going on...

## Using the urn model in the "real" world

Let's play lotto:

```js
const lottoNumbers = Array(49)
  .fill(0)
  .map((_, i) => i + 1);
urn(lottoNumbers, 6);
// DONT run that
```

If we would run the above snippet, your pc could melt... Lets limit the solutions first:

```ts
function maxSolutions(number) {
  return items => (collected, solutions) => {
    return number !== undefined && solutions.length >= number ? [] : items;
  };
}

function urn(
  items,
  number = items.length,
  strictOrder = true,
  unique = true,
  maxSolutions?
) {
  return Permutation.search(
    collect(items, [
      maxSolutions(maxSolutions),
      maxItems(number),
      unique(unique)
    ]),
    validate([sample(number), strictOrder(strictOrder)])
  );
}
```

Now:

```js
const lottoNumbers = Array(49)
  .fill(0)
  .map((_, i) => i + 1);
urn(lottoNumbers, 6, true, true, 1);
```

will stop after finding the first solution which is ```[1,2,3,4,5,6]```.

## Using it for Voicings

```ts
static search(pitches: string[], options: VoicingValidation = {}) {
  return Permutation.search(
    (path: string[]) => pitches.filter(
      (pitch) => Permutation.validate(Voicing.constraints(options))(path,pitch)
    ),
    Permutation.validate(Voicing.validators(options))
  );
}
static constraints(options?: VoicingValidation): ConstraintFilter<string>[] {
  options = {
    maxDistance: 6, // max semitones between any two sequential notes
    minDistance: 1, // min semitones between two notes
    minBottomDistance: 3, // min semitones between the two bottom notes
    unique: true,
    maxNotes: 4,
    ...options,
  }
  return [
    Voicing.intervalConstraint(interval => Interval.semitones(interval) <=options.maxDistance),
    Voicing.intervalConstraint(interval => Interval.semitones(interval) >=options.minDistance),
    Voicing.intervalConstraint((interval, path) => path.length !== 1 || Interval.semitone(interval) >= options.minBottomDistance),
    ...(options.unique ? [Permutation.constraints.unique()] : []),
    Permutation.constraints.max(options.maxNotes),
  ]
}
static validators(options?: VoicingValidation): PathValidator<string>[] {
  options = {
    minTopDistance: 3, // min semitones between the two top notes
    minNotes: 3,
    ...options,
  }
  return [
    Permutation.validators.min(options.minNotes),
    path => {
      return path.length > 1 && Interval.semitones(Distance.interval(path[path.length - 2],path[path.length - 1])) >= options.minTopDistance
    }
  ]
}
/** Validates the interval to the next note. You can write your own logic inside the validate fn. */
static intervalConstraint(validate: (interval: string, path, next) => boolean) {
  return (path, next) => {
    if (!path.length) { return true; }
    const interval = Distance.interval(path[path.length - 1], next) + '';
    return validate(interval, path, next);
  }
}
```
