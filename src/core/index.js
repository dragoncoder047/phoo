/**
 * @fileoverview
 * Main import file for the Phoo core.
 * Also includes some helpers at the bottom.
 */

import { UnknownWordError } from './errors.js';
import { cloneArray, name, type } from './utils.js';
import { _PWordDef_ } from './pbase.js';
import { _PWordMap_ } from './pbase.js';
import { Namespace, Module } from './namespace.js';
import { Thread } from './threading.js';

/**
 * A Phoo interpreter.
 */
export class Phoo {
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
        /**
         * Mapping of words to code
         * @type {Namespace[]}
         * @default nothing
         */
        this.namespaceStack = namespaces;
        /**
         * Stack that working values are
         * pushed and popped from during execution.
         * @type {Array}
         * @default []
         */
        this.workStack = stack;
        /**
         * The maximum length of {@linkcode returnStack}
         * before a {@linkcode StackOverflowError} error is thrown.
         * @type {number}
         * @default 10000
         */
        this.maxDepth = maxDepth;
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
     * Create a new subthread.
     */
    thread() {
        return new Thread({
            parent: this,
            stack: cloneArray(this.stack),
            maxDepth: this.maxDepth
        });
    }

    /**
     * Run some code in a subthread.
     * @param {string} code Code to run
     * @param {boolean} [block=false] Wait until the thread finishes.
     * @returns {{promise: Promise<any[]>, t: Thread}|Promise<any[]>} The promise returned by {@linkcode Thread.run} and the thread itself, if `block` is false, otherwise the promise which can be awaited.
     */
    spawn(code, block = false) {
        var t = this.thread();
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
        // TODO #3 modules
        var def;
        for (var i = 0; i < this.namespaceStack.length && def === undefined; i++) def = this.getNamespace(i)[where].find(word);
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

/*re*/export { word, name, w } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';

//-------------------------Helpers------------------------

/**
 * Add a function easily as a word, taking the arguments in order off the
 * top of the stack and pushing the return value.
 * @param {Namespace} ns The namespace instance to add to.
 * @param {Array<string|Array<string>>} inputTypes The names of the acceptable types for each parameter.
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
        for (var i=0; i<inputTypes.length; i++) 
            args.push(this.pop());
        var result = func.apply(this, args);
        this.push(result);
    }
    ns.words.add(name, wordFunction);
}

/**
 * Naively compile the string, converting each word into its corresponding symbol,
 * not invoking builders or literalizers.
 * @param {string} string
 * @returns {symbol[]}
 */
export function naiveCompile(string) {
    return string.split(/\s+/).map(word);
}
