/**
 * @fileoverview
 * Base file for Phoo main class.
 */

import { UnknownWordError } from './errors.js';
import { name, type } from './utils.js';
import { _PWordDef_, _PWordMap_ } from './threading.js';
import { Namespace, Module } from './namespace.js';
import { Thread } from './threading.js';

/**
 * Base class for Phoo interpreter.
 */
export class BasePhoo {
    /**
     * @param {Object} [opts={}] options
     * @param {Object} [opts.settings] Settings to start a new Thread with.
     * @param {Array<any>} [opts.settings.stack=[]] The initial items into the stack.
     * @param {number} [opts.settings.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     * @param {boolean} [opts.settings.strictMode=true] Enable or disable strict mode (see {@linkcode Phoo.strictMode})
     * @param {string} [opts.settings.namepathSeparator=':'] Separator used to split name paths in modules (e.g. `math:sqrt`)
     * @param {Module} [opts.mainModule] The global (`__main__`) module
     */
    constructor(opts) {
        /**
         * Settings to start a new thread with.
         * @type {object}
         */
        this.settings = Object.assign({ stack: [], maxDepth: 10000, strictMode: true, namepathSeparator: ':' }, opts.settings);
        /**
         * The maximum length of {@linkcode returnStack}
         * before a {@linkcode StackOverflowError} error is thrown.
         * @type {number}
         * @default 10000
         */
        this.maxDepth = maxDepth;
        /**
         * The `__main__` module.
         * @type {Module}
         */
        this.mainModule = mainModule;
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
        this.strictMode = strictMode;
        /**
         * Separator used to split name paths in modules (e.g. `math:sqrt`)
         * @type {string}
         * @default ':'
         */
        this.namepathSeparator = namepathSeparator;
    }

    /**
     * Create a new subthread.
     * ///////@param {Module} [module] The module that this thread runs.
     */
    thread({ module, stack = [] }) {
        return new Thread({
            parent: this,
            module: module || this.mainModule,
            stack,
            maxDepth: this.maxDepth
        });
    }

    /**
     * Run some code in a subthread.
     * @param {string} code Code to run
     * @param {boolean} [block=false] Wait until the thread finishes.
     * @param {Module} [module] The module to run in.
     * @returns {{promise: Promise<any[]>, t: Thread}|Promise<any[]>} The promise returned by {@linkcode Thread.run} and the thread itself, if `block` is false, otherwise the promise which can be awaited.
     */
    spawn(code, block = false, module) {
        var t = this.thread({ module, stack: this.stack });
        var promise = t.run(code);
        if (block) return promise;
        return { promise, t };
    }

    /**
     * Find the namespace in the namespace stack.
     * @param {number} idx The depth in the stack to look.
     * @returns {Namespace}
     */
    getNamespace(idx) {
        return this.namespaceStack[this.namespaceStack.length - 1 - idx];
    }

    /**
     * Recursively look up the word/builder's definition, following symlinks and traversing the module tree.
     * @param {string} word The name of the word/builder
     * @param {'words'|'builders'} [where='words'] Words or builders.
     * @returns {_PWordDef_}
     */
    resolveNamepath(word, where = 'words') {
        var def, nps = this.namepathSeparator;
        if (word.indexOf(nps) > -1) {
            var s;
            if (word.startsWith(nps)) {
                s = word.slice(nps.length).split(nps).concat([nps]);
            } else {
                s = word.split(nps);
            }
            def = this.main.findSubmodule(s[0]);
            for (var p of s.slice(1, -1)) {
                def = def.findSubmodule(p);
                if (def === undefined) break;
            }
            if (def !== undefined && s[s.length - 1] !== nps) {
                def = def[where].find(s[s.length - 1]);
            }
        } else {
            for (var i = 0; i < this.namespaceStack.length && def === undefined; i++) def = this.getNamespace(i)[where].find(word);
        }
        if (def === undefined)
            def = this.undefinedWord(word);
        if (type(def) === 'symbol')
            return this.resolveNamepath(name(def), where);
        return def;
    }

    /**
     * Called to dynamically create the definition of a word when {@linkcode Phoo.resolveNamepath}
     * otherwise fails to find it. See property [strictMode]{@linkcode Phoo.strictMode} for the behavior of this.
     * @param {string} word The word that is not defined.
     * @returns {_PWordDef_} The temporary definition of the word.
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
}
