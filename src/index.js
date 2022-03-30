/**
 * @fileoverview
 * Main import file for Phoo.
 * Also includes some helpers at the bottom.
 * Contains functions defining the import system of Phoo, and for starting a fresh new Phoo instance.
 *
 * This module assumes a browser environment (i.e., the [`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * and [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#:~:text=There%20is%20also%20a%20function-like%20dynamic%20import()) APIs),
 * so you will need to edit this file if you are using Nodejs.
 */

import { BadSyntaxError, ModuleNotFoundError, TypeMismatchError, UnknownWordError } from './errors.js';
import { Module } from './namespace.js';
import { type, name, word } from './utils.js';
import { module as builtinsModule } from '../lib/builtins.js';
import { IPhooDefinition, IPhooLiteral, Thread } from './threading.js';
import { BaseImporter } from './importers.js';

/**
 * Configuration options.
 * @typedef {{stack: any[], maxDepth: number, disableStrictMode: boolean, namepathSeparator: string, parentDirectoryMarker: string}} IPhooSettings
 */

/**
 * Configuration options.
 * @typedef {{settings: IPhooSettings, modules: Map<string, Module>, importers: Importer}} IPhooOptions
 */

/**
 * A Phoo interpreter.
 */
export class Phoo {
    /**
     * @param {IPhooOptions} [opts={}] options
     * @param {IPhooSettings} [opts.settings={}] Settings to start a new Thread with.
     * @param {any[]} [opts.settings.stack=[]] The initial items into the stack.
     * @param {number} [opts.settings.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     * @param {boolean} [opts.settings.disableStrictMode=false] Disable strict mode (see {@linkcode Phoo.strictMode})
     * @param {string} [opts.settings.namepathSeparator=':'] Separator used to split name paths in modules (e.g. `math:sqrt`)
     * @param {string} [opts.settings.parentDirectoryMarker='^'] Marker used to mark a parent directory in module paths (e.g. `:^:foo` from inside `bar:baz` will import `foo`).
     * @param {Map<string, Module>} [opts.modules] The loaded-modules cache.
     * @param {Importer[]} [opts.importers] The importers that will be tried to import any module.
     */
    constructor(opts) {
        // so won't get "TypeError: can't acces property 'blah' of undefined" errors;
        if (!opts) opts = {};
        if (!opts.settings) opts.settings = {};
        /**
         * Start stack of scopes to start a thread with.
         * @type {Namespace[]}
         */
        this.initialScopeStack = [];
        /**
         * The loaded-modules cache.
         * @type {Map<string, Module>}
         */
        this.modules = opts.modules || new Map();
        /**
         * Importers that will be checked to import a module.
         * @type {BaseImporter[]}
         */
        this.importers = opts.importers || [];
        /**
         * Settings to start a new thread with.
         * @type {IPhooSettings}
         */
        this.settings = {
            /**
             * The maximum length of {@linkcode returnStack}
             * before a {@linkcode StackOverflowError} error is thrown.
             * @type {number}
             * @default 10000
             */
            maxDepth: opts.settings.maxDepth || 10000,
            /**
             * Whether strict mode is enabled.
             *
             * * Strict mode ON: Undefined words throw an error.
             * * Strict mode OFF: Undefined words are simply looked up under the global object (i.e. `:::js globalThis`) and pushed to the stack.
             *
             * Strict mode can be turned off by including the string `:::js "use loose"`,
             * and on again by `:::js "use strict"`.
             *
             * **Only turn strict mode off if you know what you are doing.**
             * A typo leading to an undefined word will not be flagged as such, it will instead push
             * whatever that bad key looks up on the global object (likely `:::js undefined`), and lead
             * to all sorts of cryptic errors unrelated to what the problem actually is.
             * @type {boolean}
             * @default true
             */
            strictMode: !opts.settings.disableStrictMode,
            /**
             * Separator used to split name paths in modules (e.g. `math:sqrt`)
             * @type {string}
             * @default ':'
             */
            namepathSeparator: opts.settings.namepathSeparator || ':',
            /**
             * Marker used to mark a parent directory in module paths (e.g. `:^:foo` from inside `bar:baz` will import `foo`).
             * @type {string}
             * @default '^'
             */
            parentDirectoryMarker: opts.settings.parentDirectoryMarker || '^',
        };
    }

    /**
     * Called to dynamically create the definition of a word when {@linkcode Phoo.resolveNamepath}
     * otherwise fails to find it. See property [strictMode]{@linkcode Phoo.strictMode} for the behavior of this.
     * @param {string} word The word that is not defined.
     * @returns {IPhooDefinition} The temporary definition of the word.
     */
    undefinedWord(word) {
        if (this.strictMode)
            throw UnknownWordError.withPhooStack(`Word ${word} does not exist`, this.returnStack);
        /**
         * @this Thread
         */
        else return function () {
            this.push(globalThis[word]);
        };
    }

    /**
     * Create a new subthread.
     * @param {string} module The name of the module the thread will run under.
     * @param {Scope[]} scopes A list of scopes to start within.
     * @param {Module[]} modules The list of already-imported modules so the user doesn't have to import them.
     * @param {Module[]} starModules Same as modules, but no foo: prefix is needed (as if they were imported using import*).
     * @param {IPhooLiteral[]} stack The initial items on the stack.
     */
    createThread(module, scopes, modules, starModules, stack) {
        return new Thread({
            parent: this,
            module: this.findModule(module),
            stack,
            maxDepth: this.settings.maxDepth,
            starModules,
            scopes,
            modules,
        });
    }

    /**
     * Return the module if it was laready loaded, or an empty module if it was not.
     * 
     * This does **not** import the module.
     * @param {string} moduleName The name of the module.
     * @returns {Module}
     */
    findModule(moduleName) {
        // Modules are singletons; this ensures it.
        if (this.modules.has(moduleName)) return this.modules.get(moduleName);
        else {
            var module = new Module(moduleName);
            this.modules.set(moduleName, module);
            return module;
        }
    }

    /**
     * Fully qualify the name into an absolute module path.
     * Ex: Inside module `foo`, importing `:bar` will fully-qualify to `foo:bar`.
     * @param {string} relativeName The name relative to the current module
     * @param {Module} current The module that is importing the other module.
     * @returns {string} The fully-qualified name.
     */
    qualifyName(relativeName, current) {
        throw 'todo';
    }

    /**
     * Turn the name into a URL that always uses slashes as the namepath separator, but without the filename extension.
     * @param {string} name The fully-qualified path.
     * @returns {string} The URL of the module. No filename extension (.ph or .js)
     */
    nameToURL(name) {
        throw 'todo';
    }
}


/*re*/export { word, name, w, type } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';
/*re*/export * from './namespace.js';

//-------------------------Helpers------------------------

/**
 * Add a function easily as a word, taking the arguments in order off the
 * top of the stack and pushing the return value.
 * @param {Namespace} ns The namespace instance to add to.
 * @param {Array<string|RegExp>} inputTypes The names of the acceptable types for each parameter.
 * @param {string} [name] The name of the word (default: the `name` of the function)
 * @param {function} func The function (duh)
 */
export function addFunctionAsWord(ns, inputTypes, name, func) {
    if (type(name) == 'function') { // allow name to be omitted
        func = name;
        name = func.name;
    }
    function wordFunction() {
        this.expect(...inputTypes);
        var args = [];
        for (var i = 0; i < inputTypes.length; i++)
            args.push(this.pop());
        this.push(func.apply(this, args));
    }
    ns.words.add(name, wordFunction);
}

/**
 * Naively compile the string, converting each word into its corresponding symbol,
 * not invoking macros or literalizers.
 * @param {string} string
 * @returns {symbol[]}
 */
export function naiveCompile(string) {
    return string.split(/\s+/).map(word);
}

// cSpell:ignore symstr

/**
 * Runs the builtin modules on the Phoo instance, initializing it for basic use.
 * @param {Phoo} p The {@linkcode Phoo} instance to load onto.
 * @returns {Promise<void>} When initialization is complete.
 */
export async function initBuiltins(p) {
    if (!p.modules.has('__builtins__')) {
        p.modules.set('__builtins__', builtinsModule);
        var resp = await fetch('./lib/builtins.ph');
        if (!resp.ok)
            throw new ModuleNotFoundError('Fetch error');
        var thread = p.createThread('__builtins__');
        await thread.run(await resp.text());
    }
}
