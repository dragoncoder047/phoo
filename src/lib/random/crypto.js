/**
 * @fileoverview
 * Cryptographically secure random number generators.
 */

import { Random, b2rHelper, toi as b } from './index.js';

//       (4*1581256982-1) * (4*9816990-1)
const M = b('6325027927') * b('39267959');

/**
 * Uses the [Blum Blum Shub generator](https://en.wikipedia.org/wiki/Blum_Blum_Shub)
 * which is cryptographically secure due to the difficulty of solving the
 * [quadratic residuosity problem](https://en.wikipedia.org/wiki/Quadratic_residuosity_problem).
 */
export class BBS extends Random {
    seed(seed) {
        this.state = b(seed);
    }
    rand() {
        this.state = (this.state * this.state) % M;
        return b2rHelper(this.state & b('0xFFFF'), b('0x10000'));
    }
}


/**
 * Bob Jenkins' ISAAC CSPRNG.
 */
export class ISAAC extends Random {
    constructor(seed) {
        this.state = {
            i: 0,
            m: new Array(255),
            r: new Array(256),
            a: b(0),
            b: b(0),
            c: b(0),
        };
        this.seed(seed);
    }
    seed(seed) {
        var a, b, c, d, e, f, g, h;
        a = b = c = d = e = f = g = h = b('0x9E3779B9');
        this.state.a = this.state.b = this.state.c = b(0);

        function mix() {
            a ^= b << b(11); d += a; b += c;
            b ^= c >> b(2); e += b; c += d;
            c ^= d << b(8); f += c; d += e;
            d ^= e >> b(16); g += d; e += f;
            e ^= f << b(10); h += e; f += g;
            f ^= g >> b(4); a += f; g += h;
            g ^= h << b(8); b += g; h += a;
            h ^= a >> b(9); c += h; a += b;
        }

        for (var i = 0; i < 4; i++) mix();

        for (var i = 0; i < 256; i += 8) {
            a += seed; b += seed;
            c += seed; d += seed;
            e += seed; f += seed;
            g += seed; h += seed;
            mix();
            this.state.m[i + 0] = a; this.state.m[i + 1] = b;
            this.state.m[i + 2] = c; this.state.m[i + 3] = d;
            this.state.m[i + 4] = e; this.state.m[i + 5] = f;
            this.state.m[i + 6] = g; this.state.m[i + 7] = h;
        }
        for (var i = 0; i < 256; i += 8) {
            a += this.state.m[i + 0]; b += this.state.m[i + 1];
            c += this.state.m[i + 2]; d += this.state.m[i + 3];
            e += this.state.m[i + 4]; f += this.state.m[i + 5];
            g += this.state.m[i + 6]; h += this.state.m[i + 7];
            mix();
            this.state.m[i + 0] = a; this.state.m[i + 1] = b;
            this.state.m[i + 2] = c; this.state.m[i + 3] = d;
            this.state.m[i + 4] = e; this.state.m[i + 5] = f;
            this.state.m[i + 6] = g; this.state.m[i + 7] = h;
        }
        this.isaac();
        this.state.i = 255;
    }
    isaac() {
        var x, y;
        this.state.c++;
        this.state.b += this.state.c;
        for (var i = 0; i < 256; i++) {
            x = this.state.m[i];
            switch (i % 4) {
                case 0: this.state.a ^= this.state.a << b(13); break;
                case 1: this.state.a ^= this.state.a >> b(6); break;
                case 2: this.state.a ^= this.state.a << b(2); break;
                case 3: this.state.a ^= this.state.a >> b(16); break;
            }
            this.state.a += this.state.m[(i + 128) % 256];
            this.state.m[i] = y = this.state.m[(x >> b(2)) % b(256)] + this.state.a + this.state.b;
            this.state.r[i] = this.state.b = this.state.m[(y >> b(10)) % b(256)] + x;
        }
    }
    rand() {
        this.state.i++;
        if (this.state.i >= 256) {
            this.isaac();
            this.state.i = 0;
        }
        return b2rHelper(this.state.r[this.state.i], b('0xFFFFFFFF'));
    }
}