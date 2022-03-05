/**
 * @fileoverview
 * Elementary Phoo words pertaining to random numbers.
 */

import { MiddleSquare, LCG, LFSR } from './random/simple.js';
import { Bob, MersenneTwister } from './random/noncrypto.js';
import { BBS, ISAAC } from './random/crypto.js';
import { UnknownWord } from '../core/errors.js';
import { batchAddWords } from '../helpers.js';

var gens = {
    midsq: new MiddleSquare(+new Date),
    lcg: new LCG(+new Date),
    lfsr: new LFSR(+new Date),
    bob: new Bob(+new Date),
    mersenne: new MersenneTwister(+new Date),
    bbs: new BBS(+new Date),
    isaac: new ISAAC(+new Date),
}

var current = gens.bob;

function random() {
    this.push(current.rand());
}

function setrand() {
    this.run("]'[");
    var n = this.pop('>symstr');
    var ng = gens[n];
    if (ng === undefined)
        throw new UnknownWord(`userand: Unrecognized generator name: ${n}`);
    current = ng;
}

function seed() {
    current.seed(this.pop('>bignum'));
}

export function init(p) {
    batchAddWords(p, { random, setrand, seed });
}

