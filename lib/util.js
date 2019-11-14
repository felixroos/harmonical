"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tonal_1 = require("tonal");
var Harmony_1 = require("./Harmony");
var steps = {
    '1P': ['1', '8'],
    '2m': ['b9', 'b2'],
    '2M': ['9', '2',],
    '2A': ['#9', '#2'],
    '3m': ['b3'],
    '3M': ['3'],
    '4P': ['11', '4'],
    '4A': ['#11', '#4'],
    '5d': ['b5'],
    '5P': ['5'],
    '5A': ['#5'],
    '6m': ['b13', 'b6'],
    '6M': ['13', '6'],
    '7m': ['b7'],
    '7M': ['7', '^7', 'maj7']
};
/** Returns true if the given string is a valid pitch class */
function isPitchClass(note) {
    return tonal_1.Note.pc(note) === note;
}
exports.isPitchClass = isPitchClass;
/** Returns the given notes with octaves either moving bottom up or top down */
function renderAbsoluteNotes(notes, octave, direction) {
    if (octave === void 0) { octave = 3; }
    if (direction === void 0) { direction = 'up'; }
    return notes.reduce(function (absolute, current, index, notes) {
        if (index === 0) {
            return [current + octave];
        }
        var interval = tonal_1.Distance.interval(notes[index - 1], current);
        interval = Harmony_1.Harmony.minInterval(interval, direction);
        if (interval === '1P') {
            interval = direction === 'down' ? '-8P' : '8P';
        }
        absolute.push(tonal_1.Distance.transpose(absolute[index - 1], interval + ''));
        return absolute;
    }, []);
}
exports.renderAbsoluteNotes = renderAbsoluteNotes;
/** Returns true if the given chord is dominant = either 3 and b7 or sus with 4 and b7 */
function isDominantChord(chord) {
    return chordHasIntervals(chord, ['3M', '7m']) || chordHasIntervals(chord, ['!3', '4P', '7m']);
}
exports.isDominantChord = isDominantChord;
/** Returns true if the given chord is a major type chord with 3 and optional ^7 */
function isMajorChord(chord) {
    return chordHasIntervals(chord, ['3M', '7M?']);
}
exports.isMajorChord = isMajorChord;
/** Returns true if the given chord is minor */
function isMinorChord(chord) {
    return chordHasIntervals(chord, ['3m']);
}
exports.isMinorChord = isMinorChord;
/** Returns true if the given chord is a minor tonic chord = either -6 or -^7 */
function isMinorTonic(chord) {
    return chordHasIntervals(chord, ['3m', '5P', '13M?', '7M?']);
}
exports.isMinorTonic = isMinorTonic;
/** Returns the chord type based on methods above */
function getChordType(chord) {
    if (isDominantChord(chord)) {
        return 'dominant';
    }
    if (isMajorChord(chord)) {
        return 'major';
    }
    if (isMinorTonic(chord)) {
        return 'minor-tonic';
    }
    if (isMinorChord(chord)) {
        return 'minor';
    }
}
exports.getChordType = getChordType;
/* Returns true if the given intervals are all present in the chords interval structure
Intervals can be appendend with "?" to indicate that those degrees could also be omitted
(but when present they should match)
*/
function chordHasIntervals(chord, intervals) {
    chord = Harmony_1.Harmony.getTonalChord(chord);
    var has = tonal_1.Chord.intervals(chord);
    return intervals.reduce(function (match, current) {
        var isOptional = current.includes('?');
        var isForbidden = current.includes('!');
        if (isOptional) {
            current = current.replace('?', '');
            return (!hasDegree(getDegreeFromInterval(current), has) ||
                has.includes(current)) && match;
        }
        if (isForbidden) {
            current = current.replace('!', '');
            return !hasDegree(getDegreeFromInterval(current), has);
        }
        return has.includes(current) && match;
    }, true);
}
exports.chordHasIntervals = chordHasIntervals;
/** Returns true if the given degree is present in the intervals */
function hasDegree(degree, intervals) {
    return !!findDegree(degree, intervals);
}
exports.hasDegree = hasDegree;
/** Returns interval that matches the given degree/step */
function findDegree(degreeOrStep, intervalsOrSteps) {
    var intervals = intervalsOrSteps.map(function (i) { return isInterval(i) ? i : getIntervalFromStep(i); });
    if (typeof degreeOrStep === 'number') { // is degree
        var degree_1 = Math.abs(degreeOrStep);
        return intervals.find(function (i) {
            i = Harmony_1.Harmony.minInterval(i, 'up');
            if (!steps[i]) {
                console.error('interval', i, 'is not valid', intervals);
            }
            return !!(steps[i].find(function (step) { return getDegreeFromStep(step) === degree_1; }));
        });
    }
    // is step
    var step = getStep(degreeOrStep);
    return intervals.find(function (i) { return i.includes(step) ||
        i === getIntervalFromStep(step); });
}
exports.findDegree = findDegree;
/** Returns true if the given string is a valid interval */
function isInterval(interval) {
    return typeof tonal_1.Interval.semitones(interval) === 'number';
}
exports.isInterval = isInterval;
/** Returns interval from step */
function getIntervalFromStep(step) {
    step = getStep(step);
    var interval = Object.keys(steps)
        .find(function (i) { return steps[i].includes(step); });
    if (!interval) {
        // console.warn(`step ${step} has no defined inteval`);
    }
    return interval;
}
exports.getIntervalFromStep = getIntervalFromStep;
function getStepFromInterval(interval, min) {
    if (min === void 0) { min = false; }
    var step = steps[interval] || [];
    if (min) {
        return step[1] || step[0] || 0;
    }
    return step[0] || 0;
}
exports.getStepFromInterval = getStepFromInterval;
function noteArray(range) {
    var slots = tonal_1.Interval.semitones(tonal_1.Distance.interval(range[0], range[1]) + '');
    return new Array(slots + 1)
        .fill('')
        .map(function (v, i) { return tonal_1.Distance.transpose(range[0], tonal_1.Interval.fromSemitones(i)) + ''; })
        .map(function (n) { return tonal_1.Note.simplify(n); });
}
exports.noteArray = noteArray;
function noteArrayMidi(range) {
    var slots = range[1] - range[0];
    return new Array(slots + 1)
        .fill('')
        .map(function (v, i) { return tonal_1.Distance.transpose(tonal_1.Note.fromMidi(range[0]), tonal_1.Interval.fromSemitones(i)) + ''; })
        .map(function (n) { return tonal_1.Note.simplify(n); });
}
exports.noteArrayMidi = noteArrayMidi;
// accepts both strings or numbers where negative means minor, 
// returns unified step string that can be turned into an interval
function getStep(step) {
    if (typeof step === 'number' && step < 0) {
        step = 'b' + (step * -1);
    }
    return step + ''; // to string
}
exports.getStep = getStep;
/** Returns degree from step */
function getDegreeFromStep(step) {
    step = getStep(step);
    var match = step.match(/([1-9])+/);
    if (!match || !match.length) {
        return 0;
    }
    return parseInt(match[0], 10);
}
exports.getDegreeFromStep = getDegreeFromStep;
function getDegreeInChord(degree, chord) {
    chord = Harmony_1.Harmony.getTonalChord(chord);
    var intervals = tonal_1.Chord.intervals(chord);
    var tokens = tonal_1.Chord.tokenize(chord);
    return tonal_1.Distance.transpose(tokens[0], findDegree(degree, intervals));
}
exports.getDegreeInChord = getDegreeInChord;
/** Yields the semitones of the interval (can be negative) */
function semitoneDifference(intervals) {
    return intervals.reduce(function (semitones, interval) {
        return semitones + Math.abs(tonal_1.Interval.semitones(interval));
    }, 0);
}
exports.semitoneDifference = semitoneDifference;
/** yields the absolute semitones of the interval (always positive) */
function semitoneMovement(intervals) {
    return intervals.reduce(function (semitones, interval) {
        return semitones + tonal_1.Interval.semitones(interval);
    }, 0);
}
exports.semitoneMovement = semitoneMovement;
/** returns the distance of semitones between two notes */
function semitoneDistance(noteA, noteB) {
    return tonal_1.Interval.semitones(tonal_1.Distance.interval(noteA, noteB) + '');
}
exports.semitoneDistance = semitoneDistance;
/** Turns an interval into a degree */
function getDegreeFromInterval(interval, simplify) {
    if (interval === void 0) { interval = '-1'; }
    if (simplify === void 0) { simplify = false; }
    var fixed = Harmony_1.Harmony.fixInterval(interval + '', simplify) || '';
    var match = fixed.match(/[-]?([1-9])+/);
    if (!match) {
        return 0;
    }
    return Math.abs(parseInt(match[0], 10));
}
exports.getDegreeFromInterval = getDegreeFromInterval;
/** Returns true if the given note is inside the given range */
function isInRange(note, range) {
    return tonal_1.Distance.semitones(note, range[0]) <= 0 && tonal_1.Distance.semitones(note, range[1]) >= 0;
}
exports.isInRange = isInRange;
/** Returns array of distances from the given notes to the range ends  */
function getDistancesToRangeEnds(notes, range) {
    if (notes.length > 2) {
        notes = [notes[0], notes[notes.length - 1]];
    }
    var midi = notes.map(function (n) { return Harmony_1.Harmony.getMidi(n); });
    var rangeMidi = range.map(function (n) { return Harmony_1.Harmony.getMidi(n); });
    return [midi[0] - rangeMidi[0], rangeMidi[1] - midi[1]];
}
exports.getDistancesToRangeEnds = getDistancesToRangeEnds;
function transposeNotes(notes, interval) {
    return notes.map(function (note) { return tonal_1.Distance.transpose(note, interval); });
}
exports.transposeNotes = transposeNotes;
function measureTime(fn) {
    var start = performance.now();
    fn();
    var end = performance.now();
    return end - start;
}
exports.measureTime = measureTime;
