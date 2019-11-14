"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Permutation_1 = require("./Permutation");
var tonal_1 = require("tonal");
var util_1 = require("./util");
var defaultOptions_1 = require("./defaultOptions");
var Harmony_1 = require("./Harmony");
var Voicing = /** @class */ (function () {
    function Voicing() {
    }
    /** Returns the next voicing that should follow the previously played voicing.
    */
    Voicing.getNextVoicing = function (chord, previousVoicing, options) {
        if (options === void 0) { options = {}; }
        var _a = __assign({}, defaultOptions_1.voicingDefaultOptions, options), range = _a.range, forceDirection = _a.forceDirection, forceBestPick = _a.forceBestPick, rangeBorders = _a.rangeBorders, sortChoices = _a.sortChoices, filterChoices = _a.filterChoices, noTopDrop = _a.noTopDrop, noTopAdd = _a.noTopAdd, topNotes = _a.topNotes, noBottomDrop = _a.noBottomDrop, noBottomAdd = _a.noBottomAdd, idleChance = _a.idleChance, logIdle = _a.logIdle, logging = _a.logging;
        // make sure tonal can read the chord
        if (!chord || chord === 'r') {
            return null;
        }
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var exit = function () {
            var pick = [];
            if (logging) {
                //Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, logIdle, options });
            }
            return pick;
        };
        var combinations = Voicing.getAllVoicePermutations(chord, options);
        if (!combinations.length) {
            console.warn(chord, 'no combinations', options);
            return exit();
        }
        var choices = Voicing.getAllChoices(combinations, previousVoicing, options);
        var originalChoices = [].concat(choices);
        choices = choices.filter(function (choice) {
            return (!noTopDrop || !choice.topDropped) &&
                (!noTopAdd || !choice.topAdded) &&
                (!noBottomDrop || !choice.bottomDropped) &&
                (!noBottomAdd || !choice.bottomAdded);
        }).filter(function (choice) {
            return (!filterChoices || filterChoices(choice))
                && (!topNotes || Voicing.hasTopNotes(choice.targets, topNotes));
        }).filter(function (choice, index, filtered) {
            return (choice.difference > 0 || (filtered.length === 1 || Math.random() < idleChance));
        }).sort(sortChoices ?
            function (a, b) { return sortChoices(a, b); } :
            function (a, b) { return a.difference - b.difference; });
        if (!choices.length) {
            console.warn(chord, 'no choices', options, 'combinations', combinations, 'original choices', originalChoices);
            return exit();
        }
        var bestPick = choices[0].targets, choice;
        var direction = Voicing.getDesiredDirection(previousVoicing, range, rangeBorders) || forceDirection;
        if (direction && forceBestPick && (!util_1.isInRange(bestPick[0], range) || util_1.isInRange(bestPick[bestPick.length - 1], range))) {
            var octave = direction === 'up' ? '8P' : '-8P';
            bestPick = util_1.transposeNotes(bestPick, octave);
        }
        if (!direction || forceBestPick) {
            var pick_1 = bestPick;
            choice = choices[0];
            if (logging) {
                //Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, direction, bestPick, choice, choices, logIdle, options });
            }
            return pick_1;
        }
        // sort after movement instead of difference
        choice = choices.sort(function (a, b) {
            return Math.abs(a.movement) - Math.abs(b.movement);
        }).find(function (choice) {
            if (direction === 'up') {
                return choice.movement >= 0;
            }
            return choice.movement <= 0;
        });
        if (!choice) { // keep hanging in the corner of the range..
            choice = choices[0];
        }
        var pick = choice.targets;
        if (logging) {
            //Logger.logVoicing({ chord, previousVoicing, range, combinations, pick, direction, bestPick, choice, choices, logIdle, options });
        }
        return pick;
    };
    Voicing.hasTopNotes = function (pick, topNotes) {
        if (topNotes === void 0) { topNotes = []; }
        return topNotes.reduce(function (match, note) { return match && Harmony_1.Harmony.hasSamePitch(note, pick[pick.length - 1]); }, true);
    };
    /** Computes all valid voice permutations for a given chord and voice number.
     * Runs getVoicePermutations for each possible selection of notes.
     */
    Voicing.getAllVoicePermutations = function (chord, voicingOptions) {
        if (voicingOptions === void 0) { voicingOptions = {}; }
        var root = Harmony_1.Harmony.getBassNote(chord, true);
        return Voicing.getAllNoteSelections(chord, voicingOptions)
            .reduce(function (combinations, combination) {
            return combinations.concat(Voicing.getVoicePermutations(combination, __assign({}, voicingOptions, { root: root })));
        }, []);
    };
    /** Get all permutations of the given notes that would make a good voicing. */
    Voicing.getVoicePermutations = function (notes, options) {
        if (options === void 0) { options = {}; }
        if (notes.length === 1) {
            return [notes];
        }
        var validator = options.validatePermutation || (function (path, next, array) { return true; });
        return Permutation_1.Permutation.permutateElements(notes, Permutation_1.Permutation.combineValidators(validator, Voicing.voicingValidator(options)));
    };
    Voicing.validators = function (options) {
        options = __assign({ minTopDistance: 3, minNotes: 3 }, options);
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
            Permutation_1.Permutation.validator.min(options.minNotes),
            function (path) {
                var interval = tonal_1.Distance.interval(path[path.length - 2], path[path.length - 1]);
                return path.length > 1 && tonal_1.Interval.semitones(interval) >= options.minTopDistance;
            }
        ];
    };
    Voicing.intervalCollector = function (validate) {
        return function (pitches) { return function (collected, solutions) {
            if (!collected.length) {
                return pitches;
            }
            return pitches.filter(function (pitch) {
                var interval = tonal_1.Distance.interval(collected[collected.length - 1], pitch) + '';
                return validate(interval, collected[collected.length - 1], pitch);
            });
        }; };
    };
    Voicing.collectors = function (options) {
        options = __assign({ maxDistance: 6, minDistance: 1, minBottomDistance: 3, unique: true, maxNotes: 4 }, options);
        return [
            Permutation_1.Permutation.collector.maxItems(options.maxNotes),
            Permutation_1.Permutation.collector.unique(options.unique),
            Voicing.intervalCollector(Permutation_1.Permutation.validate([
                function (interval) { return tonal_1.Interval.semitones(interval) <= options.maxDistance; },
                function (interval) { return tonal_1.Interval.semitones(interval) >= options.minDistance; },
                function (interval, path) { return path.length !== 1 || tonal_1.Interval.semitones(interval) >= options.minBottomDistance; }
            ])),
        ];
    };
    Voicing.search = function (pitches, options) {
        if (options === void 0) { options = {}; }
        return Permutation_1.Permutation.search(Permutation_1.Permutation.collect(pitches, Voicing.collectors(options)), Permutation_1.Permutation.validate(Voicing.validators(options)));
    };
    Voicing.absolute = function (options) {
        if (options === void 0) { options = {}; }
        // interval in semitones => lowest starting note
        // set default options
        options = __assign({}, defaultOptions_1.voicingDefaultOptions, options);
        var requiredPitches = options.requiredPitches, optionalPitches = options.optionalPitches, bottomPitches = options.bottomPitches, topPitches = options.topPitches, topNotes = options.topNotes, voices = options.voices, ignoreLowerIntervalLimits = options.ignoreLowerIntervalLimits, bottomDistances = options.bottomDistances, topDistances = options.topDistances, preferTopDistances = options.preferTopDistances;
        var range = options.range, defaultDistances = options.defaultDistances;
        var pitches = (requiredPitches || []).concat((optionalPitches || []));
        var bottomChromas = (bottomPitches || []).map(function (p) { return (p || []).map(function (n) { return tonal_1.Note.chroma(n); }); });
        var topChromas = (topPitches || []).map((function (p) { return (p || []).map(function (n) { return tonal_1.Note.chroma(n); }); }));
        if (!pitches.length) {
            throw new Error('requiredPitches or optionalPitches must be set!');
        }
        var _a = __assign({}, Voicing.getMinMaxNotes(options), options), minNotes = _a.minNotes, maxNotes = _a.maxNotes;
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
        var allowedNotes = Harmony_1.Harmony.getPitchesInRange(pitches, range);
        return Permutation_1.Permutation.search(function (path, solutions) {
            if (!path.length) { // no notes picked yet
                /* if (bottomPitches && bottomPitches.length) {
                  return allowedNotes.filter(n => bottomPitches.includes(Note.pc(n)));
                } */
                if (bottomChromas.length) {
                    return allowedNotes.filter(function (n) { return bottomChromas[0].includes(tonal_1.Note.chroma(n)); });
                }
                return allowedNotes;
            }
            if (path.length >= maxNotes) { // limit reached
                return [];
            }
            // determine min/max distance for current path
            var bottomDistance, topDistance;
            if (bottomDistances && bottomDistances[path.length - 1]) {
                bottomDistance = bottomDistances[path.length - 1];
            }
            if (minNotes === maxNotes && topDistances && topDistances[maxNotes - path.length - 1]) {
                // maybe could optimize for minNotes!==maxNotes
                topDistance = topDistances[maxNotes - path.length];
            }
            var distanceRange = [].concat(defaultDistances);
            if (bottomDistance && topDistance) { // clash
                distanceRange = preferTopDistances ? topDistance : bottomDistance;
            }
            else {
                distanceRange = bottomDistance || topDistance || distanceRange; //  || [minDistance, maxDistance];
            }
            return allowedNotes.filter(// only return notes above last pick
            function (// only return notes above last pick
            note) {
                var noteMidi = tonal_1.Note.midi(note);
                var lastMidi = tonal_1.Note.midi(path[path.length - 1]);
                return noteMidi > lastMidi
                    && (!distanceRange[1] || (noteMidi - lastMidi) <= distanceRange[1])
                    && (!distanceRange[0] || (noteMidi - lastMidi) >= distanceRange[0])
                    && (!bottomChromas[path.length] || bottomChromas[path.length].includes(tonal_1.Note.chroma(note)))
                    && (ignoreLowerIntervalLimits || (!defaultOptions_1.lowIntervalLimits[(noteMidi - lastMidi)] || noteMidi >= tonal_1.Note.midi(defaultOptions_1.lowIntervalLimits[(noteMidi - lastMidi)])));
            });
        }, function (solution) {
            if (solution.length < minNotes) {
                return false;
            }
            if (requiredPitches && !requiredPitches.reduce(function (hasAll, pitch) { return hasAll && !!solution.find(function (n) { return tonal_1.Note.chroma(n) === tonal_1.Note.chroma(pitch); }); }, true)) {
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
            if (topChromas && !topChromas.reduce(function (valid, chromas, i) {
                var index = solution.length - topChromas.length + i;
                if (!index) {
                    return valid;
                }
                return valid && chromas.includes(tonal_1.Note.chroma(solution[index]));
            }, true)) {
                //console.log('topChroma fail', topChromas, solution);
                return false;
            }
            if (topDistances && !topDistances.reduce(function (valid, distance, i) {
                var index = solution.length - topDistances.length + i;
                if (!index) {
                    return valid;
                }
                var d = (tonal_1.Note.midi(solution[index]) - tonal_1.Note.midi(solution[index - 1]));
                return valid && d >= distance[0] && d <= distance[1];
            }, true)) {
                return false;
            }
            if (voices && Array.isArray(voices)
                && voices.length
                && Array.isArray(voices[0])
                && Array.isArray(voices[1])
                && Voicing.allocations(solution, voices).length === 0) {
                return false;
            }
            return true;
        });
    };
    // just a wrapper to avoid possible future refactoring: correctly named
    Voicing.getRequiredPitches = function (chord, voices) {
        if (voices === void 0) { voices = 2; }
        return Voicing.getRequiredNotes(chord, voices);
    };
    Voicing.getMinMaxNotes = function (options) {
        var notes = options.notes || defaultOptions_1.voicingDefaultOptions.notes;
        var minNotes, maxNotes;
        if (typeof notes === 'number') {
            minNotes = notes;
            maxNotes = notes;
        }
        else if (Array.isArray(notes)) {
            if (notes.length < 2) {
                throw new Error('notes must be a number or an array with two numbers (max,min)');
            }
            minNotes = notes[0];
            maxNotes = notes[1];
        }
        if (minNotes > maxNotes) {
            throw new Error('minNotes cannot be greater than maxNotes');
        }
        return { minNotes: minNotes, maxNotes: maxNotes };
    };
    Voicing.getPitches = function (chord, options) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var pitches = tonal_1.Chord.notes(chord);
        options = __assign({}, Voicing.getMinMaxNotes(options), options);
        var requiredPitches = Voicing.getRequiredPitches(chord, options.maxNotes);
        var optionalPitches = pitches.filter(function (pitch) { return !requiredPitches.includes(pitch); });
        return {
            requiredPitches: requiredPitches,
            optionalPitches: optionalPitches
        };
    };
    Voicing.getCombinations = function (chord, options) {
        if (options === void 0) { options = {}; }
        var root = Harmony_1.Harmony.getBassNote(chord);
        if (options.bottomDegrees && options.bottomDegrees.length) {
            options.bottomPitches = (options.bottomPitches || []).concat(options.bottomDegrees
                .map(function (degrees) { return degrees.map(function (degree) { return util_1.getDegreeInChord(degree, chord); }); }));
        }
        if (options.topDegrees && options.topDegrees.length && typeof options.topDegrees[0] === 'number') {
            throw new Error('topDegrees should be a double nested array!');
        }
        if (options.topDegrees && options.topDegrees.length) {
            options.topPitches = (options.topPitches || []).concat(options.topDegrees
                .map(function (p) { return p.map(function (degree) { return util_1.getDegreeInChord(degree, chord); }); }));
        }
        return Voicing.absolute(__assign({}, Voicing.getPitches(chord, options), options, { root: root }));
    };
    /* static allocations(notes: string[], voices: { [name: string]: string[] }) { */
    Voicing.allocations = function (notes, voices) {
        // sort voices by range top => bottom to top
        //const keys = Object.keys(voices).sort((a, b) => Note.midi(voices[a][1]) - Note.midi(voices[b][1]));
        var keys = voices.sort(function (a, b) { return tonal_1.Note.midi(a[1]) - tonal_1.Note.midi(b[1]); }).map(function (v, i) { return i; });
        return Permutation_1.Permutation.search(function (path, solutions) {
            if (path.length > notes.length - 1) { // all notes voiced
                return [];
            }
            var note = notes[path.length];
            return keys.filter(function (v, i) {
                return !path.includes(i) // voice has already neem picked
                    && i > keys.indexOf(keys[path.length - 1]) // voice is below last voice => would cross
                    && util_1.isInRange(note, voices[i]);
            });
        }, function (solution) {
            return solution.length === notes.length;
        }); //.map(solution => solution.map(v => voices.indexOf(v)));
    };
    /** Configurable Validator that sorts out note combinations with untasty intervals.  */
    Voicing.voicingValidator = function (options) {
        options = __assign({ maxDistance: 6, minDistance: 1, minBottomDistance: 3, minTopDistance: 2 }, options);
        return function (path, next, array) {
            var lastPosition = path.length + array.length - 1;
            return Permutation_1.Permutation.combineValidators(Voicing.notesAtPositionValidator(options.topNotes, lastPosition), Voicing.notesAtPositionValidator(options.bottomNotes, 0), Voicing.degreesAtPositionValidator(options.topDegrees, lastPosition, options.root), Voicing.degreesAtPositionValidator(options.bottomDegrees, 0, options.root), Voicing.validateInterval(function (interval) { return tonal_1.Interval.semitones(interval) <= options.maxDistance; }), Voicing.validateInterval(function (interval, _a) {
                var path = _a.path, array = _a.array;
                return array.length === 1 || path.length === 1 || tonal_1.Interval.semitones(interval) >= options.minDistance;
            }), Voicing.validateInterval(function (interval, _a) {
                var array = _a.array;
                return array.length !== 1 || tonal_1.Interval.semitones(interval) >= options.minTopDistance;
            }), Voicing.validateInterval(function (interval, _a) {
                var path = _a.path;
                return path.length !== 1 || tonal_1.Interval.semitones(interval) >= options.minBottomDistance;
            }))(path, next, array);
        };
    };
    /** Validates the interval to the next note. You can write your own logic inside the validate fn. */
    Voicing.validateInterval = function (validate) {
        return function (path, next, array) {
            if (!path.length) {
                return true;
            }
            var interval = tonal_1.Distance.interval(path[path.length - 1], next) + '';
            return validate(interval, { path: path, next: next, array: array });
        };
    };
    /** Returns all possible combinations of required and optional notes for a given chord and desired length.
     * If the voices number is higher than the required notes of the chord, the rest number will be permutated from the optional notes */
    Voicing.getAllNoteSelections = function (chord, options) {
        if (options === void 0) { options = {}; }
        if (typeof options === 'number') {
            options = { maxVoices: options };
        }
        var _a = __assign({ topNotes: [], bottomNotes: [] }, options), omitNotes = _a.omitNotes, topNotes = _a.topNotes, bottomNotes = _a.bottomNotes, maxVoices = _a.maxVoices;
        maxVoices = maxVoices || 3;
        var required = Voicing.getRequiredNotes(chord, maxVoices);
        var extraNotes = (topNotes || []).concat(bottomNotes).map(function (n) { return tonal_1.Note.pc(n); });
        if (extraNotes.length) {
            required = extraNotes.concat(required);
            /* .filter((n, i, a) => a.indexOf(n) === i).concat(required); */
            if (maxVoices === 1) {
                return [extraNotes];
            }
        }
        required = Voicing.withoutPitches(omitNotes, required);
        if (maxVoices === 1) {
            return required.map(function (note) { return [note]; });
        }
        var fill = maxVoices - required.length;
        if (fill === 0) {
            return [required];
        }
        if (fill < 0) { // required notes are enough
            return Permutation_1.Permutation.binomial(required, maxVoices);
        }
        var optional = Voicing.getOptionalNotes(chord, maxVoices, required);
        optional = Voicing.withoutPitches(omitNotes, optional);
        if (fill >= optional.length) {
            return [required.concat(optional)];
        }
        return Permutation_1.Permutation.binomial(optional, Math.min(fill, optional.length))
            .map(function (selection) { return required.concat(selection); });
    };
    Voicing.withoutPitches = function (pitches, voicing) {
        if (pitches === void 0) { pitches = []; }
        return voicing.filter(function (r) { return !pitches.find(function (o) { return Harmony_1.Harmony.hasSamePitch(r, o); }); });
    };
    /** Get available tensions for a given chord. Omits tensions that kill the chord quality */
    Voicing.getAvailableTensions = function (chord) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        if (util_1.isDominantChord(chord)) {
            return Voicing.getAllTensions(notes[0])
                // filter out tensions that are part of the chord
                .filter(function (note) { return !notes.find(function (n) { return util_1.semitoneDistance(notes[0], note) === util_1.semitoneDistance(notes[0], n); }); })
                // filter out tensions that are a semitone above the 3 (if exists)
                .filter(function (note) { return util_1.chordHasIntervals(chord, ['3!']) || util_1.semitoneDistance(util_1.getDegreeInChord(3, chord), note) > 1; })
                // filter out tensions that are a semitone above the 4 (if exists => sus)
                .filter(function (note) { return !util_1.chordHasIntervals(chord, ['4P']) || util_1.semitoneDistance(util_1.getDegreeInChord(4, chord), note) > 1; })
                // filter out tensions that are a semitone above the 7
                .filter(function (note) { return util_1.semitoneDistance(util_1.getDegreeInChord(7, chord), note) > 1; });
        }
        return notes.slice(0, 4)
            // notes less than 3 semitones away from root are omitted (tensions 2M above would be in next octave)
            .filter(function (note) { return note === notes[0] || util_1.semitoneDistance(note, notes[0]) > 2; })
            // all tensions are a major second above a chord note
            .map(function (note) { return tonal_1.Distance.transpose(note, '2M'); })
            // tensions 2 semiontes below root are flat 7 => changes chord quality
            .filter(function (note) { return util_1.semitoneDistance(note, notes[0]) !== 2; });
        // omit tensions that end up on a chord note again?
    };
    /** Returns all Tensions that could be in any chord */
    Voicing.getAllTensions = function (root) {
        return ['b9', '9', '#9', '3', '11', '#11', 'b13', '13', '7']
            .map(function (step) { return util_1.getIntervalFromStep(step); })
            .map(function (interval) { return tonal_1.Distance.transpose(root, interval); });
    };
    /** Returns all notes that are required to outline a chord */
    Voicing.getRequiredNotes = function (chord, voices) {
        if (voices === void 0) { voices = 2; }
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        var intervals = tonal_1.Chord.intervals(chord);
        var requiredSteps = [3, 7, 'b5', 6].slice(0, Math.max(voices, 2)); // order is important
        if (!util_1.hasDegree(3, intervals)) {
            requiredSteps.push(4); // fixes m6 chords
        }
        var required = requiredSteps.reduce(function (req, degree) {
            if (util_1.hasDegree(degree, intervals)) {
                req.push(util_1.getDegreeInChord(degree, chord));
            }
            return req;
        }, []);
        if (voices > 3 && !required.includes(notes[notes.length - 1])) {
            required.push(notes[notes.length - 1]);
        }
        return required;
    };
    /** Returns all notes that are not required */
    Voicing.getOptionalNotes = function (chord, voices, required) {
        chord = Harmony_1.Harmony.getTonalChord(chord);
        var notes = tonal_1.Chord.notes(chord);
        required = required || Voicing.getRequiredNotes(chord, voices);
        return notes.filter(function (note) { return !required.includes(note); });
    };
    /** Returns all possible note choices for the given combinations.
     * Takes the bottom note of the previous voicing and computes the minimal intervals up and down to the next bottom note.
     */
    Voicing.getAllChoices = function (combinations, previousVoicing, options) {
        if (previousVoicing === void 0) { previousVoicing = []; }
        if (options === void 0) { options = {}; }
        var range = options.range, topNotes = options.topNotes;
        range = range || defaultOptions_1.voicingDefaultOptions.range;
        var choices = [];
        if (topNotes && topNotes.length) {
            var absoluteTopNotes = (topNotes || []).filter(function (n) { return !!tonal_1.Note.oct(n); });
            var choicesWithTopNotes = absoluteTopNotes.reduce(function (rendered, topNote) {
                var combinationsWithThatTopNote = combinations.filter(function (c) { return Harmony_1.Harmony.hasSamePitch(c[c.length - 1], topNote); });
                combinationsWithThatTopNote.forEach(function (combination) {
                    return rendered.push(util_1.renderAbsoluteNotes(combination.reverse(), tonal_1.Note.oct(topNote), 'down').reverse());
                });
                // exclude the combination from further rendering
                combinations = combinations.filter(function (c) { return !combinationsWithThatTopNote.includes(c); });
                return rendered;
            }, []);
            choices = choices.concat(choicesWithTopNotes, []);
            if (!combinations.length) {
                return choices.reduce(function (all, targets) {
                    var leads = Voicing.voiceLeading(targets, previousVoicing);
                    return all.concat(leads);
                }, []);
            }
            else {
                console.warn('not only top note choices', topNotes, choicesWithTopNotes, combinations);
            }
        }
        if (!previousVoicing || !previousVoicing.length) { // no previous chord
            // filter out combinations that are out of range
            combinations = combinations.filter(function (combination) {
                var firstNote = Harmony_1.Harmony.getNearestNote(range[0], combination[0], 'up');
                var pick = util_1.renderAbsoluteNotes(combination, tonal_1.Note.oct(firstNote));
                /* const highestNote = Harmony.getNearestNote(range[1], combination[combination.length - 1], 'down');
                const pick = renderAbsoluteNotes(combination.reverse(), Note.oct(highestNote), 'down').reverse(); */
                return util_1.isInRange(pick[0], range) && util_1.isInRange(pick[pick.length - 1], range);
            });
            if (!combinations.length) {
                return [];
            }
            var firstPick = combinations[0];
            var firstNoteInRange = Harmony_1.Harmony.getNearestNote(range[0], firstPick[0], 'up');
            var pick = util_1.renderAbsoluteNotes(firstPick, tonal_1.Note.oct(firstNoteInRange));
            if (topNotes && topNotes.length) {
                return Voicing.voiceLeading(pick.concat(topNotes));
            }
            return Voicing.voiceLeading(pick);
        }
        var lastPitches = previousVoicing.map(function (note) { return tonal_1.Note.pc(note); });
        return combinations
            .map(function (combination) {
            var bottomInterval = tonal_1.Distance.interval(lastPitches[0], combination[0]);
            var bottomNotes = [
                tonal_1.Distance.transpose(previousVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'down')),
                tonal_1.Distance.transpose(previousVoicing[0], Harmony_1.Harmony.minInterval(bottomInterval, 'up')),
            ];
            if (bottomNotes[0] === bottomNotes[1]) {
                bottomNotes = [bottomNotes[0]];
            }
            return { combination: combination, bottomNotes: bottomNotes };
        })
            .reduce(function (all, _a) {
            var combination = _a.combination, bottomNotes = _a.bottomNotes;
            return all.concat(bottomNotes.map(function (bottomNote) { return util_1.renderAbsoluteNotes(combination, tonal_1.Note.oct(bottomNote)); }));
        }, [])
            .filter(function (targets) {
            return !range ||
                util_1.isInRange(targets[0], range) &&
                    util_1.isInRange(targets[targets.length - 1], range);
        })
            .reduce(function (all, targets) {
            var leads = Voicing.voiceLeading(targets, previousVoicing);
            return all.concat(leads);
        }, []);
    };
    /** Analyzes all possible voice movements for all possible transitions. Handles inequal lengths */
    Voicing.voiceLeading = function (targets, origin) {
        if (origin === void 0) { origin = []; }
        // if same length > dont permutate
        if (!origin || !origin.length || origin.length === targets.length) {
            return [Voicing.analyzeVoiceLeading(targets, origin)];
        }
        var _a = [origin, targets].sort(function (a, b) { return b.length - a.length; }), more = _a[0], less = _a[1];
        return Permutation_1.Permutation.binomial(more, less.length)
            .map(function (selection) {
            var _a, _b;
            var from, to;
            if (origin.length < targets.length) {
                _a = [origin, selection], from = _a[0], to = _a[1];
            }
            else {
                _b = [selection, targets], from = _b[0], to = _b[1];
            }
            return Voicing.analyzeVoiceLeading(to, from, targets, origin);
        });
    };
    /** Analyzed the voice leading for the movement from > to.
     * Origin and targets needs to be passed if the voice transition over unequal lengths
     */
    Voicing.analyzeVoiceLeading = function (to, from, targets, origin) {
        if (from === void 0) { from = []; }
        if (targets === void 0) { targets = to; }
        if (origin === void 0) { origin = from; }
        var _a;
        _a = [origin || from, targets || to], origin = _a[0], targets = _a[1];
        if (!from || !from.length) {
            return {
                to: to, targets: targets,
                from: from, origin: origin,
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
        var intervals = Voicing.voicingIntervals(from, to, false)
            .map(function (interval) { return Harmony_1.Harmony.fixInterval(interval, false); });
        /** Interval qualities */
        var degrees = intervals.map(function (i) { return util_1.getDegreeFromInterval(i); });
        /** Voices that did not move */
        var oblique = from.filter(function (n, i) { return to.find(function (note) { return Harmony_1.Harmony.hasSamePitch(n, note); }); });
        /** abs sum of semitones movements of voices */
        var difference = util_1.semitoneDifference(intervals);
        /** relative sum of semitone movements */
        var movement = util_1.semitoneMovement(intervals);
        /** voice differences did not cancel each other out > moved in same direction */
        var similar = Math.abs(movement) === Math.abs(difference);
        /** moves parallel if all interval qualities the same and in the same direction */
        var parallel = difference > 0 && similar && degrees.reduce(function (match, degree, index) {
            return match && (index === 0 || degrees[index - 1] === degree);
        }, true);
        // find out which notes have been dropped / added
        var dropped = [], added = [];
        if (origin.length < targets.length) {
            added = targets.filter(function (n) { return !to.includes(n); });
        }
        else {
            dropped = origin.filter(function (n) { return !from.includes(n); });
        }
        var bottomInterval = intervals[0];
        var topInterval = intervals[intervals.length - 1];
        var bottomNotes = [origin[0], targets[0]];
        var topNotes = [origin[origin.length - 1], targets[targets.length - 1]];
        return {
            from: from,
            to: to,
            origin: origin,
            targets: targets,
            intervals: intervals,
            difference: difference,
            movement: movement,
            bottomInterval: bottomInterval,
            topInterval: topInterval,
            topNotes: topNotes,
            bottomNotes: bottomNotes,
            similar: similar,
            contrary: !similar,
            parallel: parallel,
            oblique: oblique,
            degrees: degrees,
            added: added,
            dropped: dropped,
            topDropped: dropped.includes(topNotes[0]),
            topAdded: added.includes(topNotes[1]),
            bottomDropped: dropped.includes(bottomNotes[0]),
            bottomAdded: added.includes(bottomNotes[1])
        };
    };
    /** Returns true if the given note is contained in the given voicing. */
    Voicing.containsPitch = function (note, voicing, enharmonic) {
        if (enharmonic === void 0) { enharmonic = true; }
        if (!enharmonic) {
            return voicing.includes(note);
        }
        return !!voicing.find(function (n) { return Harmony_1.Harmony.hasSamePitch(note, n); });
    };
    /** Returns the intervals between the given chord voicings.
     * Can be passed pitch classes or absolute notes.
     * The two voicings should have the same length. */
    Voicing.voicingIntervals = function (chordA, chordB, min, direction) {
        if (min === void 0) { min = true; }
        if (chordA.length !== chordB.length) {
            // console.log('voicingIntervals: not the same length..');
        }
        var intervals = chordA.map(function (n, i) {
            var interval = tonal_1.Distance.interval(n, chordB[i]);
            if (min === false) {
                return interval;
            }
            if (util_1.isPitchClass(n) && util_1.isPitchClass(chordB[i])) {
                return Harmony_1.Harmony.minInterval(interval, direction);
            }
            return interval;
        });
        return intervals;
    };
    /** Validates the current permutation to have a note at a certain position (array index) */
    Voicing.notesAtPositionValidator = function (notes, position) {
        if (notes === void 0) { notes = []; }
        return function (selected, note, remaining) {
            return !notes.length || selected.length !== position || Voicing.containsPitch(note, notes) /*  notes.includes(note) */;
        };
    };
    /** Validates the current permutation to have a note at a certain position (array index) */
    Voicing.degreesAtPositionValidator = function (degrees, position, root) {
        if (degrees === void 0) { degrees = []; }
        return function (selected, note, remaining) {
            if (!degrees.length || !root || selected.length !== position) {
                return true;
            }
            var degree = util_1.getDegreeFromInterval(tonal_1.Distance.interval(root, note));
            return degrees.includes(degree);
        };
    };
    /** Returns true if the given voicing contains its root */
    Voicing.hasTonic = function (voicing, chord) {
        var tokens = tonal_1.Chord.tokenize(Harmony_1.Harmony.getTonalChord(chord));
        return voicing.map(function (n) { return tonal_1.Note.pc(n); }).includes(tokens[0]);
    };
    /** Returns the best direction to move for a given voicing in a range.
     * Outputs a direction as soon as the semitone distance of one of the outer notes is below the given threshold
     */
    Voicing.getDesiredDirection = function (voicing, range, thresholds) {
        if (thresholds === void 0) { thresholds = [3, 3]; }
        if (!voicing) {
            return;
        }
        var distances = util_1.getDistancesToRangeEnds([voicing[0], voicing[voicing.length - 1]], range);
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
    };
    return Voicing;
}());
exports.Voicing = Voicing;
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
