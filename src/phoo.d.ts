declare module 'phoo' {
    interface IPhooSettings {
        maxDepth?: number,
        strictMode?: boolean,
        namepathSeparator?: string
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

    declare type IPhooRunnable = Function | Array<IPhooRunnable>;
}