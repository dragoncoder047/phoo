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
import { IPhooDefinition, Thread } from './threading.js';

/**
 * A Phoo interpreter.
 */
export class Phoo {
    /**
     * @param {Object} [opts={}] options
     * @param {Object} [opts.settings={}] Settings to start a new Thread with.
     * @param {Array<any>} [opts.settings.stack=[]] The initial items into the stack.
     * @param {number} [opts.settings.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     * @param {boolean} [opts.settings.strictMode=true] Enable or disable strict mode (see {@linkcode Phoo.strictMode})
     * @param {string} [opts.settings.namepathSeparator=':'] Separator used to split name paths in modules (e.g. `math:sqrt`)
     * @param {Map<string, Module>} [opts.modules] The loaded-modules cache.
     */
    constructor(opts) {
        /**
         * Settings to start a new thread with.
         * @type {object}
         */
        this.settings = {};
        opts.settings = {}; // so won't get "TypeError: can't acces property 'maxDepth' of undefined" errors
        /**
         * The maximum length of {@linkcode returnStack}
         * before a {@linkcode StackOverflowError} error is thrown.
         * @type {number}
         * @default 10000
         */
        this.settings.maxDepth = opts.settings.maxDepth || 10000;
        /**
         * Start stack of scopes to start a thread with.
         * @type {Namespace[]}
         */
        this.initialScopeStack = [];
        /**
         * Whether strict mode is enabled.
         *
         * Strict mode ON:
         *
         * * Undefined words cause an error.
         * * Trying to redefine a word that is already defined will also cause an error. It must be explicitly deleted first.
         *
         * Strict mode OFF:
         *
         * * Undefined words are simply looked up under the global object (i.e. `:::js globalThis`) and pushed to the stack.
         * * Words do not need to be deleted before they are redefined.
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
        this.settings.strictMode = opts.settings.strictMode || true;
        /**
         * Separator used to split name paths in modules (e.g. `math:sqrt`)
         * @type {string}
         * @default ':'
         */
        this.settings.namepathSeparator = opts.settings.namepathSeparator || ':';
        /**
         * The loaded-modules cache.
         * @type {Map<string, Module>}
         */
        this.modules = opts.modules || new Map();
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

    // /**
    //  * Clone this instance.
    //  * @returns {Phoo}
    //  */
    // clone() {
    //     var c = new Phoo({
    //         // FIXME HERE
    //         namespaces: this.namespaceStack.slice(),
    //         stack: cloneArray(this.stack, recursive, true),
    //         maxDepth: this.maxDepth,
    //         moduleName: this.moduleName,
    //         parentModule: recursive ? this.parentModule.clone(true) : this.parentModule,
    //         strictMode: this.strictMode,
    //     });
    //     c.children = recursive ? this.children.map(c => c.clone(true)) : this.children.slice();
    //     return c;
    // }

    /**
     * Create a new subthread.
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

    findModule(moduleName) {
        // Modules are singletons; this ensures it.
        if (this.modules.has(moduleName)) return this.modules.get(moduleName);
        else {
            var module = new Module(moduleName);
            this.modules.set(moduleName, module);
            return module;
        }
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
    if (!p.mainModule.findSubmodule('__builtins__')) {
        p.mainModule.submodules.set('__builtins__', builtinsModule);
        var resp = await fetch('./lib/builtins.ph');
        if (resp.status >= 300)
            throw new ModuleNotFoundError('Fetch error');
        await p.spawn(await resp.text(), builtinsModule, true);
    }
}
