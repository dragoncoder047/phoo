import { Module } from '../core/namespace.js';
import { addFunctionAsWord as add } from '../core/index.js';
export const module = new Module('_math');

const B = BigInt || n => n;
const supportbigint = !!BigInt;

const n0 = B(0);
const n1 = B(1);
const n2 = B(2);
const n3 = B(3);
const n4 = B(4);
const n5 = B(5);
const n6 = B(6);
const n7 = B(7);
const n10 = B(10);
const n11 = B(11);
const n13 = B(13);
const n15 = B(15);
const n17 = B(17);

add(module, [/number|bigint/, /number|bigint/], 'gcd', function gcd(a, b) {
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    while (true) {
        if (b == 0) return a;
        [a, b] = [b, a % b];
    }
});

add(module, [/number|bigint/, /number|bigint/], 'lcm', function lcm(a, b) {
    var g = gcd(a, b);
    if (g == 0) return n0;
    return intdiv(a, g) * b;
});

// edge cases: returns 0 if result would be infinity
add(module, [/number|bigint/, /number|bigint/], '/t', function truncdiv(a, b) {
    if (b == 0) return n0;
    if (supportbigint) return a / b;
    var q = a / b;
    return (q < 0) ? Math.ceil(q) : Math.floor(q);
});

// edge cases: returns 0 if result would be infinity
add(module, [/number|bigint/, /number|bigint/], '/f', function floordiv(a, b) {
    if (b == 0) return n0;
    if (!supportbigint) return Math.floor(a / b);
    var q = a / b;
    if ((a < 0) != (b < 0)) {
        var m = q * b;
        if(m != a) q--;
    }
    return q;
});

// only for positive integers, so slightly faster due to less checks.
add(module, [/number|bigint/, /number|bigint/], '/i', function intdiv(a, b) {
    if (b == 0) return n0;
    if (!supportbigint) return Math.floor(a / b);
    return a / b;
});

