## `/*`  (  &rarr;  )

Block comment. like c-style comments. comments do not nest.
{#/*}## `$`  (  &rarr; ``**{.description} `s`*The string (or regular expression) defined by the literal.*{.description} )


string builder.

first non-whitespace character after the `$` is the delimiter. the delimiter can be escaped by doubling it.

the characters immediately following the end delimiter are known as the "tag" and affect the resultant string. the first character is the code that determines the formatting applied.

currently the only one implemented is `r`, which turns the string into a regular expression. the characters after the `r` are the flags that would go at the end of it. there is no way to "escape" any characters other than the delimiter, but a `e` code for defining an escape character is planned. see issue [#8](https://github.com/dragoncoder047/phoo/issues/8) for the status of that.
{#$}

```phoo

$ 5ab*c?5rig
// puts the regular expression /ab*c?/ig.
```## `do`  (  &rarr;  )

Starts of a new sub-array.
{#do}## `[`  (  &rarr;  )

Same as `do`.
{#[}## `end`  (  &rarr;  )

End of a sub-array.
{#end}## `]`  (  &rarr;  )

Same as `end`.
{#]}## `pick`  ( `n`*Depth of item to pick*{.description} ``**{.description} &rarr; ``**{.description} `i`*COPY of the item.
see-also> roll*{.description} )

Same as the forth word `pick`. takes a number `n` and **copies** the nth item to the top.
{#pick}## `roll`  ( `n`*Depth of item to pick*{.description} ``**{.description} &rarr; ``**{.description} `i`*COPY of the item.
see-also> pick*{.description} )

Same as the forth word `roll`. takes a number `n` and **moves** the nth item to the top .
{#roll}## `drop`  ( `n`**{.description} ``**{.description} &rarr;  )

Removes the top item from the stack.
{#drop}## `1+`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `n`**{.description} `+`**{.description} `1`**{.description} )

Increments a number on the top of the stack.
{#1+}## `1-`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `n`**{.description} `-`**{.description} `1`**{.description} )

Decrements a number on the top of the stack.
{#1-}## `+`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} `+`**{.description} `a`**{.description} )

Adds two items together using javascript `+` operator. note the order of addition.
{#+}## `negate`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `-`**{.description} `a`**{.description} )

Unary negation of top item.
{#negate}## `*`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} `*`**{.description} `a`**{.description} )

Multiply top items.
{#*}## `**`  ( `b`*base*{.description} ``**{.description} `e`*exponent*{.description} ``**{.description} &rarr; ``**{.description} `b`*base*{.description} `*`**{.description} `*`**{.description} `e`*exponent*{.description} )

Power of top two items.
{#**}## `/mod`  ( `x`*dividend*{.description} ``**{.description} `y`*divisor*{.description} ``**{.description} &rarr; ``**{.description} `q`*quotient*{.description} ``**{.description} `r`*remainder*{.description} )

Euclidean division. remainder and quotient.
{#/mod}## `/`  ( `a`*dividend*{.description} ``**{.description} `b`*divisor*{.description} ``**{.description} &rarr; ``**{.description} `q`*quotient*{.description} )

Regular division (results in float).
{#/}## `=`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Equals, using javascript `==` operator.
{#=}## `>`  ( `a`*number on "larger" (left) side of expression.*{.description} ``**{.description} `b`*number on "smaller" (right) side of expression.*{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Greater than.
{#>}## `nand`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Boolean nand of two arguments. true if both are false.
{#nand}## `~`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `~`**{.description} `n`**{.description} )

Bitwise not of a number.
{#~}## `&`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `&`**{.description} `b`**{.description} )

Bitwise and of two numbers.
{#&}## `|`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `|`**{.description} `b`**{.description} )

Bitwise or of two numbers.
{#|}## `^`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `^`**{.description} `b`**{.description} )

Bitwise xor of two numbers.
{#^}## `<<`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `<`**{.description} `<`**{.description} `b`**{.description} )

A bit-shifted left by b places. negative b for shift right.
{#<<}## `put`  ( `i`*Item to push*{.description} ``**{.description} `a`*Array to push onto
see-also> take*{.description} ``**{.description} &rarr;  )

Pushes the item onto the end of the array.
{#put}## `take`  ( `a`*Array*{.description} ``**{.description} &rarr; ``**{.description} `i`*Last item of the array*{.description} )

Reverse of [`put`](#put), it takes the item out of the array. the array is mutated.
{#take}## `]done[`  (  &rarr;  )

Drops the top item of the return stack, effectively causing everything else outside of the current word to be skipped.
{#]done[}

```phoo

[ foo [ ]done[ bar ] baz ]
// foo and then bar are run, but baz is skipped.
```## `]again[`  (  &rarr;  )

Sets the return pointer of the top return stack item to -1, effectively causing everything else outside of the current word to be repeated.
{#]again[}

```phoo

[ foo [ ]again[ bar ] baz ]
// runs foo bar foo bar foo bar foo bar ... infintely
```## `]cjump[`  ( `t`*truth value to test*{.description} ``**{.description} `n`*how far to jump if false*{.description} ``**{.description} &rarr;  )

If the test value `t` is false, adds `n` to the top return stack entry's return pointer, effectively skipping that many items.
{#]cjump[}

```phoo

[ 3 ]cjump[ ] foo bar baz bam
// if ToS is false, skips foo bar baz. bam will always run
```## `]'[`  (  &rarr; ``**{.description} `a`**{.description} )

Instead of running the next item on the top return stack entry, pushes it to the stack and crements the return stack pointer.
{#]'[}

```phoo

[ ]'[ drop ] foo bar
// foo will be pushed to the stack and then dropped, rendering it a noop. bar will run.
```## `]run[`  ( `a`**{.description} ``**{.description} &rarr;  )

Pushes the item to the return stack, so that it will run when the current word finishes.
{#]run[}

```phoo

[ table a b c ] [ ]run[ ]
// if ToS is n, runs nth item of the table.
```## `]this[`  ( `a`**{.description} ``**{.description} &rarr;  )

Pushes the top array on the return stack to the work stack, so that the word can reference its caller.
{#]this[}## `[]`  (  &rarr; ``**{.description} `a`**{.description} )

Pushes `a` new, empty array to the work stack.
{#[]}## `concat`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `b`**{.description} )

Concatenates two arrays. non-arrays are treated like one-element arrays.
{#concat}## `peek`  ( `a`**{.description} ``**{.description} `i`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `[`**{.description} `i`**{.description} `]`**{.description} )

Takes the `i`-th item out of the array `a`.
{#peek}## `poke`  ( `t`*item to poke*{.description} ``**{.description} `a`*the array to be poked*{.description} ``**{.description} `i`*index to poke at*{.description} ``**{.description} &rarr; ``**{.description} `a`*the array to be poked*{.description} )

Puts the item into the specified index of the array, and leaves the new, mutated array.
{#poke}## `]sandbox[`  ( `c`**{.description} ``**{.description} &rarr; ``**{.description} `e`**{.description} )

Runs the code under a `try` statement, and pushes the error it threw, or `false` if no error.
{#]sandbox[}## `die`  ( `m`**{.description} ``**{.description} &rarr;  )

Throws a `phooerror` with the message.
{#die}## `]getstack[`  ( `e`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

With a `phooerror` on the top, gets its phoo stack trace.
{#]getstack[}## `type`  ( `o`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Gets the type of the object.
{#type}## `compile`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} )

Compiles the string, so that it can be run.
{#compile}## `time`  (  &rarr; ``**{.description} `t`**{.description} )

Pushes the system time, in milliseconds.
{#time}## `await`  ( `p`**{.description} ``**{.description} &rarr; ``**{.description} `v`**{.description} )

Awaits a `promise` and pushes the resolve value.
{#await}## `get`  ( `o`*object*{.description} ``**{.description} `k`*string key*{.description} ``**{.description} &rarr; ``**{.description} `v`*o.k*{.description} )

Object and key, looks up.
{#get}## `set`  ( `v`*value to set*{.description} ``**{.description} `o`*object*{.description} ``**{.description} `k`*string key*{.description} ``**{.description} &rarr;  )

Value, object, and key, sets the key.
{#set}## `call`  ( `a`*arguments array*{.description} ``**{.description} `f`*function*{.description} ``**{.description} &rarr; ``**{.description} `r`*return value
see-also> new*{.description} )

Calls `a` function with the arguments.
{#call}## `new`  ( `a`*arguments array*{.description} ``**{.description} `f`*constructor function*{.description} ``**{.description} &rarr; ``**{.description} `r`*new object constructed*{.description} )

Same sort as [`call`](#call), but uses javascript `new` keyword to construct with `a` class.
{#new}## `word`  ( `s`*string*{.description} ``**{.description} &rarr; ``**{.description} `w`*symbol of that string*{.description} )

Converts string to symbol.
{#word}## `name`  ( `w`*symbol*{.description} ``**{.description} &rarr; ``**{.description} `s`*string of that symbol*{.description} )

Reverse of [`word`](#word), converts symbol to string.
{#name}## `resolve`  ( `w`*symbol*{.description} ``**{.description} &rarr; ``**{.description} `d`*definition*{.description} )

Looks up the definition of the word symbol.
{#resolve}## `{}`  (  &rarr; ``**{.description} `a`**{.description} )

Pushes `a` new empty object.
{#{}}## `self`  (  &rarr; ``**{.description} `t`**{.description} )

Pushes a reference to the current thread.
{#self}## `window`  (  &rarr; ``**{.description} `t`**{.description} )

Pushes a reference to the global javascript object (`globalthis`). called "window" because that is its name in the browser which is what phoo was designed for.
{#window}## `]define[`  ( `n`*symbol name*{.description} ``**{.description} `d`*definition*{.description} ``**{.description} &rarr;  )

Writes a new definition to the top scope using the name and definition on the stack.
{#]define[}## `]define-macro[`  ( `n`*symbol name*{.description} ``**{.description} `d`*definition*{.description} ``**{.description} &rarr;  )

Like [`]define[`](#]define[) but defines a macro.
{#]define-macro[}## `]forget[`  ( `n`*symbol name*{.description} ``**{.description} &rarr;  )

Erases the definition of a word, reverting back to the old one if there was one.
{#]forget[}## `to` *`name`*{.shadowed} *`def`*{.shadowed} (  &rarr;  )

Wrapper for [`]define[`](#]define[).
{#to}## `macro` *`name`*{.shadowed} *`def`*{.shadowed} (  &rarr;  )

Wrapper for [`]define-macro[`](#]define-macro[).
{#macro}## `forget` *`name`*{.shadowed} (  &rarr;  )

Wrapper for [`]forget[`](#]forget[).
{#forget}## `]import[`  ( `n`*name of the module*{.description} ``**{.description} `r`*boolean, force-reload the module*{.description} ``**{.description} &rarr;  )

Imports the module, force-reloading if the top is true (ignores cache).
{#]import[}## `promise`  (  &rarr; ``**{.description} `p`*the promise*{.description} ``**{.description} `x`*reject callback*{.description} ``**{.description} `r`*resolve callback*{.description} )

Pushes the pieces to a new promise.
{#promise}## `functionize`  ( `c`**{.description} ``**{.description} &rarr; ``**{.description} `f`**{.description} )

Turns the code into a function, that will run the code in a subthread.
{#functionize}