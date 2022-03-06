/**
 * @fileoverview
 * Main import file for the Phoo core.
 */

import { UnknownWordError } from './errors.js';
import { PBase } from './pbase.js';
import { name, clone as cloneObject, cloneArray, type } from './utils.js';
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
    resolve(word, kind = 'words') {
        // TODO fixme
        var def;
        for (var i = 0; i < this.namespaceStack.length && def === undefined; i++) def = this.getNamespace(i)[kind].find(word);
        if (def === undefined)
            def = this.undefinedWord(word);
        if (type(def) === 'symbol')
            return this.resolve(name(def));
        return def;
    }

    /**
     * Overrides [the same-named method]{@link PBase.compileLiteral} in {@linkcode PBase}.
     *
     * Sequentially goes through and checks each regular expression
     * in {@linkcode Phoo.literalizers|:::js this.literalizers}, and when one matches, it pushes
     * the match result, runs the corresponding code, and pushes the
     * top value on the stack to the compiled array.
     * @param {string} word The word to be converted.
     * @param {Array} a The current array being compiled.
     * @returns {Promise<boolean>} Whether processing succeeded.
     */
    async compileLiteral(word, a) {
        for (var [regex, code] in this.literalizers) {
            var result = regex.exec(word);
            if (result) {
                this.push(result);
                this._safeToRun = true; // HACK #1 - somehow it works
                await this.run(code);
                this._safeToRun = false;
                a.push(this.pop());
                return true;
            }
        }
        return false;
    }

    /**
     * Called to dynamically create the definition of a word when {@linkcode Phoo.resolve}
     * otherwise fails to find it. See property [strictMode]{@linkcode Phoo.strictMode} for the behavior of this.
     * @param {string} word The word that is not defined.
     * @returns {_PWordDef_} The temporary definition of the word.
     */
    undefinedWord(word) {
        if (this.strictMode)
            throw UnknownWordError.withPhooStack(`Word ${word} does not exist`, this.returnStack);
        /**
         * @this Phoo
         */
        else return function () {
            this.push(globalThis[word]);
        };
    }

    /**
     * Callback when a non-array is encountered
     * during execution. Functions are simply called.
     * 
     * See property [strictMode]{@linkcode Phoo.strictMode} for the behavior of this.
     * @param {any} item Thing to be dealt with.
     */
    async executeOneItem(item) {
        if (type(item) === 'symbol')
            item = this.resolve(name(item));
        if (item === 'use loose')
            this.strictMode = false;
        else if (item === 'use strict')
            this.strictMode = true;
        else if (type(item) === 'function') {
            this._safeToRun = true; // see issue #1
            await item.call(this);
            this._safeToRun = false;
        }
        else
            this.push(item);
    }

    /**
     * Clone this instance.
     * @param {boolean} [recursive=true] Recursively clone words/builders/literalizers, the stack, and parent and child modules.
     * @returns {Phoo}
     */
    clone(recursive = true) {
        var c = new Phoo({
            words: cloneObject(this.words, recursive),
            builders: cloneObject(this.builders, recursive),
            literalizers: cloneObject(this.literalizers, recursive),
            stack: cloneArray(this.stack, recursive, true),
            maxDepth: this.maxDepth,
            moduleName: this.moduleName,
            parentModule: recursive ? this.parentModule.clone(true) : this.parentModule,
            strictMode: this.strictMode,
        });
        c.children = recursive ? this.children.map(c => c.clone(true)) : this.children.slice();
        return c;
    }
}

/*re*/export { word, name, w } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';