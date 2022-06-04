

## `#pragma` *`flag`*{.shadowed} *`value`*{.shadowed} (  &rarr;  ) {#%23pragma}

Sets the settings `flag` specified.

Example:

```phoo

#pragma strictMode false
```

## `in_scope` *`block`*{.shadowed} (  &rarr;  ) {#in%5fscope}

Runs the code with a new entry on the scope stack.

## `noop`  (  &rarr;  ) {#noop}

No-op.

## `alias` *`x`*{.shadowed} *`y`*{.shadowed} (  &rarr;  ) {#alias}

Aliases `x` to mean `y`.

## `const`  (  &rarr; `v` ) {#const}

Precomputes a value.

## `now!`  (  &rarr;  ) {#now%21}

Runs code during compilation. *(#6 - doesn't work)*.

## `//`  (  &rarr;  ) {#%2f%2f}

Line comment *(#6 - doesn't work)*.

## `dup`  ( `a` &rarr; `a` `a` ) {#dup}

Duplicates top item.

## `over`  ( `b` `a` &rarr; `b` `a` `b` ) {#over}

Copies second item to top.

## `swap`  ( `b` `a` &rarr; `a` `b` ) {#swap}

Swaps top two.

## `rot`  ( `a` `b` `c` &rarr; `b` `c` `a` ) {#rot}

Pulls third to top.

## `unrot`  ( `a` `b` `c` &rarr; `c` `a` `b` ) {#unrot}

Pushes top down to third.

## `nip`  ( `a` `b` &rarr; `b` ) {#nip}

Removes second stack item.

## `tuck`  ( `a` `b` &rarr; `b` `a` `b` ) {#tuck}

Copies first item to third.

## `2dup`  ( `a` `b` &rarr; `a` `b` `a` `b` ) {#2dup}

[`dup`](#dup)s two items as `a` pair.

## `2drop`  ( `a` `b` &rarr;  ) {#2drop}

[`drop`](#drop)s two items as `a` pair.

## `2swap`  ( `a` `b` `c` `d` &rarr; `c` `d` `a` `b` ) {#2swap}

[`swap`](#swap)s two pairs of items.

## `2over`  ( `a` `b` `c` `d` &rarr; `a` `b` `c` `d` `a` `b` ) {#2over}

[`over`](#over)s two pairs of items.

## `pack`  ( `*a` `n` &rarr; `a` ) {#pack}

Takes `n` and then puts `n` items into an array.

## `unpack`  ( `a` &rarr; `i` `j` `k` `...` ) {#unpack}

Reverse of [`pack`](#pack), it flattens an array onto the stack.

## `dip` *`op`*{.shadowed} ( `a` &rarr; `a` ) {#dip}

Dips the top item out of the array, runs the block, and puts the item back.

## `abs`  ( `n` &rarr; `|n|` ) {#abs}

Absolute value of a number.

## `-`  ( `a` `b` &rarr; `a-b` ) {#%2d}

Subtracts top from second.

## `/~`  ( `a` `b` &rarr; `floor(a/b)` ) {#%2f%7e}

Flooring division.

## `mod`  ( `a` `b` &rarr; `a%b` ) {#mod}

Modulo.

## `!=`  ( `a` `b` &rarr; `t` ) {#%21%3d}

Not equals.

## `<=`  ( `a` `b` &rarr; `a<=b` ) {#%3c%3d}

Less than or equal to.

## `<`  ( `a` `b` &rarr; `a<b` ) {#%3c}

Less than.

## `>=`  ( `a` `b` &rarr; `a>=b` ) {#%3e%3d}

Greater than or equal to.

## `min`  ( `a` `b` &rarr; `v` ) {#min}

Lesser of two value.

## `max`  ( `a` `b` &rarr; `v` ) {#max}

Larger of two value.

## `clamp`  ( `l` `u` `x` &rarr; `v` ) {#clamp}

Clamps `x` to $l\gte x\gt `u`$.

## `within`  ( `l` `u` `x` &rarr; `t` ) {#within}

True if $l\gte x\gt `u`$.

## `$<`  ( `s1` `s2` &rarr; `s1<s2` ) {#%24%3c}

True if `s1` comes before `s2` in the dictionary.

## `$>`  ( `s1` `s2` &rarr; `s1>s2` ) {#%24%3e}

True if `s1` comes after `s2` in the dictionary.

## `not`  ( `t` &rarr; `t` ) {#not}

Boolean inverse.

## `and`  ( `t` `t` &rarr; `t` ) {#and}

Boolean and.

## `or`  ( `t` `t` &rarr; `t` ) {#or}

Boolean or.

## `xor`  ( `t` `t` &rarr; `t` ) {#xor}

Boolean xor.

## `>>`  ( `a` `n` &rarr; `b` ) {#%3e%3e}

Shift `a` right by `n` places.

## `bit`  ( `n` &rarr; `b` ) {#bit}

$2^`n`$.

## `var` *`name`*{.shadowed} (  &rarr;  ) {#var}

Declares a new variable, initialized to `undefined`.

## `var,` *`name`*{.shadowed} ( `v` &rarr;  ) {#var%2c}

Declares a new variable, initialized to top stack value.

## `is` *`name`*{.shadowed} ( `v` &rarr;  ) {#is}

Puts a value into a variable.

## `stack`  (  &rarr; `a` ) {#stack}

Placed at the start of a word, makes the word an ancillary stack.

## `release`  ( `a` &rarr;  ) {#release}

Removes the first item from an array and discards it. Mutates the array.

## `copy`  ( `a` &rarr; `i` ) {#copy}

Copies the last item of the array `a` onto the stack.

## `replace`  ( `i` `a` &rarr;  ) {#replace}

Replaces the last item on the array `a` with i.

## `replace`  ( `a` `b` &rarr;  ) {#replace}

Moves the last item from the array `b` to the array `a`.

## `tally`  ( `n` `a` &rarr;  ) {#tally}

Adds `n` to the last item of the array `a`.

## `temp`  (  &rarr; `a` ) {#temp}

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

## `if`  ( `t` &rarr;  ) {#if}

If the top of stack is false, skips the next item.

Example:

```phoo

[ foo bar if baz ]
// if bar returns false, baz will be skipped
```

## `iff`  ( `t` &rarr;  ) {#iff}

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

## `until`  ( `t` &rarr;  ) {#until}

If the top of stack is false, jumps back to the start of the array.

Example:

```phoo

[ foo bar baz until ]
// repeats foo bar baz until baz returns true.
```

## `while`  ( `t` &rarr;  ) {#while}

If the top of stack is false, jumps to the end of the array.

Example:

```phoo

[ foo while baz again ]
// runs foo at least once, then repeats bar foo until foo returns false
```

## `switch`  ( `v` &rarr;  ) {#switch}

Begins a switch staement: puts the value to be switched upon in a temporary stack (not [`temp`](#temp)).

 **See Also:** [`case`](#case), [`default`](#default)

## `default`  ( `v` &rarr;  ) {#default}

Ends a switch staement: empties the switch value from the stack it is stored on.

 **See Also:** [`switch`](#switch), [`case`](#case)

## `case` *`action`*{.shadowed} ( `v` &rarr;  ) {#case}

If the value on the stack is not the switch value, skips `action`. If it is, runs `action` and then jumps to the end of the array (skipping the other cases and the [`default`](#default)).

 **See Also:** [`switch`](#switch), [`default`](#default)

## `'` *`value`*{.shadowed} (  &rarr; `v` ) {#%27}

Puts the `value` following it on the stack instead of running it.

Example:

```phoo

[ 1 2 3 ] // results in 3 items on the stack
' [ 1 2 3 ] // results in 1 item, the array [1, 2, 3]
```

## `run`  ( `c` &rarr;  ) {#run}

Runs the item on the stack as code.

## `this`  (  &rarr; `a` ) {#this}

Puts `a` reference to the current array on the stack.

## `table`  ( `n` &rarr; `i` ) {#table}

Placed at the start of a word, turns it into a lookup table. Takes the `n`-th item after the `table` and puts it on the stack, and then skips everything after it.

## `recurse`  (  &rarr;  ) {#recurse}

Causes the current array to run itself again.

## `times` *`block`*{.shadowed} ( `n` &rarr;  ) {#times}

Runs body the specified numbe of times.

## `i`  (  &rarr; `n` ) {#i}

Inside of a [`times`](#times) loop, gets the number of iterations left to do after this one.

## `i^`  (  &rarr; `n` ) {#i%5e}

Inside of a [`times`](#times) loop, gets the number of iterations done since the loop started.

## `j`  (  &rarr; `n` ) {#j}

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations left to do in the **outer** loop after this one.

## `j^`  (  &rarr; `n` ) {#j%5e}

Inside of a doubly nested [`times`](#times) loop, gets the number of iterations done by the **outer** loop since the loop started.

## `step`  ( `n` &rarr;  ) {#step}

Adds `n` to the current [`times`](#times) loop's iteration counter.

## `restart`  (  &rarr;  ) {#restart}

Sets the current [`times`](#times) loop's iteration counter to the original value it started at, restarting the loop.

## `break`  (  &rarr;  ) {#break}

Sets the current [`times`](#times) loop's iteration counter to 0, causing the loop to end after this iteration is done.

## `printable`  ( `c` &rarr; `t` ) {#printable}

Given a character `c`, treurns true or false whether it is in the printable region of ASCII (i.e. greater than 31).

## `trim`  ( `s` &rarr; `t` ) {#trim}

Trims the leading whitespace from a string.

## `nextword`  ( `s`*string*{.description} &rarr; `r`*remainder of string*{.description} `w`*first word*{.description} ) {#nextword}

Given a string that does not start with whitespace, returns the first word and the rest of the string.

## `split$`  ( `s` &rarr; `a` ) {#split%24}

Splits `a` string `s` into an array `a` of individual words.

## `nested`  ( `i` &rarr; `a` ) {#nested}

Puts an item in its own array.

## `len`  ( `a` &rarr; `l` ) {#len}

Gets the length of the array or string.

## `pluck`  ( `a` `n` &rarr; `a` `i` ) {#pluck}

Pulls the `n`-th item out of the array `a` and returns the shortened array and the item `i`.

 **See Also:** [`stuff`](#stuff)

## `stuff`  ( `a` `i` `n` &rarr; `a` ) {#stuff}

Reverse of [`pluck`](#pluck), it puts the item back.

## `behead`  ( `a` &rarr; `a` `i` ) {#behead}

Returns the first item of the array `a`, and the rest. The original array is not mutated.

## `join`  ( `a` `b` &rarr; `ab` ) {#join}

Joins two arrays or strings, selecting between [`++`](#%2b%2b) and `concat` depending on the type of the arguments.

## `of`  ( `x` `n` &rarr; `a` ) {#of}

Makes an array with `n` `x`'s in it.

## `reverse`  ( `arr` &rarr; `rra` ) {#reverse}

Reverses the array.

## `reverse$`  ( `x` &rarr; `x` ) {#reverse%24}

[`reverse`](#reverse) but for strings.

## `reflect`  ( `x` &rarr; `x` ) {#reflect}

[`reverse`](#reverse) but digs down into sub-arrays and reflects them too.

## `makewith`  ( `c` &rarr; `l` ) {#makewith}

Places the code in a loop and returns the generated code.

The returned code takes an array or string on the stack and calls the original code passed 
to `makewith` with each item of the array or string.

## `witheach` *`block`*{.shadowed} ( `a` &rarr;  ) {#witheach}

Takes an array or string and runs `block` for each item in it.

## `fold`  ( `a` `r` &rarr; `s` ) {#fold}

Takes `a` function and an array and reduces the array by calling the function with pairs of the items from the array:

    ' [ 1   2   3   4   5   6   7   8   9   0 ] ' k fold
        |   |   |   |   |   |   |   |   |   |
        '>k<'   |   |   |   |   |   |   |   |
          '-->k<'   |   |   |   |   |   |   |
              '-->k<'   |   |   |   |   |   |
                  '-->k<'   |   |   |   |   |
                      '-->k<'   |   |   |   |
                          '-->k<'   |   |   |
                              '-->k<'   |   |
                                  '-->k<'   |
                                      '-->k<'
                                          |
                                          result.

## `foldr`  ( `a` `r` &rarr; `s` ) {#foldr}

Same as [`fold`](#fold) but applies the operation in reverse order.

## `map`  ( `a` `r` &rarr; `s` ) {#map}

Passes each item of array `a` through function `r` and concatentates the returned values.

## `filter`  ( `a` `r` &rarr; `s` ) {#filter}

Passes each item of array `a` through function `r` and returns the items for which `r` returns true.

## `split`  ( `a` `n` &rarr; `x` `y` ) {#split}

Splits the array between the `n`-th and `n`+1-th items and returns the parts, second half on top.

## `matchitem`  ( `a`*array to search*{.description} `f`*criteria function to test if item matches*{.description} `c`*cleanup function to clean the stack*{.description} &rarr; `i` ) {#matchitem}

Uses the provided functions to find an item. returns the index of the first found item.

## `find`  ( `a` `x` &rarr; `i` ) {#find}

Finds the first index where item `x` occurs in the array `a`.

## `findwith` *`criteria`*{.shadowed} *`cleanup`*{.shadowed} ( `a` &rarr; `i` ) {#findwith}

Same as [`matchitem`](#matchitem) but uses lookahead for `cleanup` and `criteria`.

## `found?`  ( `a` `i` &rarr; `t` ) {#found%3f}

True if `i` is `a` valid index into array `a`.

Example:

```phoo

to has-foo? [ dup $ "foo" find found? ]
```

## `lower`  ( `s` &rarr; `s` ) {#lower}

Turns a string lowercase.

## `upper`  ( `s` &rarr; `s` ) {#upper}

Turns a string uppercase.

## `++`  ( `s1` `s2` &rarr; `s1s2` ) {#%2b%2b}

Concatenates 2 items after casting both to string type.

## `num>$`  ( `x` `n` &rarr; `s` ) {#num%3e%24}

Writes number `x` in base n.

## `$>num`  ( `s` `n` &rarr; `x` ) {#%24%3enum}

Parses string `s` as a number in base `n`.

## `big`  ( `n` &rarr; `b` ) {#big}

Turns number `n` into a `BigInt`.

## `sortwith` *`comp`*{.shadowed} ( `a` &rarr; `s` ) {#sortwith}

Using comparator `comp`, sorts the array. Does not mutate the array.

## `sort`  ( `a` &rarr; `s` ) {#sort}

Sort an array of numbers.

## `sort$`  ( `a` &rarr; `s` ) {#sort%24}

Sort an array of strings.

## `try` *`block`*{.shadowed} *`except`*{.shadowed} (  &rarr;  ) {#try}

Runs `block`, and if it threw an error, runs `except` with the error on the stack. If `block` ran fine, skips `except`.

## `nestdepth`  (  &rarr; `n` ) {#nestdepth}

Puts the current recursion depth on the stack.

## `stacksize`  (  &rarr; `n` ) {#stacksize}

Puts the number of items on the stack, on the stack.

## `to-do`  (  &rarr; `a` ) {#to%2ddo}

To-do is `a` general purpose ancillary [`stack`](#stack).

## `new-do`  ( `a` &rarr;  ) {#new%2ddo}

Initializes the [`stack`](#stack) `a` as `a` to-do stack by putting [`done`](#done) on it.

## `add-to`  ( `xxx*` `c` `n` `a` &rarr;  ) {#add%2dto}

Puts the action `c` and its arguments `xxx*` (the number of which is `n`) on the to-do stack `a`.

## `now-do`  ( `a` &rarr;  ) {#now%2ddo}

Runs all the queued items on the to-do stack, until it hits the [`done`](#done) put there by [`new-to`](#new%2dto).

## `do-now`  ( `a` &rarr;  ) {#do%2dnow}

Same as [`now-do`](#now%2ddo) but does the items in reverse order.

## `not-do`  ( `a` &rarr;  ) {#not%2ddo}

Removes all the queued items from the to-do stack `a` without running them.

## `chr`  ( `n` &rarr; `s` ) {#chr}

Returns the character with the Unicode code point `n`.

## `ord`  ( `s` &rarr; `n` ) {#ord}

Reverse of [`chr`](#chr), it gets the code point of the character.

## `isa?`  ( `a` `s` &rarr; `t` ) {#isa%3f}

True if item `a`'`s` [`type`](#type) is the same as `s`.

## `isoneof`  ( `a` `ss` &rarr; `t` ) {#isoneof}

Same as [`isa?`](#isa%3f) but accepts an array of types, which will succeed if any of them is the [`type`](#type) of `a`.

## `stringify`  ( `a` &rarr; `s` ) {#stringify}

Converts `a` to a string.

## `arrayify`  ( `x` &rarr; `a` ) {#arrayify}

Converts `a` to an array.

## `phoo`  ( `c` &rarr;  ) {#phoo}

Compile and run the code.

## `new@`  ( `f` &rarr; `o` ) {#new%40}

Constructs the function `f` by calling it with no arguments.

## `call@`  ( `f` &rarr; `r` ) {#call%40}

Calls the function `f` with no arguments.

## `!!todo!!`  (  &rarr;  ) {#%21%21todo%21%21}

Throws `'todo'`.

## `use` *`path/to/module`*{.shadowed} (  &rarr;  ) {#use}

Imports the module, skipping if it was already imported.

## `reuse` *`path/to/module`*{.shadowed} (  &rarr;  ) {#reuse}

Imports the module, force-reloading it even if it is already loaded.

## `dir`  (  &rarr; `a` ) {#dir}

Returns a list of the names of all the available words in this scope.