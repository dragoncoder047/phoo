

## `#pragma` *`flag`*{.shadowed} *`value`*{.shadowed} (  &rarr;  ) {##pragma}

Sets the settings `flag` specified.

```phoo

#pragma strictMode false
```

## `in_scope` *`block`*{.shadowed} (  &rarr;  ) {#in_scope}

Runs the code with a new entry on the scope stack.

## `noop`  (  &rarr;  ) {#noop}

No-op.

## `alias` *`x`*{.shadowed} *`y`*{.shadowed} (  &rarr;  ) {#alias}

Aliases `x` to mean `y`.

## `const`  (  &rarr; ``**{.description} `v`**{.description} ) {#const}

Precomputes a value.

## `now!`  (  &rarr;  ) {#now!}

Runs code during compilation. *(#6 - doesn't work)*.

## `//`  (  &rarr;  ) {#//}

Line comment *(#6 - doesn't work)*.

## `dup`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `a`**{.description} ) {#dup}

Duplicates top item.

## `over`  ( `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ) {#over}

Copies second item to top.

## `swap`  ( `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ) {#swap}

Swaps top two.

## `rot`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `a`**{.description} ) {#rot}

Pulls third to top.

## `unrot`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} &rarr; ``**{.description} `c`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ) {#unrot}

Pushes top down to third.

## `nip`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ) {#nip}

Removes second stack item.

## `tuck`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ) {#tuck}

Copies first item to third.

## `2dup`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ) {#2dup}

[`dup`](#dup)s two items as `a` pair.

## `2drop`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr;  ) {#2drop}

[`drop`](#drop)s two items as `a` pair.

## `2swap`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} &rarr; ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ) {#2swap}

[`swap`](#swap)s two pairs of items.

## `2over`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} `c`**{.description} ``**{.description} `d`**{.description} ``**{.description} `a`**{.description} ``**{.description} `b`**{.description} ) {#2over}

[`over`](#over)s two pairs of items.

## `pack`  ( `*`**{.description} `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ) {#pack}

Takes `n` and then puts `n` items into an array.

## `unpack`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} ``**{.description} `j`**{.description} ``**{.description} `k`**{.description} ``**{.description} `.`**{.description} `.`**{.description} `.`**{.description} ) {#unpack}

Reverse of [`pack`](#pack), it flattens an array onto the stack.

## `dip` *`op`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ) {#dip}

Dips the top item out of the array, runs the block, and puts the item back.

## `abs`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `|`**{.description} `n`**{.description} `|`**{.description} ) {#abs}

Absolute value of a number.

## `-`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `-`**{.description} `b`**{.description} ) {#-}

Subtracts top from second.

## `/~`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `f`**{.description} `l`**{.description} `o`**{.description} `o`**{.description} `r`**{.description} `(`**{.description} `a`**{.description} `/`**{.description} `b`**{.description} `)`**{.description} ) {#/~}

Flooring division.

## `mod`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `%`**{.description} `b`**{.description} ) {#mod}

Modulo.

## `!=`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#!=}

Not equals.

## `<=`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `<`**{.description} `=`**{.description} `b`**{.description} ) {#<=}

Less than or equal to.

## `<`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `<`**{.description} `b`**{.description} ) {#<}

Less than.

## `>=`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `>`**{.description} `=`**{.description} `b`**{.description} ) {#>=}

Greater than or equal to.

## `min`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `v`**{.description} ) {#min}

Lesser of two value.

## `max`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `v`**{.description} ) {#max}

Larger of two value.

## `clamp`  ( `l`**{.description} ``**{.description} `u`**{.description} ``**{.description} `x`**{.description} ``**{.description} &rarr; ``**{.description} `v`**{.description} ) {#clamp}

Clamps `x` to $l\gte x\gt `u`$.

## `within`  ( `l`**{.description} ``**{.description} `u`**{.description} ``**{.description} `x`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#within}

True if $l\gte x\gt `u`$.

## `$<`  ( `s`**{.description} `1`**{.description} ``**{.description} `s`**{.description} `2`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `1`**{.description} `<`**{.description} `s`**{.description} `2`**{.description} ) {#$<}

True if `s1` comes before `s2` in the dictionary.

## `$>`  ( `s`**{.description} `1`**{.description} ``**{.description} `s`**{.description} `2`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `1`**{.description} `>`**{.description} `s`**{.description} `2`**{.description} ) {#$>}

True if `s1` comes after `s2` in the dictionary.

## `not`  ( `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#not}

Boolean inverse.

## `and`  ( `t`**{.description} ``**{.description} `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#and}

Boolean and.

## `or`  ( `t`**{.description} ``**{.description} `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#or}

Boolean or.

## `xor`  ( `t`**{.description} ``**{.description} `t`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#xor}

Boolean xor.

## `>>`  ( `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ) {#>>}

Shift `a` right by `n` places.

## `bit`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ) {#bit}

$2^`n`$.

## `var` *`name`*{.shadowed} (  &rarr;  ) {#var}

Declares a new variable, initialized to `undefined`.

## `var,` *`name`*{.shadowed} ( `v`**{.description} ``**{.description} &rarr;  ) {#var,}

Declares a new variable, initialized to top stack value.

## `is` *`name`*{.shadowed} ( `v`**{.description} ``**{.description} &rarr;  ) {#is}

Puts a value into a variable.

## `stack`  (  &rarr; ``**{.description} `a`**{.description} ) {#stack}

Placed at the start of `a` word, makes the word an ancillary stack.

## `release`  ( `a`**{.description} ``**{.description} &rarr;  ) {#release}

Removes the first item from an array and discards it. mutates the array.

## `copy`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} ) {#copy}

Copies the last item of the array `a` onto the stack.

## `replace`  ( `i`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr;  ) {#replace}

Replaces the last item on the array `a` with i.

## `replace`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr;  ) {#replace}

Moves the last item from the array `b` to the array `a`.

## `tally`  ( `n`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr;  ) {#tally}

Adds `n` to the last item of the array `a`.

## `temp`  (  &rarr; ``**{.description} `a`**{.description} ) {#temp}

Temp is `a` general purpose ancillary [`stack`](#stack).

## `done`  (  &rarr;  ) {#done}

Jumps immediately to the end of the array.

```phoo

[ foo bar done baz ]
// foo bar will run, baz will not
```

## `again`  (  &rarr;  ) {#again}

Jumps immediately to the start of the array.

```phoo

[ foo bar again baz ]
// foo bar will run infinitely
```

## `if`  ( `t`**{.description} ``**{.description} &rarr;  ) {#if}

If the top of stack is false, skips the next item.

```phoo

[ foo bar if baz ]
// if bar returns false, baz will be skipped
```

## `iff`  ( `t`**{.description} ``**{.description} &rarr;  ) {#iff}

If the top of stack is false, skips the next two items.

```phoo

[ foo iff bar baz ]
// if foo returns false, bar baz will be skipped
```

## `else`  (  &rarr;  ) {#else}

Unconditionally skips the next item.

```phoo

[ foo else bar baz ]
// bar will not run.
```

## `until`  ( `t`**{.description} ``**{.description} &rarr;  ) {#until}

If the top of stack is false, jumps back to the start of the array.

```phoo

[ foo bar baz until ]
// repeats foo bar baz until baz returns true.
```

## `while`  ( `t`**{.description} ``**{.description} &rarr;  ) {#while}

If the top of stack is false, jumps to the end of the array.

```phoo

[ foo while baz again ]
// runs foo at least once, then repeats bar foo until foo returns false
```

## `switch`  ( `v`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `c`**{.description} `a`**{.description} `s`**{.description} `e`**{.description} ``**{.description} `d`**{.description} `e`**{.description} `f`**{.description} `a`**{.description} `u`**{.description} `l`**{.description} `t`**{.description} ) {#switch}

Begins a switch staement: puts the value to be switched upon in a temporary stack (not [`temp`](#temp)).

## `default`  ( `v`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `s`**{.description} `w`**{.description} `i`**{.description} `t`**{.description} `c`**{.description} `h`**{.description} ``**{.description} `c`**{.description} `a`**{.description} `s`**{.description} `e`**{.description} ) {#default}

Ends a `switch` staement: empties the `switch` value from the stack it is stored on.

## `case` *`action`*{.shadowed} ( `v`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `s`**{.description} `w`**{.description} `i`**{.description} `t`**{.description} `c`**{.description} `h`**{.description} ``**{.description} `d`**{.description} `e`**{.description} `f`**{.description} `a`**{.description} `u`**{.description} `l`**{.description} `t`**{.description} ) {#case}

If the value on the stack is not the `switch` value, skips `action`. if it is, runs `action` and then jumps to the end of the array (skipping the other cases and the [`default`](#default)).

## `'` *`value`*{.shadowed} (  &rarr; ``**{.description} `v`**{.description} ) {#'}

Puts the `value` following it on the stack instead of running it.

```phoo

[ 1 2 3 ] // results in 3 items on the stack
' [ 1 2 3 ] // results in 1 item, the array [1, 2, 3]
```

## `run`  ( `c`**{.description} ``**{.description} &rarr;  ) {#run}

Runs the item on the stack as code.

## `this`  (  &rarr; ``**{.description} `a`**{.description} ) {#this}

Puts `a` reference to the current array on the stack.

## `table`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} ) {#table}

Placed at the start of a word, turns it into a lookup table. takes the `n`-th item after the `table` and puts it on the stack, and then skips everything after it.

## `recurse`  (  &rarr;  ) {#recurse}

Causes the current array to run itself again.

## `times` *`block`*{.shadowed} ( `n`**{.description} ``**{.description} &rarr;  ) {#times}

Runs body the specified numbe of times.

## `i`  (  &rarr; ``**{.description} `n`**{.description} ) {#i}

Inside of a [`times`](#times) loop, gets the number of iterations left to do after this one.

## `i^`  (  &rarr; ``**{.description} `n`**{.description} ) {#i^}

Inside of a [`times`](#times) loop, gets the number of iterations done since the loop started.

## `j`  (  &rarr; ``**{.description} `n`**{.description} ) {#j}

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations left to do in the **outer** loop after this one.

## `j^`  (  &rarr; ``**{.description} `n`**{.description} ) {#j^}

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations done by the **outer** loop since the loop started.

## `step`  ( `n`**{.description} ``**{.description} &rarr;  ) {#step}

Adds `n` to the current [`times`](#times) loop's iteration counter. .

## `restart`  (  &rarr;  ) {#restart}

Sets the current [`times`](#times) loop's iteration counter to the original value it started at, restarting the loop. .

## `break`  (  &rarr;  ) {#break}

Sets the current [`times`](#times) loop's iteration counter to 0, causing the loop to end after this iteration is done.

## `printable`  ( `c`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#printable}

Given a character `c`, treurns true or false whether it is in the printable region of ascii (i.e. greater than 31).

## `trim`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#trim}

Trims the leading whitespace from a string.

## `nextword`  ( `s`*string*{.description} ``**{.description} &rarr; ``**{.description} `r`*remainder of string*{.description} ``**{.description} `w`*first word*{.description} ) {#nextword}

Given a string that does not start with whitespace, returns the first word and the rest of the string.

## `split$`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ) {#split$}

Splits `a` string `s` into an array `a` of individual words.

## `nested`  ( `i`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ) {#nested}

Puts an item in its own array.

## `len`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `l`**{.description} ) {#len}

Gets the length of the array or string.

## `pluck`  ( `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `i`**{.description} ``**{.description} `s`**{.description} `e`**{.description} `e`**{.description} `-`**{.description} `a`**{.description} `l`**{.description} `s`**{.description} `o`**{.description} `>`**{.description} ``**{.description} `s`**{.description} `t`**{.description} `u`**{.description} `f`**{.description} `f`**{.description} ) {#pluck}

Pulls the `i`-th item out of the array `a` and returns the shortened array and the item.

## `stuff`  ( `a`**{.description} ``**{.description} `i`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ) {#stuff}

Reverse of [`pluck`](#pluck), it puts the item back.

## `behead`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} `i`**{.description} ) {#behead}

Returns the first item of the array `a`, and the rest. the original array is not mutated.

## `join`  ( `a`**{.description} ``**{.description} `b`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} `b`**{.description} ) {#join}

Joins two arrays or strings, selecting between [`++`](#++) and `concat` depending on the type of the arguments.

## `of`  ( `x`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ``**{.description} ) {#of}

Makes an array with `n` `x`'s in it.

## `reverse`  ( `a`**{.description} `r`**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `r`**{.description} `r`**{.description} `a`**{.description} ``**{.description} ) {#reverse}

Reverses the array.

## `reverse$`  ( `x`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} ``**{.description} ) {#reverse$}

[`reverse`](#reverse) but for strings.

## `reflect`  ( `x`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} ``**{.description} ) {#reflect}

[`reverse`](#reverse) but digs down into sub-arrays and reflects them too.

## `makewith`  ( `c`**{.description} ``**{.description} &rarr; ``**{.description} `l`**{.description} ``**{.description} ) {#makewith}


places the code in a loop and returns the generated code.

the returned code takes an array or string on the stack and calls the original code passed 
to `makewith` with each item of the array or string.

## `witheach` *`block`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} ) {#witheach}

Takes an array or string and runs `block` for each item in it.

## `fold`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#fold}


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

## `foldr`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#foldr}

Same as [`fold`](#fold) but applies the operation in reverse order.

## `map`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#map}

Passes each item of array `a` through function `r` and concatentates the returned values.

## `filter`  ( `a`**{.description} ``**{.description} `r`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#filter}

Passes each item of array `a` through function `r` and returns the items for which `r` returns true.

## `split`  ( `a`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} ``**{.description} `y`**{.description} ) {#split}

Splits the array between the `n`-th and `n`+1-th items and returns the parts, second half on top.

## `matchitem`  ( `a`*array to search*{.description} ``**{.description} `f`*criteria function to test if item matches*{.description} ``**{.description} `c`*cleanup function to clean the stack*{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} ) {#matchitem}

Uses the provided functions to find an item. returns the index of the first found item.

## `find`  ( `a`**{.description} ``**{.description} `x`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} ) {#find}

Finds the first index where item `x` occurs in the array `a`.

## `findwith` *`criteria`*{.shadowed} *`cleanup`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `i`**{.description} ) {#findwith}

Same as [`matchitem`](#matchitem) but uses lookahead for `cleanup` and `criteria`.

## `found?`  ( `a`**{.description} ``**{.description} `i`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#found?}

True if `i` is `a` valid index into array `a`.

```phoo

to has-foo? [ dup $ "foo" find found? ]
```

## `lower`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#lower}

Turns a string lowercase.

## `upper`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#upper}

Turns a string uppercase.

## `++`  ( `s`**{.description} `1`**{.description} ``**{.description} `s`**{.description} `2`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} `1`**{.description} `s`**{.description} `2`**{.description} ) {#++}

Concatenates 2 items after casting both to string type.

## `num>$`  ( `x`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#num>$}

Writes number `x` in base n.

## `$>num`  ( `s`**{.description} ``**{.description} `n`**{.description} ``**{.description} &rarr; ``**{.description} `x`**{.description} ) {#$>num}

Parses string `s` as a number in base `n`.

## `big`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `b`**{.description} ) {#big}

Turns number `n` into a `bigint`.

## `sortwith` *`comp`*{.shadowed} ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#sortwith}

Using comparator `comp`, sorts the array. does not mutate the array.

## `sort`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#sort}

Sort an array of numbers.

## `sort$`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#sort$}

Sort an array of strings.

## `try` *`block`*{.shadowed} *`except`*{.shadowed} (  &rarr;  ) {#try}

Runs `block`, and if it threw an error, runs `except` with the error on the stack. if `block` ran fine, skips `except`.

## `nestdepth`  (  &rarr; ``**{.description} `n`**{.description} ) {#nestdepth}

Puts the current recursion depth on the stack.

## `stacksize`  (  &rarr; ``**{.description} `n`**{.description} ) {#stacksize}

Puts the number of items on the stack, on the stack.

## `to-do`  (  &rarr; ``**{.description} `a`**{.description} ) {#to-do}

To-do is `a` general purpose ancillary [`stack`](#stack).

## `new-do`  ( `a`**{.description} ``**{.description} &rarr;  ) {#new-do}

Initializes the [`stack`](#stack) `a` as `a` to-do stack by putting [`done`](#done) on it.

## `add-to`  ( `x`**{.description} `x`**{.description} `x`**{.description} `*`**{.description} ``**{.description} `c`**{.description} ``**{.description} `n`**{.description} ``**{.description} `a`**{.description} ``**{.description} &rarr;  ) {#add-to}

Puts the action `c` and its arguments `xxx*` (the number of which is `n`) on the to-do stack `a`.

## `now-do`  ( `a`**{.description} ``**{.description} &rarr;  ) {#now-do}

Runs all the queued items on the to-do stack, until it hits the [`done`](#done) put there by [`new-to`](#new-to).

## `do-now`  ( `a`**{.description} ``**{.description} &rarr;  ) {#do-now}

Same as [`now-do`](#now-do) but does the items in reverse order.

## `not-do`  ( `a`**{.description} ``**{.description} &rarr;  ) {#not-do}

Removes all the queued items from the to-do stack `a` without running them.

## `chr`  ( `n`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#chr}

Returns the character with the unicode code point `n`.

## `ord`  ( `s`**{.description} ``**{.description} &rarr; ``**{.description} `n`**{.description} ) {#ord}

Reverse of [`chr`](#chr), it gets the code point of the character.

## `isa?`  ( `a`**{.description} ``**{.description} `s`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#isa?}

True if item `a`'`s` [`type`](#type) is the same as `s`.

## `isoneof`  ( `a`**{.description} ``**{.description} `s`**{.description} `s`**{.description} ``**{.description} &rarr; ``**{.description} `t`**{.description} ) {#isoneof}

Same as [`isa?`](#isa?) but accepts an array of types, which will succeed if any of them is the [`type`](#type) of `a`.

## `stringify`  ( `a`**{.description} ``**{.description} &rarr; ``**{.description} `s`**{.description} ) {#stringify}

Converts `a` to `a` string.

## `arrayify`  ( `x`**{.description} ``**{.description} &rarr; ``**{.description} `a`**{.description} ) {#arrayify}

Converts `a` to an array.

## `phoo`  ( `c`**{.description} ``**{.description} &rarr;  ) {#phoo}

Compile and run the code.

## `new@`  ( `f`**{.description} ``**{.description} &rarr; ``**{.description} `o`**{.description} ) {#new@}

Constructs the function `f` by calling it with no arguments.

## `call@`  ( `f`**{.description} ``**{.description} &rarr; ``**{.description} `r`**{.description} ) {#call@}

Calls the function `f` with no arguments.

## `!!todo!!`  (  &rarr;  ) {#!!todo!!}

Throws `'todo'`.

## `use` *`path/to/module`*{.shadowed} (  &rarr;  ) {#use}

Imports the module, skipping if it was already imported.

## `reuse` *`path/to/module`*{.shadowed} (  &rarr;  ) {#reuse}

Imports the module, force-reloading it even if it is already loaded.

## `dir`  (  &rarr; ``**{.description} `a`**{.description} ) {#dir}

Returns `a` list of the names of all the available words in this scope.