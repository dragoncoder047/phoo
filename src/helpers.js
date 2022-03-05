/**
 * @fileoverview
 * Helpers to batch-add many words, builders, and literalizers at once,
 * quickly add regular Javascript functions as words, and some other things.
 */

import { Phoo } from "./core/index.js";
import { _PWordDef_ } from './core/pbase.js';
import { _PWordMap_ } from './core/pbase.js';
import { type } from "./core/utils.js";

/**
 * Add words in a batch.
 * @param {Phoo} this_ The Phoo instance to add to.
 * @param {_PWordMap_} words The mapping of words to definitions.
 * @param {boolean} [safe=true] Fail if the word is already defined.
 * @example
 * var myPhoo = new Phoo;
 * batchAddWords(myPhoo, {
 *     foo() { alert('in foo'); },
 *       // `this` in the function refers to the Phoo instance
 *     bar() { this.push(confirm('do you want to bar?')); },
 *     baz: [w('foo'), w('bar')]
 * })
 */
export function batchAddWords(this_, words, safe = true) {
    for (var word in Object.getOwnPropertyNames(words))
        this_.addWord(word, words[word], safe);
}

/**
 * Add builders in a batch.
 * @param {Phoo} this_ The Phoo instance to add to.
 * @param {_PWordMap_} builders The mapping of builders to definitions.
 * @param {boolean} [safe=true] Fail if the builder is already defined.
 */
export function batchAddBuilders(this_, builders, safe = true) {
    for (var builder in Object.getOwnPropertyNames(builders))
        this_.addBuilder(builder, builders[builder], safe);
}

/**
 * Add literalizers in a batch.
 * @param {Phoo} this_ The Phoo instance to add to.
 * @param {Map<RegExp, _PWordDef_>|Array} literalizers The mapping of regexp to literalizer code.
 * @example
 * var p = new Phoo;
 * batchAddLiteralizers(p, [
 *     [/^\d+$/, // primitive integer literalizer
 *      function() {
 *          var match = this.pop();
 *          this.push(+match[0]);
 *      }
 *     ],
 *     // ETC... Add more pairs as needed
 * ]);
 * @example
 * var l = new Map;
 * l.set(/^\d+$/,
 *     function() {
 *         var match = this.pop();
 *         this.push(+match[0]);
 *     }
 * );
 * // ETC... add more `set` calls as needed
 * batchAddLiteralizers(p, l);
 */
export function batchAddLiteralizers(this_, literalizers) {
    switch (type(literalizers)) {
        case 'Map':
            for (var [regexp, code] in literalizers.entries())
                this_.addLiteralizer(regexp, code);
            break;
        default:
            for (var [regexp, code] in literalizers)
                this_.addLiteralizer(regexp, code);
            break;
    }
}

/**
 * Batch-add words, literalizers, and builders.
 * @param {Phoo} this_ The Phoo instance to add to.
 * @param {Object} [stuff]
 * @param {_PWordMap_} [stuff.words] The words to add.
 * @param {_PWordMap_} [stuff.builders] The builders to add.
 * @param {Map<RegExp, _PWordDef_>|Array} [stuff.literalizers] The mapping of literalizers to add.
 * @param {boolean} [safe=true] Fail if already defined.
 */
export function batchAdd(this_, { words, builders, literalizers }, safe = true) {
    batchAddWords(this_, words, safe);
    batchAddBuilders(this_, builders, safe);
    batchAddLiteralizers(this_, literalizers);
}

/**
 * Add a function easily as a word, taking the arguments in order off the
 * top of the stack and pushing the return value.
 * @param {Phoo} this_ The Phoo instance to add to.
 * @param {Array<string|Array<string>>} inputTypes The names of the acceptable types for each parameter.
 * @param {string} [name] The name of the word (default: the `name` of the function)
 * @param {function} func The function (duh)
 * @param {boolean} [safe=true] Fail if already defined.
 */
export function addFunctionAsWord(this_, inputTypes, name, func, safe = true) {
    if (type(name) == 'function') { // allow name to be omitted
        safe = func;
        func = name;
        name = func.name;
    }
    function wordFunction() {
        var args = [];
        for (var t in inputTypes) {
            if (type(t) !== 'array') t = [t];
            args.push(this.pop(...t));
        }
        var result = func.apply(this, args);
        this.push(result);
    }
    this_.addWord(name, wordFunction, safe);
}