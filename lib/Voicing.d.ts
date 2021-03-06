import { PathValidator } from './Permutation';
import { intervalDirection } from './Harmony';
export declare type VoicingValidation = {
    /** COPIED FROM VoiceLeadingOptions to avoid typing errors */
    range?: string[];
    maxVoices?: number;
    forceDirection?: intervalDirection;
    forceBestPick?: boolean;
    rangeBorders?: number[];
    logging?: boolean;
    idleChance?: number;
    logIdle?: boolean;
    /** COPY END */
    requiredPitches?: string[];
    optionalPitches?: string[];
    bottomPitches?: string[][];
    topPitches?: string[][];
    voices?: string[][];
    ignoreLowerIntervalLimits?: boolean;
    defaultDistances?: number[];
    bottomDistances?: number[][];
    topDistances?: number[][];
    preferTopDistances?: boolean;
    maxTopDistance?: number;
    notes?: number | number[];
    maxDistance?: number;
    minBottomDistance?: number;
    minDistance?: number;
    minTopDistance?: number;
    topNotes?: string[];
    topDegrees?: number[][] | number[];
    bottomNotes?: string[];
    bottomDegrees?: number[] | number[][];
    omitNotes?: string[];
    unique?: boolean;
    maxNotes?: number;
    minNotes?: number;
    validatePermutation?: (path: string[], next: string, array: string[]) => boolean;
    sortChoices?: (choiceA: any, choiceB: any) => number;
    filterChoices?: (choice: any) => boolean;
    noTopDrop?: boolean;
    noTopAdd?: boolean;
    noBottomDrop?: boolean;
    noBottomAdd?: boolean;
    root?: string;
};
export declare type VoiceLeading = {
    from: string[];
    to: string[];
    origin: string[];
    targets: string[];
    intervals: string[];
    difference: number;
    movement: number;
    bottomInterval?: string;
    topInterval?: string;
    topNotes?: string[];
    bottomNotes?: string[];
    similar: boolean;
    contrary: boolean;
    parallel: boolean;
    oblique: string[];
    degrees: string[];
    added: string[];
    dropped: string[];
    topDropped?: boolean;
    bottomDropped?: boolean;
    topAdded?: boolean;
    bottomAdded?: boolean;
};
export declare interface VoiceLeadingOptions extends VoicingValidation {
}
export declare class Voicing {
    /** Returns the next voicing that should follow the previously played voicing.
    */
    static getNextVoicing(chord: any, previousVoicing: any, options?: VoiceLeadingOptions): any;
    static hasTopNotes(pick: string[], topNotes?: any[]): any;
    /** Computes all valid voice permutations for a given chord and voice number.
     * Runs getVoicePermutations for each possible selection of notes.
     */
    static getAllVoicePermutations(chord: any, voicingOptions?: VoiceLeadingOptions): any[];
    /** Get all permutations of the given notes that would make a good voicing. */
    static getVoicePermutations(notes: any, options?: VoicingValidation): any;
    static validators(options?: VoicingValidation): PathValidator<string>[];
    static intervalCollector(validate: (interval: string, path: any, next: any) => boolean): (pitches: any) => (collected: any, solutions: any) => any;
    static collectors(options?: VoicingValidation): any[];
    static search(pitches: string[], options?: VoicingValidation): {}[][];
    static absolute(options?: VoicingValidation): string[][];
    static getRequiredPitches(chord: any, voices?: number): any[];
    static getMinMaxNotes(options: VoicingValidation): {
        minNotes: any;
        maxNotes: any;
    };
    static getPitches(chord: string, options: VoicingValidation): {
        requiredPitches: any[];
        optionalPitches: string[];
    };
    static getCombinations(chord: any, options?: VoicingValidation): string[][];
    static allocations(notes: string[], voices: string[][]): number[][];
    /** Configurable Validator that sorts out note combinations with untasty intervals.  */
    static voicingValidator(options?: VoicingValidation): (path: any, next: any, array: any) => boolean;
    /** Validates the interval to the next note. You can write your own logic inside the validate fn. */
    static validateInterval(validate: (interval: string, { path, next, array }: {
        path: any;
        next: any;
        array: any;
    }) => boolean): (path: any, next: any, array: any) => boolean;
    /** Returns all possible combinations of required and optional notes for a given chord and desired length.
     * If the voices number is higher than the required notes of the chord, the rest number will be permutated from the optional notes */
    static getAllNoteSelections(chord: any, options?: VoiceLeadingOptions | number): any[][];
    static withoutPitches(pitches: any[], voicing: string[]): string[];
    /** Get available tensions for a given chord. Omits tensions that kill the chord quality */
    static getAvailableTensions(chord: any): (string | ((interval: string) => string))[];
    /** Returns all Tensions that could be in any chord */
    static getAllTensions(root: any): (string | ((interval: string) => string))[];
    /** Returns all notes that are required to outline a chord */
    static getRequiredNotes(chord: any, voices?: number): any[];
    /** Returns all notes that are not required */
    static getOptionalNotes(chord: any, voices?: any, required?: any): string[];
    /** Returns all possible note choices for the given combinations.
     * Takes the bottom note of the previous voicing and computes the minimal intervals up and down to the next bottom note.
     */
    static getAllChoices(combinations: Array<string[]>, previousVoicing?: string[], options?: VoiceLeadingOptions): VoiceLeading[];
    /** Analyzes all possible voice movements for all possible transitions. Handles inequal lengths */
    static voiceLeading(targets: any, origin?: any[]): VoiceLeading[];
    /** Analyzed the voice leading for the movement from > to.
     * Origin and targets needs to be passed if the voice transition over unequal lengths
     */
    static analyzeVoiceLeading(to: any, from?: any[], targets?: any, origin?: any[]): VoiceLeading;
    /** Returns true if the given note is contained in the given voicing. */
    static containsPitch(note: any, voicing: any, enharmonic?: boolean): any;
    /** Returns the intervals between the given chord voicings.
     * Can be passed pitch classes or absolute notes.
     * The two voicings should have the same length. */
    static voicingIntervals(chordA: any, chordB: any, min?: boolean, direction?: intervalDirection): any;
    /** Validates the current permutation to have a note at a certain position (array index) */
    static notesAtPositionValidator(notes: any[], position: any): (selected: any, note: any, remaining: any) => any;
    /** Validates the current permutation to have a note at a certain position (array index) */
    static degreesAtPositionValidator(degrees: any[], position: any, root: any): (selected: any, note: any, remaining: any) => boolean;
    /** Returns true if the given voicing contains its root */
    static hasTonic(voicing: any, chord: any): any;
    /** Returns the best direction to move for a given voicing in a range.
     * Outputs a direction as soon as the semitone distance of one of the outer notes is below the given threshold
     */
    static getDesiredDirection(voicing: any, range: any, thresholds?: number[]): "up" | "down";
}
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
