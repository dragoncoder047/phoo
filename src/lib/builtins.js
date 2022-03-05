/**
 * @fileoverview
 * Builtin words, builders, and literalizers in the standard Phoo distribution that,
 * for speed or semantics, must be defined in Javascript and not native Phoo code.
 */

import { type, name, word } from '../core/utils.js';
import { IllegalOperation, UnexpectedEOF, StackUnderflow, PhooError } from '../core/errors.js';
import { batchAdd } from '../helpers.js';
import { pStackTrace } from '../core/constants.js';
import { Phoo } from '../core/index.js';

// var [, word, code] = /^(?:\s*)(\S+)([\S\s]*)$/.exec(code);

// builders

/**
 * @this Phoo
 */
function blockComment() {
    var code = this.pop('string');
    if (!/\s\*\/\s/.test(code)) {
        throw new UnexpectedEOF('/*: Unclosed block comment.');
    }
    var [, code] = code.split(/\s\*\/\s/, 1); /* jshint ignore:line */
    this.push(code);
}

/**
 * @this Phoo
 */
function string() {
    var code = this.pop('string');
    code = code.replace(/^\s+/, ''); // strip leading white space after $
    var delim = code[0];
    code = code.slice(1);
    if (code.indexOf(delim) < 0) {
        throw new UnexpectedEOF('$: Unterminated string literal.');
    }
    var [str, code] = code.split(delim, 1); /* jshint ignore:line */

    var [, formatCode, code] = /^(?:(\S+)|(?:\s+))([\S\s]*)$/.exec(code); /* jshint ignore:line */
    // do something with format code stuck onto end delimiter???
    // ignoring it for now
    code = formatCode + code;

    var array = this.pop('array');
    array.push(str);
    this.push(array);
    this.push(code);
}

/**
 * @this Phoo
 */
function openBracket() {
    var s = this.pop('string');
    this.push([]);
    this.push(s);
}

/**
 * @this Phoo
 */
function closeBracket() {
    var s = this.pop('string');
    var i = this.pop('array');
    var o = this.pop('array');
    o.push(i);
    this.push(o);
    this.push(s);
}

// words

/**
 * @this Phoo
 */
function dup() {
    var a = this.pop();
    this.push(a);
    this.push(a);
}

/**
 * @this Phoo
 */
function drop() {
    this.pop();
}

/**
 * @this Phoo
 */
function swap() {
    var a = this.pop();
    var b = this.pop();
    this.push(a);
    this.push(b);
}

/**
 * @this Phoo
 */
function onePlus() {
    // cSpell:ignore bignum
    var n = this.pop('>bignum');
    this.push(++n);
}

/**
 * @this Phoo
 */
function oneMinus() {
    var n = this.pop('>bignum');
    this.push(--n);
}

/**
 * @this Phoo
 */
function sum() {
    this.push(this.pop('>bignum') + this.pop('>bignum'));
}

/**
 * @this Phoo
 */
function negate() {
    this.push(-this.pop('>bignum'));
}

/**
 * @this Phoo
 */
function product() {
    this.push(this.pop('>bignum') * this.pop('>bignum'));
}

/**
 * @this Phoo
 */
function exp() {
    var exponent = this.pop('>bignum');
    var base = this.pop('>bignum');
    this.push(base ** exponent);
}

// cSpell:ignore divmod
/**
 * @this Phoo
 */
function divmod() {
    var divisor = this.pop('>bignum');
    var dividend = this.pop('>bignum');
    var quot = dividend / divisor;
    if (type(quot) !== 'bigint') quot = Math.floor(quot);
    this.push(quot);
    this.push(dividend % divisor);
}

/**
 * @this Phoo
 */
function div() {
    var divisor = this.pop('>bignum');
    var dividend = this.pop('>bignum');
    this.push(dividend / divisor);
}

/**
 * @this Phoo
 */
function eq() {
    this.push(this.pop() == this.pop());
}

/**
 * @this Phoo
 */
function gt() {
    var a = this.pop('>bignum');
    var b = this.pop('>bignum');
    this.push(b > a);
}

/**
 * @this Phoo
 */
function nand() {
    var a = this.pop('>bool');
    var b = this.pop('>bool');
    //     or !(a && b)
    // de Morgan's law
    this.push(!a || !b);
}

// cSpell:ignore bitinv bitand bitor bitxor
/**
 * @this Phoo
 */
function bitinv() {
    this.push(~this.pop('>bignum'));
}

/**
 * @this Phoo
 */
function bitand() {
    this.push(this.pop('>bignum') & this.pop('>bignum'));
}

/**
 * @this Phoo
 */
function bitor() {
    this.push(this.pop('>bignum') | this.pop('>bignum'));
}

/**
 * @this Phoo
 */
function bitxor() {
    this.push(this.pop('>bignum') ^ this.pop('>bignum'));
}

/**
 * @this Phoo
 */
function shl() {
    var places = this.pop('>bignum');
    var num = this.pop('>bignum');
    this.push(num << places);
}

/**
 * @this Phoo
 */
function put() {
    var a = this.pop('array');
    a.push(this.pop());
}

/**
 * @this Phoo
 */
function take() {
    var a = this.pop('array');
    var fff;
    if (type(a[0]) === 'symbol')
        fff = this.lookupWord(name(a[0]))[0];
    else
        fff = a[0][0];
    if (fff === word('immovable'))
        throw new IllegalOperation('take: Cannot `take` an immovable item.');
    if (a.length < 1)
        throw new StackUnderflow('take: Unexpectedly empty array.');
    this.push(a.pop());
}

/**
 * @this Phoo
 */
function metaDone() {
    this.retPop();
}

/**
 * @this Phoo
 */
function metaAgain() {
    var entry = this.retPop();
    entry.pc = -1;
    this.retPush(entry);
}

// cSpell:ignore cjump
/**
 * @this Phoo
 */
function cjump() {
    var amount = this.pop('>num');
    var test = this.pop('>bool');
    if (!test) {
        var entry = this.retPop();
        entry.pc += amount;
        this.retPush(entry);
    }
}

/**
 * @this Phoo
 */
function metaLiteral() {
    var entry = this.retPop();
    entry.pc++;
    if (entry.arr.length <= entry.pc)
        throw new IllegalOperation("]'[: ' at the end of an array");
    this.push(entry.arr[entry.pc]);
    this.retPush(entry);
}

/**
 * @this Phoo
 */
function metaDo() {
    var arr = this.pop();
    if (type(arr) !== 'array') arr = [arr];
    this.retPush({ arr, pc: -1 });
}

/**
 * @this Phoo
 */
function metaThis() {
    var entry = this.retPop();
    this.retPush(entry);
    this.push(entry.arr);
}

/**
 * @this Phoo
 */
function lower() {
    this.push(this.pop('string').toLowerCase());
}

/**
 * @this Phoo
 */
function upper() {
    this.push(this.pop('string').toUpperCase());
}

/**
 * @this Phoo
 */
function strConcat() {
    var a = this.pop('>str');
    var b = this.pop('>str');
    this.push(b + a);
}

/**
 * @this Phoo
 */
function newArray() {
    this.push([]);
}

/**
 * @this Phoo
 */
function arrConcat() {
    var a = this.pop();
    var b = this.pop();
    if (type(a) !== 'array') a = [a];
    if (type(b) !== 'array') b = [b];
    this.push(b.concat(a));
}

/**
 * @this Phoo
 */
function split() {
    var i = this.pop('>bignum');
    var a = this.pop('string', 'array');
    this.push(a.slice(0, i));
    this.push(a.slice(i));
}

/**
 * @this Phoo
 */
function peek() {
    var i = this.pop('>bignum');
    var a = this.pop('array', 'string');
    if (i < -a.length || i >= a.length)
        throw new IllegalOperation('peek: Index out of bounds');
    this.push(a[(i + a.length) % a.length]);
}

/**
 * @this Phoo
 */
function poke() {
    var i = this.pop('>bignum');
    var a = this.pop('array', 'string');
    var t = this.pop();
    if (i < -a.length || i >= a.length)
        throw new IllegalOperation('poke: Index out of bounds');
    a[(i + a.length) % a.length] = t;
    this.push(a);
}

// def find [ findwith [ over = ] drop ]
// ...but js is much faster
/**
 * @this Phoo
 */
function find() {
    var a = this.pop('array');
    var i = this.pop();
    this.push((a.indexOf(i) + a.length) % a.length);
}

/**
 * @this Phoo
 */
async function sandbox() {
    var c = this.pop();
    try {
        await this.execute(c);
        this.push(false);
    } catch (e) {
        this.push(e);
    }
}

/**
 * @this Phoo
 */
function error() {
    throw PhooError.withPhooStack(this.pop('string'), this.returnStack);
}

/**
 * @this Phoo
 */
function getStack() {
    var err = this.pop();
    this.push(err[pStackTrace]);
}

/**
 * @this Phoo
 */
function num$() {
    var b = this.pop('>bignum');
    var n = this.pop('>bignum');
    this.push(n.toString(b));
}

/**
 * @this Phoo
 */
function $num() {
    var b = this.pop('>bignum');
    var s = this.pop('string');
    this.push(parseInt(s, b));
}

/**
 * @this Phoo
 */
function chr() {
    this.push(String.fromCharCode(this.pop('number')));
}

/**
 * @this Phoo
 */
function type_() {
    this.push(type(this.pop()));
}

/**
 * @this Phoo
 */
function bigg() {
    this.push(BigInt(this.pop()));
}

/**
 * @this Phoo
 */
async function compile() {
    this.push(await this.compile(this.pop()));
}

/**
 * @this Phoo
 */
function time() {
    this.push(+new Date());
}

/**
 * @this Phoo
 */
function nestdepth() {
    this.push(this.returnStack.length);
}

/**
 * @this Phoo
 */
async function await_() {
    this.push(await this.pop('Promise'));
}

/**
 * @this Phoo
 */
function get() {
    var k = this.pop();
    var o = this.pop();
    this.push(o[k]);
}

/**
 * @this Phoo
 */
function set() {
    var k = this.pop();
    var o = this.pop();
    var v = this.pop();
    o[k] = v;
}

/**
 * @this Phoo
 */
function call() {
    var f = this.pop('function');
    var a = this.pop('array');
    this.push(f(...a));
}

/**
 * @this Phoo
 */
function new_() {
    var c = this.pop('function');
    var a = this.pop('array');
    this.push(new c(...a));
}

/**
 * @this Phoo
 */
function word_() {
    this.push(word(this.pop('string')));
}

/**
 * @this Phoo
 */
function name_() {
    this.push(name(this.pop('symbol')));
}

/**
 * @this Phoo
 */
function newObject() {
    this.push({});
}

/**
 * @this Phoo
 */
function self() {
    this.push(this);
}

/**
 * @this Phoo
 */
function stacksize() {
    this.push(this.workStack.length);
}

/**
 * @this Phoo
 */
function win() {
    this.push(globalThis);
}

// and now, the most important ones!

const def = [word("]'["), word("]'["), function metaDef() {
    var d = this.pop('array', 'symbol');
    var n = name(this.pop('symbol'));
    this.addWord(n, d, this.strictMode);
}];

const builder = [word("]'["), word("]'["), function metaBuilder() {
    var d = this.pop('array');
    var n = name(this.pop('symbol'));
    this.addBuilder(n, d, this.strictMode);
}];

const del = [word("]'["), function metaDelete() {
    var n = name(this.pop('symbol'));
}];

// literalizers

var literalizers = new Map();
literalizers.set(
    /^[-+]?(([0-9]*\.?[0-9]+([Ee][-+]?[0-9]+)?)|(Infinity)|(NaN))$/,
    function floats() {
        var n = this.pop()[0];
        this.push(parseFloat(n));
    }
);

literalizers.set(
    /^(?<num>[-+]?(?:(?:0x[0-9a-f]+)|(?:[0-9]+)))(?<big>n)?$/i,
    function hexOrBigInt() {
        var m = this.pop();
        if (m.big) {
            cArr.push(BigInt(m.num));
        } else {
            cArr.push(parseInt(m.num));
        }
    }
);

literalizers.set(
    /(?<base>[0-9]{1,2})#(?<num>[a-z]+)(?<big>-n)/,
    function psNumber() {
        var m = this.pop();
        if (!m.big) {
            this.push(parseInt(m.num, +m.base));
        }
        else {
            var n = BigInt(0);
            for (var d in [...m.num].reverse()) {
                n *= BigInt(m.base);
                n += BigInt(parseInt(d, +m.base));
            }
            this.push(n);
        }
    }
);

export function init(p) {
    batchAdd(p, {
        words: {
            dup, drop, swap,
            '1+': onePlus,
            '1-': oneMinus,
            '+': sum,
            negate,
            '*': product,
            '**': exp,
            '/%': divmod,
            '/': div,

            '=': eq,
            '>': gt,

            nand,

            '~': bitinv,
            '&': bitand,
            '|': bitor,
            '^': bitxor,
            '<<': shl,

            put, take,

            ']done[': metaDone,
            ']again[': metaAgain,
            ']cjump[': cjump,

            "]'[": metaLiteral,
            ']do[': metaDo,
            ']this[': metaThis,

            lower, upper,
            '..': strConcat,

            '[]': newArray,
            concat: arrConcat,
            split, peek, poke,

            find,

            ']sandbox[': sandbox,
            error,
            ']getstack[': getStack,

            'num->$': num$,
            '$->num': $num,
            chr,
            type: type_,
            bigg,

            compile,

            time,

            nestdepth,
            'await': await_,
            get, set, call,
            new: new_,
            word: word_,
            name: name_,
            '{}': newObject,
            self, stacksize,
            window: win,

            def, builder,

            // a couple constants that don't need to be literalizers
            'true': [true],
            'false': [false],
            'undefined': [undefined],
            'null': [null],
        },
        builders: {
            '/*': blockComment,
            $: string,
            '[': openBracket,
            ']': closeBracket,
        },
        literalizers,
    });
}