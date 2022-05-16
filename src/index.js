/**
 * @fileoverview
 * Main import file for Phoo.
 * Also includes some helpers at the bottom.
 */

import { PhooSyntaxError, ModuleNotFoundError, TypeMismatchError, UnknownWordError } from './errors.js';
import { Module } from './namespace.js';
import { type, name, word } from './utils.js';
import { module as builtinsModule } from '../lib/builtins.js';
import { IPhooDefinition, IPhooLiteral, Thread } from './threading.js';
import { BaseImporter } from './importers.js';

/**
 * Configuration options.
 * @typedef {{stack: any[], maxDepth: number, disableStrictMode: boolean}} IPhooSettings
 */

/**
 * Configuration options.
 * @typedef {{settings: IPhooSettings, importers: Importer[]}} IPhooOptions
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
     * @param {Importer[]} [opts.importers] The importers that will be tried to import any module.
     */
    constructor(opts) {
        // so won't get "TypeError: can't acces property 'blah' of undefined" errors;
        if (!opts) opts = {};
        if (!opts.settings) opts.settings = {};
        /**
         * Importers that will be checked to import a module.
         * @type {BaseImporter[]}
         */
        this.importers = opts.importers || [];
        /**
         * Cache of all threads created, by name.
         * @type {Map<string, Module>}
         */
        this.threadCache = new Map();
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
             * **Only turn strict mode off if you know what you are doing.**
             * A typo leading to an undefined word will not be flagged as such, it will instead push
             * whatever that bad key looks up on the global object (likely `:::js undefined`), and lead
             * to all sorts of cryptic errors unrelated to what the problem actually is.
             * 
             * Strict mode can be turned off with `:::phoo #pragma strictMode false`
             * and back on with `:::phoo #pragma strictMode true`.
             * @type {boolean}
             * @default true
             */
            strictMode: !opts.settings.disableStrictMode,
        };
    }

    /**
     * Called to dynamically create the definition of a word when lookup
     * otherwise fails to find it. See property [strictMode]{@linkcode Phoo.strictMode} for the behavior of this.
     * @param {string} word The word that is not defined.
     * @returns {IPhooDefinition} The temporary definition of the word.
     */
    undefinedWord(word) {
        if (this.strictMode)
            /**
             * @this Thread
             */
            return function () {
                throw UnknownWordError.withPhooStack(`Word ${word} does not exist`, this.returnStack);
            }
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
     * @param {Map<symbol, Module>} modules The list of already-imported modules so the user doesn't have to import them.
     * @param {Module[]} starModules Same as modules, but no foo: prefix is needed (as if they were imported using import*).
     * @param {IPhooLiteral[]} stack The initial items on the stack.
     */
    createThread(module, stack) {
        var m;
        if (this.threadCache.has(module)) m = this.threadCache.get(module);
        else {
            m = new Module(module);
            this.threadCache.set(module, m);
        }
        return new Thread({
            parent: this,
            module: m,
            stack,
            maxDepth: this.settings.maxDepth,
        });
    }
}


/*re*/export { word, name, w, type } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';
/*re*/export * from './namespace.js';
/*re*/export * from './importers.js';

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
 * Runs the builtin modules on the Phoo thread, initializing it for basic use.
 * @param {Thread} t The thread to load onto.
 * @returns {Promise<void>} When initialization is complete.
 */
export async function initBuiltins(t) {
    throw 'todo';
    t.modules.set('__builtins__', builtinsModule);
    var resp = await fetch('./lib/builtins.ph');
    if (!resp.ok)
        throw new ModuleNotFoundError('Fetch error');
    await t.run(await resp.text());
}
