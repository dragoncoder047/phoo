/**
 * @fileoverview
 * Contains base classes for random number generators.
 */

import { clone } from '../../core/utils.js';

/**
 * Base class for random number generators.
 */
export class Random {
    /**
     * @param {*} seed The initial seed value.
     */
    constructor(seed) {
        this.seed(seed);
    }

    /**
     * Re-initialize the generator to a new seed.
     * @param {*} seed The seed.
     */
    seed(seed) {
        this.state = seed;
    }

    /**
     * Get the internal state of the generator.
     * @returns {*} The internal state.
     */
    getState() {
        return this.state;
    }

    /**
     * Set the internal state back to what it was.
     * @param {*} state The state returned by {@linkcode Random.getState}.
     */
    setState(state) {
        this.state = state;
    }

    /**
     * Same as {@linkcode Random.rand}, but does **not**
     * advance the internal state.
     * @returns {number} Random float in range [0, 1).
     */
    peek() {
        var old = clone(this.getState(), true);
        var ret = this.rand();
        this.setState(old);
        return ret;
    }

    /**
     * Call this to move the generator one step.
     * @returns {number} Random float in range [0, 1).
     * @abstract
     */
    rand() {
        throw 'override me';
    }
}

export function b2rHelper(n, m) {
    var ns = n.toString();
    var ms = m.toString();
    return parseFloat(ns) / parseFloat(ms);
}

export function tof(n) {
    return parseFloat(n.toString());
}

export function toi(n) {
    return BigInt(n);
}