import { intervalDirection } from './Harmony';
/** Returns true if the given string is a valid pitch class */
export declare function isPitchClass(note: any): boolean;
/** Returns the given notes with octaves either moving bottom up or top down */
export declare function renderAbsoluteNotes(notes: any, octave?: number, direction?: intervalDirection): string[];
/** Returns true if the given chord is dominant = either 3 and b7 or sus with 4 and b7 */
export declare function isDominantChord(chord: any): any;
/** Returns true if the given chord is a major type chord with 3 and optional ^7 */
export declare function isMajorChord(chord: any): any;
/** Returns true if the given chord is minor */
export declare function isMinorChord(chord: any): any;
/** Returns true if the given chord is a minor tonic chord = either -6 or -^7 */
export declare function isMinorTonic(chord: any): any;
/** Returns the chord type based on methods above */
export declare function getChordType(chord: any): "dominant" | "major" | "minor-tonic" | "minor";
export declare function chordHasIntervals(chord: any, intervals: any): any;
/** Returns true if the given degree is present in the intervals */
export declare function hasDegree(degree: any, intervals: any): boolean;
/** Returns interval that matches the given degree/step */
export declare function findDegree(degreeOrStep: number | string, intervalsOrSteps: string[]): string;
/** Returns true if the given string is a valid interval */
export declare function isInterval(interval: any): boolean;
/** Returns interval from step */
export declare function getIntervalFromStep(step: string | number): string;
export declare function getStepFromInterval(interval: any, min?: boolean): any;
export declare function noteArray(range: any): string[];
export declare function noteArrayMidi(range: any): string[];
export declare function getStep(step: string | number): string;
/** Returns degree from step */
export declare function getDegreeFromStep(step: string): number;
export declare function getDegreeInChord(degree: any, chord: any): string | ((interval: string) => string);
/** Yields the semitones of the interval (can be negative) */
export declare function semitoneDifference(intervals: any): any;
/** yields the absolute semitones of the interval (always positive) */
export declare function semitoneMovement(intervals: any): any;
/** returns the distance of semitones between two notes */
export declare function semitoneDistance(noteA: any, noteB: any): number;
/** Turns an interval into a degree */
export declare function getDegreeFromInterval(interval?: string, simplify?: boolean): number;
/** Returns true if the given note is inside the given range */
export declare function isInRange(note: any, range: any): boolean;
/** Returns array of distances from the given notes to the range ends  */
export declare function getDistancesToRangeEnds(notes: string[], range: string[]): number[];
export declare function transposeNotes(notes: any, interval: any): any;
export declare function measureTime(fn: any): number;
