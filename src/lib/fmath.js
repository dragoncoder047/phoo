const { sin, cos, round, abs, floor, min, max, sqrt, pow, log, exp, PI, E } = Math;
const TWO_PI = 2 * PI;

import { Module } from '../core/namespace.js';
import { addFunctionAsWord as a } from '../core/index.js';

export const module = new Module('_fmath');

a(module, nn(1), 'gamma', gamma);
a(module, nn(1), 'loggamma', loggamma);
a(module, nn(1), 'W', lambertw);
a(module, nn(2), 'erf', erf);
a(module, nn(2), 'erfc', erfc);
a(module, nn(2), 'J', besselj);

function nn(n) { var r = []; for (var i = 0; i < n; i++) r.push('number'); return r; }

// approximation of gamma function, for floating point input
function gamma(x) {
    if (x <= 0 && x == round(x)) return Infinity;
    if (x > 200) return Infinity;
    if (x < 0.5) return PI / (sin(PI * x) * gamma(1 - x));
    const p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    x -= 1;
    var y = p[0];
    for (var i = 1; i < 7 + 2; i++) {
        y += p[i] / (x + i);
    }
    var t = x + 7 + 0.5;
    return sqrt(TWO_PI) * pow(t, x + 0.5) * exp(-t) * y;
}

function loggamma(x) {
    if (x < 0) {
        if (x == floor(x)) return Infinity;
        var l = log(PI / abs(sin(PI * x)));
        return l - loggamma(1 - x);
    }
    if (x == 1 || x == 2) return 0;
    if (x == Infinity) return Infinity;
    if (x == -Infinity) return NaN;
    if (x > -20 && x < 20) return log(abs(gamma(x)));

    // stirling series
    var x3 = x * x * x;
    var x5 = x3 * x * x;
    var x7 = x5 * x * x;
    var x9 = x7 * x * x;
    var result = 0.918938533204672669540968854562; // 0.5 * log(TWOPI)
    result += (x - 0.5) * log(x) - x + 1.0 / (x * 12) - 1.0 / (x3 * 360) + 1.0 / (x5 * 1260) - 1.0 / (x7 * 1680) + 1.0 / (x9 * 1188);
    return result;
}


function lambertw(x) {
    if (isNaN(x)) return NaN;
    if (x == Infinity || x == -Infinity) return Infinity;

    if (x >= -1.0 / E && x <= 703) {
        // Newton's method. Only works up to 703
        var wj = x < 10 ? 0 : log(x) - log(log(x)); // Without good starting value, it requires hundreds of iterations rather than just 30.
        var num = max(30, x > 0 ? 10 + floor(x) : 30);
        for (var i = 0; i < num; i++) {
            var ew = exp(wj);
            wj = wj - ((wj * ew - x) / (ew + wj * ew));
        }
        return wj;
    } else if (x > 0) {
        var step = 1;
        var lastDir = 0;
        var result = log(x) - log(log(x)); // good starting value speeds up iterations. E.g. only 76 instead of 292 for 7e100.
        while (true) {
            if (step == 0 || step * 0.5 == step || result + step == result) return result; // avoid infinite loop
            var v = result * exp(result);
            if (abs(v - x) <= 1e-15) return result;
            if (v > x) {
                result -= step;
                if (lastDir == -1) step *= 0.5;
                lastDir = 1;
            } else {
                result += step;
                if (lastDir == 1) step *= 0.5;
                lastDir = -1;
            }
        }
    }
    return NaN;
}

// Faddeeva function: w(z) = exp(-z^2)*erfc(-iz)
// internal
function faddeeva(x, y) {
    const TWO_OVER_SQRT_PI = 2 / sqrt(PI);
    function cexp(x, y) {
        var e = exp(x);
        return [e * cos(y), e * sin(y)];
    }
    function cmul(a, b, c, d) {
        return [a * c - b * d, a * d + b * c];
    }
    function cinv(x, y) {
        var d = x * x + y * y;
        return [x / d, -y / d];
    }
    var rho2 = (x / 6.3 * x / 6.3) + (y / 4.4 * y / 4.4);
    var e, f, s, n, k, kk, zz, t, nu, h, hh, w;
    if (y < 0 && rho2 >= 0.292 * 0.292) {
        if (x == 0 && y < -26.64) return [Infinity, 0];
        e = cexp(y * y - x * x, -2 * x * y);
        f = faddeeva(-x, -y);
        return [2 * e[0] - f[0], 2 * e[1] - f[1]];
    }
    var result = [0, 0];
    if (rho2 < 0.292 * 0.292) {
        s = (1 - 0.85 * y / 4.4) * sqrt(rho2);
        n = ceil(6 + 72 * s);
        kk = 1;
        zz = [y * y - x * x, -2 * x * y];
        t = [y, -x];
        for (k = 0; k < n; k++) {
            if (k > 0) {
                kk *= -k;
                t = cmul(t[0], t[1], zz[0], zz[1]);
            }
            result[0] += t[0] / (kk * (2 * k + 1));
            result[1] += t[1] / (kk * (2 * k + 1));
        }
        e = cexp(zz[0], zz[1]);
        result = cmul(e[0], e[1], result[0], result[1]);
        result[0] = e[0] - result[0] * TWO_OVER_SQRT_PI;
        result[1] = e[1] - result[1] * TWO_OVER_SQRT_PI;
    } else if (rho2 < 1.0) {
        s = (1 - y / 4.4) * sqrt(1 - rho2);
        nu = ceil(16 + 26 * s) + 1;
        n = ceil(7 + 34 * s) + 1;
        h = 1.88 * s;

        w = [0, 0];
        for (k = nu; k > n; k--) {
            w = cinv(2 * (y + k * w[0] + h), 2 * (k * w[1] - x));
        }
        hh = pow(h * 2, n - 1);
        for (k = n; k > 0; k--) {
            w = cinv(2 * (y + k * w[0] + h), 2 * (k * w[1] - x));
            result = cmul(result[0] + hh, result[1], w[0], w[1]);
            hh /= (h * 2);
        }
        result[0] *= TWO_OVER_SQRT_PI;
        result[1] *= TWO_OVER_SQRT_PI;
    } else {
        nu = ceil(3 + (1442 / (26 * sqrt(rho2) + 77))) + 1;
        for (k = nu; k > 0; k--) {
            result = cinv(2 * (y + k * result[0]), 2 * (k * result[1] - x));
        }
        result[0] *= TWO_OVER_SQRT_PI;
        result[1] *= TWO_OVER_SQRT_PI;
    }

    if (x == 0) result[1] = 0;
    if (y == 0) result[0] = exp(-x * x);
    return result;
}

function erf(x, y) {
    var a = exp(-x * x);
    if (x >= 0) return 1 - a * faddeeva(0, x)[0];
    else return a * faddeeva(0, -x)[0] - 1;
}

function erfc(x, y) {
    var a = exp(-x * x);
    if (x >= 0) return a * faddeeva(0, x)[0];
    else return 2 - a * faddeeva(0, -x)[0];
}

function besselj(n, x) {
    if (n < 0 && floor(n) == n) {
        return (n & 1) ? -besselj(-n, x) : besselj(-n, x);
    }
    if (x == 0) return n == 0 ? 1 : ((n > 0 || floor(n) == n) ? 0 : Infinity);
    if (n == -0.5) return sqrt(2 / (PI * x)) * cos(x);
    if (n == 0.5) return sqrt(2 / (PI * x)) * sin(x);
    // For 0 and 1, provide implementation that supports large |x| as well
    if ((n == 0 || n == 1) && abs(x) > 12) {
        var a = (n == 0) ? [-0.703125e-1, 0.112152099609375, -0.5725014209747314, 0.6074042001273483, -0.1100171402692467e3, 0.03038090510922384e4, -0.1188384262567832e6, 0.06252951493434797e7, -0.4259392165047669e9, 0.03646840080706556e11, -0.3833534661393944e13, 0.04854014686852901e15] : [0.1171875, -0.144195556640625, 0.6765925884246826, -0.6883914268109947e1, 0.1215978918765359e3, -0.3302272294480852e4, 0.1276412726461746e6, -0.6656367718817688e7, 0.4502786003050393e9, -0.3833857520742790e11, 0.4011838599133198e13, -0.5060568503314727e15];
        var b = (n == 0) ? [0.732421875e-1, -0.2271080017089844, 0.1727727502584457e1, -0.2438052969955606e2, 0.5513358961220206e3, -0.1825775547429318e5, 0.8328593040162893e6, -0.5006958953198893e8, 0.3836255180230433e10, -0.3649010818849833e12, 0.4218971570284096e14, -0.5827244631566907e16] : [-0.1025390625, 0.2775764465332031, -0.1993531733751297e1, 0.2724882731126854e2, -0.6038440767050702e3, 0.1971837591223663e5, -0.8902978767070678e6, 0.5310411010968522e8, -0.4043620325107754e10, 0.3827011346598605e12, -0.4406481417852278e14, 0.6065091351222699e16];
        var ca = 1, cb = ((n == 0 ? -0.125 : 0.375) / x);
        var xx = 1;
        for (var k = 0; k < 12; k++) {
            xx /= x * x;
            ca += xx * a[k];
            cb += xx / x * b[k];
        }
        var p = x - (PI * (n == 0 ? 0.25 : 0.75));
        return sqrt(1 / (x * (PI / 2))) * (ca * cos(p) - (cb * sin(p)));
    }
    // series for others
    var r = 1;
    var e = 1;
    var s = -x * x / 4;
    const ITERATIONS = 50;
    for (var i = 1; i <= ITERATIONS; i++) {
        e *= s / (i * (n + i));
        if ((i == ITERATIONS && abs(e) < 1e-15) || e == 0) {
            return r * pow(x, n) / (pow(2, n) * gamma(n + 1));
        }
        r += e;
    }
    // The series did not have enough numerical precision to converge. Return NaN.
    // Implementing alternative algorithms for large values of x is too much code to be worth it.
    return NaN;
}

