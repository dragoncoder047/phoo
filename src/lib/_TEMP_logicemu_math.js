//copied from https://github.com/lvandeve/logicemu/blob/bd0bb49e7db88fa4f8dcdc56ff3d6e978a03a800/logicemu.js

var LogicEmuMath = (function() {
  // exported functions/fields are assigned to result which will be returned by this self invoking anonymous function expression
  var result = {};

  var supportbigint = !!window.BigInt;
  result.supportbigint = supportbigint;

  // Make integer of the relevant type: BigInt if supported, JS number otherwise.
  // Most of the math here will use BigInt if available, JS number otherwise.
  // If JS supports BigInt, then, between JS number and BigInt:
  // - the following operators work the same (but support larger values for bigInt): almost all, including +, %, <=, <<, &, **, etc...
  // - the following operators work differently: / becomes integer division
  // - the following things are not supported, resulting in an exception: mixing JS nubmer with BigInt for any operation except comparisons; using Math.#### functions on BigInt.
  var B = supportbigint ? window.BigInt : function(i) { return i; };
  result.B = B;

  // the notation 0n, 1n, 3n, ... cannot be used, because if browser doesn't support BigInt,
  // it'll give parsing error on decimal number ending with n.
  var n0 = B(0); result.n0 = n0;
  var n1 = B(1); result.n1 = n1;
  var n2 = B(2); result.n2 = n2;
  var n3 = B(3); result.n3 = n3;
  var n4 = B(4); result.n4 = n4;
  var n5 = B(5); result.n5 = n5;
  var n6 = B(6); result.n6 = n6;
  var n7 = B(7); result.n7 = n7;
  var n10 = B(10); result.n10 = n10;
  var n11 = B(11); result.n11 = n11;
  var n13 = B(13); result.n13 = n13;
  var n15 = B(15); result.n15 = n15;
  var n17 = B(17); result.n17 = n17;

  var gcd = function(a, b) {
    if(a < 0) a = -a;
    if(b < 0) b = -b;
    for(;;) {
      if(b == 0) return a;
      var o = a % b;
      a = b;
      b = o;
    }
  };
  result.gcd = gcd;

  var lcm = function(a, b) {
    var g = gcd(a, b);
    if(g == 0) return n0;
    return intdiv(a, g) * b;
  };
  result.lcm = lcm;


  // error cases: returns 0 if result would be infinity
  var truncdiv = function(a, b) {
    if(b == 0) return n0;
    if(supportbigint) return a / b;
    var result = a / b;
    return (result < 0) ? Math.ceil(result) : Math.floor(result);
  };
  result.truncdiv = truncdiv;

  // error cases: returns 0 if result would be infinity
  var floordiv = function(a, b) {
    if(b == 0) return n0;
    if(!supportbigint) return Math.floor(a / b);
    var result = a / b;
    if((a < 0) != (b < 0)) {
      var m = result * b;
      if(m != a) result--;
    }
    return result;
  };
  result.floordiv = floordiv;

  // only for positive integers, so slightly faster due to less checks.
  var intdiv = function(a, b) {
    if(b == 0) return n0;
    if(!supportbigint) return Math.floor(a / b);
    return a / b;
  };

  // a modulo b, matching floored division (not matching truncated division, like the % operation does)
  var mod = function(a, b) {
    var negb = (b < 0);
    if(negb) b = -b;
    var nega = (a < 0);
    if(nega) a = -a;
    a %= b;
    if(nega) { a = (b - a) % b; } // not the most optimal implementation, but made to easily work for both Number and BigInt
    if(negb) a = -a;
    return a;
  };
  result.mod = mod;

  // in case BigInt is not supported, this function helps to support shifting up to 2**53 instead of just up to 2**31
  var rshift1 = supportbigint ? function(n) { return n >> n1; } : function(n) { return Math.floor(n / 2); };

  // like left shift, but designed to also work with more than 31 bits in case BigInt is not supported in the browser
  var lshift = supportbigint ? function(n, s) { return n << s; } : function(n, s) { return n * ((s < 31) ? (1 << s) : (Math.pow(2, s))); };
  result.lshift = lshift;

  // returns (a + b) % c, taking overflow into account (in JS, overflow means reaching a part in the floating point representation where it can no longer distinguish 1)
  var modadd = supportbigint ?
      function(a, b, c) { return mod(a + b, c); } :
      function(a, b, c) {
    if (a + b < 9007199254740992) return mod(a + b, c);
    if(a + b > c) {
      return mod(a - c + b, c);
    }
    // This assumes that c < 4503599627370496 or a + b doesn't overflow
    return mod(mod(a, c) + mod(b, c), c);
  };

  // returns (a * b) % c, taking overflow into account
  var modmul = supportbigint ?
      function(a, b, c) { return mod(a * b, c); } :
      function(a, b, c) {
    if(a * b < 9007199254740992) return mod(a * b, c);
    var x = 0;
    var y = mod(a, c);
    while(b > 0) {
      if(b & 1) x = modadd(x, y, c);
      y = modadd(y, y, c);
      b = rshift1(b);
    }
    return x % c;
  };

  // Computes integer power (a**b) modulo m.
  // Handles error cases as follows:
  // Returns 0 if the output would be infinity (instead of throwing error) which happens if b < 0 and a == 0.
  // Returns 0 if m is <= 0
  // Returns 1 for the case of 0**0.
  var modpow = function(a, b, m) {
    if(m == 1) return n0; // anything modulo 1 is 0.
    if(m <= 0) return n0; // error
    // integer power
    if(b < 0) {
      if(a == 0) {
        return n0; // actually infinity, but user must handle this as error case outside if desired
      } else if(a == 1) {
        return n1;
      } else if(a == -1) {
        return (b & n1) ? -n1 : n1;
      } else {
        return n0; // integer power result: truncation of the small value is 0.
      }
    } else if(b == 0) {
      return n1;
    } else {
      var neg = a < 0;
      if(neg) a = -a;
      var r = n1;
      var pot = ((m & (m - n1)) == 0); // power of two, so can use faster mask instead of modulo division
      if(pot) {
        var mask = m - n1;
        a &= mask;
        while(b > 0) {
          if(b & n1) r = ((r * a) & mask);
          b = rshift1(b);
          a = ((a * a) & mask);
        }
      } else {
        r = n1;
        a %= m;
        while(b > 0) {
          if(b & n1) r = modmul(r, a, m);
          b = rshift1(b);
          a = modmul(a, a, m);
        }
      }
      if(neg && (b & n1)) {
        r = -r;
      }
      return r;
    }
  };
  result.modpow = modpow;


  // returns floored integer log b of a (e.g. b = 2 gives log2)
  // that is, returns largest integer k such that b**k <= a
  // error cases: returns 0 if a <= 0 or b <= 1
  var intlog = function(a, b) {
    if(b <= 1) return n0;
    if(a <= 1) return n0;
    if(a == b) return n1;
    var r = n0;
    while(a > 0) {
      r++;
      a = intdiv(a, b);
    }
    return r - n1;
  };
  result.intlog = intlog;


  // computes floored integer root b of a (e.g. b = 2 gives sqrt, b=3 gives cbrt)
  // that is, computes largest integer k such that k**b <= a
  // b must be positive integer
  // returns array with [result, boolean error]
  var introot = function(a, b) {
    if(b <= 0) return [n0, true];
    if(b == 1) return [a, false];
    var neg = a < 0;
    if(neg && !(b & n1)) return [n0, true];
    if(neg) a = -a;

    //if n is bigger than log2(a), the result is smaller than 2
    var l = log2(a);
    if(l == 0) return [n0, true];
    if(b > l) return [neg ? -n1 : n1, false];

    var low = n0;
    // high must be higher than the solution (not equal), otherwise the comparisons below don't work correctly.
    // estimate for higher bound: exact non-integer solution of a ^ (1 / b) is 2 ** (log2(a) / b)
    // integer approximation: ensure to use ceil of log2(a)/b to have higher upper bound, and add 1 to be sure it's higher.
    // ceil of log2(a) is l + 1, and ceil of (l + 1) / b is intdiv(l + b + 1 - 1, b)
    var high = (n2 ** intdiv(l + b, b)) + n1;
    var r;
    for (;;) {
      var r = (low + high) >> n1;
      var rr = r ** b;
      if(rr == a) return [neg ? -r : r, false];
      else if(rr < a) low = r;
      else high = r;
      if(high <= low + n1) {
        return [neg ? -low : low, false];
      }
    }
  };
  result.introot = introot;

  // integer modular inverse 1 / a modulo b
  // error cases: if a is 0 or m <= 0, returns 0
  var modinv = function(a, b) {
    if(a == 0 || m == 0) {
      return n0;
    } else {
      a = mod(a, b);
      var r = n0;
      var b0 = b;
      var x = n1, y = n0;
      for(;;) {
        if(a == 1) { r = x; break; }
        if(a == 0) { r = n0; break; }
        var d = intdiv(b, a);
        var m = b - d * a; // modulo (matching floored division)
        y -= x * d;
        b = m;

        if(b == 1) { r = y; break; }
        if(b == 0) { r = n0; break; }
        d = intdiv(a, b);
        m = a - d * b; // modulo (matching floored division)
        x -= y * d;
        a = m;
      }
      if(r < 0) r += b0;
      return r;
    }
  };
  result.modinv = modinv;


  // integer log2
  // error cases: returns 0 if a <= 0
  var log2 = function(a) {
    if(a <= 1) return n0;
    var r = n0;
    while(a > 0) {
      r++;
      a >>= n1;
    }
    return r - n1;
  };
  result.log2 = log2;

  // integer sqrt
  // error cases: returns 0 if a < 0
  var sqrt = function(a) {
    if(a <= 0) return n0;
    var r = n0;
    var s = n2;
    var as = a >> s;
    while(as != 0) {
      s += n2;
      as = a >> s;
    }
    while(s >= 0) {
      r <<= n1;
      var c2 = r + n1;
      if(c2 * c2 <= (a >> s)) {
        r = c2;
      }
      s -= n2;
    }
    return r;
  };
  result.sqrt = sqrt;



  // factorial of a modulo b. returns array of [result, overflow]
  // overflow means the real (non-modulo) result is larger than b, or error condition
  // error cases:
  // - returns 0 and sets overflow if a < 0
  // - returns 0 and sets overflow if b <= 0
  // if opt_nooverflow is true, will not treat output larger than b as overflow (but still use the overflow flag for error conditions)
  // NOTE: can be slow for a > 4096 especially if b only has large prime factors
  var factorial = function(a, b, opt_nooverflow) {
    if(a < 0) return [n0, true];
    if(b <= 0) return [n0, true];

    var pot = ((b & (b - n1)) == 0); // power of two, so can use faster mask instead of modulo division

    // if a/2 is larger than amount of output bits,
    // then we know that all visible output bits will be 0, due to the amount of
    // factors '2' in the result. So no need to compute then, plus also
    // indicate overflow
    if(pot && a > log2(b) * n2) return [n0, true && !opt_nooverflow];
    // if a is larger than b, then it's guaranteed that the modulo value itself
    // is a factor and we know the output modulo b will be 0.
    if(a >= b) return [n0, true && !opt_nooverflow];

    var r = n1;
    var overflow = false;

    if(pot) {
      var mask = b - n1;
      for(var i = n2; i <= a; i++) {
        r *= i;
        if(r > mask) {
          if(!opt_nooverflow) overflow = true;
          r &= mask;
          if(r == 0) break;
        }
      }
    } else {
      if(a >= b) {
        // result is guaranteed to be 0, since the modulo itself will be
        // contained in the factors when a >= b. So no need to compute.
        r = n0;
      } else {
        for(var i = n2; i <= a; i++) {
          r *= i;
          if(r > b) {
            if(!opt_nooverflow) overflow = true;
            r = mod(r, b);
            // once the modulo operation made the result 0, which can easily happen as soon
            // as we passed all the prime factors of b, we can stop since the result is
            // guaranteed to stay 0.
            if(r == 0) break;
          }
        }
      }
    }

    return [r, overflow];
  };
  result.factorial = factorial;

  // return array of [isprime, error]
  var isprime = function(n) {
    if(n < 2) return [false, false];
    if((n & n1) == 0) return [(n == 2) ? true : false, false];
    if((n % n3) == 0) return [(n == 3) ? true : false, false];
    if((n % n5) == 0) return [(n == 5) ? true : false, false];
    if((n % n7) == 0) return [(n == 7) ? true : false, false];
    if(!supportbigint && n > 9007199254740991) return [false, true];
    if(supportbigint && n.toString(16).length > 180) return [false, true]; // too slow for running inside LogicEmu components

    if(n < 1500000) {
      if(supportbigint) n = Number(n); // no need for BigInt for this part
      var s = Math.ceil(Math.sqrt(n)) + 6;
      p = Math.floor(7 / 6) * 6;
      while(p < s) {
        if(n % (p - 1) == 0 || n % (p + 1) == 0) return [false, false];
        p += 6;
      }
      return [true, false];
    } else {
      // Miller-Rabin
      var base;
      if(n < 1373653) base = [2, 3];
      else if(n < 9080191) base = [31, 73];
      else if(n < 4759123141) base = [2, 7, 61];
      else if(n < 1122004669633) base = [2, 13, 23, 1662803];
      else if(n < 2152302898747) base = [2, 3, 5, 7, 11];
      else if(n < 3474749660383) base = [2, 3, 5, 7, 11, 13];
      else if(n < 341550071728321) base = [2, 3, 5, 7, 11, 13, 17];
      else if(n < 3770579582154547) base = [2, 2570940, 880937, 610386380, 4130785767];
      else base = [2, 325, 9375, 28178, 450775, 9780504, 1795265022]; //valid up to >2^64
      for(var i = 0; i < base.length; i++) base[i] = B(base[i]);

      var d = rshift1(n);
      var s = n1;
      while(!(d & n1)) {
        d = rshift1(d);
        ++s;
      }

      var witness = function(n, s, d, a) {
        var x = modpow(a, d, n);
        var y;
        while(s) {
          y = modmul(x, x, n);
          if(y == n1 && x != n1 && x != n - n1) return [false, false];
          x = y;
          s--;
        }
        return y == 1;
      };

      for(var i = 0; i < base.length; i++) {
        if(!witness(n, s, d, base[i])) return [false, false];
      }
      return [true, false];
    }
  };
  result.isprime = isprime;

  // returns smallest prime that is >= n
  // returns -1 if error
  var nextprime = function(n) {
    if(n <= 2) return n2;
    if(n <= 3) return n3;
    if(!supportbigint && n >= 9007199254740881) return -n1;
    if(supportbigint && n.toString(16).length > 180) return -n1; // too slow for running inside LogicEmu components
    if(isprime(n)[0]) return n;

    var m = n % n6;
    var step = n2;
    if(m == 0 || m == 5) {
      n += (m == 0 ? n1 : n2);
      step = n4;
    } else {
      n += (n5 - m);
    }
    for(;;) {
      var p = isprime(n);
      if(p[1]) return -n1; // error
      if(p[0]) return n;
      n += step;
      step ^= n6; //swap step between 2 and 4
    }
  };
  result.nextprime = nextprime;

  // returns largest prime that is <= n
  // returns -1 if error
  var prevprime = function(n) {
    if(n < 2) return -n1; // there is no lower prime
    if(n < 3) return n2;
    if(n < 5) return n3;
    if(n < 7) return n5;
    if(!supportbigint && n > 9007199254740881) return -n1; // not supported if no BigInt
    if(supportbigint && n.toString(16).length > 180) return -n1; // too slow for running inside LogicEmu components
    if(isprime(n)[0]) return n;

    var m = n % n6;
    var step = n2;
    if(m == 0 || m == 1) {
      n -= (m + n1);
      step = n4;
    } else {
      n -= (m - n1);
    }
    for(;;) {
      var p = isprime(n);
      if(p[1]) return -n1; // error
      if(p[0]) return n;
      n -= step;
      step ^= n6; //swap step between 2 and 4
    }
  };
  result.prevprime = prevprime;


  // returns the highest possible exponent if the number is a perfect power (>= 2), or 1 if not.
  // e.g. if n is 8, returns 3 because 2^3 is 8, if n is 10 returns 1.
  var perfectpow = function(n) {
    if(n <= 3) return n1;
    var l2 = log2(n);
    for(var i = l2; i >= 2; i--) {
      var s = introot(n, i)[0];

      if(s ** i == n) return i;
    }

    return n1;
  };
  result.perfectpow = perfectpow;


  var pollard_rho = function(n, c) {
    var count = 0;
    // limit amount of iterations, to avoid slow components in logicemu.
    // the limit is chosen such that a product of two 32-bit primes can still
    // usually be factorized but the total runtime will not take more than a
    // fraction of a second. For lager numbers, the max iteration count is
    // severely reduced because the gcd's take longer in that case.
    var limit = 70000;
    if(n > (2 ** 65)) limit = 1000;
    for(;;) {
      var x = n2;
      var y = n2;
      var d = n1;

      while(d == 1) {
        if(count++ > limit) return n0;
        // Turtle
        x = (x * x + c) % n;
        // Hare
        y = (y * y + c) % n;
        y = (y * y + c) % n;
        d = gcd(x - y, n);
      }

      if(d == n) {
        c++;
        continue;
      }
      return d;
    }
  };

  var firstprimes = [n2, n3, n5, n7, n11, n13, n17];

  // returns smallest prime factor of n, or 0 if factorizing it takes too long.
  // can usually find the product of two 32-bit primes in time.
  // NOTE: factorization is most difficult when n is a product of two different large primes
  var smallestfactor = function(n) {
    if(n < 0) return -n1;
    if(n == 0) return n0;
    if(n == 1) return n1;
    for(var i = 0; i < firstprimes.length; i++) {
      if(n % firstprimes[i] == 0) return firstprimes[i];
    }

    var p = perfectpow(n);
    if(p > n1) return smallestfactor(introot(n, p)[0]);

    p = isprime(n);
    if(p[1]) return n0; // error
    if(p[0]) return n; // prime

    var r = pollard_rho(n, n1);
    if(r == n || r == 1) return r;

    // recursively factor to ensure getting the smallest factor
    var r0 = smallestfactor(r);
    var r1 = smallestfactor(intdiv(n, r));
    return (r0 < r1) ? r0 : r1;
  };
  result.smallestfactor = smallestfactor;

  // returns all prime factors of n
  var factorize = function(n) {
    if(n == 0 || n == 1) return [n];
    var result = [];
    if(n < 0) {
      if(n == -1) return [-n1];
      result = factorize(-n);
      if(result.length == 0) return []; // error
      result.unshift(-n1);
      return result;
    }
    for(var i = 0; i < firstprimes.length; i++) {
      while(!(n % firstprimes[i])) {
        result.push(firstprimes[i]);
        n = intdiv(n, firstprimes[i]);
      }
    }

    if(n == 1) return result;

    var p = perfectpow(n);
    if(p > n1) {
      var f = factorize(introot(n, p)[0]);
      for(var i = 0; i < f.length; i++) {
        for(var j = n0; j < p; j++) {
          result.push(f[i]);
        }
      }
      return result;
    }

    p = isprime(n);
    if(p[1]) return []; // error
    if(p[0]) {
      result.push(n); // prime
      return result;
    }

    var r = pollard_rho(n, n1);
    if(r == 0) return []; // too slow, error

    // recursively factor, each side could have more factors
    var r0 = factorize(r);
    if(r0.length == 0) return []; // error
    var r1 = factorize(intdiv(n, r));
    if(r1.length == 0) return []; // error
    for(var i = 0; i < r0.length; i++) result.push(r0[i]);
    for(var i = 0; i < r1.length; i++) result.push(r1[i]);
    result.sort(function(a, b) { return a < b ? -1 : (a > b ? 1 : 0); });
    return result;
  };
  result.factorize = factorize;

  var factorize2 = function(n) {
    var f = factorize(n);
    var result = [];
    for(var i = 0; i < f.length; i++) {
      var p = f[i];
      var e = n1; // exponent of identical primes
      while(i + 1 < f.length && f[i + 1] == p) {
        e++;
        i++;
      }
      result.push([p, e]);
    }
    return result;
  };
  result.factorize2 = factorize2;

  var allfactors = function(n) {
    var f = factorize2(n);
    if(f.length == 0) return [];

    var result = [n1];
    for(var i = 0; i < f.length; i++) {
      var len2 = result.length;
      var p = f[i][0];
      var e = f[i][1];
      for(var j = 0; j < e; j++) {
        for(var k = 0; k < len2; k++) {
          result.push(result[k] * p);
        }
        p *= f[i][0];
      }
    }
    result.sort(function(a, b) { return a < b ? -1 : (a > b ? 1 : 0); });
    return result;
  };
  result.allfactors = allfactors;

  // returns smallest positive integer r such that a**r = 1 (mod m)
  // this is a special case of discrete log, where b == 1, but computed in a different way
  // TODO: doesn't work for 10007n, 1000000000000000000000007n. Answer should be: 1000000000000000000000006n
  // probable reason: must use not just prime factors, but all unique factors (including non prime ones, but no need to repeat same ones), for f2 at least (for f prime factors is ok)
  var multiplicativeorder = function(a, m) {
    if(m == 0) return -n1;
    if(gcd(a, m) != 1) return n0;
    a = mod(a, m);
    var f = factorize2(m);
    if(f.length == 0) return -n1; // error, too difficult
    var result = n0;
    for(var i = 0; i < f.length; i++) {
      var p = f[i][0];
      var e = f[i][1];
      var m2 = p ** e;
      var t = intdiv(m2, p) * (p - n1);
      var f2 = allfactors(t);
      for(var j = 0; j < f2.length; j++) {
        if(modpow(a, f2[j], m2) == 1) {
          if(!result) result = n1;
          result = lcm(result, f2[j]);
          break;
        }
      }
    }
    return result;
  };
  result.multiplicativeorder = multiplicativeorder;

  // baby-step-giant-step algorithm for discrete log
  var bsgs = function(a, b, m) {
    var n = sqrt(m) + n1;
    var limit = 70000; // limit amount of iterations, to not make logicemu components too slow to compute

    var o = {};
    var e = modpow(a, n, m);
    var an = e;
    for(var i = n1; i <= n; i++) {
      if(i > limit) break;
      var k = e.toString(16);  // JS object keys are strings, by default BigInt converts to decimal string which is much slower.
      if(!o[k]) o[k] = i; // prefer smaller values as result
      e = modmul(e, an, m);
    }
    e = n1;
    var result = n0;
    for(var i = n0; i < n; i++) {
      if(i > limit) {
        if(!result) return -n1;
        break;
      }
      var c = modmul(e, b, m);
      var v = o[c.toString(16)];
      if(v != undefined) {
        var r = v * n - i;
        if(result == 0 || r < result) {
          result = r; // continue instead of immediately returning: try to find smaller result
        }
      }
      e = modmul(e, a, m);
    }
    return result;
  };


  // computes r such that a**r = b (mod m).
  // This problem is of similar computational difficulty as integer factorization.
  // If b is 1, computes multiplicative order: r such that a**r = 1 (mod m)
  // Returns 0 if it's known there is no result, -1 if it failed to compute (took too long)
  var discretelog = function(a, b, m) {
    if(m <= 0)  return -n1;
    var r = (b == 1) ? multiplicativeorder(a, m) : bsgs(a, b, m);

    var test = modpow(a, r, m);
    var test2 = mod(b, m);

    if(r <= 0) return r;
    if(test != test2) {
      return -n1;
    }
    return r;
  };
  result.discretelog = discretelog;

  // Euler's totient function: counts amount of positive integers <= n that are relatively prime to n
  var totient = function(n) {
    if(n == 0 || n == 1) return n;
    var f = factorize2(n);
    if(f.length == []) return -n1; // error
    var r = n;
    for(var i = 0; i < f.length; i++) {
      r -= r / f[i][0];
    }
    return r;
  };
  result.totient = totient;

  var legendre  = function(n, p) {
    return modpow(n, (p - n1) >> n1, p);
  };

  // Tonelli–Shanks algorithm for quadratic residue (square root of n modulo p). p must be prime.
  var ressol = function(n, p) {
    if(p == 2) return n0;
    if (p < 2) return -n1; // error
    n = mod(n, p);
    var q = p - n1;
    var s = n0;
    while((q & n1) == 0) {
      q >>= n1;
      s++;
    }
    if(s == 1) {
      var r = modpow(n, (p + n1) >> n2, p);
      if(mod(r * r, p) != n) return n0;
      return r;
    }

    var nr = n1; // find a non-residue
    for(;;) {
      nr++;
      if(legendre(nr, p) > 1) break; // if legendre symbol is -1
    }

    var c = modpow(nr, q, p);
    var r = modpow(n, (q + n1) >> n1, p);
    var t = modpow(n, q, p);
    var m = s;
    while(t != 1) {
      var tmp = t;
      var i = n0;
      while(tmp != 1) {
        tmp = (tmp * tmp) % p;;
        i++;
        if(i >= m) return n0;
      }
      var b = modpow(c, modpow(n2, m - i - n1, p - n1), p);
      tmp = (b * b) % p;
      r = (r * b) % p;
      t = (t * tmp) % p;;
      c = tmp;
      m = i;
    }

    if ((r * r)% p != n) return n0;
    return r;
  };
  result.ressol = ressol;


  var binomtoobig = supportbigint ? (n1 << B(65536)) : 9007199254740992;

  var binomial = function(n, k) {
    if(k > n) return n0;
    if(n == k || k == 0) return n1;
    if(k * n2 > n) k = n - k;
    var r = n - k + n1;
    for(var i = n2; i <= k; i++) {
      r *= (n - k + i);
      r /= i;
      if(r > binomtoobig) return n0; // bail out
    }
    return r;
  };
  result.binomial = binomial;

  // does not use BigInt, for now
  // uses IEEE rules
  var createfloat = function(sign, exp, mantissa, expbits, mantissabits) {
    if(expbits == 0 && mantissabits == 0) {
      return sign ? -0 : 0;
    }
    var subnormal = (exp == 0);
    var special = (exp == (1 << expbits) - 1);
    if(special) {
      if(sign) return mantissa ? -NaN : -Infinity;
      return mantissa ? NaN : Infinity;
    }
    var bias = (1 << (expbits - 1)) - 1;
    exp -= bias;
    if(subnormal) exp++;
    mantissa /= Math.pow(2, mantissabits);
    if(!subnormal) mantissa += 1;

    var result = mantissa;
    result *= Math.pow(2, exp);
    if(sign) result = -result;
    return result;
  };
  result.createfloat = createfloat;

  // returns [sign, mantissa, exponent] all as unsigned binary integers
  var dissectfloat = function(f, expbits, mantissabits) {
    // NOTE: in the pathalogical case of 3, 2 or 1 bits, we have respectively: SEM, SE, S (where S=sign bit, E=exponent bits, M=mantissa bits). So e.g. the 2-bit case only supports 0, -0, Inf and -Inf.
    if(expbits == 0 && mantissabits == 0) return [(f < 0) ? 1 : 0, 0, 0];
    var sign = 0;
    if(f < 0) {
      f = -f;
      sign = 1;
    }
    var maxexp = (1 << expbits) - 1;
    if(f == Infinity) {
      return [sign, maxexp, 0];
    }
    if(isNaN(f)) {
      return [sign, maxexp, 1];
    }
    if(f == 0) {
      if(1 / f < 0) sign = 1; // for the case of negative zero (-0)
      return [sign, 0, 0];
    }

    var exp = 0;
    while(f >= 2) {
      f /= 2;
      exp++;
    }
    while(f < 1) {
      f *= 2;
      exp--;
    }
    var bias = (1 << (expbits - 1)) - 1;
    exp += bias;
    if(exp < 1) {
      // subnormal number
      var mantissa = Math.floor(f * Math.pow(2, mantissabits + exp - 1));
      return [sign, 0, mantissa];
    }
    if(exp >= maxexp) {
      // overflow, return infinity
      return [sign, maxexp, 0];
    }
    var mantissa = Math.floor((f - 1) * Math.pow(2, mantissabits));
    return [sign, exp, mantissa];
  };
  result.dissectfloat = dissectfloat;

  // approximation of gamma function, for floating point input
  var gamma = function(x) {
    if(x <= 0 && x == Math.round(x)) return Infinity;
    if(x > 200) return Infinity;
    if(x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
    var p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    x -= 1;
    var y = p[0];
    for(var i = 1; i < 7 + 2; i++) {
      y += p[i] / (x + i);
    }
    var t = x + 7 + 0.5;
    return Math.sqrt(Math.PI * 2) * Math.pow(t, x + 0.5) * Math.exp(-t) * y;
  };
  result.gamma = gamma;

  var loggamma = function(x) {
    if(x < 0) {
      if(x == Math.floor(x)) return Infinity;
      var l = Math.log(Math.PI / Math.abs((Math.sin(Math.PI * x))));
      return l - loggamma(1 - x);
    }
    if(x == 1 || x == 2) return 0;
    if(x == Infinity) return Infinity;
    if(x == -Infinity) return NaN;
    if(x > -20 && x < 20) return Math.log(Math.abs(gamma(x)));

    // stirling series
    var x3 = x * x * x;
    var x5 = x3 * x * x;
    var x7 = x5 * x * x;
    var x9 = x7 * x * x;
    var result = 0.918938533204672669540968854562; //0.5 * ln(2pi)
    result += (x - 0.5) * Math.log(x) - x + 1.0 / (x * 12) -1.0 / (x3 * 360) + 1.0 / (x5 * 1260) - 1.0 / (x7 * 1680) + 1.0 / (x9 * 1188);
    return result;
  };
  result.loggamma = loggamma;

  // approximation of Lamber's W function (principal branch, for real values above -1/e), for floating point input
  var lambertw = function(x) {
    if(isNaN(x)) return NaN;
    if(x == Infinity || x == -Infinity) return Infinity;

    if(x >= -1.0 / Math.E && x <= 703) {
      //Newton's method. Only works up to 703
      var wj = x < 10 ? 0 : Math.log(x) - Math.log(Math.log(x)); // Without good starting value, it requires hundreds of iterations rather than just 30.
      var num = Math.max(30, x > 0 ? 10 + Math.floor(x) : 30);
      for(var i = 0; i < num; i++) {
        var ew = Math.exp(wj);
        wj = wj - ((wj * ew - x) / (ew + wj * ew));
      }
      return wj;
    } else if (x > 0) {
      var step = 1;
      var lastDir = 0;
      var result = Math.log(x) - Math.log(Math.log(x)); // good starting value speeds up iterations. E.g. only 76 instead of 292 for 7e100.
      for(;;) {
        if(step == 0 || step * 0.5 == step || result + step == result) return result; //avoid infinite loop
        var v = result * Math.exp(result);
        if(Math.abs(v - x) <= 1e-15) return result;
        if(v > x) {
          result -= step;
          if(lastDir == -1) step *= 0.5;
          lastDir = 1;
        } else {
          result += step;
          if(lastDir == 1) step *= 0.5;
          lastDir = -1;
        }
      }
    }
    return NaN;
  };
  result.lambertw = lambertw;

  // Faddeeva function: w(z) = exp(-z^2)*erfc(-iz)
  var faddeeva = function(x, y) {
    var invsqrtpi2   = 2 / Math.sqrt(Math.PI);
    var cexp = function(x, y) {
      var e = Math.exp(x);
      return [e * Math.cos(y), e * Math.sin(y)];
    };
    var cmul = function(a, b, c, d) {
      return [a * c - b * d, a * d + b * c];
    };
    var cinv = function(x, y) {
      var d = x * x + y * y;
      return [x / d, -y / d];
    };
    var rho2 = (x / 6.3 * x / 6.3) + (y / 4.4 * y / 4.4);
    if(y < 0 && rho2 >= 0.292 * 0.292) {
      if(x == 0 && y < -26.64) return [Infinity, 0];
      var e = cexp(y * y - x * x, -2 * x * y);
      var f = R.faddeeva(-x, -y);
      return [2 * e[0] - f[0], 2 * e[1] - f[1]];
    }
    var result = [0, 0];
    if(rho2 < 0.292 * 0.292) {
      var s = (1 - 0.85 * y / 4.4) * Math.sqrt(rho2);
      var n = Math.ceil(6 + 72 * s);
      var kk = 1;
      var zz = [y * y - x * x, -2 * x * y];
      var t = [y, -x];
      for(var k = 0; k < n; k++) {
        if(k > 0) {
          kk *= -k;
          t = cmul(t[0], t[1], zz[0], zz[1]);
        }
        result[0] += t[0] / (kk * (2 * k + 1));
        result[1] += t[1] / (kk * (2 * k + 1));
      }
      var e = cexp(zz[0], zz[1]);
      result = cmul(e[0], e[1], result[0], result[1]);
      result[0] = e[0] - result[0] * invsqrtpi2;
      result[1] = e[1] - result[1] * invsqrtpi2;
    } else if(rho2 < 1.0) {
      var s = (1 - y / 4.4) * Math.sqrt(1 - rho2);
      var nu = Math.ceil(16 + 26 * s) + 1;
      var n = Math.ceil(7  + 34 * s) + 1;
      var h = 1.88 * s;

      var w = [0, 0];
      for (var k = nu; k > n; k--) {
        w = cinv(2 * (y + k * w[0] + h), 2 * (k * w[1] - x));
      }
      var hh = Math.pow(h * 2, n - 1);
      for (var k = n; k > 0; k--) {
        w = cinv(2 * (y + k * w[0] + h), 2 * (k * w[1] - x));
        result = cmul(result[0] + hh, result[1], w[0], w[1]);
        hh /= (h * 2);
      }
      result[0] *= invsqrtpi2;
      result[1] *= invsqrtpi2;
    } else {
      var nu = Math.ceil(3 + (1442 / (26 * Math.sqrt(rho2) + 77))) + 1;
      for (var k = nu; k > 0; k--) {
        result = cinv(2 * (y + k * result[0]), 2 * (k * result[1] - x));
      }
      result[0] *= invsqrtpi2;
      result[1] *= invsqrtpi2;
    }

    if(x == 0) result[1] = 0;
    if(y == 0) result[0] = Math.exp(-x * x);
    return result;
  };

  var erf = function(x, y) {
    var a = Math.exp(-x * x);
    if(x >= 0) return 1 - a * faddeeva(0, x)[0];
    else return a * faddeeva(0, -x)[0] - 1;
  };
  result.erf = erf;

  var erfc = function(x, y) {
    var a = Math.exp(-x * x);
    if(x >= 0) return a * faddeeva(0, x)[0];
    else return 2 - a * faddeeva(0, -x)[0];
  };
  result.erfc = erfc;

  var besselj = function(n, x) {
    if(n < 0 && Math.floor(n) == n) {
      return (n & 1) ? -besselj(-n, x) : besselj(-n, x);
    }
    if(x == 0) return n == 0 ? 1 : ((n > 0 || Math.floor(n) == n) ? 0 : Infinity);
    if(n == -0.5) return Math.sqrt(2 / (Math.PI * x)) * Math.cos(x);
    if(n == 0.5) return Math.sqrt(2 / (Math.PI * x)) * Math.sin(x);
    // For 0 and 1, provide implementation that supports large |x| as well
    if((n == 0 || n == 1) && Math.abs(x) > 12) {
      var a = (n == 0) ? [-0.703125e-1, 0.112152099609375, -0.5725014209747314, 0.6074042001273483, -0.1100171402692467e3, 0.03038090510922384e4, -0.1188384262567832e6, 0.06252951493434797e7, -0.4259392165047669e9, 0.03646840080706556e11, -0.3833534661393944e13, 0.04854014686852901e15] : [0.1171875,-0.144195556640625, 0.6765925884246826,-0.6883914268109947e1, 0.1215978918765359e3, -0.3302272294480852e4, 0.1276412726461746e6, -0.6656367718817688e7, 0.4502786003050393e9, -0.3833857520742790e11, 0.4011838599133198e13, -0.5060568503314727e15];
      var b = (n == 0) ? [0.732421875e-1, -0.2271080017089844, 0.1727727502584457e1, -0.2438052969955606e2, 0.5513358961220206e3, -0.1825775547429318e5, 0.8328593040162893e6, -0.5006958953198893e8, 0.3836255180230433e10, -0.3649010818849833e12, 0.4218971570284096e14, -0.5827244631566907e16] : [-0.1025390625,0.2775764465332031, -0.1993531733751297e1,0.2724882731126854e2, -0.6038440767050702e3, 0.1971837591223663e5, -0.8902978767070678e6, 0.5310411010968522e8, -0.4043620325107754e10, 0.3827011346598605e12, -0.4406481417852278e14, 0.6065091351222699e16];
      var ca = 1, cb = ((n == 0 ? -0.125 : 0.375) / x);
      var xx = 1;
      for(var k = 0; k < 12; k++) {
        xx /= x * x;
        ca += xx * a[k];
        cb += xx / x * b[k];
      }
      var p = x - (Math.PI * (n == 0 ? 0.25 : 0.75));
      return Math.sqrt(1 / (x * (Math.PI / 2))) * (ca * (Math.cos(p)) - (cb * (Math.sin(p))));
    }
    // series for others
    var r = 1;
    var e = 1;
    var s = -x * x / 4;
    var maxit = 50;
    for(var i = 1; i <= maxit; i++) {
      e *= s / (i * (n + i));
      if((i == maxit && Math.abs(e) < 1e-15) || e == 0) {
        return r * Math.pow(x, n) / (Math.pow(2, n) * gamma(n + 1));
      }
      r += e;
    }
    // The series did not have enough numerical precision to converge. Return NaN.
    // Implementing alternative algorithms for large values of x is too much code to be worth it in this logic simulator.
    return NaN;
  };
  result.besselj = besselj;

  return result;
}());
