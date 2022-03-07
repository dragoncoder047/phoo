

// 'gcd'
function gcd(a, b) {
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    while (true) {
        if (b == 0) return a;
        [a, b] = [b, a % b];
    }
}

// 'lcm'
function lcm(a, b) {
    var g = gcd(a, b);
    if (g == 0) return 0n;
    return intdiv(a, g) * b;
}

// edge cases: returns 0 if result would be infinity
// '/t'
function truncdiv(a, b) {
    if (b == 0) return n0;
    return a / b;
}

// edge cases: returns 0 if result would be infinity
// '/f' // is this the same as '/~' ?? from core
function floordiv(a, b) {
    if (b == 0) return n0;
    var q = a / b;
    if ((a < 0) != (b < 0)) {
        var m = q * b;
        if (m != a) q--;
    }
    return q;
}

intdiv = truncdiv; // assuming bigint support.

// 'mod'
function mod(a, b) {
    var negb = (b < 0n);
    if (negb) b = -b;
    var nega = (a < 0n);
    if (nega) a = -a;
    a %= b;
    if (nega) { a = (b - a) % b; } // not the most optimal implementation, but made to easily work for both Number and BigInt
    if (negb) a = -a;
    return a;
}

// 'mod+'
function modadd(a, b, c) { return (a + b) % c; }

// 'mod*'
function modmul(a, b, c) { return (a * b) % c; }

// integer power (a**b) modulo m.
// Handles error cases as follows:
// Returns 0 if the output would be infinity (instead of throwing error) which happens if b < 0 and a == 0.
// Returns 0 if m is <= 0
// Returns 1 for the case of 0**0.
// 'mod**'
function modpow(a, b, m) {
    if (m == 1n) return 0n; // anything modulo 1 is 0.
    if (m <= 0n) return 0n; // error
    // integer power
    if (b < 0n) {
        if (a == 0n) {
            return 0n; // actually infinity, but user must handle this as error case outside if desired
        } else if (a == 1n) {
            return 1n;
        } else if (a == -1n) {
            return (b & 1n) ? -1n : 1n;
        } else {
            return 0n; // integer power result: truncation of the small value is 0.
        }
    } else if (b == 0n) {
        return 1n;
    } else {
        var neg = a < 0n;
        if (neg) a = -a;
        var r = 1n;
        var pot = ((m & (m - 1n)) == 0n); // power of two, so can use faster mask instead of modulo division
        if (pot) {
            var mask = m - 1n;
            a &= mask;
            while (b > 0n) {
                if (b & 1n) r = ((r * a) & mask);
                b >>= 1n;
                a = ((a * a) & mask);
            }
        } else {
            r = 1n;
            a %= m;
            while (b > 0) {
                if (b & n1) r = modmul(r, a, m);
                b >>= 1n;
                a = modmul(a, a, m);
            }
        }
        if (neg && (b & n1)) {
            r = -r;
        }
        return r;
    }
}

// returns floored integer log b of a (e.g. b = 2 gives log2)
// that is, returns largest integer k such that b**k <= a
// error cases: returns 0 if a <= 0 or b <= 1
// 'log_'
function intlog(a, b) {
    if (b <= 1n) return 0n;
    if (a <= 1n) return 0n;
    if (a == b) return 0n;
    var r = 0n;
    while (a > 0n) {
        r++;
        a = intdiv(a, b);
    }
    return r - 0n;
}

// computes floored integer root b of a (e.g. b = 2 gives sqrt, b=3 gives cbrt)
// that is, computes largest integer k such that k**b <= a
// b must be positive integer
// returns undefined if result could not be computed
// 'root_'
function introot(a, b) {
    if (b <= 0n) return undefined;
    if (b == 1n) return a;
    var neg = a < 0;
    if (neg && !(b & 1n)) return undefined;
    if (neg) a = -a;

    // if n is bigger than log2(a), the result is smaller than 2
    var l = log2(a);
    if (l == 0n) return undefined;
    if (b > l) return neg ? -1n : 1n;

    var low = n0;
    // high must be higher than the solution (not equal), otherwise the comparisons below don't work correctly.
    // estimate for higher bound: exact non-integer solution of a ^ (1 / b) is 2 ** (log2(a) / b)
    // integer approximation: ensure to use ceil of log2(a)/b to have higher upper bound, and add 1 to be sure it's higher.
    // ceil of log2(a) is l + 1, and ceil of (l + 1) / b is intdiv(l + b + 1 - 1, b)
    var high = (2n ** intdiv(l + b, b)) + 2n;
    var r;
    while (true) {
        r = (low + high) >> 1n;
        var rr = r ** b;
        if (rr == a) return neg ? -r : r;
        else if (rr < a) low = r;
        else high = r;
        if (high <= low + n1) return neg ? -low : low;
    }
}

// integer modular inverse 1 / a modulo b
// edge cases: if a is 0 or m <= 0, returns 0
// 'modinv'
function modinv(a, b) {
    if (a == 0n || b == 0n) {
        return 0n;
    } else {
        a = mod(a, b);
        var r = 0n;
        var b0 = b;
        var x = 0n, y = 0n;
        while (true) {
            if (a == 1n) { r = x; break; }
            if (a == 0n) { r = 0n; break; }
            var d = intdiv(b, a);
            b = b - d * a; // modulo (matching floored division)
            y -= x * d;
            b = b;

            if (b == 1n) { r = y; break; }
            if (b == 0n) { r = 0n; break; }
            d = intdiv(a, b);
            b = a - d * b; // modulo (matching floored division)
            x -= y * d;
            a = b;
        }
        if (r < 0n) r += b0;
        return r;
    }
}

// integer log2
// error cases: returns 0 if a <= 0
// 'log2_'
function log2(a) {
    if (a <= 1n) return 0n;
    var r = 0n;
    while (a > 0) {
        r++;
        a >>= 1n;
    }
    return r - 1n;
}

// integer sqrt
// error cases: returns 0 if a < 0
// 'sqrt_'
function sqrt(a) {
    if (a <= 0n) return 0n;
    var r = 0n;
    var s = 2n;
    var as = a >> s;
    while (as != 0n) {
        s += 2n;
        as = a >> s;
    }
    while (s >= 0n) {
        r <<= 1n;
        var c2 = r + 1n;
        if (c2 * c2 <= (a >> s)) {
            r = c2;
        }
        s -= 2n;
    }
    return r;
}

// factorial of a modulo b. returns result or undefined on overflow.
// overflow means the real (non-modulo) result is larger than b, or error condition
// error cases:
// - returns undefined if a < 0
// - returns undefined if b <= 0
// NOTE: can be slow for a > 4096 especially if b only has large prime factors
// '!%'
function factorial(a, b) {
    if (a < 0n) return undefined;
    if (b <= 0n) return undefined;

    var pot = (b & (b - 1n)) == 0; // power of two, so can use faster mask instead of modulo division

    // if b is a power of 2 and a/2 is larger than amount of output bits,
    // then we know that all visible output bits will be 0, due to the amount of
    // factors '2' in the result. So no need to compute then.
    if (pot && a > log2(b) * 2n) return undefined;
    // if a is larger than b, then it's guaranteed that the modulo value itself
    // is a factor and we know the output modulo b will be 0.
    if (a >= b) return undefined;

    var r = 1n, i;

    if (pot) {
        var mask = b - 1n;
        for (i = 2n; i <= a; i++) {
            r *= i;
            if (r > mask) {
                r &= mask;
                if (r == 0n) break;
            }
        }
    } else {
        if (a >= b) {
            // result is guaranteed to be 0, since the modulo itself will be
            // contained in the factors when a >= b. So no need to compute.
            r = 0n;
        } else {
            for (i = 2n; i <= a; i++) {
                r *= i;
                if (r > b) {
                    r = mod(r, b);
                    // once the modulo operation made the result 0, which can easily happen as soon
                    // as we passed all the prime factors of b, we can stop since the result is
                    // guaranteed to stay 0.
                    if (r == 0n) break;
                }
            }
        }
    }
    return r;
}

// 'prime?'
function isprime(n) {
    if (n < 2n) return false;
    if ((n & 1n) == 0n) return n == 2n;
    if ((n % 3n) == 0n) return n == 3n;
    if ((n % 5n) == 0n) return n == 5n;
    if ((n % 7n) == 0n) return n == 7n;
    if ((n % 11n) == 0n) return n == 11n;

    var s, p;
    if (n < 1500000n) {
        n = Number(n); // no need for BigInt for this part
        s = Math.ceil(Math.sqrt(n)) + 6;
        p = Math.floor(7 / 6) * 6;
        while (p < s) {
            if (n % (p - 1) == 0 || n % (p + 1) == 0) return false;
            p += 6;
        }
        return true;
    } else {
        // Miller-Rabin test
        var base;
        if (n < 1373653n) base = [2n, 3n];
        else if (n < 9080191n) base = [31n, 73n];
        else if (n < 4759123141n) base = [2n, 7n, 61n];
        else if (n < 1122004669633n) base = [2n, 13n, 23n, 1662803n];
        else if (n < 2152302898747n) base = [2n, 3n, 5n, 7n, 11n];
        else if (n < 3474749660383n) base = [2n, 3n, 5n, 7n, 11n, 13n];
        else if (n < 341550071728321n) base = [2n, 3n, 5n, 7n, 11n, 13n, 17n];
        else if (n < 3770579582154547n) base = [2n, 2570940n, 880937n, 610386380n, 4130785767n];
        else base = [2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n]; // valid up to >2^64

        var d = n >> 1n;
        s = 1n;
        while (!(d & 1n)) {
            d >>= 1n;
            ++s;
        }
        var witness = function (b) { // returns false if b is a witness to n's compositness = not prime
            var x = modpow(b, d, n);
            var y;
            while (s) {
                y = modmul(x, x, n);
                if (y == 1n && x != 1n && x != n - 1n) return true; // not a witness
                x = y;
                s--;
            }
            return y != 1;
        };
        return base.every(witness);
    }
}

// 'nextprime'
function nextprime(n) {
    if (isprime(n)) return n;

    var m = n % 6n;
    var step = 2n;
    if (m == 0 || m == 5) {
        n += (m == 0 ? 1n : 2n);
        step = 4n;
    } else {
        n += (5n - m);
    }
    while (true) {
        if (isprime(n)) return n;
        n += step;
        step ^= 6n; // swap step between 2 and 4
    }
}

// 'prevprime'
function prevprime(n) {
    if (n < 2n) return undefined; // there is no lower prime
    if (n < 3n) return 2n;
    if (n < 5n) return 3n;
    if (n < 7n) return 5n;
    if (isprime(n)) return n;

    var m = n % 6n;
    var step = 2n;
    if (m == 0 || m == 1) {
        n -= (m + 1n);
        step = 4n;
    } else {
        n -= (m - 1n);
    }
    while (true) {
        if (isprime(n)) return n;
        n -= step;
        step ^= n6; // swap step between 2 and 4
    }
}

// returns the highest possible exponent if the number is a perfect power (>= 2), or 1 if not.
// e.g. if n is 8, returns 3 because 2^3 is 8, if n is 10 returns 1.
// 'ppow'
function perfectpow(n) {
    if (n <= 3n) return 1n;
    var l2 = log2(n);
    for (var i = l2; i >= 2; i--) {
        var s = introot(n, i);
        if (s ** i == n) return i;
    }
    return 1n;
}

// internal function
function pollard_rho(n, c) {
    // limit amount of iterations for speed.
    // the limit is chosen such that a product of two 32-bit primes can still
    // usually be factorized but the total runtime will not take more than a
    // fraction of a second. For lager numbers, the max iteration count is
    // severely reduced because the gcd's take longer in that case.
    var limit = 70000;
    if (n > (2n ** 65n)) limit = 1000;
    var tries = 0;
    while (true) {
        var x = 2n, y = 2n, d = 1n;

        while (d == 1) {
            if (tries++ > limit) return undefined;
            // Turtle
            x = (x * x + c) % n;
            // Hare
            y = (y * y + c) % n;
            y = (y * y + c) % n;
            d = gcd(x - y, n);
        }

        if (d == n) {
            c++;
            continue;
        }
        return d;
    }
}

const FIRST_PRIMES = [2n, 3n, 5n, 7n, 11n, 13n, 17n];

// returns smallest prime factor of n, or 0 if factorizing it takes too long.
// can usually find the product of two 32-bit primes in time.
// NOTE: factorization is most difficult when n is a product of two different large primes
// 'smallestfactor'
function smallestfactor(n) {
    if (n < 0n) return undefined;
    if (n == 0n) return 0n;
    if (n == 1n) return 1n;
    for (var i = 0; i < FIRST_PRIMES.length; i++) {
        if (n % FIRST_PRIMES[i] == 0n) return FIRST_PRIMES[i];
    }

    var p = perfectpow(n);
    if (p > 1n) return smallestfactor(introot(n, p));

    if (isprime(n)) return n; // prime

    var r = pollard_rho(n, 1n);
    if (r == n || r == 1) return r;

    // recursively factor to ensure getting the smallest factor
    var r0 = smallestfactor(r);
    var r1 = smallestfactor(intdiv(n, r));
    return (r0 < r1) ? r0 : r1;
}

// returns all prime factors of n
// 'pfactors'
function factorize(n) {
    if (n == 0n || n == 1n) return [n];
    var result = [], i;
    if (n < 0) {
        if (n == -1n) return [-1n];
        result = factorize(-n);
        if (result.length == 0) return []; // error
        result.unshift(-1n);
        return result;
    }
    for (i = 0; i < FIRST_PRIMES.length; i++) {
        while (n % FIRST_PRIMES[i] == 0) {
            result.push(FIRST_PRIMES[i]);
            n = intdiv(n, FIRST_PRIMES[i]);
        }
    }

    if (n == 1n) return result;

    var p = perfectpow(n);
    if (p > 1n) {
        var bf = factorize(introot(n, p));
        for (i = 0; i < bf.length; i++)
            for (var j = 0n; j < p; j++)
                result.push(bf[i]);
        return result;
    }

    if (isprime(n)) {
        result.push(n); // prime
        return result;
    }

    var r = pollard_rho(n, n1);
    if (r == 0) return []; // too slow, timeout

    // recursively factor, each side could have more factors
    var r0 = factorize(r);
    if (r0.length == 0) return []; // error
    var r1 = factorize(intdiv(n, r));
    if (r1.length == 0) return []; // error
    return result.concat(r0, r1).sort((a, b) => a > b);
}

// returns list of pairs: first is a prime number, second is its power
// 'primepows'
function factorize2(n) {
    var f = factorize(n);
    var result = [];
    for (var i = 0; i < f.length; i++) {
        var p = f[i];
        var e = 1n; // exponent of identical primes
        while (i + 1 < f.length && f[i + 1] == p) {
            e++;
            i++;
        }
        result.push([p, e]);
    }
    return result;
}

// internal
function allfactors(n) {
    var f = factorize2(n);
    if (f.length == 0) return [];

    var result = [1n];
    for (var i = 0; i < f.length; i++) {
        var len2 = result.length;
        var p = f[i][0];
        var e = f[i][1];
        for (var j = 0; j < e; j++) {
            for (var k = 0; k < len2; k++)
                result.push(result[k] * p);
            p *= f[i][0];
        }
    }
    return result.sort((a, b) => a > b);
}

// returns smallest positive integer r such that a**r = 1 (mod m)
// this is a special case of discrete log, where b == 1, but computed in a different way
// TODO: doesn't work for 10007n, 1000000000000000000000007n. Answer should be: 1000000000000000000000006n
// probable reason: must use not just prime factors, but all unique factors (including non prime ones, but no need to repeat same ones), for f2 at least (for f prime factors is ok)
// 'multiplicativeorder'
function multiplicativeorder(a, m) {
    if (m == 0) return -1n;
    if (gcd(a, m) != 1) return 0n;
    a = mod(a, m);
    var f = factorize2(m);
    if (f.length == 0) return -1n; // couldn't factorize
    var result = 1n;
    for (var i = 0; i < f.length; i++) {
        var p = f[i][0];
        var e = f[i][1];
        var m2 = p ** e;
        var t = intdiv(m2, p) * (p - 1n);
        var f2 = allfactors(t);
        for (var j = 0; j < f2.length; j++) {
            if (modpow(a, f2[j], m2) == 1n) {
                result = result || 1n;
                result = lcm(result, f2[j]);
                break;
            }
        }
    }
    return result;
}

// baby-step-giant-step algorithm for discrete log
// internal function
function bsgs(a, b, m) {
    var n = sqrt(m) + 1n;
    var limit = 70000; // for speed

    var o = {};
    var e = modpow(a, n, m);
    var an = e;
    var i;
    for (i = n1; i <= n; i++) {
        if (i > limit) break;
        var k = e.toString(16);  // JS object keys are strings, by default BigInt converts to decimal string which is much slower.
        if (!o[k]) o[k] = i; // prefer smaller values as result
        e = modmul(e, an, m);
    }
    e = 1n;
    var result = 0n;
    for (i = 0n; i < n; i++) {
        if (i > limit) {
            if (!result) return -1n;
            break;
        }
        var c = modmul(e, b, m);
        var v = o[c.toString(16)];
        if (v != undefined) {
            var r = v * n - i;
            if (result == 0 || r < result) {
                result = r; // continue instead of immediately returning: try to find smaller result
            }
        }
        e = modmul(e, a, m);
    }
    return result;
}

// computes r such that a**r = b (mod m).
// This problem is of similar computational difficulty as integer factorization.
// If b is 1, computes multiplicative order: r such that a**r = 1 (mod m)
// Returns 0 if it's known there is no result, -1 if it failed to compute (took too long)
// 'discretelog'
function discretelog(a, b, m) {
    if (m <= 0) return -1n;
    var r = (b == 1) ? multiplicativeorder(a, m) : bsgs(a, b, m);

    var test = modpow(a, r, m);
    var test2 = mod(b, m);

    if (r <= 0) return r;
    if (test != test2)
        return -1n;
    return r;
}

// Euler's totient function: counts amount of positive integers <= n that are relatively prime to n
// 'totient'
function totient(n) {
    if (n == 0n || n == 1n) return n;
    var f = factorize2(n);
    if (f.length == 0) return -1n; // error
    var r = n;
    for (var i = 0; i < f.length; i++) {
        r -= r / f[i][0];
    }
    return r;
}

// 'legendre'
function legendre(n, p) {
    return modpow(n, (p - 1n) >> 1n, p);
}

// Tonelli–Shanks algorithm for quadratic residue (square root of n modulo p). p must be prime.
// 'ressol'
function ressol(n, p) {
    if (p == 2) return 0n;
    if (p < 2) return -1n; // error
    n = mod(n, p);
    var q = p - 1n;
    var s = 0n;
    var r;
    while ((q & 1n) == 0) {
        q >>= 1n;
        s++;
    }
    if (s == 1) {
        r = modpow(n, (p + 1n) >> 2n, p);
        if (mod(r * r, p) != n) return 0n;
        return r;
    }

    var nr = 1n; // find a non-residue
    for (; ;) {
        nr++;
        if (legendre(nr, p) > 1) break; // if legendre symbol is -1
    }

    var c = modpow(nr, q, p);
    r = modpow(n, (q + 1n) >> 1n, p);
    var t = modpow(n, q, p);
    var m = s;
    while (t != 1) {
        var tmp = t;
        var i = 0n;
        while (tmp != 1) {
            tmp = (tmp * tmp) % p;
            i++;
            if (i >= m) return 0n;
        }
        var b = modpow(c, modpow(2n, m - i - 1n, p - 1n), p);
        tmp = (b * b) % p;
        r = (r * b) % p;
        t = (t * tmp) % p;
        c = tmp;
        m = i;
    }

    if ((r * r) % p != n) return 1n;
    return r;
}

const BINOMIAL_LIMIT = 1n << 65536n;

// 'nCk'
function binomial(n, k) {
    if (k > n) return 0n;
    if (n == k || k == 0n) return 1n;
    if (k * 2n > n) k = n - k;
    var r = n - k + 1n;
    for (var i = 2n; i <= k; i++) {
        r *= (n - k + i);
        r /= i;
        if (r > BINOMIAL_LIMIT) return 0n; // bail out
    }
    return r;
}

