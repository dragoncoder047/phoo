/**
 * @fileoverview
 * Namespaces hold the definition of everything.
 */

import { WORD_NAME_SYMBOL } from './constants.js';
import { _PWordDef_ } from './pbase.js';

/**
 * Namespace that holds everything in a scope.
 * 
 */
export class Namespace {
    constructor() {
        /**
         * The map of word name to definition.
         * @type {Map<string, _PWordDef_[]>}
         * @default empty
         */
        this.map = new Map();
    }

    /**
     * Add the word to make it available.
     * @param {string} word The word to add.
     * @param {_PWordDef_} def The definition of it.
     * @throws {AlreadyDefined} if `safe` is `:::js true` and the word is already defined.
     */
    add(word, def) {
        var a = this.map.get(word) || [];
        a.push(def);
        this.map.set(word, a);
        def[WORD_NAME_SYMBOL] = word;
    }

    /**
     * Remove the word, reverting to the old definition if it had one.
     * @param {string} word The word whose definition to remove.
     * @returns {_PWordDef_} The old definition, if there was one.
     */
    
    forget(word) {
        var a = this.map.get(word) || [];
        var r = a.pop();
        this.map.set(word, a);
        return r;
    }

    /**
     * Find the definition of a word and return it.
     * @param {string} word The word to look up.
     * @returns {_PWordDef_}
     */
    find(word) {
        var w = this.forget(word);
        this.add(word, w);
        return w;
    }
}