"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Permutation = /** @class */ (function () {
    function Permutation() {
    }
    Permutation.permutateElements = function (array, validate, path) {
        if (path === void 0) { path = []; }
        var isValid = function (next) { return !validate || validate(path, next, array); };
        if (array.length === 1) {
            return isValid(array[0]) ? array : [];
        }
        return array
            .filter(isValid)
            .reduce(function (combinations, el) { return combinations.concat(Permutation.permutateElements(array.filter(function (e) { return e !== el; }), validate, path.concat([el])).map(function (subcombinations) { return [el].concat(subcombinations); })); }, []);
    };
    Permutation.validate = function (filters) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return filters.reduce(function (result, filter) { return result && filter.apply(void 0, args); }, true);
        };
    };
    Permutation.isEqual = function (collectionA, collectionB) {
        return collectionA.sort().join('-') === collectionB.sort().join('-');
    };
    Permutation.collect = function (items, collectors) {
        return function (path, solutions) {
            return collectors.reduce(function (filtered, collector) { return collector(filtered)(path, solutions); }, items);
        };
    };
    Permutation.urn = function (items, number, strictOrder, unique, maxSolutions) {
        if (number === void 0) { number = items.length; }
        if (strictOrder === void 0) { strictOrder = true; }
        if (unique === void 0) { unique = true; }
        return Permutation.search(Permutation.collect(items, [
            Permutation.collector.maxSolutions(maxSolutions),
            Permutation.collector.maxItems(number),
            Permutation.collector.unique(unique),
        ]), Permutation.validate([
            Permutation.validator.sample(number),
            Permutation.validator.strictOrder(strictOrder)
        ]));
    };
    Permutation.permutate_old = function (items, constraints, validators, concatFn, path) {
        if (constraints === void 0) { constraints = [
            Permutation.filter.max(items.length),
            Permutation.filter.unique(),
        ]; }
        if (validators === void 0) { validators = [
            Permutation.validator.min(items.length)
        ]; }
        if (concatFn === void 0) { concatFn = function (_path, _candidate) { return _path.concat([_candidate]); }; }
        if (path === void 0) { path = []; }
        var candidates = constraints.reduce(function (filtered, constraint) {
            return filtered.filter(function (candidate) { return constraint(path, candidate); });
        }, items.slice());
        if (!candidates.length) {
            return [path];
        }
        return candidates.reduce(function (solutions, candidate) { return solutions.concat([
            path
        ], Permutation.permutate_old(items, constraints, validators, concatFn, concatFn(path, candidate))); }, []).filter(function (permutation, index, permutations) { return validators.reduce(function (valid, validator) { return valid && validator(permutation); }, true); });
    };
    Permutation.search = function (collector, validator, concatFn, path, solutions) {
        if (concatFn === void 0) { concatFn = function (_path, _candidate) { return _path.concat([_candidate]); }; }
        if (path === void 0) { path = []; }
        if (solutions === void 0) { solutions = []; }
        // get candidates for current path
        var candidates = collector(path, solutions);
        // runs current path through validator to either get a new solution or nothing
        if (validator(path, solutions)) {
            solutions.push(path);
        }
        // if no candidates found, we cannot go deeper => either solution or dead end
        if (!candidates.length) {
            return solutions;
        }
        var c = -1;
        while (++c < candidates.length) {
            solutions = Permutation.search(collector, validator, concatFn, concatFn(path, candidates[c]), solutions);
            candidates = collector(path, solutions);
        }
        return solutions;
        // go deeper
        //return candidates.reduce((_, candidate) => Permutation.search(collector, validator, concatFn, concatFn(path, candidate), solutions), []);
    };
    Permutation.possibleHands = function (stash, cards) {
        return Permutation.search(function (picked) { return stash.filter(function (card) { return !picked.includes(card); }); }, function (hand, hands) { return hand.length === cards && !hands.find(function (h) { return h.join('+') === hand.join('+'); }); }, function (hand, card) { return hand.concat([card]).sort(function (a, b) { return a - b; }); });
    };
    Permutation.rooks = function (n) {
        var positions = Array(n).fill(0).map(function (_, i) { return i; });
        var runs = 0;
        var solutions = Permutation.search(function (picked) { return positions.filter(function (i) { return !picked.includes(i); }); }, function (hand, hands) { return hand.length === n; }, function (positions, position) {
            runs += 1;
            return positions.concat([position]);
        });
        return { solutions: solutions, runs: runs };
    };
    Permutation.randomRook = function (n) {
        var positions = Array(n).fill(0).map(function (_, i) { return i; });
        return Permutation.search(function (picked, solutions) { return solutions.length ? [] : positions.filter(function (i) { return !picked.includes(i); }); }, function (hand, hands) { return hand.length === n; }, function (positions, position) { return Math.random() > 0.5 ? positions.concat([position]) : [position].concat(positions); });
    };
    Permutation.permutate = function (items, constraints, validators, concatFn, path) {
        if (constraints === void 0) { constraints = [
            Permutation.filter.max(items.length),
            Permutation.filter.unique(),
        ]; }
        if (validators === void 0) { validators = [
            Permutation.validator.min(items.length)
        ]; }
        if (concatFn === void 0) { concatFn = function (_path, _candidate) { return _path.concat([_candidate]); }; }
        if (path === void 0) { path = []; }
        return Permutation.search(function (path) { return items.filter(Permutation.validate(constraints.map(function (constraint) { return function (candidate) { return constraint(path, candidate); }; }))); }, Permutation.validate(validators));
    };
    Permutation.permutationComplexity = function (array, validate, path) {
        if (path === void 0) { path = []; }
        var validations = 0;
        Permutation.permutateElements(array, function (path, next, array) {
            ++validations;
            return !validate || validate(path, next, array);
        }, path);
        return validations;
    };
    Permutation.permutateArray = function (array) {
        if (array.length === 1) {
            return array;
        }
        return array.reduce(function (combinations, el) { return combinations.concat(Permutation.permutateArray(array.filter(function (e) { return e !== el; })).map(function (subcombinations) { return [el].concat(subcombinations); })); }, []);
    };
    // combine multiple validators
    Permutation.combineValidators = function () {
        var validators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            validators[_i] = arguments[_i];
        }
        return function (path, next, array) {
            return validators.reduce(function (result, validator) { return result && validator(path, next, array); }, true);
        };
    };
    //https://stackoverflow.com/questions/9960908/permutations-in-javascript
    Permutation.combinations = function (array) {
        var length = array.length, result = [array.slice()], c = new Array(length).fill(0), i = 1, k, p;
        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = array[i];
                array[i] = array[k];
                array[k] = p;
                ++c[i];
                i = 1;
                result.push(array.slice());
            }
            else {
                c[i] = 0;
                ++i;
            }
        }
        return result;
    };
    // https://gist.github.com/axelpale/3118596
    Permutation.binomial = function (set, k) {
        var i, j, combs, head, tailcombs;
        // There is no way to take e.g. sets of 5 elements from
        // a set of 4.
        if (k > set.length || k <= 0) {
            return [];
        }
        // K-sized set has only one K-sized subset.
        if (k == set.length) {
            return [set];
        }
        // There is N 1-sized subsets in a N-sized set.
        if (k == 1) {
            combs = [];
            for (i = 0; i < set.length; i++) {
                combs.push([set[i]]);
            }
            return combs;
        }
        // Assert {1 < k < set.length}
        // Algorithm description:
        // To get k-combinations of a set, we want to join each element
        // with all (k-1)-combinations of the other elements. The set of
        // these k-sized sets would be the desired result. However, as we
        // represent sets with lists, we need to take duplicates into
        // account. To avoid producing duplicates and also unnecessary
        // computing, we use the following approach: each element i
        // divides the list into three: the preceding elements, the
        // current element i, and the subsequent elements. For the first
        // element, the list of preceding elements is empty. For element i,
        // we compute the (k-1)-computations of the subsequent elements,
        // join each with the element i, and store the joined to the set of
        // computed k-combinations. We do not need to take the preceding
        // elements into account, because they have already been the i:th
        // element so they are already computed and stored. When the length
        // of the subsequent list drops below (k-1), we cannot find any
        // (k-1)-combs, hence the upper limit for the iteration:
        combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
            // head is a list that includes only our current element.
            head = set.slice(i, i + 1);
            // We take smaller combinations from the subsequent elements
            tailcombs = Permutation.binomial(set.slice(i + 1), k - 1);
            // For each (k-1)-combination we join it with the current
            // and store it to the set of k-combinations.
            for (j = 0; j < tailcombs.length; j++) {
                combs.push(head.concat(tailcombs[j]));
            }
        }
        return combs;
    };
    Permutation.bjorklund = function (steps, pulses) {
        steps = Math.round(steps);
        pulses = Math.round(pulses);
        if (pulses > steps || pulses == 0 || steps == 0) {
            return new Array();
        }
        var pattern = [];
        var counts = [];
        var remainders = [];
        var divisor = steps - pulses;
        var level = 0;
        remainders.push(pulses);
        while (true) {
            counts.push(Math.floor(divisor / remainders[level]));
            remainders.push(divisor % remainders[level]);
            divisor = remainders[level];
            level += 1;
            if (remainders[level] <= 1) {
                break;
            }
        }
        counts.push(divisor);
        var r = 0;
        var build = function (level) {
            r++;
            if (level > -1) {
                for (var i = 0; i < counts[level]; i++) {
                    build(level - 1);
                }
                if (remainders[level] != 0) {
                    build(level - 2);
                }
            }
            else if (level == -1) {
                pattern.push(0);
            }
            else if (level == -2) {
                pattern.push(1);
            }
        };
        build(level);
        return pattern.reverse();
    };
    Permutation.filter = {
        max: function (max) { return function (path, next) {
            return path.length < max;
        }; },
        unique: function () { return function (path, next) {
            return !path.includes(next);
        }; },
        noRepeat: function () { return function (path, next) {
            return path[path.length - 1] !== next;
        }; }
    };
    Permutation.collector = {
        maxItems: function (n) { return function (items) { return function (collected, solutions) {
            n = n || items.length;
            return collected.length >= n ? [] : items;
        }; }; },
        unique: function (active) {
            if (active === void 0) { active = true; }
            return function (items) { return function (collected, solutions) {
                return active ? items.filter(function (item) { return !collected.includes(item); }) : items;
            }; };
        },
        maxSolutions: function (number) { return function (items) { return function (collected, solutions) {
            return number !== undefined && solutions.length >= number ? [] : items;
        }; }; },
        validate: function (validators) { return function (items) { return function (collected, solutions) {
            return items.filter(Permutation.validate(validators));
        }; }; }
    };
    Permutation.validator = {
        min: function (min) { return function (path) {
            return path.length >= min;
        }; },
        sample: function (number) { return function (path) {
            return path.length === number;
        }; },
        strictOrder: function (active, equalityFn) {
            if (active === void 0) { active = true; }
            if (equalityFn === void 0) { equalityFn = Permutation.isEqual; }
            return function (path, solutions) {
                return active || !solutions.find(function (solution) { return equalityFn(path, solution); });
            };
        }
    };
    return Permutation;
}());
exports.Permutation = Permutation;
