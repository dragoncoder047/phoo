

## `#pragma` *`flag`*{.shadowed} *`value`*{.shadowed} (  &rarr;  ) {##pragma}

Sets the settings `flag` specified.

Example:

```phoo

#pragma strictMode false
```

## `in_scope` *`block`*{.shadowed} (  &rarr;  ) {#in_scope}

Runs the code with a new entry on the scope stack.

## `noop`  (  &rarr;  ) {#noop}

No-op.

## `alias` *`x`*{.shadowed} *`y`*{.shadowed} (  &rarr;  ) {#alias}

Aliases `x` to mean `y`.

## `const`  (  &rarr; `v`**{.description} ) {#const}

Precomputes a value.

## `now!`  (  &rarr;  ) {#now!}

Runs code during compilation. *(#6 - doesn't work)*.

## `//`  (  &rarr;  ) {#//}

Line comment *(#6 - doesn't work)*.

## `dup`  ( `a`**{.description} &rarr; `a`**{.description} `a`**{.description} ) {#dup}

Duplicates top item.

## `over`  ( `b`**{.description} `a`**{.description} &rarr; `b`**{.description} `a`**{.description} `b`**{.description} ) {#over}

Copies second item to top.

## `swap`  ( `b`**{.description} `a`**{.description} &rarr; `a`**{.description} `b`**{.description} ) {#swap}

Swaps top two.

## `rot`  ( `a`**{.description} `b`**{.description} `c`**{.description} &rarr; `b`**{.description} `c`**{.description} `a`**{.description} ) {#rot}

Pulls third to top.

## `unrot`  ( `a`**{.description} `b`**{.description} `c`**{.description} &rarr; `c`**{.description} `a`**{.description} `b`**{.description} ) {#unrot}

Pushes top down to third.

## `nip`  ( `a`**{.description} `b`**{.description} &rarr; `b`**{.description} ) {#nip}

Removes second stack item.

## `tuck`  ( `a`**{.description} `b`**{.description} &rarr; `b`**{.description} `a`**{.description} `b`**{.description} ) {#tuck}

Copies first item to third.

## `2dup`  ( `a`**{.description} `b`**{.description} &rarr; `a`**{.description} `b`**{.description} `a`**{.description} `b`**{.description} ) {#2dup}

[`dup`](#dup)s two items as `a` pair.

## `2drop`  ( `a`**{.description} `b`**{.description} &rarr;  ) {#2drop}

[`drop`](#drop)s two items as `a` pair.

## `2swap`  ( `a`**{.description} `b`**{.description} `c`**{.description} `d`**{.description} &rarr; `c`**{.description} `d`**{.description} `a`**{.description} `b`**{.description} ) {#2swap}

[`swap`](#swap)s two pairs of items.

## `2over`  ( `a`**{.description} `b`**{.description} `c`**{.description} `d`**{.description} &rarr; `a`**{.description} `b`**{.description} `c`**{.description} `d`**{.description} `a`**{.description} `b`**{.description} ) {#2over}

[`over`](#over)s two pairs of items.

## `pack`  ( `*a`**{.description} `n`**{.description} &rarr; `a`**{.description} ) {#pack}

Takes `n` and then puts `n` items into an array.

## `unpack`  ( `a`**{.description} &rarr; `i`**{.description} `j`**{.description} `k`**{.description} `...`**{.description} ) {#unpack}

Reverse of [`pack`](#pack), it flattens an array onto the stack.

## `dip` *`op`*{.shadowed} ( `a`**{.description} &rarr; `a`**{.description} ) {#dip}

Dips the top item out of the array, runs the block, and puts the item back.

## `abs`  ( `n`**{.description} &rarr; `|n|`**{.description} ) {#abs}

Absolute value of a number.

## `-`  ( `a`**{.description} `b`**{.description} &rarr; `a-b`**{.description} ) {#-}

Subtracts top from second.

## `/~`  ( `a`**{.description} `b`**{.description} &rarr; `floor(a/b)`**{.description} ) {#/~}

Flooring division.

## `mod`  ( `a`**{.description} `b`**{.description} &rarr; `a%b`**{.description} ) {#mod}

Modulo.

## `!=`  ( `a`**{.description} `b`**{.description} &rarr; `t`**{.description} ) {#!=}

Not equals.

## `<=`  ( `a`**{.description} `b`**{.description} &rarr; `a<=b`**{.description} ) {#<=}

Less than or equal to.

## `<`  ( `a`**{.description} `b`**{.description} &rarr; `a<b`**{.description} ) {#<}

Less than.

## `>=`  ( `a`**{.description} `b`**{.description} &rarr; `a>=b`**{.description} ) {#>=}

Greater than or equal to.

## `min`  ( `a`**{.description} `b`**{.description} &rarr; `v`**{.description} ) {#min}

Lesser of two value.

## `max`  ( `a`**{.description} `b`**{.description} &rarr; `v`**{.description} ) {#max}

Larger of two value.

## `clamp`  ( `l`**{.description} `u`**{.description} `x`**{.description} &rarr; `v`**{.description} ) {#clamp}

Clamps `x` to $l\gte x\gt `u`$.

## `within`  ( `l`**{.description} `u`**{.description} `x`**{.description} &rarr; `t`**{.description} ) {#within}

True if $l\gte x\gt `u`$.

## `$<`  ( `s1`**{.description} `s2`**{.description} &rarr; `s1<s2`**{.description} ) {#$<}

True if `s1` comes before `s2` in the dictionary.

## `$>`  ( `s1`**{.description} `s2`**{.description} &rarr; `s1>s2`**{.description} ) {#$>}

True if `s1` comes after `s2` in the dictionary.

## `not`  ( `t`**{.description} &rarr; `t`**{.description} ) {#not}

Boolean inverse.

## `and`  ( `t`**{.description} `t`**{.description} &rarr; `t`**{.description} ) {#and}

Boolean and.

## `or`  ( `t`**{.description} `t`**{.description} &rarr; `t`**{.description} ) {#or}

Boolean or.

## `xor`  ( `t`**{.description} `t`**{.description} &rarr; `t`**{.description} ) {#xor}

Boolean xor.

## `>>`  ( `a`**{.description} `n`**{.description} &rarr; `b`**{.description} ) {#>>}

Shift `a` right by `n` places.

## `bit`  ( `n`**{.description} &rarr; `b`**{.description} ) {#bit}

$2^`n`$.

## `var` *`name`*{.shadowed} (  &rarr;  ) {#var}

Declares a new variable, initialized to `undefined`.

## `var,` *`name`*{.shadowed} ( `v`**{.description} &rarr;  ) {#var,}

Declares a new variable, initialized to top stack value.

## `is` *`name`*{.shadowed} ( `v`**{.description} &rarr;  ) {#is}

Puts a value into a variable.

## `stack`  (  &rarr; `a`**{.description} ) {#stack}

Placed at the start of `a` word, makes the word an ancillary stack.

## `release`  ( `a`**{.description} &rarr;  ) {#release}

Removes the first item from an array and discards it. mutates the array.

## `copy`  ( `a`**{.description} &rarr; `i`**{.description} ) {#copy}

Copies the last item of the array `a` onto the stack.

## `replace`  ( `i`**{.description} `a`**{.description} &rarr;  ) {#replace}

Replaces the last item on the array `a` with i.

## `replace`  ( `a`**{.description} `b`**{.description} &rarr;  ) {#replace}

Moves the last item from the array `b` to the array `a`.

## `tally`  ( `n`**{.description} `a`**{.description} &rarr;  ) {#tally}

Adds `n` to the last item of the array `a`.

## `temp`  (  &rarr; `a`**{.description} ) {#temp}

Temp is `a` general purpose ancillary [`stack`](#stack).

## `done`  (  &rarr;  ) {#done}

Jumps immediately to the end of the array.

Example:

```phoo

[ foo bar done baz ]
// foo bar will run, baz will not
```

## `again`  (  &rarr;  ) {#again}

Jumps immediately to the start of the array.

Example:

```phoo

[ foo bar again baz ]
// foo bar will run infinitely
```

## `if`  ( `t`**{.description} &rarr;  ) {#if}

If the top of stack is false, skips the next item.

Example:

```phoo

[ foo bar if baz ]
// if bar returns false, baz will be skipped
```

## `iff`  ( `t`**{.description} &rarr;  ) {#iff}

If the top of stack is false, skips the next two items.

Example:

```phoo

[ foo iff bar baz ]
// if foo returns false, bar baz will be skipped
```

## `else`  (  &rarr;  ) {#else}

Unconditionally skips the next item.

Example:

```phoo

[ foo else bar baz ]
// bar will not run.
```

## `until`  ( `t`**{.description} &rarr;  ) {#until}

If the top of stack is false, jumps back to the start of the array.

Example:

```phoo

[ foo bar baz until ]
// repeats foo bar baz until baz returns true.
```

## `while`  ( `t`**{.description} &rarr;  ) {#while}

If the top of stack is false, jumps to the end of the array.

Example:

```phoo

[ foo while baz again ]
// runs foo at least once, then repeats bar foo until foo returns false
```

## `switch`  ( `v`**{.description} &rarr; `see-also>`**{.description} `case`**{.description} `default`**{.description} ) {#switch}

Begins a switch staement: puts the value to be switched upon in a temporary stack (not [`temp`](#temp)).

## `default`  ( `v`**{.description} &rarr; `see-also>`**{.description} `switch`**{.description} `case`**{.description} ) {#default}

Ends a `switch` staement: empties the `switch` value from the stack it is stored on.

## `case` *`action`*{.shadowed} ( `v`**{.description} &rarr; `see-also>`**{.description} `switch`**{.description} `default`**{.description} ) {#case}

If the value on the stack is not the `switch` value, skips `action`. if it is, runs `action` and then jumps to the end of the array (skipping the other cases and the [`default`](#default)).

## `'` *`value`*{.shadowed} (  &rarr; `v`**{.description} ) {#'}

Puts the `value` following it on the stack instead of running it.

Example:

```phoo

[ 1 2 3 ] // results in 3 items on the stack
' [ 1 2 3 ] // results in 1 item, the array [1, 2, 3]
```

## `run`  ( `c`**{.description} &rarr;  ) {#run}

Runs the item on the stack as code.

## `this`  (  &rarr; `a`**{.description} ) {#this}

Puts `a` reference to the current array on the stack.

## `table`  ( `n`**{.description} &rarr; `i`**{.description} ) {#table}

Placed at the start of a word, turns it into a lookup table. takes the `n`-th item after the `table` and puts it on the stack, and then skips everything after it.

## `recurse`  (  &rarr;  ) {#recurse}

Causes the current array to run itself again.

## `times` *`block`*{.shadowed} ( `n`**{.description} &rarr;  ) {#times}

Runs body the specified numbe of times.

## `i`  (  &rarr; `n`**{.description} ) {#i}

Inside of a [`times`](#times) loop, gets the number of iterations left to do after this one.

## `i^`  (  &rarr; `n`**{.description} ) {#i^}

Inside of a [`times`](#times) loop, gets the number of iterations done since the loop started.

## `j`  (  &rarr; `n`**{.description} ) {#j}

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations left to do in the **outer** loop after this one.

## `j^`  (  &rarr; `n`**{.description} ) {#j^}

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations done by the **outer** loop since the loop started.

## `step`  ( `n`**{.description} &rarr;  ) {#step}

Adds `n` to the current [`times`](#times) loop's iteration counter.

## `restart`  (  &rarr;  ) {#restart}

Sets the current [`times`](#times) loop's iteration counter to the original value it started at, restarting the loop.

## `break`  (  &rarr;  ) {#break}

Sets the current [`times`](#times) loop's iteration counter to 0, causing the loop to end after this iteration is done.

## `printable`  ( `c`**{.description} &rarr; `t`**{.description} ) {#printable}

Given a character `c`, treurns true or false whether it is in the printable region of ascii (i.e. greater than 31).

## `trim`  ( `s`**{.description} &rarr; `t`**{.description} ) {#trim}

Trims the leading whitespace from a string.

## `nextword`  ( `s`*string*{.description} &rarr; `r`*remainder of string*{.description} `w`*first word*{.description} ) {#nextword}

Given a string that does not start with whitespace, returns the first word and the rest of the string.

## `split$`  ( `s`**{.description} &rarr; `a`**{.description} ) {#split$}

Splits `a` string `s` into an array `a` of individual words.

## `nested`  ( `i`**{.description} &rarr; `a`**{.description} ) {#nested}

Puts an item in its own array.

## `len`  ( `a`**{.description} &rarr; `l`**{.description} ) {#len}

Gets the length of the array or string.

## `pluck`  ( `a`**{.description} `n`**{.description} &rarr; `a`**{.description} `i`**{.description} `see-also>`**{.description} `stuff`**{.description} ) {#pluck}

Pulls the `i`-th item out of the array `a` and returns the shortened array and the item.

## `stuff`  ( `a`**{.description} `i`**{.description} `n`**{.description} &rarr; `a`**{.description} ) {#stuff}

Reverse of [`pluck`](#pluck), it puts the item back.

## `behead`  ( `a`**{.description} &rarr; `a`**{.description} `i`**{.description} ) {#behead}

Returns the first item of the array `a`, and the rest. the original array is not mutated.

## `join`  ( `a`**{.description} `b`**{.description} &rarr; `ab`**{.description} ) {#join}

Joins two arrays or strings, selecting between [`++`](#++) and `concat` depending on the type of the arguments.

## `of`  ( `x`**{.description} `n`**{.description} &rarr; `a`**{.description} ) {#of}

Makes an array with `n` `x`'s in it.

## `reverse`  ( `arr`**{.description} &rarr; `rra`**{.description} ) {#reverse}

Reverses the array.

## `reverse$`  ( `x`**{.description} &rarr; `x`**{.description} ) {#reverse$}

[`reverse`](#reverse) but for strings.

## `reflect`  ( `x`**{.description} &rarr; `x`**{.description} ) {#reflect}

[`reverse`](#reverse) but digs down into sub-arrays and reflects them too.

## `makewith`  ( `c`**{.description} &rarr; `l`**{.description} ) {#makewith}

Places the code in a loop and returns the generated code.

the returned code takes an array or string on the stack and calls the original code passed 
to `makewith` with each item of the array or string.

## `witheach` *`block`*{.shadowed} ( `a`**{.description} &rarr;  ) {#witheach}

Takes an array or string and runs `block` for each item in it.

## `fold`  ( `a`**{.description} `r`**{.description} &rarr; `s`**{.description} ) {#fold}

Takes `a` function and an array and reduces the array by calling the function with pairs of the items from the array:

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

## `foldr`  ( `a`**{.description} `r`**{.description} &rarr; `s`**{.description} ) {#foldr}

Same as [`fold`](#fold) but applies the operation in reverse order.

## `map`  ( `a`**{.description} `r`**{.description} &rarr; `s`**{.description} ) {#map}

Passes each item of array `a` through function `r` and concatentates the returned values.

## `filter`  ( `a`**{.description} `r`**{.description} &rarr; `s`**{.description} ) {#filter}

Passes each item of array `a` through function `r` and returns the items for which `r` returns true.

## `split`  ( `a`**{.description} `n`**{.description} &rarr; `x`**{.description} `y`**{.description} ) {#split}

Splits the array between the `n`-th and `n`+1-th items and returns the parts, second half on top.

## `matchitem`  ( `a`*array to search*{.description} `f`*criteria function to test if item matches*{.description} `c`*cleanup function to clean the stack*{.description} &rarr; `i`**{.description} ) {#matchitem}

Uses the provided functions to find an item. returns the index of the first found item.

## `find`  ( `a`**{.description} `x`**{.description} &rarr; `i`**{.description} ) {#find}

Finds the first index where item `x` occurs in the array `a`.

## `findwith` *`criteria`*{.shadowed} *`cleanup`*{.shadowed} ( `a`**{.description} &rarr; `i`**{.description} ) {#findwith}

Same as [`matchitem`](#matchitem) but uses lookahead for `cleanup` and `criteria`.

## `found?`  ( `a`**{.description} `i`**{.description} &rarr; `t`**{.description} ) {#found?}

True if `i` is `a` valid index into array `a`.

Example:

```phoo

to has-foo? [ dup $ "foo" find found? ]
```

## `lower`  ( `s`**{.description} &rarr; `s`**{.description} ) {#lower}

Turns a string lowercase.

## `upper`  ( `s`**{.description} &rarr; `s`**{.description} ) {#upper}

Turns a string uppercase.

## `++`  ( `s1`**{.description} `s2`**{.description} &rarr; `s1s2`**{.description} ) {#++}

Concatenates 2 items after casting both to string type.

## `num>$`  ( `x`**{.description} `n`**{.description} &rarr; `s`**{.description} ) {#num>$}

Writes number `x` in base n.

## `$>num`  ( `s`**{.description} `n`**{.description} &rarr; `x`**{.description} ) {#$>num}

Parses string `s` as a number in base `n`.

## `big`  ( `n`**{.description} &rarr; `b`**{.description} ) {#big}

Turns number `n` into a `bigint`.

## `sortwith` *`comp`*{.shadowed} ( `a`**{.description} &rarr; `s`**{.description} ) {#sortwith}

Using comparator `comp`, sorts the array. does not mutate the array.

## `sort`  ( `a`**{.description} &rarr; `s`**{.description} ) {#sort}

Sort an array of numbers.

## `sort$`  ( `a`**{.description} &rarr; `s`**{.description} ) {#sort$}

Sort an array of strings.

## `try` *`block`*{.shadowed} *`except`*{.shadowed} (  &rarr;  ) {#try}

Runs `block`, and if it threw an error, runs `except` with the error on the stack. if `block` ran fine, skips `except`.

## `nestdepth`  (  &rarr; `n`**{.description} ) {#nestdepth}

Puts the current recursion depth on the stack.

## `stacksize`  (  &rarr; `n`**{.description} ) {#stacksize}

Puts the number of items on the stack, on the stack.

## `to-do`  (  &rarr; `a`**{.description} ) {#to-do}

To-do is `a` general purpose ancillary [`stack`](#stack).

## `new-do`  ( `a`**{.description} &rarr;  ) {#new-do}

Initializes the [`stack`](#stack) `a` as `a` to-do stack by putting [`done`](#done) on it.

## `add-to`  ( `xxx*`**{.description} `c`**{.description} `n`**{.description} `a`**{.description} &rarr;  ) {#add-to}

Puts the action `c` and its arguments `xxx*` (the number of which is `n`) on the to-do stack `a`.

## `now-do`  ( `a`**{.description} &rarr;  ) {#now-do}

Runs all the queued items on the to-do stack, until it hits the [`done`](#done) put there by [`new-to`](#new-to).

## `do-now`  ( `a`**{.description} &rarr;  ) {#do-now}

Same as [`now-do`](#now-do) but does the items in reverse order.

## `not-do`  ( `a`**{.description} &rarr;  ) {#not-do}

Removes all the queued items from the to-do stack `a` without running them.

## `chr`  ( `n`**{.description} &rarr; `s`**{.description} ) {#chr}

Returns the character with the unicode code point `n`.

## `ord`  ( `s`**{.description} &rarr; `n`**{.description} ) {#ord}

Reverse of [`chr`](#chr), it gets the code point of the character.

## `isa?`  ( `a`**{.description} `s`**{.description} &rarr; `t`**{.description} ) {#isa?}

True if item `a`'`s` [`type`](#type) is the same as `s`.

## `isoneof`  ( `a`**{.description} `ss`**{.description} &rarr; `t`**{.description} ) {#isoneof}

Same as [`isa?`](#isa?) but accepts an array of types, which will succeed if any of them is the [`type`](#type) of `a`.

## `stringify`  ( `a`**{.description} &rarr; `s`**{.description} ) {#stringify}

Converts `a` to `a` string.

## `arrayify`  ( `x`**{.description} &rarr; `a`**{.description} ) {#arrayify}

Converts `a` to an array.

## `phoo`  ( `c`**{.description} &rarr;  ) {#phoo}

Compile and run the code.

## `new@`  ( `f`**{.description} &rarr; `o`**{.description} ) {#new@}

Constructs the function `f` by calling it with no arguments.

## `call@`  ( `f`**{.description} &rarr; `r`**{.description} ) {#call@}

Calls the function `f` with no arguments.

## `!!todo!!`  (  &rarr;  ) {#!!todo!!}

Throws `'todo'`.

## `use` *`path/to/module`*{.shadowed} (  &rarr;  ) {#use}

Imports the module, skipping if it was already imported.

## `reuse` *`path/to/module`*{.shadowed} (  &rarr;  ) {#reuse}

Imports the module, force-reloading it even if it is already loaded.

## `dir`  (  &rarr; `a`**{.description} ) {#dir}

Returns `a` list of the names of all the available words in this scope.