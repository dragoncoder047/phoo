/**
 * @fileoverview
 * Simple random number generators, some not very good, but they nonetheless work.
 */

import { Random, b2rHelper, toi } from './index.js';

/**
 * Uses [John von Neumann's middle-square method](https://en.wikipedia.org/wiki/Pseudorandom_number_generator#Early_approaches).
 * Primitive and very inefficient, but it works.
 */
export class MiddleSquare extends Random {
    seed(num) {
        this.state = toi(num);
    }
    rand() {
        this.state = this.state * this.state;
        var str = this.state.toString();
        if (str.length & 1) str = '0' + str;
        var fourth = Math.floor(str.length / 4);
        var mid = str.slice(fourth, str.length - fourth);
        this.state = toi(mid);
        return b2rHelper(mid, '1' + '0'.repeat(mid.length));
    }
}

/**
 * Uses a very long-period [linear congruential generator](https://en.wikipedia.org/wiki/Linear_congruential_generator).
 */
export class LCG extends Random {
    /**
     * If `c = 0`, and `m` is prime, you have a [Lehmer generator](https://en.wikipedia.org/wiki/Lehmer_RNG).
     * 
     * See [here](https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use) for good m, a, and c to use.
     * The defaults are that of Turbo Pascal's generator.
     * @param {BigInt} seed The initial seed.
     * @param {BigInt} [m=2**32] The modulus.
     * @param {BigInt} [a=0x08088405] The multiplier.
     * @param {BigInt} [c=1] The increment.
     */
    constructor(seed, m = toi(2) ** toi(32), a = toi('0x08088405'), c = 1) {
        this.m = toi(m);
        this.a = toi(a);
        this.c = toi(c);
        this.seed(seed);
    }
    seed(seed) {
        this.state = toi(seed);
    }

    rand() {
        this.state = (this.a * this.state + this.c) % this.m;
        return b2rHelper(this.state, this.m);
    }
}

/**
 * Uses a [linear feedback shift register](https://en.wikipedia.org/wiki/Linear-feedback_shift_register).
 */
export class LFSR extends Random {
    /**
     * See [here](https://en.wikipedia.org/wiki/Linear-feedback_shift_register#Example_polynomials_for_maximal_LFSRs)
     * for a list of good feedback polynomials.
     * @param {BigInt} seed The initial register value. Don't use 0.
     * @param {number|BigInt} [taps=0xE10000] The binary representation of the XOR'ed taps of the register.
     * @param {number|BigInt} [bits=24] The number of bits in the register.
     */
    constructor(seed, taps = 0xE10000, bits = 24) {
        this.taps = toi(taps);
        this.bits = toi(bits);
        this.seed(seed);
    }
    seed(seed) {
        this.state = toi(seed);
    }
    rand() {
        var b = toi(1);
        for (var i = toi(0); i < this.bits; i++) {
            b ^= (this.state >> i) & (this.taps >> i) & toi(1);
        }
        var mask = (toi(1) << this.bits) - toi(1);
        this.state = ((this.state << toi(1)) | b) & mask;
        return b2rHelper(this.state, mask + toi(1));
    }
}

/**
 * Uses the system random generator, `:::js Math.random`.
 * Cannot be seeded, and usually not very good either.
 */
export class SystemRandom extends Random {
    rand() {
        return Math.random();
    }
}