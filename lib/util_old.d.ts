import { intervalDirection } from './Harmony';
/** Returns the given notes with octaves either moving bottom up or top down */
export declare function renderAbsoluteNotes(notes: any, octave?: number, direction?: intervalDirection): string[];
export declare function isDominantChord(chord: any): any;
export declare function isMajorChord(chord: any): any;
export declare function isMinorChord(chord: any): any;
export declare function isMinorTonic(chord: any): any;
export declare function getChordType(chord: any): "dominant" | "major" | "minor-tonic" | "minor";
export declare function chordHasIntervals(chord: any, intervals: any): any;
export declare function semitoneDifference(intervals: any): any;
export declare function semitoneMovement(intervals: any): any;
export declare function isPitchClass(note: any): boolean;
export declare function getDegreeFromInterval(interval?: string, simplify?: boolean): number;
export declare function isInRange(note: any, range: any): boolean;
export declare function getDistancesToRangeEnds(notes: string[], range: string[]): number[];
export declare function transposeNotes(notes: any, interval: any): any;
export declare function randomNumber(n: any): number;
export declare function randomNumberInRange(a: number, b: number): number;
export declare function arraySum(array: any): any;
export declare function randomElement(array: any, weighted?: any): any;
export declare function shuffleArray(a: any): any;
/** OLD SHEET / RHYTHM STUFF */
/** Travels path along measures */
export declare function getPath(path: any, measures: any, traveled?: any[]): any;
export declare function getDuration(divisions: any, noteLength?: number, measureLength?: number): number;
export declare function resolveChords(pattern: any, measures: any, path: any, divisions?: any[]): any[] | 0 | {
    chord: any;
    pattern: any;
    path: any;
    divisions: any[];
    fraction: number;
};
export declare function hasOff(pattern: any, division?: number): boolean;
export declare function offbeatReducer(settings: any): (measures: any, bar: any, index: any) => any;
export interface ADSRParams {
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    gain?: number;
    duration?: number;
    endless?: boolean;
}
export declare function adsr({ attack, decay, sustain, release, gain, duration, endless }: ADSRParams, time: any, param: any): void;
export declare function randomDelay(maxMs: any): number;
export declare function transposeToRange(notes: any, range: any, times?: number): any;
export declare function getAverageMidi(notes: any, offset?: any): number;
export declare function getRangePosition(note: string | number, range: any): number;
export declare function getStep(step: string): string;
export declare function getIntervalFromStep(step: string): string;
export declare function getStepsFromDegree(degree: any): void;
export declare function getStepsInChord(notes: string[], chord: string, min?: boolean): any[];
export declare function getStepInChord(note: any, chord: any, min?: boolean): any;
export declare function findDegree(degreeOrStep: number | string, intervalsOrSteps: string[]): string;
export declare function hasDegree(degree: any, intervals: any): boolean;
export declare function hasAllDegrees(degrees: any, intervals: any): any;
export declare function getScaleDegree(degree: any, scale: any): string;
export declare function getScalePattern(pattern: any, scale: any): any;
export declare function renderIntervals(intervals: any, root: any): any;
export declare function renderSteps(steps: any, root: any): any;
export declare function permutateIntervals(intervals: any, pattern: any): any;
/** DOUBLE... */
export declare function getStepFromInterval(interval: any, min?: boolean): any;
export declare function getDegreeFromStep(step: string): number;
export declare function getDegreeInChord(degree: any, chord: any): string | ((interval: string) => string);
export declare function getDigitalPattern(chord: any): number[];
export declare function getRangeDirection(note: any, range: any, defaultDirection?: intervalDirection, border?: number): {
    direction: intervalDirection;
    force: boolean;
};
export declare function isFirstInPath(path: any, index: any): boolean;
export declare function isBarStart(path: any): boolean;
export declare function isFormStart(path: any): boolean;
export declare function isOffbeat(path: any): boolean;
export declare function otherDirection(direction: any, defaultDirection?: any): any;
export declare function totalDiff(diff: any): any;
/** Reorders the given notes to contain the given step as close as possible */
export declare function sortByDegree(notes: any, degree: any): any;
export declare function getIntervals(notes: any): any;
export declare function isInterval(interval: any): boolean;
export declare function smallestInterval(intervals: any): any;
export declare function sortNotes(notes: any, direction?: intervalDirection): any;
export declare function analyzeVoicing(notes: any, root?: any): {
    notes: any;
    minInterval: any;
    maxInterval: any;
    intervals: any;
    spread: string | ((to: string) => string);
};
export declare function longestChild(array: any[][]): any[];
export declare function maxArray(array: any): any;
export declare function avgArray(array: any): number;
export declare function humanize(value: number, amount?: number, offset?: number): number;
export declare function mapTree(tree: any, modifier?: any, simplify?: boolean, path?: any[], siblings?: any[], position?: number): any;
export declare function flattenTree(tree: any): any[];
export declare function expandTree(tree: any): void;
export declare function getChordNotes(chord: any, validate?: any): string[];
export declare function validateWithoutRoot(note: any, { degree }: {
    degree: any;
}): boolean;
export declare function getVoicing(chord: any, { voices, previousVoicing, omitRoot, quartal }?: {
    previousVoicing?: string[];
    voices?: number;
    omitRoot?: boolean;
    quartal?: boolean;
}): string[];
export declare function semitoneDistance(noteA: any, noteB: any): number;
export declare function factorial(n: any): number;
