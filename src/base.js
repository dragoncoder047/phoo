/**
 * @fileoverview
 * Base file for Phoo main class.
 */

import { UnknownWordError } from './errors.js';
import { _PWordDef_, _PWordMap_ } from './threading.js';
import { Module } from './namespace.js';
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
        this.settings.maxDepth = this.settings.maxDepth;
        /**
         * The `__main__` module.
         * @type {Module}
         */
        this.mainModule = opts.mainModule;
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
        this.settings.strictMode = this.settings.strictMode;
        /**
         * Separator used to split name paths in modules (e.g. `math:sqrt`)
         * @type {string}
         * @default ':'
         */
        this.settings.namepathSeparator = this.settings.namepathSeparator;
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
