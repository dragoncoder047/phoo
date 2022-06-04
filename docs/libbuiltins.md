## `#pragma` *`flag`*{.shadowed} *`value`*{.shadowed} (  &rarr;  )

Sets the settings `flag` specified.
{##pragma}

```phoo

#pragma strictMode false
```## `in_scope` *`block`*{.shadowed} (  &rarr;  )

Runs the code with a new entry on the scope stack.
{#in_scope}## `noop`  (  &rarr;  )

No-op.
{#noop}## `alias` *`x`*{.shadowed} *`y`*{.shadowed} (  &rarr;  )

Aliases `x` to mean `y`.
{#alias}## `const`  (  &rarr; ``**{.description} `v`**{.description} )

Precomputes a value.
{#const}## `now!`  (  &rarr;  )

Runs code during compilation. *(#6 - doesn't work)*.
{#now!}## `//`  (  &rarr;  )

Line comment *(#6 - doesn't work)*.
{#//}## `dup`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `a`**{.description} )

Duplicates top item.
{#dup}## `over`  ( `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} )

Copies second item to top.
{#over}## `swap`  ( `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} )

Swaps top two.
{#swap}## `rot`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `a`**{.description} )

Pulls third to top.
{#rot}## `unrot`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} &rarr; ``**{.description} `c`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} )

Pushes top down to third.
{#unrot}## `nip`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} )

Removes second stack item.
{#nip}## `tuck`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} )

Copies first item to third.
{#tuck}## `2dup`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} )

[`dup`](#dup)s two items as `a` pair.
{#2dup}## `2drop`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr;  )

[`drop`](#drop)s two items as `a` pair.
{#2drop}## `2swap`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} &rarr; ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} )

[`swap`](#swap)s two pairs of items.
{#2swap}## `2over`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} )

[`over`](#over)s two pairs of items.
{#2over}## `pack`  ( `*`**{.description} `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} )

Takes `n` and then puts `n` items into an array.
{#pack}## `unpack`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} ``**{.description} `j`**{.description} ``**{.description} `k`**{.description} ``**{.description} `.`**{.description} `.`**{.description} `.`**{.description} )

Reverse of [`pack`](#pack), it flattens an array onto the stack.
{#unpack}## `dip` *`op`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} )

Dips the top item out of the array, runs the block, and puts the item back.
{#dip}## `abs`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `|`**{.description} `n`**{.description} `|`**{.description} )

Absolute value of a number.
{#abs}## `-`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `-`**{.description} `b`**{.description} )

Subtracts top from second.
{#-}## `/~`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `f`**{.description} `l`**{.description} `o`**{.description} `o`**{.description} `r`**{.description} `(`**{.description} `a`**{.description} `/`**{.description} `b`**{.description} `)`**{.description} )

Flooring division.
{#/~}## `mod`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `%`**{.description} `b`**{.description} )

Modulo.
{#mod}## `!=`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Not equals.
{#!=}## `<=`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `<`**{.description} `=`**{.description} `b`**{.description} )

Less than or equal to.
{#<=}## `<`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `<`**{.description} `b`**{.description} )

Less than.
{#<}## `>=`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `>`**{.description} `=`**{.description} `b`**{.description} )

Greater than or equal to.
{#>=}## `min`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `v`**{.description} )

Lesser of two value.
{#min}## `max`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `v`**{.description} )

Larger of two value.
{#max}## `clamp`  ( `l`**{.description} ``**{.description} `u`**{.description} ``**{.description} `x`**{.description} ``**{.description} &rarr; ``**{.description} `v`**{.description} )

Clamps `x` to $l\gte x\gt `u`$.
{#clamp}## `within`  ( `l`**{.description} ``**{.description} `u`**{.description} ``**{.description} `x`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

True if $l\gte x\gt `u`$.
{#within}## `$<`  ( `s`**{.description} `1`**{.description} ``**{.description} `s`**{.description} `2`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `1`**{.description} `<`**{.description} `s`**{.description} `2`**{.description} )

True if `s1` comes before `s2` in the dictionary.
{#$<}## `$>`  ( `s`**{.description} `1`**{.description} ``**{.description} `s`**{.description} `2`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `1`**{.description} `>`**{.description} `s`**{.description} `2`**{.description} )

True if `s1` comes after `s2` in the dictionary.
{#$>}## `not`  ( `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Boolean inverse.
{#not}## `and`  ( `t`**{.description} ``**{.description} `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Boolean and.
{#and}## `or`  ( `t`**{.description} ``**{.description} `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Boolean or.
{#or}## `xor`  ( `t`**{.description} ``**{.description} `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Boolean xor.
{#xor}## `>>`  ( `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} )

Shift `a` right by `n` places.
{#>>}## `bit`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} )

$2^`n`$.
{#bit}## `var` *`name`*{.shadowed} (  &rarr;  )

Declares a new variable, initialized to `undefined`.
{#var}## `var,` *`name`*{.shadowed} ( `v`**{.description} ``**{.description} &rarr;  )

Declares a new variable, initialized to top stack value.
{#var,}## `is` *`name`*{.shadowed} ( `v`**{.description} ``**{.description} &rarr;  )

Puts a value into a variable.
{#is}## `stack`  (  &rarr; ``**{.description} `a`**{.description} )

Placed at the start of `a` word, makes the word an ancillary stack.
{#stack}## `release`  ( `a`**{.description} ``**{.description} &rarr;  )

Removes the first item from an array and discards it. mutates the array.
{#release}## `copy`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} )

Copies the last item of the array `a` onto the stack.
{#copy}## `replace`  ( `i`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr;  )

Replaces the last item on the array `a` with i.
{#replace}## `replace`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr;  )

Moves the last item from the array `b` to the array `a`.
{#replace}## `tally`  ( `n`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr;  )

Adds `n` to the last item of the array `a`.
{#tally}## `temp`  (  &rarr; ``**{.description} `a`**{.description} )

Temp is `a` general purpose ancillary [`stack`](#stack).
{#temp}## `done`  (  &rarr;  )

Jumps immediately to the end of the array.
{#done}

```phoo

[ foo bar done baz ]
// foo bar will run, baz will not
```## `again`  (  &rarr;  )

Jumps immediately to the start of the array.
{#again}

```phoo

[ foo bar again baz ]
// foo bar will run infinitely
```## `if`  ( `t`**{.description} ``**{.description} &rarr;  )

If the top of stack is false, skips the next item.
{#if}

```phoo

[ foo bar if baz ]
// if bar returns false, baz will be skipped
```## `iff`  ( `t`**{.description} ``**{.description} &rarr;  )

If the top of stack is false, skips the next two items.
{#iff}

```phoo

[ foo iff bar baz ]
// if foo returns false, bar baz will be skipped
```## `else`  (  &rarr;  )

Unconditionally skips the next item.
{#else}

```phoo

[ foo else bar baz ]
// bar will not run.
```## `until`  ( `t`**{.description} ``**{.description} &rarr;  )

If the top of stack is false, jumps back to the start of the array.
{#until}

```phoo

[ foo bar baz until ]
// repeats foo bar baz until baz returns true.
```## `while`  ( `t`**{.description} ``**{.description} &rarr;  )

If the top of stack is false, jumps to the end of the array.
{#while}

```phoo

[ foo while baz again ]
// runs foo at least once, then repeats bar foo until foo returns false
```## `switch`  ( `v`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `c`**{.description} `a`**{.description} `s`**{.description} `e`**{.description} ``**{.description} `d`**{.description} `e`**{.description} `f`**{.description} `a`**{.description} `u`**{.description} `l`**{.description} `t`**{.description} )

Begins a switch staement: puts the value to be switched upon in a temporary stack (not [`temp`](#temp)).
{#switch}## `default`  ( `v`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `s`**{.description} `w`**{.description} `i`**{.description} `t`**{.description} `c`**{.description} `h`**{.description} ``**{.description} `c`**{.description} `a`**{.description} `s`**{.description} `e`**{.description} )

Ends a `switch` staement: empties the `switch` value from the stack it is stored on.
{#default}## `case` *`action`*{.shadowed} ( `v`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `s`**{.description} `w`**{.description} `i`**{.description} `t`**{.description} `c`**{.description} `h`**{.description} ``**{.description} `d`**{.description} `e`**{.description} `f`**{.description} `a`**{.description} `u`**{.description} `l`**{.description} `t`**{.description} )

If the value on the stack is not the `switch` value, skips `action`. if it is, runs `action` and then jumps to the end of the array (skipping the other cases and the [`default`](#default)).
{#case}## `'` *`value`*{.shadowed} (  &rarr; ``**{.description} `v`**{.description} )

Puts the `value` following it on the stack instead of running it.
{#'}

```phoo

[ 1 2 3 ] // results in 3 items on the stack
' [ 1 2 3 ] // results in 1 item, the array [1, 2, 3]
```## `run`  ( `c`**{.description} ``**{.description} &rarr;  )

Runs the item on the stack as code.
{#run}## `this`  (  &rarr; ``**{.description} `a`**{.description} )

Puts `a` reference to the current array on the stack.
{#this}## `table`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} )

Placed at the start of a word, turns it into a lookup table. takes the `n`-th item after the `table` and puts it on the stack, and then skips everything after it.
{#table}## `recurse`  (  &rarr;  )

Causes the current array to run itself again.
{#recurse}## `times` *`block`*{.shadowed} ( `n`**{.description} ``**{.description} &rarr;  )

Runs body the specified numbe of times.
{#times}## `i`  (  &rarr; ``**{.description} `n`**{.description} )

Inside of a [`times`](#times) loop, gets the number of iterations left to do after this one.
{#i}## `i^`  (  &rarr; ``**{.description} `n`**{.description} )

Inside of a [`times`](#times) loop, gets the number of iterations done since the loop started.
{#i^}## `j`  (  &rarr; ``**{.description} `n`**{.description} )

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations left to do in the **outer** loop after this one.
{#j}## `j^`  (  &rarr; ``**{.description} `n`**{.description} )

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations done by the **outer** loop since the loop started.
{#j^}## `step`  ( `n`**{.description} ``**{.description} &rarr;  )

Adds `n` to the current [`times`](#times) loop's iteration counter. .
{#step}## `restart`  (  &rarr;  )

Sets the current [`times`](#times) loop's iteration counter to the original value it started at, restarting the loop. .
{#restart}## `break`  (  &rarr;  )

Sets the current [`times`](#times) loop's iteration counter to 0, causing the loop to end after this iteration is done.
{#break}## `printable`  ( `c`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Given a character `c`, treurns true or false whether it is in the printable region of ascii (i.e. greater than 31).
{#printable}## `trim`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Trims the leading whitespace from a string.
{#trim}## `nextword`  ( `s`*string*{.description} ``**{.description} &rarr; ``**{.description} `r`*remainder of string*{.description} ``**{.description} `w`*first word*{.description} )

Given a string that does not start with whitespace, returns the first word and the rest of the string.
{#nextword}## `split$`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} )

Splits `a` string `s` into an array `a` of individual words.
{#split$}## `nested`  ( `i`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} )

Puts an item in its own array.
{#nested}## `len`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `l`**{.description} )

Gets the length of the array or string.
{#len}## `pluck`  ( `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `i`**{.description} ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `s`**{.description} `t`**{.description} `u`**{.description} `f`**{.description} `f`**{.description} )

Pulls the `i`-th item out of the array `a` and returns the shortened array and the item.
{#pluck}## `stuff`  ( `a`**{.description} ``**{.description} `i`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} )

Reverse of [`pluck`](#pluck), it puts the item back.
{#stuff}## `behead`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `i`**{.description} )

Returns the first item of the array `a`, and the rest. the original array is not mutated.
{#behead}## `join`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `b`**{.description} )

Joins two arrays or strings, selecting between [`++`](#++) and `concat` depending on the type of the arguments.
{#join}## `of`  ( `x`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} )

Makes an array with `n` `x`'s in it.
{#of}## `reverse`  ( `a`**{.description} `r`**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `r`**{.description} `r`**{.description} `a`**{.description} ``**{.description} )

Reverses the array.
{#reverse}## `reverse$`  ( `x`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} ``**{.description} )

[`reverse`](#reverse) but for strings.
{#reverse$}## `reflect`  ( `x`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} ``**{.description} )

[`reverse`](#reverse) but digs down into sub-arrays and reflects them too.
{#reflect}## `makewith`  ( `c`**{.description} ``**{.description} &rarr; ``**{.description} `l`**{.description} ``**{.description} )


places the code in a loop and returns the generated code.

the returned code takes an array or string on the stack and calls the original code passed 
to `makewith` with each item of the array or string.
{#makewith}## `witheach` *`block`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} )

Takes an array or string and runs `block` for each item in it.
{#witheach}## `fold`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )


takes `a` function and an array and reduces the array by calling the function with pairs of the items from the array:

    ' [ 1   2   3   4   5   6   7   8   9   0 ] ' `a` fold
        |   |   |   |   |   |   |   |   |   |
        '>`a`<'   |   |   |   |   |   |   |   |
          '-->`a`<'   |   |   |   |   |   |   |
              '-->`a`<'   |   |   |   |   |   |
                  '-->`a`<'   |   |   |   |   |
                      '-->`a`<'   |   |   |   |
                          '-->`a`<'   |   |   |
                              '-->`a`<'   |   |
                                  '-->`a`<'   |
                                      '-->`a`<'
                                          |
                                          result.
{#fold}## `foldr`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Same as [`fold`](#fold) but applies the operation in reverse order.
{#foldr}## `map`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Passes each item of array `a` through function `r` and concatentates the returned values.
{#map}## `filter`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Passes each item of array `a` through function `r` and returns the items for which `r` returns true.
{#filter}## `split`  ( `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} ``**{.description} `y`**{.description} )

Splits the array between the `n`-th and `n`+1-th items and returns the parts, second half on top.
{#split}## `matchitem`  ( `a`*array to search*{.description} ``**{.description} `f`*criteria function to test if item matches*{.description} ``**{.description} `c`*cleanup function to clean the stack*{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} )

Uses the provided functions to find an item. returns the index of the first found item.
{#matchitem}## `find`  ( `a`**{.description} ``**{.description} `x`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} )

Finds the first index where item `x` occurs in the array `a`.
{#find}## `findwith` *`criteria`*{.shadowed} *`cleanup`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} )

Same as [`matchitem`](#matchitem) but uses lookahead for `cleanup` and `criteria`.
{#findwith}## `found?`  ( `a`**{.description} ``**{.description} `i`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

True if `i` is `a` valid index into array `a`.
{#found?}

```phoo

to has-foo? [ dup $ "foo" find found? ]
```## `lower`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Turns a string lowercase.
{#lower}## `upper`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Turns a string uppercase.
{#upper}## `++`  ( `s`**{.description} `1`**{.description} ``**{.description} `s`**{.description} `2`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `1`**{.description} `s`**{.description} `2`**{.description} )

Concatenates 2 items after casting both to string type.
{#++}## `num>$`  ( `x`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Writes number `x` in base n.
{#num>$}## `$>num`  ( `s`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} )

Parses string `s` as a number in base `n`.
{#$>num}## `big`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} )

Turns number `n` into a `bigint`.
{#big}## `sortwith` *`comp`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Using comparator `comp`, sorts the array. does not mutate the array.
{#sortwith}## `sort`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Sort an array of numbers.
{#sort}## `sort$`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Sort an array of strings.
{#sort$}## `try` *`block`*{.shadowed} *`except`*{.shadowed} (  &rarr;  )

Runs `block`, and if it threw an error, runs `except` with the error on the stack. if `block` ran fine, skips `except`.
{#try}## `nestdepth`  (  &rarr; ``**{.description} `n`**{.description} )

Puts the current recursion depth on the stack.
{#nestdepth}## `stacksize`  (  &rarr; ``**{.description} `n`**{.description} )

Puts the number of items on the stack, on the stack.
{#stacksize}## `to-do`  (  &rarr; ``**{.description} `a`**{.description} )

To-do is `a` general purpose ancillary [`stack`](#stack).
{#to-do}## `new-do`  ( `a`**{.description} ``**{.description} &rarr;  )

Initializes the [`stack`](#stack) `a` as `a` to-do stack by putting [`done`](#done) on it.
{#new-do}## `add-to`  ( `x`**{.description} `x`**{.description} `x`**{.description} `*`**{.description} ``**{.description} `c`**{.description} ``**{.description} `n`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr;  )

Puts the action `c` and its arguments `xxx*` (the number of which is `n`) on the to-do stack `a`.
{#add-to}## `now-do`  ( `a`**{.description} ``**{.description} &rarr;  )

Runs all the queued items on the to-do stack, until it hits the [`done`](#done) put there by [`new-to`](#new-to).
{#now-do}## `do-now`  ( `a`**{.description} ``**{.description} &rarr;  )

Same as [`now-do`](#now-do) but does the items in reverse order.
{#do-now}## `not-do`  ( `a`**{.description} ``**{.description} &rarr;  )

Removes all the queued items from the to-do stack `a` without running them.
{#not-do}## `chr`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Returns the character with the unicode code point `n`.
{#chr}## `ord`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `n`**{.description} )

Reverse of [`chr`](#chr), it gets the code point of the character.
{#ord}## `isa?`  ( `a`**{.description} ``**{.description} `s`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

True if item `a`'`s` [`type`](#type) is the same as `s`.
{#isa?}## `isoneof`  ( `a`**{.description} ``**{.description} `s`**{.description} `s`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} )

Same as [`isa?`](#isa?) but accepts an array of types, which will succeed if any of them is the [`type`](#type) of `a`.
{#isoneof}## `stringify`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} )

Converts `a` to `a` string.
{#stringify}## `arrayify`  ( `x`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} )

Converts `a` to an array.
{#arrayify}## `phoo`  ( `c`**{.description} ``**{.description} &rarr;  )

Compile and run the code.
{#phoo}## `new@`  ( `f`**{.description} ``**{.description} &rarr; ``**{.description} `o`**{.description} )

Constructs the function `f` by calling it with no arguments.
{#new@}## `call@`  ( `f`**{.description} ``**{.description} &rarr; ``**{.description} `r`**{.description} )

Calls the function `f` with no arguments.
{#call@}## `!!todo!!`  (  &rarr;  )

Throws `'todo'`.
{#!!todo!!}## `use` *`path/to/module`*{.shadowed} (  &rarr;  )

Imports the module, skipping if it was already imported.
{#use}## `reuse` *`path/to/module`*{.shadowed} (  &rarr;  )

Imports the module, force-reloading it even if it is already loaded.
{#reuse}## `dir`  (  &rarr; ``**{.description} `a`**{.description} )

Returns `a` list of the names of all the available words in this scope.
{#dir}