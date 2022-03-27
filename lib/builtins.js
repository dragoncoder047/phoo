/**
 * @fileoverview
 * Builtin words, macross, and literalizers in the standard Phoo distribution that,
 * for speed or semantics, must be defined in Javascript and not native Phoo code.
 */

import { type, name, word } from '../src/utils.js';
import { IllegalOperationError, UnexpectedEOFError, StackUnderflowError, PhooError } from '../src/errors.js';
import { STACK_TRACE_SYMBOL } from '../src/constants.js';
import { naiveCompile } from '../src/index.js';
import { Module } from '../src/namespace.js';
export const module = new Module('__builtins__');
// var [, word, code] = /^(?:\s*)(\S+)([\S\s]*)$/.exec(code);

// macros

module.macros.add('/*', function blockComment() {
    var code = this.pop();
    if (!/\s\*\/\s/.test(code)) {
        throw new UnexpectedEOFError('/*: Unclosed block comment.');
    }
    var [, code] = code.split(/\s\*\/\s/, 1); /* jshint ignore:line */
    this.push(code);
});

module.macros.add('$', function string() {
    var code = this.pop();
    code = code.replace(/^\s+/, ''); // strip leading white space after $
    var delim = code[0];
    code = code.slice(1);
    if (code.indexOf(delim) < 0) {
        throw new UnexpectedEOFError('$: Unterminated string literal.');
    }
    var str, formatCode;
    [str, code] = code.split(delim, 1); /* jshint ignore:line */

    [, formatCode, code] = /^(?:(\S+)|(?:\s+))([\S\s]*)$/.exec(code); /* jshint ignore:line */
    // do something with format code stuck onto end delimiter???
    // ignoring it for now
    code = formatCode + code;

    var array = this.pop();
    array.push(str);
    this.push(array);
    this.push(code);
});

function openBracket() {
    var s = this.pop();
    this.push([]);
    this.push(s);
}
module.macros.add('[', openBracket);
module.macros.add('do', openBracket);

function closeBracket() {
    var s = this.pop();
    var i = this.pop();
    this.expect('array');
    var o = this.pop();
    o.push(i);
    this.push(o);
    this.push(s);
}
module.macros.add(']', closeBracket);
module.macros.add('end', closeBracket);

// words

module.words.add('pick', function pick() {
    this.expect('number');
    var n = this.pop();
    this.push(this.peek(n + 1));
});

module.words.add('roll', function roll() {
    this.expect('number');
    var n = this.pop();
    this.push(this.pop(n + 1));
});

module.words.add('drop', function drop() {
    this.pop();
});

module.words.add('1+', function onePlus() {
    this.expect(/bigint|number/);
    var n = this.pop();
    this.push(++n);
});

module.words.add('1-', function oneMinus() {
    this.expect(/bigint|number/);
    var n = this.pop();
    this.push(--n);
});

module.words.add('+', function sum() {
    this.expect(/bigint|number/, /bigint|number/);
    this.push(this.pop() + this.pop());
});

module.words.add('negate', function negate() {
    this.expect(/bigint|number/);
    this.push(-this.pop());
});

module.words.add('*', function product() {
    this.expect(/bigint|number/, /bigint|number/);
    this.push(this.pop() * this.pop());
});

module.words.add('**', function exponentiate() {
    this.expect(/bigint|number/, /bigint|number/);
    var exponent = this.pop();
    var base = this.pop();
    this.push(base ** exponent);
});

// cSpell:ignore divmod
module.words.add('/mod', function divmod() {
    this.expect(/bigint|number/, /bigint|number/);
    var divisor = this.pop();
    var dividend = this.pop();
    var quot = dividend / divisor;
    if (type(quot) !== 'bigint') quot = Math.floor(quot);
    this.push(quot);
    this.push(dividend % divisor);
});

module.words.add('/', function divide() {
    this.expect(/bigint|number/, /bigint|number/);
    var divisor = this.pop();
    var dividend = this.pop();
    this.push(dividend / divisor);
});

module.words.add('=', function equal() {
    this.push(this.pop() == this.pop());
});

module.words.add('>', function greater() {
    this.expect(/bigint|number/, /bigint|number/);
    var a = this.pop();
    var b = this.pop();
    this.push(b > a);
});

module.words.add('nand', function nand() {
    var notA = !this.pop();
    var notB = !this.pop();
    //     or !(a && b)
    // de Morgan's law
    this.push(notA || notB);
});

// cSpell:ignore bitinvert bitand bitor bitxor
module.words.add('~', function bitinvert() {
    this.expect(/bigint|number/);
    this.push(~this.pop());
});

module.words.add('&', function bitand() {
    this.expect(/bigint|number/, /bigint|number/);
    this.push(this.pop() & this.pop());
});

module.words.add('|', function bitor() {
    this.expect(/bigint|number/, /bigint|number/);
    this.push(this.pop() | this.pop());
});

module.words.add('^', function bitxor() {
    this.expect(/bigint|number/, /bigint|number/);
    this.push(this.pop() ^ this.pop());
});

module.words.add('<<', function shiftleft() {
    this.expect(/bigint|number/, /bigint|number/);
    var places = this.pop();
    var num = this.pop();
    this.push(num << places);
});

module.words.add('put', function put() {
    this.expect('array');
    var a = this.pop();
    a.push(this.pop());
});

module.words.add('take', function take() {
    this.expect('array');
    var a = this.pop();
    var fff;
    if (type(a[0]) === 'symbol')
        fff = this.resolveNamepath(name(a[0]))[0];
    else
        fff = a[0][0];
    if (fff === word('immovable'))
        throw new IllegalOperationError('take: Cannot `take` an immovable item.');
    if (a.length < 1)
        throw new StackUnderflowError('take: Unexpectedly empty array.');
    this.push(a.pop());
});

module.words.add(']done[', function metaDone() {
    this.retPop();
});

module.words.add(']again[', function metaAgain() {
    var entry = this.retPop();
    entry.pc = -1;
    this.retPush(entry);
});

// cSpell:ignore cjump
module.words.add(']cjump[', function cjump() {
    var amount = +this.pop();
    var falsey = !this.pop();
    if (falsey) {
        var entry = this.retPop();
        entry.pc += amount;
        this.retPush(entry);
    }
});

module.words.add("]'[", function metaLiteral() {
    var entry = this.retPop();
    entry.pc++;
    if (entry.arr.length <= entry.pc)
        throw new IllegalOperationError("]'[: ' at the end of an array");
    this.push(entry.arr[entry.pc]);
    this.retPush(entry);
});

module.words.add(']run[', function metaRun() {
    var arr = this.pop();
    if (type(arr) !== 'array') arr = [arr];
    this.retPush({ arr, pc: -1 });
});

module.words.add(']this[', function metaThis() {
    var entry = this.retPop();
    this.retPush(entry);
    this.push(entry.arr);
});

module.words.add('lower', function lower() {
    this.expect('string');
    this.push(this.pop().toLowerCase());
});

module.words.add('upper', function upper() {
    this.expect('string');
    this.push(this.pop().toUpperCase());
});

module.words.add('..', function strConcat() {
    var a = '' + this.pop();
    var b = '' + this.pop();
    this.push(b + a);
});

module.words.add('[]', function newArray() {
    this.push([]);
});

module.words.add('concat', function arrConcat() {
    var a = this.pop();
    var b = this.pop();
    if (type(a) !== 'array') a = [a];
    if (type(b) !== 'array') b = [b];
    this.push(b.concat(a));
});

module.words.add('split', function split() {
    this.expect(/bigint|number/, /string|array/);
    var i = this.pop();
    var a = this.pop();
    this.push(a.slice(0, i));
    this.push(a.slice(i));
});

module.words.add('peek', function peek() {
    this.expect(/bigint|number/, /string|array/);
    var i = this.pop();
    var a = this.pop();
    if (i < -a.length || i >= a.length)
        throw new IllegalOperationError('peek: Index out of bounds');
    this.push(a[(i + a.length) % a.length]);
});

module.words.add('poke', function poke() {
    this.expect(/bigint|number/, /string|array/);
    var i = this.pop();
    var a = this.pop();
    var t = this.pop();
    if (i < -a.length || i >= a.length)
        throw new IllegalOperationError('poke: Index out of bounds');
    a[(i + a.length) % a.length] = t;
    this.push(a);
});

// to find do findwith [ over = ] drop end
// ...but js is much faster
module.words.add('find', function find() {
    this.expect('array');
    var a = this.pop();
    var i = this.pop();
    this.push((a.indexOf(i) + a.length) % a.length);
});

module.words.add(']sandbox[', async function sandbox() {
    var c = this.pop();
    try {
        await this.execute(c, true);
        this.push(false);
    } catch (e) {
        this.push(e);
    }
});

module.words.add('die', function die() {
    throw PhooError.withPhooStack('' + this.pop(), this.returnStack);
});

module.words.add(']getstack[', function getStack() {
    var err = this.pop();
    this.push(err[STACK_TRACE_SYMBOL]);
});

module.words.add('num>$', function num$() {
    this.expect(/number|bigint/, /number|bigint/);
    var b = this.pop();
    var n = this.pop();
    this.push(n.toString(b));
});

module.words.add('$>num', function $num() {
    this.expect(/number|bigint/, 'string');
    var b = this.pop();
    var s = this.pop();
    this.push(parseInt(s, b));
});

module.words.add('chr', function chr() {
    this.expect('number');
    this.push(String.fromCharCode(this.pop()));
});

module.words.add('type', function type_() {
    this.push(type(this.pop()));
});

module.words.add('big', function big() {
    this.push(BigInt(this.pop()));
});

module.words.add('compile', async function compile() {
    this.push(await this.compile(this.pop(), true));
});

module.words.add('time', function time() {
    this.push(+new Date());
});

module.words.add('nestdepth', function nestdepth() {
    this.push(this.returnStack.length);
});

module.words.add('await', async function await_() {
    this.expect('Promise');
    this.push(await this.pop());
});

module.words.add('get', function get() {
    var k = this.pop();
    var o = this.pop();
    this.push(o[k]);
});

module.words.add('set', function set() {
    var k = this.pop();
    var o = this.pop();
    var v = this.pop();
    o[k] = v;
});

module.words.add('call', function call() {
    this.expect('function', 'array');
    var f = this.pop();
    var a = this.pop();
    this.push(f(...a));
});

module.words.add('new', function new_() {
    this.expect('function', 'array');
    var c = this.pop();
    var a = this.pop();
    this.push(new c(...a));
});

module.words.add('word', function word_() {
    this.expect('string');
    this.push(word(this.pop()));
});

module.words.add('name', function name_() {
    this.expect('symbol');
    this.push(name(this.pop()));
});

module.words.add('resolve', function resolve() {
    this.expect('symbol');
    this.push(this.resolveNamepath(this.pop()));
});

module.words.add('{}', function newObject() {
    this.push({});
});

module.words.add('self', function self() {
    this.push(this);
});

module.words.add('stacksize', function stacksize() {
    this.push(this.workStack.length);
});

module.words.add('window', function win() {
    this.push(globalThis);
});

// and now, the most important ones!
module.words.add(']define[', function metaDefine() {
    this.expect(/array|symbol/, 'symbol');
    var d = this.pop();
    var n = name(this.pop());
    this.getScope(0).words.add(n, d);
});

module.words.add(']define-macro[', function metaMacro() {
    this.expect('array', 'symbol');
    var d = this.pop();
    var n = name(this.pop());
    this.getScope(0).macros.add(n, d);
});

module.words.add(']forget[', function metaForget() {
    this.expect('symbol');
    var n = name(this.pop());
    this.getScope(0).words.forget(n);
});

module.words.add('to', naiveCompile("]'[ ]'[ ]define["));
module.words.add('macro', naiveCompile("]'[ ]'[ ]define-macro["));
module.words.add('forget', naiveCompile("]'[ ]forget["));

// literalizers
module.literalizers.add(/^[-+]?(([0-9]*\.?[0-9]+([Ee][-+]?[0-9]+)?)|(Infinity)|(NaN))$/,
    function floats() {
        var n = this.pop()[0];
        this.push(parseFloat(n));
    }
);

module.literalizers.add(/^(?<num>[-+]?(?:(?:0x[0-9a-f]+)|(?:[0-9]+)))(?<big>n)?$/i,
    function hexOrBigInt() {
        var m = this.pop();
        if (m.big) {
            this.push(BigInt(m.num));
        } else {
            this.push(parseInt(m.num));
        }
    }
);

module.literalizers.add(/^(?<base>[0-9]{1,2})#(?<num>[a-z]+)(?<big>-n)$/,
    function psNumber() {
        var m = this.pop();
        if (!m.big) {
            this.push(parseInt(m.num, +m.base));
        }
        else {
            var n = BigInt(0);
            var b = BigInt(m.base);
            for (var d in [...m.num].reverse()) {
                n *= b;
                n += BigInt(parseInt(d, +m.base));
            }
            this.push(n);
        }
    }
);

module.literalizers.add(/^\.(?<pname>.+)(?<type>\(\)|=|@)?$/,
    function getsetcall_shorthand() {
        var m = this.pop();
        var pname = m.pname;
        var ty = m.type;
        switch (ty) {
            case '()':
                this.push(function () {
                    this.expect('array', /./);
                    var args = this.pop();
                    var obj = this.pop();
                    this.push(obj[pname](...args));
                });
                break;
            case '@':
                this.push(function () {
                    this.expect(/./);
                    var obj = this.pop();
                    this.push(obj[pname]());
                });
                break;
            case '=':
                this.push(function () {
                    this.expect(/./, /./);
                    var val = this.pop();
                    var obj = this.pop();
                    obj[pname] = val;
                });
                break;
            case '':
            default:
                this.push(function () {
                    this.expect(/./);
                    var obj = this.pop();
                    this.push(obj[pname]);
                });
                break;
        }
    }
);
