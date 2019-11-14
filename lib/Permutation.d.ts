export declare type ConstraintFilter<T> = (path: T[], candidate?: T) => boolean;
export declare type PathValidator<T> = (path: T[], solution?: any) => boolean;
export declare type PathSolver<T> = (path: T[], candidate: T) => T[][];
export declare type RoadFinder<T> = (path: T[]) => T[];
export declare class Permutation {
    static permutateElements(array: any, validate?: any, path?: any[]): any;
    static filter: {
        [key: string]: (...args: any[]) => ConstraintFilter<any>;
    };
    static collector: {
        maxItems: (n: any) => (items: any) => (collected: any, solutions: any) => any;
        unique: (active?: boolean) => (items: any) => (collected: any, solutions: any) => any;
        maxSolutions: (number?: any) => (items: any) => (collected: any, solutions: any) => any;
        validate: (validators: ((...args: any[]) => boolean)[]) => (items: any) => (collected: any, solutions: any) => any;
    };
    static validator: {
        [key: string]: (...args: any[]) => PathValidator<any>;
    };
    static validate(filters: ((...args: any[]) => boolean)[]): (...args: any[]) => boolean;
    static isEqual(collectionA: any, collectionB: any): boolean;
    static collect<T>(items: any, collectors: ((items: T[]) => (collected: any, solutions: any) => T[])[]): (path: any, solutions: any) => any;
    static urn(items: any, number?: any, strictOrder?: boolean, unique?: boolean, maxSolutions?: any): {}[][];
    static permutate_old<T>(items: T[], constraints?: ConstraintFilter<T>[], validators?: PathValidator<T>[], concatFn?: (_path: T[], _candidate: T) => T[], path?: T[]): T[][];
    static search<T>(collector: (path: T[], solutions: T[][]) => T[], validator: (path: T[], solutions: T[][]) => boolean, concatFn?: (_path: T[], _candidate: T) => T[], path?: T[], solutions?: T[][]): T[][];
    static possibleHands(stash: number[], cards: number): number[][];
    static rooks(n: any): {
        solutions: number[][];
        runs: number;
    };
    static randomRook(n: any): number[][];
    static permutate<T>(items: T[], constraints?: ConstraintFilter<T>[], validators?: PathValidator<T>[], concatFn?: (_path: T[], _candidate: T) => T[], path?: T[]): T[][];
    static permutationComplexity(array: any, validate?: any, path?: any[]): number;
    static permutateArray(array: any): any;
    static combineValidators(...validators: ((path: any, next: any, array: any) => boolean)[]): (path: any, next: any, array: any) => boolean;
    static combinations(array: any): any[];
    static binomial(set: any, k: any): Array<any[]>;
    static bjorklund(steps: any, pulses: any): any[];
}
