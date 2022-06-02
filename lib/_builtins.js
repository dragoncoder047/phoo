/**
 * @fileoverview
 * Builtin words, macross, and literalizers in the standard Phoo distribution that,
 * for speed or semantics, must be defined in Javascript and not native Phoo code.
 */

function doNothing() { }

const debug = doNothing;

import { type, name, word } from '../src/utils.js';
import { IllegalOperationError, UnexpectedEOFError, StackUnderflowError, PhooError, TypeMismatchError } from '../src/errors.js';
import { STACK_TRACE_SYMBOL } from '../src/constants.js';
import { naiveCompile } from '../src/index.js';
import { Module } from '../src/namespace.js';
export const module = new Module('__builtins__');
// var [, word, code] = /^(?:\s*)(\S+)([\S\s]*)$/.exec(code);

// macros
/* >>
macro> /*
description> Block comment. Like C-style comments. Comments do not nest.
sed> --
*/
module.macros.add('/*', function blockComment() {
    var code = this.pop(), comment, rest;
    if (!/\s\*\/\s/.test(code)) {
        debug('unclosed comment');
        throw new UnexpectedEOFError('/*: Unclosed block comment.');
    }
    [comment, ...rest] = code.split(/(?<=\s)\*\/(?=\s)/);
    code = rest.join('*/');
    doNothing(comment);
    this.push(code);
});

/* >>
macro> $
description>
    String builder.

    First non-whitespace character after the `$` is the delimiter. The delimiter can be escaped by doubling it.
    
    The characters immediately following the end delimiter are known as the "tag" and affect the resultant string. The first character is the code that determines the formatting applied.

    Currently the only one implemented is `r`, which turns the string into a regular expression. The characters after the `r` are the flags that would go at the end of it. There is no way to "escape" any characters other than the delimiter, but a `e` code for defining an escape character is planned. See issue [#8](https://github.com/dragoncoder047/phoo/issues/8) for the status of that.
sed> -- s
s> The string (or regular expression) defined by the literal.
example>
    $ ofooooo
    // puts the string "foo" on the stack. Note the o is used as delimiter so it is escaped twice.
example>
    $ 5ab*c?5rig
    // puts the regular expression /ab*c?/ig.
*/
module.macros.add('$', function string() {
    var code = this.pop().trim();
    var delim = code[0];
    code = code.slice(1);
    var str, formatCode, bits;
    var dummy = `\x02${Math.random()}this1will2never4be3part6of0any5string${Math.random()}\x03`;
    code = code.replaceAll(delim + delim, dummy);
    if (code.indexOf(delim) < 0) {
        debug('unclosed string');
        throw new UnexpectedEOFError('$: Unterminated string literal.');
    }
    [str, ...bits] = code.split(delim);
    code = bits.join(delim);
    str = str.replaceAll(dummy, delim); // because use 2 delims to escape it --> 1 delim
    code = code.replaceAll(dummy, delim + delim);

    if (/^\S/.test(code)) {
        [formatCode, code] = code.trim().split(/(?<=^\S+)\s/);
        //console.debug('string format code:', formatCode);
        code = code || '';
        if (formatCode.startsWith('r')) {
            var flags = formatCode.substring(1);
            str = new RegExp(str, flags);
        }
        else if (formatCode.startsWith('e')) {
            const c = { '0': 0, a: 7, b: 8, t: 9, n: 10, v: 11, f: 12, r: 13, e: 27 };
            throw 'todo'; // Escaped stuff.
        }
    }

    var array = this.pop();
    array.push(str);
    this.push(array);
    this.push(code);
});

/* >>
macro> do
description> Starts of a new sub-array.
*/
/* >>
macro> [
description> Same as `do`.
*/
function openBracket() {
    var s = this.pop();
    this.push([]);
    this.push(s);
}
module.macros.add('[', openBracket);
module.macros.add('do', openBracket);

/* >>
macro> end
description> End of a sub-array.
*/
/* >>
macro> ]
description> Same as `end`.
*/
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

/* >>
word> pick
description> Same as the Forth word `PICK`. Takes a number n and **copies** the nth item to the top.
sed> n -- i
n> Depth of item to pick
i> COPY of the item.
see-also> roll
*/
module.words.add('pick', function pick() {
    this.expect('number');
    var n = this.pop();
    this.push(this.peek(n));
});

/* >>
word> roll
description> Same as the Forth word `ROLL`. Takes a number n and **moves** the nth item to the top .
sed> n -- i
n> Depth of item to pick
i> COPY of the item.
see-also> pick
*/
module.words.add('roll', function roll() {
    this.expect('number');
    var n = this.pop();
    this.push(this.pop(n));
});

/* >>
word> drop
description> Removes the top item from the stack.
sed> n --
*/
module.words.add('drop', function drop() {
    this.pop();
});

/* >>
word> 1+
description> Increments a number on the top of the stack.
sed> n -- n+1
*/
module.words.add('1+', function onePlus() {
    var n = this.pop();
    this.push(++n);
});

/* >>
word> 1-
description> Decrements a number on the top of the stack.
sed> n -- n-1
*/
module.words.add('1-', function oneMinus() {
    var n = this.pop();
    this.push(--n);
});

/* >>
word> +
description> adds two items together using Javascript `+` operator. Note the order of addition.
sed> a b -- b+a
*/
module.words.add('+', function sum() {
    this.expect(2);
    this.push(this.pop() + this.pop());
});

/* >>
word> negate
description> unary negation of top item.
sed> a -- -a
*/
module.words.add('negate', function negate() {
    this.push(-this.pop());
});

/* >>
word> *
description> Multiply top items.
sed> a b -- b*a
*/
module.words.add('*', function product() {
    this.expect(2);
    this.push(this.pop() * this.pop());
});

/* >>
word> **
description> Power of top two items.
sed> b e -- b**e
b> base
e> exponent
*/
module.words.add('**', function exponentiate() {
    this.expect(2);
    var exponent = this.pop();
    var base = this.pop();
    this.push(base ** exponent);
});

// cSpell:ignore divmod
module.words.add('/mod', function divmod() {
    this.expect(2);
    var divisor = this.pop();
    var dividend = this.pop();
    var quot = dividend / divisor;
    if (type(quot) !== 'bigint') quot = Math.floor(quot);
    this.push(quot);
    this.push(dividend % divisor);
});

module.words.add('/', function divide() {
    this.expect(2);
    var divisor = this.pop();
    var dividend = this.pop();
    this.push(dividend / divisor);
});

module.words.add('=', function equal() {
    this.push(this.pop() == this.pop());
});

module.words.add('>', function greater() {
    this.expect(2);
    var a = this.pop();
    var b = this.pop();
    this.push(b > a);
});

module.words.add('nand', function nand() {
    this.expect(2);
    var notA = !this.pop();
    var notB = !this.pop();
    //     or !(a && b)
    // de Morgan's law
    this.push(notA || notB);
});

// cSpell:ignore bitinvert bitand bitor bitxor
module.words.add('~', function bitinvert() {
    this.push(~this.pop());
});

module.words.add('&', function bitand() {
    this.expect(2);
    this.push(this.pop() & this.pop());
});

module.words.add('|', function bitor() {
    this.expect(2);
    this.push(this.pop() | this.pop());
});

module.words.add('^', function bitxor() {
    this.expect(2);
    this.push(this.pop() ^ this.pop());
});

module.words.add('<<', function shiftleft() {
    this.expect(2);
    var places = this.pop();
    var num = this.pop();
    this.push(num << places);
});

module.words.add('put', function put() {
    this.expect('array');
    var a = this.pop();
    var item = this.pop();
    a.push(item);
});

module.words.add('take', function take() {
    this.expect('array');
    var a = this.pop();
    if (a.length === 1) {
        var fff;
        if (type(a[0]) === 'symbol')
            fff = this.lookup(name(a[0]))[0];
        else
            fff = a[0][0];
        if (fff === word('immovable')) {
            debug('take immovable');
            throw new IllegalOperationError('take: Cannot `take` an immovable item.');
        }
    }
    if (a.length < 1) {
        debug('take nothing');
        throw new StackUnderflowError('take: Unexpectedly empty array.');
    }
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
    this.expect(2);
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
    debug(entry);
    entry.pc++;
    if (entry.arr.length <= entry.pc) {
        debug(']\'[ eof');
        throw new IllegalOperationError("]'[: ' at the end of an array");
    }
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

module.words.add('peek', function peek() {
    this.expect(2);
    var i = this.pop();
    var a = this.pop();
    if (i < -a.length || i >= a.length) {
        debug('peek oob');
        throw new IllegalOperationError('peek: Index out of bounds');
    }
    this.push(a[(i + a.length) % a.length]);
});

module.words.add('poke', function poke() {
    this.expect(2);
    var i = this.pop();
    var a = this.pop();
    var t = this.pop();
    if (i < -a.length || i >= a.length) {
        debug('poke oob');
        throw new IllegalOperationError('poke: Index out of bounds');
    }
    a[(i + a.length) % a.length] = t;
    this.push(a);
});

module.words.add(']sandbox[', async function sandbox() {
    var c = this.pop();
    try {
        await this.run(c, false);
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

module.words.add('type', function type_() {
    this.push(type(this.pop()));
});

module.words.add('compile', async function compile() {
    this.push(await this.compile(this.pop(), false));
});

module.words.add('time', function time() {
    this.push(+new Date());
});

module.words.add('await', async function await_() {
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
    this.expect(2);
    var f = this.pop();
    var a = this.pop();
    this.push(f(...a));
});

module.words.add('new', function new_() {
    this.expect(2);
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
    this.push(this.lookup(name(this.pop())));
});

module.words.add('{}', function newObject() {
    this.push({});
});

module.words.add('self', function self() {
    this.push(this);
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

module.words.add(']import[', async function doImport() {
    this.expect('boolean');
    var forcereload = this.pop();
    //console.debug('called ]import[');
    this.expect('symbol');
    var nn = name(this.pop());
    await this.phoo.import(nn, this, forcereload);
});

module.words.add('promise', async function prbits() {
    var res, rej, p;
    var prom = await new Promise(done => {
        p = new Promise(function (a, b) {
            res = a;
            rej = b;
            done();
        });
    });
    this.push(p);
    this.push(rej);
    this.push(res);
});

module.words.add('functionize', function functionize() {
    var code = this.pop();
    var self = this;
    this.push(async function (...args) {
        var depth = self.workStack.length;
        self.push([].slice.call(args));
        await self.run(code);
        var result = self.pop();
        while (self.workStack.length > depth) self.pop();
        return result;
    });
})

// literalizers
module.literalizers.add(/^[-+]?(([0-9]*\.?[0-9]+([Ee][-+]?[0-9]+)?)|(Infinity)|(NaN))$/,
    function floats() {
        var n = this.pop()[0];
        this.push(parseFloat(n));
    }
);

module.literalizers.add(/^(?<x>true|false|null|undefined)$/i,
    function singletons() {
        var m = this.pop().groups;
        //console.debug('singleton:', m.x);
        this.push({
            true: true,
            false: false,
            null: null,
            undefined: undefined,
        }[m.x]);
    }
);

module.literalizers.add(/^(?<num>[-+]?(?:(?:0x[0-9a-f]+)|(?:[0-9]+)))(?<big>n)?$/i,
    function hexOrBigInt() {
        var m = this.pop().groups;
        //console.debug('xbi:', m.big, m.num);
        if (m.big) {
            this.push(BigInt(m.num));
        } else {
            this.push(parseInt(m.num));
        }
    }
);

module.literalizers.add(/^(?<base>[0-9]{1,2})#(?<num>[a-z0-9]+)(?<big>-n)?$/i,
    function psNumber() {
        var m = this.pop().groups;
        //conosle.debug('ps#:', m.base, m.num, m.big);
        if (!m.big) {
            this.push(parseInt(m.num, +m.base));
        }
        else {
            var n = BigInt(0);
            var b = BigInt(m.base);
            for (var d of [...m.num].reverse()) {
                n *= b;
                n += BigInt(parseInt(d, +m.base));
            }
            this.push(n);
        }
    }
);

module.literalizers.add(/^\.(?<aa>.+)$/,
    function getsetcall_shorthand() {
        var m = this.pop().groups;
        var afterdot = m.aa;
        var pname;
        //console.debug('gsc:', afterdot);
        if (afterdot.endsWith('()')) {
            pname = afterdot.substring(0, afterdot.length - 2);
            this.push(function _dotliteral_call_withargs() {
                this.expect(2, 'array');
                var args = this.pop();
                var obj = this.pop();
                try {
                    this.push(obj[pname](...args));
                }
                catch (e) {
                    if (e.message && /is not a function/.test(e.message))
                        throw TypeMismatchError.withPhooStack(`<${type(obj)}>.${pname} isn't callable`, this.returnStack);
                    else
                        throw PhooError.wrap(e, this.returnStack);
                }
            });
        }
        else if (afterdot.endsWith('@')) {
            pname = afterdot.substring(0, afterdot.length - 1);
            this.push(function _dotliteral_call_noargs() {
                this.expect(1);
                var obj = this.pop();
                try {
                    this.push(obj[pname]());
                }
                catch (e) {
                    if (e.message && /is not a function/.test(e.message))
                        throw TypeMismatchError.withPhooStack(`<${type(obj)}>.${pname} isn't callable`, this.returnStack);
                    else
                        throw PhooError.wrap(e, this.returnStack);
                }
            });
        }
        else if (afterdot.endsWith('=')) {
            pname = afterdot.substring(0, afterdot.length - 1);
            this.push(function _dotliteral_set_property() {
                this.expect(2);
                var val = this.pop();
                var obj = this.pop();
                obj[pname] = val;
            });
        }
        else {
            pname = afterdot;
            this.push(function _dotliteral_get_property() {
                this.expect(1);
                var obj = this.pop();
                this.push(obj[pname]);
            });
        }
    }
);
