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

import { BasePhoo } from './base.js';
import { BadSyntaxError, ModuleNotFoundError, TypeMismatchError } from './errors.js';
import { Module } from './namespace.js';
import { type, name, word } from './utils.js';
import { module as builtinsModule } from '../lib/builtins.js';

/**
 * A Phoo interpreter.
 */
export class Phoo extends BasePhoo {
    /**
     * @param {Object} [opts={}] options
     * @param {Object} [opts.settings] Settings to start a new Thread with.
     * @param {Array<any>} [opts.settings.stack=[]] The initial items into the stack.
     * @param {number} [opts.settings.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     * @param {boolean} [opts.settings.strictMode=true] Enable or disable strict mode (see {@linkcode Phoo.strictMode})
     * @param {string} [opts.settings.namepathSeparator=':'] Separator used to split name paths in modules (e.g. `math:sqrt`)
     * @param {Module} [opts.mainModule] The global (`__main__`) module
     * @param {Map<string, Module>} [opts.modules] The loaded modules cache.
     */
    constructor(opts) {
        super(opts);
        this.modules = opts.modules || new Map();
    }

    /**
     * Create a new subthread.
     */
    createThread(module, scopes, modules, starModules, stack) {
        return new Thread({
            parent: this,
            module: this.findModule(module) || new Module(module), // default to empty module
            stack,
            maxDepth: this.settings.maxDepth,
            starModules,
            scopes,
        });
    }

    findModule(moduleName) {
        if (this.modules.has(moduleName)) return this.modules.get(moduleName);
        else return undefined;
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
