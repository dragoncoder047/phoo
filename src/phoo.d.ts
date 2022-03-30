declare module 'phoo' {
    import { Scope, Module } from './namespace';

    declare type IPhooSettings = {
        maxDepth?: number,
        strictMode?: boolean,
        namepathSeparator?: string,
    };

    declare type IPhooOptions = {
        settings?: IPhooSettings,
        modules?: Map<string, Module>,
    };

    export declare class Phoo {
        settings: IPhooSettings;
        modules: Map<string, Module>;
        constructor(opts: IPhooOptions);
        undefinedWord(word: string): IPhooRunnable;
        createThread(module: string, scopes: Scope[], modules: Module[], starModules: Module[], stack: any[]): Thread;
        findModule(moduleName: string): Module;
    }
}

declare module 'phoo/threading' {
    import { Phoo } from 'phoo';
    import { WORD_NAME_SYMBOL } from './constants';
    import { Threadlock } from './locks';

    declare type IThreadOptions = {
        parent: Phoo,
        module: Module,
        starModules?: Module[],
        modules?: Map<string, Module>,
        stack?: any[],
        scopes?: Scope[],
        maxDepth: number,
    };

    export declare class Thread {
        phoo: Phoo;
        module: Module;
        starModules: Module[];
        workStack: any[];
        scopeStack: Scope[];
        returnStack: IReturnStackEntry[];
        maxDepth: number;
        lock: Threadlock;
        constructor(opts: IThreadOptions);
        async executeOneItem(item: IPhooRunnable): void;
        async compileLiteral(word: string, a: IPhooRunnable[]): boolean;
        async compile(source: string | any[] | IPhooRunnable[], hasLockAlready?: boolean): IPhooRunnable[];
        expect(...types: (string | RegExp | number)[]): void;
        pop(depth: number): any;
        peek(depth: number): any;
        push(item: any): void;
        retPop(): IReturnStackEntry;
        retPush(item: IReturnStackEntry): void;
        enterScope(): void;
        exitScope(): void;
        async execute(c: IPhooRunnable, hasLockAlready?: boolean): any[];
        async run(source: string | any[] | IPhooRunnable[], hasLockAlready?: boolean): any[];
        getScope(idx: number): Scope;
        resolveNamepath(word: string, where: 'words' | 'macros'): IPhooDefinition;
        checkIfKilled(): void;
        async kill(): void;
        checkForPaused(): void;
        async pause(): void;
        async step(): void;
        resume(): void;
    }

    declare type IPhooRunnable = Function | IPhooLiteral | IPhooRunnable[];
    declare type IPhooLiteral = number | string | Promise<any> | Symbol;
    declare type IReturnStackEntry = { pc: number; arr: IPhooRunnable[] };
    declare type IPhooDefinition = (Function | Symbol | IPhooRunnable) & { [WORD_NAME_SYMBOL]: string };
}

declare module 'phoo/namespace' {
    import { IPhooDefinition } from './threading';

    export class SimpleNamespace<N, V> {
        map: Map<N, V[]>;
        add(name: N, def: V): void;
        forget(name: N): V | undefined;
        find(name: N): V | undefined;
    }

    export class Namespace {
        words: SimpleNamespace<string, IPhooDefinition>;
        macros: SimpleNamespace<string, IPhooDefinition>;
        literalizers: SimpleNamespace<RegExp, IPhooDefinition>;
    }

    export class Scope extends Namespace {
        loadedModules: Module[];
        starModules: Module[];
    }

    export class Module extends Scope {
        name: string;
    }
}

declare module 'phoo/errors' {
    import { WORD_NAME_SYMBOL, STACK_TRACE_SYMBOL } from './constants';
    import { IReturnStackEntry } from 'phoo/threading';

    export class PhooError extends Error {
        [STACK_TRACE_SYMBOL]: string;
        constructor(message: string);
        static wrap(otherError: Error, stackToTrace: IReturnStackEntry[]): ThisType;
        static withPhooStack(stackToTrace: IReturnStackEntry[]): ThisType;
    }
    export class UnknownWordError extends PhooError { }
    export class ModuleNotFoundError extends UnknownWordError { }
    export class IllegalOperationError extends PhooError { }
    export class AlreadyDefinedError extends IllegalOperationError { }
    export class UnreachableError extends PhooError { }
    export class StackOverflowError extends PhooError { }
    export class StackUnderflowError extends PhooError { }
    export class RaceConditionError extends PhooError { }
    export class ExternalInterrupt extends PhooError { }
    export class TypeMismatchError extends PhooError { }
    export class BadSyntaxError extends PhooError { }
    export class BadNestingError extends BadSyntaxError { }
    export class UnexpectedEOFError extends BadSyntaxError { }
    export function stringifyReturnStack(stack: IReturnStackEntry[]): string;
}

declare module 'phoo/locks' {
    export class Threadlock {
        promise: Promise<void>;
        locks: number;
        async acquire(): () => void;
        get locked(): boolean;
    }
}

declare module 'phoo/utils' {
    export function type(obj: any, guess_containers?: boolean): string;
    export function word(word: string): Symbol;
    export function name(word: Symbol): string;
    export function cloneArray(arr: T[], objects?: boolean, deep?: boolean, seen?: Map<T, T>): T[];
    export function clone(obj: T, deep?: boolean, seen?: Map<T, T>): T;
}

declare module 'phoo/importers' {
    import { Module } from './namespace';
    import { Phoo } from 'phoo';
    
    export interface Importer {
        setup(phoo: Phoo): void;
        async find(name: string, currentModule: Module): Module;
    }

    export class BaseImporter implements Importer { }
}

declare module 'phoo/constants' {
    export const WORD_NAME_SYMBOL: Symbol;
    export const STACK_TRACE_SYMBOL: Symbol;
}