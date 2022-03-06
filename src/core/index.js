/**
 * @fileoverview
 * Main import file for the Phoo core.
 */

import { UnknownWordError } from './errors.js';
import { PBase } from './pbase.js';
import { name, type } from './utils.js';
import { _PWordDef_ } from './pbase.js';
import { _PWordMap_ } from './pbase.js';
import { Namespace, Module } from './namespace.js';

/**
 * A Phoo interpreter.
 *
 * Inherits methods from {@linkcode PBase}.
 */
export class Phoo extends PBase {
    /**
     * @param {Object} [opts={}]
     * @param {Array<any>} [opts.stack=[]] The initial items into the stack.
     * @param {Namespace[]} [opts.namespaces] The initial namespace stack.
     * @param {Module[]} [opts.modules] The initial cache of modules.
     * @param {number} [opts.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     * @param {boolean} [opts.strictMode=true] Enable or disable strict mode (see {@linkcode Phoo.strictMode})
     * @param {string} [opts.namepathSeparator=':'] Separator used to split name paths in modules (e.g. `math:sqrt`)
     */
    constructor({
        namespaces = [],
        modules = [],
        stack = [],
        maxDepth = 10000,
        strictMode = true,
        namepathSeparator = ':',
    }) {
        super({ namespaces, stack, maxDepth });
        /**
         * Modules that can be looked up by name.
         * @type {Module[]}
         */
        this.modules = modules;
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
     * @private
     */
    getNamespace(idx) {
        return this.namespaceStack[this.namespaceStack.length - 1 - idx];
    }

    /**
     * @private
     */
    resolveNamepath(word, kind = 'words') {
        // TODO modules
        var def;
        for (var i = 0; i < this.namespaceStack.length && def === undefined; i++) def = this.getNamespace(i)[kind].find(word);
        if (def === undefined)
            def = this.undefinedWord(word);
        if (type(def) === 'symbol')
            return this.resolveNamepath(name(def), kind);
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

/*re*/export { word, name, w } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';