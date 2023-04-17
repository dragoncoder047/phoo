/**
 * @fileoverview
 * Builtin words, macros, and literalizers in the standard Phoo distribution that,
 * for speed or semantics, must be defined in Javascript and not native Phoo code.
 */

/* >>
plain>

This module is contains the words necessary to implement the builtin functionality of Phoo, that must be
defined in Javascript and not Phoo code for the ease of bootstrapping.

The rest of the built-in words, that *are* defined in Phoo code, can be found on the page for [builtins](builtins.html) (without the underscore).
*/

function doNothing() { }
function showInTerminal(x) {
    if (window.term && window.stringify && window.color) {
        window.term.echo("\t[DEBUG]: " + window.stringify(x, window.color));
    }
}

const debug = showInTerminal;

import { type, name, word } from '../src/utils.js';
import { IllegalOperationError, UnexpectedEOFError, StackUnderflowError, PhooError, TypeMismatchError, PhooSyntaxError } from '../src/errors.js';
import { STACK_TRACE_SYMBOL } from '../src/constants.js';
import { naiveCompile } from '../src/index.js';
import { Module } from '../src/namespace.js';
export const module = new Module('__builtins__');
// var [, word, code] = /^(?:\s*)(\S+)([\S\s]*)$/.exec(code);

module.macros.add('//', function lineComment() { var code = this.pop(); this.push(code.replace(/.+?$/m, '')); });
module.macros.add('const', async function constant() { var code = this.pop(); var arr = this.pop(); var citem = arr.pop(); await this.run(citem); arr.push(this.pop()); this.push(arr); this.push(code); });
module.macros.add('now!', async function duringcomp() { var code = this.pop(); var arr = this.pop(); await this.run(arr.pop()); this.push(arr); this.push(code); });

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
    [comment, ...rest] = code.split(/(?<=\s)\*\/(?=\s|$)/);
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

    There are two format codes implemented right now. The first is `r`, which turns the string into a regular expression. The characters after the `r` are the flags that would go at the end of it.
    
    The second is `e`, which escapes characters in the same manner as `\\` does in Javascript strings.
sed> -- s
s> The string (or regular expression) defined by the literal.
example>
    $ ofooooo
    // puts the string "foo" on the stack. Note the o is used as delimiter so it is escaped twice.
example>
    $ 5ab*c?5rig
    // puts the regular expression /ab*c?/ig.
example>
    $ fixdafei
    // puts the string "\xDA".
*/
module.macros.add('$', function string() {
    var code = this.pop().trim();
    var delim = code[0];
    code = code.slice(1);
    var str, formatCode, bits;
    const dummy = '\xde\xfa\xce\xab\xad\xfa\xca\xde';
    code = code.replaceAll(delim + delim, dummy);
    if (code.indexOf(delim) < 0) {
        debug('unclosed string');
        throw new UnexpectedEOFError('$: Unterminated string literal.');
    }
    [str, ...bits] = code.split(delim);
    code = bits.join(delim);
    str = str.replaceAll(dummy, delim); // because 2 delims are used to escape it --> 1 delim
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
            if (formatCode.length <= 1) throw new PhooSyntaxError('$: format code e must have escape character following it');
            var esc = formatCode[1];
            if (esc === '\\') esc = '\\\\';
            if (formatCode.length > 2) throw new PhooSyntaxError(`$: format code e can only have one character following it (got '${formatCode.slice(1)}')`);
            var res = [
                [2, undefined, new RegExp(`${esc}x[0-9a-f]{2}`, 'gi')],
                [2, undefined, new RegExp(`${esc}u[0-9a-f]{4}`, 'gi')],
                [3, -1, new RegExp(`${esc}u\{[0-9a-f]+\}`, 'gi')]
            ];
            for (var [start, end, re] of res) str = str.replaceAll(re, function (match) { return String.fromCharCode(parseInt(match.slice(start, end), 16)); });
            const c = { '0': '\x00', a: '\x07', b: '\x08', t: '\x09', n: '\x0a', v: '\x0b', f: '\x0c', r: '\x0d', e: '\x1b' };
            str = str.replaceAll(new RegExp(`${esc}(.)`, 'gi'), function (match, p1) { return p1 in c ? c[p1] : match; });
        }
        else throw new PhooSyntaxError(`$: Unknown format code '${formatCode}'`);
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

/* >>
word> /mod
description> Euclidean division. Remainder and quotient.
sed> x y -- q r
x> dividend
y> divisor
q> quotient
r> remainder
*/
module.words.add('/mod', function divmod() {
    this.expect(2);
    var divisor = this.pop();
    var dividend = this.pop();
    var quot = dividend / divisor;
    if (type(quot) !== 'bigint') quot = Math.floor(quot);
    this.push(quot);
    this.push(dividend % divisor);
});

/* >>
word> /
description> Regular division (results in float).
sed> a b -- q
a> dividend
b> divisor
q> quotient
*/
module.words.add('/', function divide() {
    this.expect(2);
    var divisor = this.pop();
    var dividend = this.pop();
    this.push(dividend / divisor);
});

/* >>
word> =
description> Equals, using Javascript `==` operator.
sed> a b -- t
*/
module.words.add('=', function equal() {
    this.push(this.pop() == this.pop());
});

/* >>
word> >
description> Greater than.
sed> a b -- t
a> number on "larger" (left) side of expression.
b> number on "smaller" (right) side of expression.
*/
module.words.add('>', function greater() {
    this.expect(2);
    var a = this.pop();
    var b = this.pop();
    this.push(b > a);
});

/* >>
word> nand
description> Boolean NAND of two arguments. True if both are false.
sed> a b -- t
*/
module.words.add('nand', function nand() {
    this.expect(2);
    var notA = !this.pop();
    var notB = !this.pop();
    //     or !(a && b)
    // de Morgan's law
    this.push(notA || notB);
});

// cSpell:ignore bitinvert bitand bitor bitxor

/* >>
word> ~
description> Bitwise NOT of a number
sed> n -- ~n
*/
module.words.add('~', function bitinvert() {
    this.push(~this.pop());
});

/* >>
word> &
description> Bitwise AND of two numbers.
sed> a b -- a&b
*/
module.words.add('&', function bitand() {
    this.expect(2);
    this.push(this.pop() & this.pop());
});

/* >>
word> |
description> Bitwise OR of two numbers.
sed> a b -- a|b
*/
module.words.add('|', function bitor() {
    this.expect(2);
    this.push(this.pop() | this.pop());
});

/* >>
word> ^
description> Bitwise XOR of two numbers.
sed> a b -- a^b
*/
module.words.add('^', function bitxor() {
    this.expect(2);
    this.push(this.pop() ^ this.pop());
});

/* >>
word> <<
description> A bit-shifted left by B places. Negative B for shift right.
sed> a b -- a<<b
*/
module.words.add('<<', function shiftleft() {
    this.expect(2);
    var places = this.pop();
    var num = this.pop();
    this.push(num << places);
});

/* >>
word> put
description> Pushes the item onto the end of the array
sed> i a --
i> Item to push
a> Array to push onto
see-also> take
*/
module.words.add('put', function put() {
    this.expect('array');
    var a = this.pop();
    var item = this.pop();
    a.push(item);
});

/* >>
word> take
description> reverse of [[put]], it takes the item out of the array. The array is mutated.
sed> a -- i
a> Array
i> Last item of the array
*/
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

/* >>
word> ]done[
description> Drops the top item of the return stack, effectively causing everything else outside of the current word to be skipped.
sed> --
example>
    [ foo [ ]done[ bar ] baz ]
    // foo and then bar are run, but baz is skipped.
*/
module.words.add(']done[', function metaDone() {
    this.retPop();
});

/* >>
word> ]again[
description> Sets the return pointer of the top return stack item to -1, effectively causing everything else outside of the current word to be repeated.
sed> --
example>
    [ foo [ ]again[ bar ] baz ]
    // runs foo bar foo bar foo bar foo bar ... infintely
*/
module.words.add(']again[', function metaAgain() {
    this.returnStack.at(-2).pc++;
});

// cSpell:ignore cjump

/* >>
word> ]cjump[
description> if the test value t is false, adds n to the top return stack entry's return pointer, effectively skipping that many items.
sed> t n --
t> truth value to test
n> how far to jump if false
example>
    [ 3 ]cjump[ ] foo bar baz bam
    // if ToS is false, skips foo bar baz. bam will always run
*/
module.words.add(']cjump[', function cjump() {
    this.expect(2);
    var amount = +this.pop();
    var falsey = !this.pop();
    if (falsey) {
        this.returnStack.at(-2).pc += amount;
    }
});

/* >>
word> ]'[
description> instead of running the next item on the top return stack entry, pushes it to the stack and crements the return stack pointer.
sed> -- a
example>
    [ ]'[ drop ] foo bar
    // foo will be pushed to the stack and then dropped, rendering it a noop. bar will run.
*/
module.words.add("]'[", function metaLiteral() {
    var entry = this.returnStack.at(-2);
    debug(entry);
    entry.pc++;
    if (entry.arr.length <= entry.pc) {
        debug(']\'[ eof');
        throw new IllegalOperationError("]'[: ' at the end of an array");
    }
    this.push(entry.arr[entry.pc]);
});

/* >>
word> ]run[
description> pushes the item to the return stack, so that it will run when the current word finishes.
sed> a --
example>
    [ table a b c ] [ ]run[ ]
    // if ToS is n, runs nth item of the table.
*/
module.words.add(']run[', function metaRun() {
    var arr = this.pop();
    if (type(arr) !== 'array') arr = [arr];
    this.retPush({ arr, pc: -1 });
});

/* >>
word> ]this[
description> pushes the top array on the return stack to the work stack, so that the word can reference its caller.
sed> a --
*/
module.words.add(']this[', function metaThis() {
    var entry = this.retPop();
    this.retPush(entry);
    this.push(entry.arr);
});

/* >>
word> []
description> pushes a new, empty array to the work stack.
sed> -- a
*/
module.words.add('[]', function newArray() {
    this.push([]);
});

/* >>
word> concat
description> concatenates two arrays. non-arrays are treated like one-element arrays.
sed> a b -- ab
*/
module.words.add('concat', function arrConcat() {
    var a = this.pop();
    var b = this.pop();
    if (type(a) !== 'array') a = [a];
    if (type(b) !== 'array') b = [b];
    this.push(b.concat(a));
});

/* >>
word> peek
description> takes the i-th item out of the array a, without changing a.
sed> a i -- a[i]
*/
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

/* >>
word> poke
description> puts the item into the specified index of the array, and leaves the new, mutated array.
sed> t a i -- a
t> item to poke
a> the array to be poked
i> index to poke at
*/
module.words.add('poke', function poke() {
    this.expect(3);
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

/* >>
word> ]sandbox[
description> runs the code under a `try` statement, and pushes the error it threw, or `undefined` if no error.
sed> c -- e
*/
module.words.add(']sandbox[', async function sandbox() {
    var c = this.pop();
    try {
        await this.run(c);
        this.push(undefined);
    } catch (e) {
        this.push(e);
        console.log(']sandbox[\'ed error', e);
        debugger;
    }
});

/* >>
word> die
description> throws a `PhooError` with the message, or re-throws the error if it was already one.
sed> m --
*/
module.words.add('die', function die() {
    var e = this.pop();
    if (e instanceof PhooError) throw e;
    throw PhooError.withPhooStack('' + e, this.returnStack);
});

/* >>
word> ]getstack[
description> with a `PhooError` on the top, gets its Phoo stack trace.
sed> e -- t
*/
module.words.add(']getstack[', function getStack() {
    var err = this.pop();
    this.push(err[STACK_TRACE_SYMBOL]);
});

/* >>
word> type
description> gets the type of the object
sed> o -- t
*/
module.words.add('type', function type_() {
    this.push(type(this.pop()));
});

/* >>
word> compile
description> compiles the string, so that it can be run.
sed> s -- a
*/
module.words.add('compile', async function compile() {
    this.push(await this.compile(this.pop(), false));
});

/* >>
word> time
description> pushes the system time, in milliseconds.
sed> -- t
*/
module.words.add('time', function time() {
    this.push(+new Date());
});

/* >>
word> await
description> awaits a `Promise` and pushes the resolve value.
sed> p -- v
*/
module.words.add('await', async function await_() {
    this.push(await this.pop());
});

/* >>
word> get
description> object and key, looks up.
sed> o k -- v
o> object
k> string key
v> o.k
*/
module.words.add('get', function get() {
    var k = this.pop();
    var o = this.pop();
    this.push(o[k]);
});

/* >>
word> set
description> value, object, and key, sets the key.
sed> v o k --
o> object
k> string key
v> value to set
*/
module.words.add('set', function set() {
    var k = this.pop();
    var o = this.pop();
    var v = this.pop();
    o[k] = v;
});

/* >>
word> call
description> calls a function with the arguments.
sed> a f -- r
a> arguments array
f> function
r> return value
see-also> new
*/
module.words.add('call', function call() {
    this.expect(2);
    var f = this.pop();
    var a = this.pop();
    this.push(f(...a));
});

/* >>
word> new
description> same sort as [[call]], but uses Javascript `new` keyword to construct with an class.
sed> a f -- r
a> arguments array
f> constructor function
r> new object constructed
*/
module.words.add('new', function new_() {
    this.expect(2);
    var c = this.pop();
    var a = this.pop();
    this.push(new c(...a));
});

/* >>
word> word
description> converts string to symbol.
sed> s -- w
s> string
w> symbol of that string
*/
module.words.add('word', function word_() {
    this.expect('string');
    this.push(word(this.pop()));
});

/* >>
word> name
description> reverse of [[word]], converts symbol to string.
sed> w -- s
w> symbol
s> string of that symbol
*/
module.words.add('name', function name_() {
    this.expect('symbol');
    this.push(name(this.pop()));
});

/* >>
word> resolve
description> looks up the definition of the word symbol.
sed> w -- d
w> symbol
d> definition
*/
module.words.add('resolve', function resolve() {
    this.expect('symbol');
    this.push(this.lookup(name(this.pop())));
});

/* >>
word> {}
description> pushes a new empty object.
sed> -- a
*/
module.words.add('{}', function newObject() {
    this.push({});
});

/* >>
word> self
description> pushes a reference to the current thread.
sed> -- t
*/
module.words.add('self', function self() {
    this.push(this);
});

/* >>
word> window
description> pushes a reference to the global Javascript object (`globalThis`). Called "window" because that is its name in the browser which is what Phoo was designed for.
sed> -- t
*/
module.words.add('window', function win() {
    this.push(globalThis);
});

// and now, the most important ones!

/* >>
word> ]define[
description> writes a new definition to the top scope using the name and definition on the stack.
sed> n d --
n> symbol name
d> definition
*/
module.words.add(']define[', function metaDefine() {
    this.expect(/array|symbol/, 'symbol');
    var d = this.pop();
    var n = name(this.pop());
    this.getScope(0).words.add(n, d);
});

/* >>
word> ]define-macro[
description> like [[]define[]] but defines a macro.
sed> n d --
n> symbol name
d> definition
*/
module.words.add(']define-macro[', function metaMacro() {
    this.expect('array', 'symbol');
    var d = this.pop();
    var n = name(this.pop());
    this.getScope(0).macros.add(n, d);
});

/* >>
word> ]forget[
description> erases the definition of a word, reverting back to the old one if there was one.
sed> n --
n> symbol name
*/
module.words.add(']forget[', function metaForget() {
    this.expect('symbol');
    var n = name(this.pop());
    this.getScope(0).words.forget(n);
});

/* >>
word> to
lookahead> name def
description> wrapper for [[]define[]].
sed> --
*/
module.words.add('to', naiveCompile("]'[ ]'[ ]define["));

/* >>
word> macro
lookahead> name def
description> wrapper for [[]define-macro[]].
sed> --
*/
module.words.add('macro', naiveCompile("]'[ ]'[ ]define-macro["));

/* >>
word> forget
lookahead> name
description> wrapper for [[]forget[]].
sed> --
*/
module.words.add('forget', naiveCompile("]'[ ]forget["));

/* >>
word> ]import[
description> imports the module, force-reloading if the top is true (ignores cache).
sed> n r --
n> name of the module
r> boolean, force-reload the module
*/
module.words.add(']import[', async function doImport() {
    this.expect('boolean');
    var forcereload = this.pop();
    //console.debug('called ]import[');
    this.expect('symbol');
    var nn = name(this.pop());
    await this.phoo.import(nn, this, forcereload);
});

/* >>
word> promise
description> pushes the pieces to a new promise.
sed> -- p x r
p> the promise
x> reject callback
r> resolve callback
*/
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

/* >>
word> functionize
description> turns the code into a function, that will run the code in a subthread.
sed> c -- f
*/
module.words.add('functionize', function functionize() {
    var code = this.pop();
    var self = this;
    this.push(async function (...args) {
        var newThread = self.phoo.createThread(`${self.name}_functionize_${+new Date}`);
        newThread.module = self.module;
        newThread.push([].slice.call(args));
        await newThread.run(code);
        return newThread.pop();
    });
});

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
