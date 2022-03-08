/**
 * @fileoverview
 * Namespaces hold the definition of everything.
 */

import { WORD_NAME_SYMBOL } from './constants.js';
import { _PWordDef_ } from './index.js';

/**
 * A `SimpleNamespace` holds only one type of thing in a scope.
 */
export class SimpleNamespace {
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
     * 
     * The old definition is not lost, it is just hidden by the new one
     * and will come back if the new one is forgotten (using {@linkcode forget}).
     * @param {string} name The word to add.
     * @param {_PWordDef_} def The definition of it.
     */
    add(name, def) {
        var a = this.map.get(name) || [];
        a.push(def);
        this.map.set(name, a);
        def[WORD_NAME_SYMBOL] = name;
    }

    /**
     * Remove the word, reverting to the old definition if there was one.
     * @param {string} name The word whose definition to remove.
     * @returns {_PWordDef_} The old definition, if there was one.
     */

    forget(name) {
        var a = this.map.get(name) || [];
        var r = a.pop();
        this.map.set(name, a);
        return r;
    }

    /**
     * Find the definition of a word and return it.
     * @param {string} name The word to look up.
     * @returns {_PWordDef_}
     */
    find(name) {
        var w = this.forget(name);
        this.add(name, w);
        return w;
    }
}

/**
 * The namespace type that Phoo usually uses, holding words, builders, and literalizers.
 */
export class Namespace {
    constructor() {
        this.words = new SimpleNamespace();
        this.builders = new SimpleNamespace();
        this.literalizers = new SimpleNamespace();
    }
}

/**
 * A module is a named namespace that usually encloses a file.
 */
export class Module extends Namespace {
    /**
     * @param {string} name The name of the module
     */
    constructor(name) {
        super();
        /**
         * @type {string}
         */
        this.name = name;
        /**
         * @type {Module[]}
         */
        this.submodules = [];
    }

    /**
     * Look up the module in submodules
     * @param {string} n module name
     * @returns {Module|null}
     */
    findSubmodule(n) {
        if (n == this.name) return this;
        for (var s of this.submodules) {
            if (s.name == n) return s;
            var ss = s.findSubmodule(n);
            if (ss) return ss;
        }
        return null;
    }
}
