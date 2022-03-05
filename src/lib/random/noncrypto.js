/**
 * @fileoverview
 * Good-quality, but not cryptographically secure generators.
 */

import { Random, b2rHelper, toi as b, tof } from './index.js';


function rot64(x, k) {
    return ((x << k) | (x >> (b(64) - k)))
}

/**
 * 64-bit variant of Bob Jenkins' small noncryptographic PRNG
 * which can be found [here](https://www.burtleburtle.net/bob/rand/smallprng.html).
 */
export class Bob extends Random {
    seed(seed) {
        var bi = b(seed);
        this.state = { a: b('0xF1EA5EED'), b: bi, c: bi, d: bi };
        for (var i = 0; i < 20; i++) this.rand();
    }
    rand() {
        const mask = (b(1) << b(64)) - b(1);
        var e = this.state.a - rot64(this.state.b, b(7));
        this.state.a = this.state.b ^ rot64(this.state.c, b(13));
        this.state.b = (this.state.c + rot64(this.state.d, b(37))) & mask;
        this.state.c = (this.state.d + e) & mask;
        this.state.d = (this.state.a + e) & mask;
        return b2rHelper(this.state.d, mask + b(1));
    }
}

// 'magic' numbers for MT generator.
const N = b(624);
const M = b(397);
const MAT_A = b('0x9908B0DF');
const MAGIC01 = [b(0), MAT_A];
const MASK_HIGH = b('0x80000000');
const MASK_LOW = b('0x7FFFFFFF');
/**
 * The popular Mersenne Twister generator invented by Makoto Matsumoto and Takuji Nishimura
 * and set up exactly (??) as it is implemented
 * by the Python `random` module.
 */
export class MersenneTwister extends Random {
    constructor(seed) {
        super(seed);
        this.index = b(0);
    }
    seed(seed) {
        this.state = new Array(tof(N));
        this.state[0] = b(seed);
        for (var i = b(1); i < N; i++) {
            this.state[i] = b('1812433253') * (this.state[i - b(1)] ^ (this.state[i - b(1)] >> b(30))) + i;
        }
        this.index = N;
    }
    rand() {
        var y;
        if (this.index >= N) {
            this.twist();
            this.index = b(0);

        }
        y = this.state[this.index++];
        y ^= y >> b(11);
        y ^= (y << b(7)) & b('0x9D2C5680');
        y ^= (y << b(15)) & b('0xEFC60000');
        y ^= y >> b(18);
        return b2rHelper(y, b('0xFFFFFFFF'));
    }
    twist() {
        var kk;
        for (kk = b(0); kk < N - M; kk++) {
            y = (this.state[kk] & MASK_HIGH) | (this.state[kk + 1] & MASK_LOW);
            this.state[kk] = this.state[kk + M] ^ (y >> b(1)) ^ MAGIC01[y & b(1)];
        }
        for (; kk < N - b(1); kk++) {
            y = (this.state[kk] & MASK_HIGH) | (this.state[kk + 1] & MASK_LOW);
            this.state[kk] = this.state[kk + M - N] ^ (y >> b(1)) ^ MAGIC01[y & b(1)];
        }
        y = (this.state[N - 1] & MASK_HIGH) | (this.state[0] & MASK_LOW);
        this.state[N - 1] = this.state[M - 1] ^ (y >> b(1)) ^ MAGIC01[y & b(1)];
    }
}