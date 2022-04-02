/**
 * @fileoverview
 * Namespaces hold the definition of everything.
 */

import { WORD_NAME_SYMBOL } from './constants.js';
import { IPhooDefinition } from './threading.js';
import { type } from './utils.js';

/**
 * A `SimpleNamespace` holds only one type of thing in a scope.
 */
export class SimpleNamespace {
    constructor() {
        /**
         * The map of word name to definition.
         * @type {Map<string, IPhooDefinition[]>}
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
     * @param {IPhooDefinition} def The definition of it.
     */
    add(name, def) {
        var a = this.map.get(name) || [];
        a.push(def);
        this.map.set(name, a);
        if (type(def) !== 'symbol') def[WORD_NAME_SYMBOL] = name;
    }

    /**
     * Remove the word, reverting to the old definition if there was one.
     * @param {string} name The word whose definition to remove.
     * @returns {IPhooDefinition} The old definition, if there was one.
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
     * @returns {IPhooDefinition}
     */
    find(name) {
        var l = this.map.get(name) || [];
        return l[l.length - 1];
    }
}

/**
 * The namespace type that Phoo usually uses, holding words, macros, and literalizers.
 */
export class Namespace {
    constructor() {
        this.words = new SimpleNamespace();
        this.macros = new SimpleNamespace();
        this.literalizers = new SimpleNamespace();
    }
}

export class Scope extends Namespace {
    constructor(loaded_modules, star_modules) {
        super();
        this.loadedModules = [];
        this.starModules = [];
    }
}

/**
 * A module is a named namespace that usually encloses a file.
 */
export class Module extends Scope {
    /**
     * @param {string} name The name of the module
     */
    constructor(name) {
        super();
        /**
         * @type {string}
         */
        this.name = name;
    }
}
