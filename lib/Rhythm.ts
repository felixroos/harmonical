import { Permutation } from './Permutation';

export class Rhythm {
  static sum(path) {
    return path.reduce((sum, size) => sum + size, 0);
  }
  static positionInGroup(path, groupSize) {
    return Rhythm.sum(path) % groupSize;
  }
  static exceedsGroup(groupSize) {
    return (path, next) => Rhythm.positionInGroup(path, groupSize) + next > groupSize;
  }
  static isSyncope(groupSize) {
    return (path, next) => {
      const pos = Rhythm.positionInGroup(path, groupSize);
      const sum = pos + next;
      return sum > groupSize && sum % groupSize !== 0
    }
  }
  static search(grid) {
    return Permutation.search(
      (path) => Array(grid).fill(0).map((_, i) => i + 1).filter(c => Rhythm.sum(path.concat(c)) <= grid),
      (path) => Rhythm.sum(path) === grid
    );
  }
}