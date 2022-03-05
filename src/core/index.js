/**
 * @fileoverview
 * Main import file for the Phoo core.
 */

import { AlreadyDefinedError, UnknownWordError } from './errors.js';
import { PBase } from './pbase.js';
import { WORD_NAME_SYMBOL } from './constants.js';
import { name, clone as cloneObject, cloneArray, type } from './utils.js';

/**
 * A Phoo interpreter.
 *
 * Inherits methods from {@linkcode PBase}.
 */
export class Phoo extends PBase {
    /**
     * @param {Object} [opts={}]
     * @param {Array<any>} [opts.stack=[]] The initial items into the stack.
     * @param {_PWordMap_} [opts.words={}] The initial words to use,
     * @param {_PWordMap_} [opts.builders={}] The initial builders to use.
     * @param {Map<RegExp, _PWordDef_>} [opts.literalizers=new Map] The mapping of regular expression to processor code.
     * @param {number} [opts.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     * @param {string} [opts.moduleName=''] The name of the module this Phoo instance is managing.
     * @param {string} [opts.aliasName=opts.moduleName] The aliased name (i.e., set with `import foo as bar`)
     * @param {Phoo} [opts.parentModule] The reference to the parent module that imported this one.
     * @param {boolean} [opts.strictMode=true] Enable or disable strict mode (see {@linkcode Phoo.strictMode})
     * @param {string} [opts.namepathSeparator=':'] Separator used to split name paths in modules (e.g. `math:sqrt`)
     */
    constructor({
        words = {},
        builders = {},
        literalizers = new Map(),
        stack = [],
        maxDepth = 10000,
        moduleName = '',
        aliasName,
        parentModule = null,
        strictMode = true,
        namepathSeparator: namepathSeparator = ':',
    }) {
        super({ words, builders, stack, maxDepth });
        /**
         * Map of regex to code that will transform
         * single-word literal values into the actual value.
         * @type {Map<RegExp, _PWordDef_>}
         */
        this.literalizers = literalizers;
        /**
         * The name of the module this Phoo instance is managing.
         * @type {string}
         */
        this.moduleName = moduleName;
        /**
         * The alias name (i.e., set with `import foo as bar`)
         * @type {string}
         */
        this.aliasName = aliasName || moduleName;
        /**
         * The parent module that imported this one.
         * @type {Phoo}
         */
        this.parentModule = parentModule;
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
     * Overrides [the same-named method]{@link PBase.lookupWord} in {@linkcode PBase}.
     *
     * Looks up the word in {@linkcode PBase.words|:::js this.words}.
     * @param {string} word The word to be looked up.
     * @returns {_PWordDef_}
     */
    lookupWord(word) {
        var def = this.words[word];
        if (def === undefined)
            def = this.undefinedWord(word);
        if (type(def) === 'symbol')
            return this.lookupWord(name(def));
        return def;
    }

    /**
     * Overrides [the same-named method]{@link PBase.lookupBuilder} in {@linkcode PBase}.
     *
     * Looks up the builder in {@linkcode PBase.words|:::js this.builders}.
     * @param {string} builder The builder to be looked up.
     * @returns {_PWordDef_}
     */
    lookupBuilder(builder) {
        return this.builders[builder];
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
                this._safeToRun = true; // kludgey, but it works
                await this.run(code);
                this._safeToRun = false;
                a.push(this.pop());
                return true;
            }
        }
        return false;
    }

    /**
     * Called to dynamically create the definition of a word when {@linkcode Phoo.lookupWord}
     * otherwise fails to find it. See property [strictMode]{@linkcode Phoo.strictMode} for the behavior of this.
     * @param {string} word The word that is not defined.
     * @returns {_PWordDef_} The temporary definition of the word.
     */
    undefinedWord(word) {
        if (this.strictMode) throw UnknownWordError.withPhooStack(`Word ${word} does not exist`, this.returnStack);
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
            item = this.lookupWord(name(item));
        if (item === 'use loose')
            this.strictMode = false;
        else if (item === 'use strict')
            this.strictMode = true;
        else if (type(item) === 'function') {
            this._safeToRun = true;
            await item.call(this);
            this._safeToRun = false;
        }
        else
            this.push(item);
    }

    /**
     * Add the word to make it available.
     * @param {string} word The word to add.
     * @param {_PWordDef_} def The definition of it.
     * @param {boolean} [safe=true] Fail if already defined.
     * @throws {AlreadyDefined} if `safe` is `:::js true` and the word is already defined.
     */
    addWord(word, def, safe = true) {
        if (safe && this.words[word] !== undefined) throw new AlreadyDefinedError(`Word ${word} is already defined`);
        this.words[word] = def;
        def[WORD_NAME_SYMBOL] = word;
    }

    /**
     * Add the builder to make it available.
     * @param {string} builder The builder to add.
     * @param {_PWordDef_} def The definition of it.
     * @param {boolean} [safe=true] Fail if already defined.
     * @throws {AlreadyDefined} if `safe` is `:::js true` and the builder is already defined.
     */
    addBuilder(builder, def, safe = true) {
        if (safe && this.builders[builder] !== undefined) throw new AlreadyDefinedError(`Builder ${builder} is already defined`);
        this.builders[builder] = def;
    }

    /**
     * Add the literalizer.
     *
     * Note: This will not affect any arrays or word that have already been compiled.
     * @param {RegExp} regex The regular expression to match against.
     * @param {_PWordDef_} def The code to run when it matches.
     */
    addLiteralizer(regex, def) {
        this.literalizers.set(regex, def);
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

import { _PWordDef_ } from './pbase.js';
import { _PWordMap_ } from './pbase.js';

/*re*/export { word, name, w } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';