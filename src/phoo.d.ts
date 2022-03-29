declare module 'phoo' {
    interface IPhooSettings {
        maxDepth?: number,
        strictMode?: boolean,
        namepathSeparator?: string,
    }

    interface IPhooOptions {
        settings?: IPhooSettings,
        modules?: Map<string, Module>,
    }

    export declare class Phoo {
        settings: IPhooSettings;
        modules: Map<string, Module>;
        constructor(opts: IPhooOptions): Phoo;
        undefinedWord(word: string): IPhooRunnable;
        createThread(module: string, scopes: Scope[], modules: Module[], starModules: Module[], stack: any[]): Thread;
        findModule(moduleName: string): Module;
    }
}

declare module 'phoo/threading' {
    interface IThreadOptions {
        parent: Phoo,
        module: Module,
        starModules: Module[],
        modules: Map<string, Module>,
        stack: any[],
        scopes: Scope[],
        maxDepth: number,
    }

    export declare class Thread {
        phoo: Phoo;
        module: Module;
        starModules: Module[];
        workStack: any[];
        scopeStack: Scope[];
        returnStack: IReturnStackEntry[];
        maxDepth: number;
        lock: Threadlock;
        constructor(opts: IThreadOptions): Thread;
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

    }

    declare type IPhooRunnable = Function | IPhooLiteral | IPhooRunnable[];
    declare type IPhooLiteral = any;
    declare type IReturnStackEntry = { pc: number; arr: IPhooRunnable[] };
    declare type IPhooDefinition = Function | Symbol | IPhooRunnable;
}