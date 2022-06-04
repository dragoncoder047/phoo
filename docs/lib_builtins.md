# `use lib/_builtins`


--



This module is the 

--

### `/*`  (  &rarr;  ) {#%2f%2a}

Block comment. Like C-style comments. Comments do not nest.

--

### `$`  (  &rarr; `s`*The string (or regular expression) defined by the literal.*{.description} ) {#%24}

String builder.

First non-whitespace character after the `$` is the delimiter. The delimiter can be escaped by doubling it.

The characters immediately following the end delimiter are known as the "tag" and affect the resultant string. The first character is the code that determines the formatting applied.

Currently the only one implemented is `r`, which turns the string into a regular expression. The characters after the `r` are the flags that would go at the end of it. There is no way to "escape" any characters other than the delimiter, but a `e` code for defining an escape character is planned. See issue [#8](https://github.com/dragoncoder047/phoo/issues/8) for the status of that.

Example:

```phoo

$ 5ab*c?5rig
// puts the regular expression /ab*c?/ig.
```

--

### `do`  (  &rarr;  ) {#do}

Starts of a new sub-array.

--

### `[`  (  &rarr;  ) {#%5b}

Same as `do`.

--

### `end`  (  &rarr;  ) {#end}

End of a sub-array.

--

### `]`  (  &rarr;  ) {#%5d}

Same as `end`.

--

### `pick`  ( `n`*Depth of item to pick*{.description} &rarr; `i`*COPY of the item.*{.description} ) {#pick}

Same as the Forth word `PICK`. Takes a number `n` and **copies** the nth item to the top.

 **See Also:** [`roll`](#roll)

--

### `roll`  ( `n`*Depth of item to pick*{.description} &rarr; `i`*COPY of the item.*{.description} ) {#roll}

Same as the Forth word `ROLL`. Takes a number `n` and **moves** the nth item to the top .

 **See Also:** [`pick`](#pick)

--

### `drop`  ( `n` &rarr;  ) {#drop}

Removes the top item from the stack.

--

### `1+`  ( `n` &rarr; `n+1` ) {#1%2b}

Increments a number on the top of the stack.

--

### `1-`  ( `n` &rarr; `n-1` ) {#1%2d}

Decrements a number on the top of the stack.

--

### `+`  ( `a` `b` &rarr; `b+a` ) {#%2b}

Adds two items together using Javascript `+` operator. Note the order of addition.

--

### `negate`  ( `a` &rarr; `-a` ) {#negate}

Unary negation of top item.

--

### `*`  ( `a` `b` &rarr; `b*a` ) {#%2a}

Multiply top items.

--

### `**`  ( `b`*base*{.description} `e`*exponent*{.description} &rarr; `b**e` ) {#%2a%2a}

Power of top two items.

--

### `/mod`  ( `x`*dividend*{.description} `y`*divisor*{.description} &rarr; `q`*quotient*{.description} `r`*remainder*{.description} ) {#%2fmod}

Euclidean division. Remainder and quotient.

--

### `/`  ( `a`*dividend*{.description} `b`*divisor*{.description} &rarr; `q`*quotient*{.description} ) {#%2f}

Regular division (results in float).

--

### `=`  ( `a` `b` &rarr; `t` ) {#%3d}

Equals, using Javascript `==` operator.

--

### `>`  ( `a`*number on "larger" (left) side of expression.*{.description} `b`*number on "smaller" (right) side of expression.*{.description} &rarr; `t` ) {#%3e}

Greater than.

--

### `nand`  ( `a` `b` &rarr; `t` ) {#nand}

Boolean NAND of two arguments. True if both are false.

--

### `~`  ( `n` &rarr; `~n` ) {#%7e}

Bitwise NOT of a number.

--

### `&`  ( `a` `b` &rarr; `a&b` ) {#%26}

Bitwise AND of two numbers.

--

### `|`  ( `a` `b` &rarr; `a|b` ) {#%7c}

Bitwise OR of two numbers.

--

### `^`  ( `a` `b` &rarr; `a^b` ) {#%5e}

Bitwise XOR of two numbers.

--

### `<<`  ( `a` `b` &rarr; `a<<b` ) {#%3c%3c}

A bit-shifted left by B places. Negative B for shift right.

--

### `put`  ( `i`*Item to push*{.description} `a`*Array to push onto*{.description} &rarr;  ) {#put}

Pushes the item onto the end of the array.

 **See Also:** [`take`](#take)

--

### `take`  ( `a`*Array*{.description} &rarr; `i`*Last item of the array*{.description} ) {#take}

Reverse of [`put`](#put), it takes the item out of the array. The array is mutated.

--

### `]done[`  (  &rarr;  ) {#%5ddone%5b}

Drops the top item of the return stack, effectively causing everything else outside of the current word to be skipped.

Example:

```phoo

[ foo [ ]done[ bar ] baz ]
// foo and then bar are run, but baz is skipped.
```

--

### `]again[`  (  &rarr;  ) {#%5dagain%5b}

Sets the return pointer of the top return stack item to -1, effectively causing everything else outside of the current word to be repeated.

Example:

```phoo

[ foo [ ]again[ bar ] baz ]
// runs foo bar foo bar foo bar foo bar ... infintely
```

--

### `]cjump[`  ( `t`*truth value to test*{.description} `n`*how far to jump if false*{.description} &rarr;  ) {#%5dcjump%5b}

If the test value `t` is false, adds `n` to the top return stack entry's return pointer, effectively skipping that many items.

Example:

```phoo

[ 3 ]cjump[ ] foo bar baz bam
// if ToS is false, skips foo bar baz. bam will always run
```

--

### `]'[`  (  &rarr; `a` ) {#%5d%27%5b}

Instead of running the next item on the top return stack entry, pushes it to the stack and crements the return stack pointer.

Example:

```phoo

[ ]'[ drop ] foo bar
// foo will be pushed to the stack and then dropped, rendering it a noop. bar will run.
```

--

### `]run[`  ( `a` &rarr;  ) {#%5drun%5b}

Pushes the item to the return stack, so that it will run when the current word finishes.

Example:

```phoo

[ table a b c ] [ ]run[ ]
// if ToS is n, runs nth item of the table.
```

--

### `]this[`  ( `a` &rarr;  ) {#%5dthis%5b}

Pushes the top array on the return stack to the work stack, so that the word can reference its caller.

--

### `[]`  (  &rarr; `a` ) {#%5b%5d}

Pushes `a` new, empty array to the work stack.

--

### `concat`  ( `a` `b` &rarr; `ab` ) {#concat}

Concatenates two arrays. non-arrays are treated like one-element arrays.

--

### `peek`  ( `a` `i` &rarr; `a[i]` ) {#peek}

Takes the `i`-th item out of the array `a`.

--

### `poke`  ( `t`*item to poke*{.description} `a`*the array to be poked*{.description} `i`*index to poke at*{.description} &rarr; `a`*the array to be poked*{.description} ) {#poke}

Puts the item into the specified index of the array, and leaves the new, mutated array.

--

### `]sandbox[`  ( `c` &rarr; `e` ) {#%5dsandbox%5b}

Runs the code under a `try` statement, and pushes the error it threw, or `false` if no error.

--

### `die`  ( `m` &rarr;  ) {#die}

Throws a `PhooError` with the message.

--

### `]getstack[`  ( `e` &rarr; `t` ) {#%5dgetstack%5b}

With a `PhooError` on the top, gets its Phoo stack trace.

--

### `type`  ( `o` &rarr; `t` ) {#type}

Gets the type of the object.

--

### `compile`  ( `s` &rarr; `a` ) {#compile}

Compiles the string, so that it can be run.

--

### `time`  (  &rarr; `t` ) {#time}

Pushes the system time, in milliseconds.

--

### `await`  ( `p` &rarr; `v` ) {#await}

Awaits a `Promise` and pushes the resolve value.

--

### `get`  ( `o`*object*{.description} `k`*string key*{.description} &rarr; `v`*o.k*{.description} ) {#get}

Object and key, looks up.

--

### `set`  ( `v`*value to set*{.description} `o`*object*{.description} `k`*string key*{.description} &rarr;  ) {#set}

Value, object, and key, sets the key.

--

### `call`  ( `a`*arguments array*{.description} `f`*function*{.description} &rarr; `r`*return value*{.description} ) {#call}

Calls `a` function with the arguments.

 **See Also:** [`new`](#new)

--

### `new`  ( `a`*arguments array*{.description} `f`*constructor function*{.description} &rarr; `r`*new object constructed*{.description} ) {#new}

Same sort as [`call`](#call), but uses Javascript `new` keyword to construct with a class.

--

### `word`  ( `s`*string*{.description} &rarr; `w`*symbol of that string*{.description} ) {#word}

Converts string to symbol.

--

### `name`  ( `w`*symbol*{.description} &rarr; `s`*string of that symbol*{.description} ) {#name}

Reverse of [`word`](#word), converts symbol to string.

--

### `resolve`  ( `w`*symbol*{.description} &rarr; `d`*definition*{.description} ) {#resolve}

Looks up the definition of the word symbol.

--

### `{}`  (  &rarr; `a` ) {#%7b%7d}

Pushes `a` new empty object.

--

### `self`  (  &rarr; `t` ) {#self}

Pushes a reference to the current thread.

--

### `window`  (  &rarr; `t` ) {#window}

Pushes a reference to the global Javascript object (`globalThis`). Called "window" because that is its name in the browser which is what Phoo was designed for.

--

### `]define[`  ( `n`*symbol name*{.description} `d`*definition*{.description} &rarr;  ) {#%5ddefine%5b}

Writes a new definition to the top scope using the name and definition on the stack.

--

### `]define-macro[`  ( `n`*symbol name*{.description} `d`*definition*{.description} &rarr;  ) {#%5ddefine%2dmacro%5b}

Like [`]define[`](#%5ddefine%5b) but defines a macro.

--

### `]forget[`  ( `n`*symbol name*{.description} &rarr;  ) {#%5dforget%5b}

Erases the definition of a word, reverting back to the old one if there was one.

--

### `to` *`name`*{.shadowed} *`def`*{.shadowed} (  &rarr;  ) {#to}

Wrapper for [`]define[`](#%5ddefine%5b).

--

### `macro` *`name`*{.shadowed} *`def`*{.shadowed} (  &rarr;  ) {#macro}

Wrapper for [`]define-macro[`](#%5ddefine%2dmacro%5b).

--

### `forget` *`name`*{.shadowed} (  &rarr;  ) {#forget}

Wrapper for [`]forget[`](#%5dforget%5b).

--

### `]import[`  ( `n`*name of the module*{.description} `r`*boolean, force-reload the module*{.description} &rarr;  ) {#%5dimport%5b}

Imports the module, force-reloading if the top is true (ignores cache).

--

### `promise`  (  &rarr; `p`*the promise*{.description} `x`*reject callback*{.description} `r`*resolve callback*{.description} ) {#promise}

Pushes the pieces to a new promise.

--

### `functionize`  ( `c` &rarr; `f` ) {#functionize}

Turns the code into a function, that will run the code in a subthread.

---

[back to index](index.html)