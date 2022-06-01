/**
 * @fileoverview
 * Main import file for Phoo.
 * Also includes some helpers at the bottom.
 */

import { PhooError, PhooSyntaxError, ModuleNotFoundError, TypeMismatchError, UnknownWordError } from './errors.js';
import { Module } from './namespace.js';
import { type, name, word } from './utils.js';
import { module as builtinsModule } from '../lib/_builtins.js';
import { IPhooDefinition, IPhooLiteral, Thread } from './threading.js';
import { BaseLoader } from './loaders.js';

/**
 * Configuration options.
 * @typedef {{stack: any[], maxDepth: number, disableStrictMode: boolean}} IPhooSettings
 */

/**
 * Configuration options.
 * @typedef {{settings: IPhooSettings, loaders: Loader[]}} IPhooOptions
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
     * @param {Loader[]} [opts.loaders] The loaders that will be tried to import any module.
     */
    constructor(opts) {
        // so won't get "TypeError: can't acces property 'blah' of undefined" errors;
        if (!opts) opts = {};
        if (!opts.settings) opts.settings = {};
        /**
         * Loaders that will be checked to import a module.
         * @type {BaseLoader[]}
         */
        this.loaders = opts.loaders || [];
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
        if (this.settings.strictMode) {
            throw UnknownWordError.withPhooStack(`Word ${word} does not exist`, this.returnStack);
        }
        else {
            /**
             * @this Thread
             */
            return function () {
                this.push(globalThis[word]);
            };
        }
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
    /**
     * Load the module onto the thread.
     * @param {string} module The name of the module that is to be loaded
     * @param {Thread} thread The thread to load onto.
     * @param {boolean} [force_reload=false] False if it is okay to do nothing if the module has alredy been loaded.
     */
    async import(module, thread, force_reload = false) {
        if (thread.module.imported_modules.includes(module) && !force_reload) {
            console.debug('Already imported', module);
            return;
        }
        console.debug('Trying to import', module);
        for (var ld of this.loaders) {
            var done;
            try {
                done = await ld.load(module, thread);
            } catch(e) {
                throw PhooError.wrap(e, this.returnStack);
            }
            if (done) {
                thread.module.imported_modules.push(module);
                return;
            }
        }
        throw ModuleNotFoundError.withPhooStack(`Module ${module} could not be loaded`, this.returnStack);
    }
}


/*re*/export { word, name, w, type } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';
/*re*/export * from './namespace.js';
/*re*/export * from './loaders.js';

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
 * @param {string} [bphp] Path to builtins Phoo code (because ES6 modules can't resolve non-JS files)
 * @returns {Promise<void>} When initialization is complete.
 */
export async function initBuiltins(t, bphp = './lib/builtins.ph') {
    t.module.copyFrom(builtinsModule);
    var resp = await fetch(bphp);
    if (!resp.ok)
        throw new ModuleNotFoundError('Fetch error');
    await t.run(await resp.text());
}
