/**
 * @fileoverview
 * basic random number utilities: random, seed, getstate, setatstate.
 * Plus murmurhash's mix function as a hash.
 */

import { Module } from '../src/namespace.js';
export const module = new Module('_random');

// code from https://github.com/bryc/code/blob/master/jshash/PRNGs.md

// Bob Jenkins' small PRNG
var bobstate;

function bobseed(seed) {
    bobstate = [0xF1EA5EED, seed, seed, seed];
    for (var i = 0; i < 20; i++) bob();
}

function bob() {
    var [a, b, c, d] = bobstate;
    var t = a - (b << 23 | b >>> 9) | 0;
    a = b ^ (c << 16 | c >>> 16) | 0;
    b = c + (d << 11 | d >>> 21) | 0;
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    bobstate = [a, b, c, d];
    return (d >>> 0) / 4294967296;
}

//bobseed(0xDEADBEEF);
bobseed(+new Date());

module.words.add('random', function r() { this.push(bob()); });
module.words.add('getstate', function g() { this.push(bobstate); });
module.words.add('setstate', function s() { this.expect('array'); bobstate = this.pop(); });
module.words.add('seed', function ss() { this.expect('number'); bobseed(this.pop()); });

/*



var a = 100000000;
var b = 10000000;

var counts = new Array(a / b).fill(-b);
for (var i = 0; i < a; i++) {
    counts[Math.floor(bob() * a / b)]++;
}
console.log(counts);
console.log(counts.reduce((a, b) => a + b, 0))



*/

// Murmurhash3's mix function
function xmur3(str) {
    var h = 1779033703 ^ str.length;
    for(var i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return function xmur3inner() {
        h = Math.imul(h ^ h >>> 16, 2246822507),
        h = Math.imul(h ^ h >>> 13, 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
    }
}

module.words.add('xmur', function x() { this.expect('string'); this.push(xmur3(this.pop())); });
