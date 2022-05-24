/// <reference lib="dom">

declare module 'index.js' {
    import { Scope, Module } from 'namespace.js';
    import { Loader } from 'loaders.js';

    declare type IPhooSettings = {
        maxDepth?: number,
        strictMode?: boolean,
    };

    declare type IPhooOptions = {
        settings?: IPhooSettings,
        modules?: Map<string, Module>,
        loaders?: Loader[];
    };

    export declare class Phoo {
        settings: IPhooSettings;
        modules: Map<string, Module>;
        loaders: Loader[];
        constructor(opts: IPhooOptions);
        undefinedWord(word: string): IPhooRunnable;
        createThread(module: string, stack: any[]): Thread;
        import(moduleName: string, thread: Thread);
    }
    export { word, name, w, type } from 'utils.js';
    export * from 'errors.js';
    export * from 'constants.js';
    export * from 'namespace.js';
}

declare module 'threading.js' {
    import { Phoo } from 'index.js';
    import { WORD_NAME_SYMBOL } from 'constants.js';
    import { Threadlock } from 'locks.js';

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
        workStack: any[];
        scopeStack: Scope[];
        returnStack: IReturnStackEntry[];
        maxDepth: number;
        lock: Threadlock;
        constructor(opts: IThreadOptions);
        async executeOneItem(item: IPhooRunnable);
        async compileLiteral(word: string, a: IPhooRunnable[]): boolean;
        async compile(source: string | any[] | IPhooRunnable[], hasLockAlready?: boolean): IPhooRunnable[];
        expect(...types: (string | RegExp | number)[]);
        pop(depth: number): any;
        peek(depth: number): any;
        push(item: any);
        retPop(): IReturnStackEntry;
        retPush(item: IReturnStackEntry);
        enterScope();
        exitScope();
        async execute(c: IPhooRunnable, hasLockAlready?: boolean): any[];
        async run(source: string | any[] | IPhooRunnable[], hasLockAlready?: boolean): any[];
        getScope(idx: number): Scope;
        lookup(word: string, macro?: boolean): IPhooDefinition;
    }

    declare type IPhooRunnable = Function | IPhooLiteral | IPhooRunnable[];
    declare type IPhooLiteral = number | string | Promise<any> | Symbol;
    declare type IReturnStackEntry = { pc: number; arr: IPhooRunnable[], };
    declare type IPhooDefinition = IPhooRunnable & { [WORD_NAME_SYMBOL]: string };
}

declare module 'namespace.js' {
    import { IPhooDefinition } from 'threading.js';

    export class SimpleNamespace<N, V> {
        map: Map<N, V[]>;
        add(name: N, def: V);
        forget(name: N): V?;
        find(name: N): V?;
        copyFrom(otherNS: SimpleNamespace);
    }

    export class Namespace {
        words: SimpleNamespace<string, IPhooDefinition>;
        macros: SimpleNamespace<string, IPhooDefinition>;
        literalizers: SimpleNamespace<RegExp, IPhooDefinition>;
    }

    export class Scope extends Namespace {
        imported_modules: string[];
        copyFrom(other: Scope);
    }

    export class Module extends Scope {
        name: string;
    }
}

declare module 'errors.js' {
    import { WORD_NAME_SYMBOL, STACK_TRACE_SYMBOL } from 'constants.js';
    import { IReturnStackEntry } from 'threading.js';

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
    export class PhooSyntaxError extends PhooError { }
    export class BadNestingError extends PhooSyntaxError { }
    export class UnexpectedEOFError extends PhooSyntaxError { }
    export function stringifyReturnStack(stack: IReturnStackEntry[]): string;
}

declare module 'utils.js' {
    export function type(obj: any, guess_containers?: boolean): string;
    export function word(word: string): Symbol;
    export const w = word;
    export function name(sym: Symbol): string;
    export function cloneArray<T>(arr: T[], objects?: boolean, deep?: boolean, seen?: Map<T, T>): T[];
    export function clone<T>(obj: T, deep?: boolean, seen?: Map<T, T>): T;
}

declare module 'loaders.js' {
    import { Module } from 'namespace.js';
    import { Phoo } from 'index.js';

    export interface Loader {
        setup(phoo: Phoo);
        async load(name: string, thread: Thread);
    }

    export class BaseLoader implements Loader { }

    export class FetchLoader extends BaseLoader {
        basePath: string;
        fetchOptions: RequestInit;
        constructor(basePath: string, fetchOptions?: RequestInit);
    }

    export class ES6Loader extends BaseLoader {
        basePath: string;
        constructor(basePath: string);
    }
}

declare module 'constants.js' {
    export const WORD_NAME_SYMBOL: Symbol;
    export const STACK_TRACE_SYMBOL: Symbol;
}