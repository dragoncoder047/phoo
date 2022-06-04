/* >>
plain>

This module is contains the words necessary to implement the builtin functionality of Phoo, that are defined in Phoo code.

The words that this module depends upon can be found on the page for [lib_builtins](lib_builtins.html) (note the underscore).
*/

/* 
dependency:
use _builtins
*/

/* >>
word> #pragma
lookahead> flag value
description> sets the settings flag specified.
sed> --
example>
    #pragma strictMode false
*/
to #pragma do
    ]'[ name
    self .phoo .settings
    ]'[ rot swap unrot set
end

to try.prt [ stack [ ] ]

to protect do
    try.prt take
    ]'[ nested concat
    try.prt put
end

/* >>
word> in_scope
lookahead> block
description> runs the code with a new entry on the scope stack.
sed> --
*/
to in_scope do
    self .enterScope@ drop
    ]'[ run
    self .exitScope@ drop
end

/* >>
word> noop
description> a no-op.
sed> --
*/
to noop [ ]

/* >>
word> alias
lookahead> x y
description> aliases x to mean y.
sed> --
*/
to alias to

/* >>
macro> const
description> precomputes a value. *(#6 - doesn't work)*
sed> -- v
*/
macro const do
    dip do
        dup len 0 = iff
            $ 'const: need something before to precompile' die
        dup take run
        nested
        concat
    end
end

/* >>
macro> now!
description> runs code during compilation. *(#6 - doesn't work)*
sed> --
*/
macro now! do
    dip [ dup take run ]
end

/* >>
macro> //
description> line comment *(#6 - doesn't work)*
sed> --
*/
macro // do
    dup $ '' = not while
    behead
    dup [ 10 chr ] const = dip [ [ 13 chr ] const = ] or until
end

/* >>
word> dup
description> duplicates top item
sed> a -- a a
*/
to dup [ 0 pick ]

/* >>
word> over
description> copies second item to top
sed> b a -- b a b
*/
to over [ 1 pick ]

/* >>
word> swap
description> swaps top two
sed> b a -- a b
*/
to swap [ 1 roll ]

/* >>
word> rot
description> pulls third to top
sed> a b c -- b c a
*/
to rot [ 2 roll ]

/* >>
word> unrot
description> pushes top down to third
sed> a b c -- c a b
*/
to unrot [ rot rot ]

/* >>
word> nip
description> removes second stack item
sed> a b -- b
*/
to nip [ swap drop ]

/* >>
word> tuck
description> copies first item to third
sed> a b -- b a b
*/
to tuck [ dup unrot ]

/* >>
word> 2dup
description> [[dup]]s two items as a pair.
sed> a b -- a b a b
*/
to 2dup [ over over ]

/* >>
word> 2drop
description> [[drop]]s two items as a pair.
sed> a b --
*/
to 2drop [ drop drop ]

/* >>
word> 2swap
description> [[swap]]s two pairs of items.
sed> a b c d -- c d a b
*/
to 2swap [ rot dip rot ]

/* >>
word> 2over
description> [[over]]s two pairs of items.
sed> a b c d -- a b c d a b
*/
to 2over [ dip [ dip 2dup ] 2swap ]

/* >>
word> pack
description> takes n and then puts n items into an array.
sed> *a n -- a
*/
to pack do
    [] swap times do
        swap nested concat
    end
    reverse
end

/* >>
word> unpack
description> reverse of [[pack]], it flattens an array onto the stack.
sed> a -- i j k ...
*/
to unpack [ witheach noop ]

to dip.hold [ stack ]

/* >>
word> dip
lookahead> op
description> dips the top item out of the array, runs the block, and puts the item back.
sed> a -- a
*/
to dip [ dip.hold put ]'[ run dip.hold take ]

/* >>
word> abs
description> absolute value of a number.
sed> n -- |n|
*/
to abs [ dup 0 < if negate ]

/* >>
word> -
description> subtracts top from second.
sed> a b -- a-b
*/
to - [ negate + ]

/* >>
word> /~
description> Flooring division.
sed> a b -- floor(a/b)
*/
to /~ [ /mod drop ]

/* >>
word> mod
description> modulo.
sed> a b -- a%b
*/
to mod [ /mod nip ]

/* >>
word> !=
description> not equals.
sed> a b -- t
*/
to != [ = not ]

/* >>
word> <=
description> less than or equal to.
sed> a b -- a<=b
*/
to <= [ 2dup swap > dip = or ]

/* >>
word> <
description> less than.
sed> a b -- a<b
*/
to < [ swap > ]

/* >>
word> >=
description> greater than or equal to.
sed> a b -- a>=b
*/
to >= [ swap <= ]

/* >>
word> min
description> lesser of two value.
sed> a b -- v
*/
to min [ 2dup > if swap drop ]

/* >>
word> max
description> larger of two value.
sed> a b -- v
*/
to max [ 2dup < if swap drop ]

/* >>
word> clamp
description> clamps x to $l\gte x\gt u$.
sed> l u x -- v
*/
to clamp [ rot min max ]

/* >>
word> within
description> true if $l\gte x\gt u$.
sed> l u x -- t
*/
to within [ rot tuck > unrot > not and ]

/* >>
word> $<
description> true if s1 comes before s2 in the dictionary.
sed> s1 s2 -- s1<s2
*/
to $< do
    do
        dup  $ '' = iff
            false done
        over $ '' = iff
            true done
        behead rot behead rot
        2dup = iff do
            2drop swap
        end again
        ord swap ord >
    end
    unrot 2drop
end

/* >>
word> $>
description> true if s1 comes after s2 in the dictionary.
sed> s1 s2 -- s1>s2
*/
to $> [ swap $< ]

/* >>
word> not
description> boolean inverse.
sed> t -- t
*/
to not [ dup nand ]

/* >>
word> and
description> boolean and.
sed> t t -- t
*/
to and [ nand not ]

/* >>
word> or
description> boolean or.
sed> t t -- t
*/
to or [ not swap not nand ]

/* >>
word> xor
description> boolean xor.
sed> t t -- t
*/
to xor [ not swap not != ]

/* >>
word> >>
description> shift a right by n places.
sed> a n -- b
*/
to >> [ negate << ]

/* >>
word> bit
description> $2^n$
sed> n -- b
*/
to bit [ dup $ 'bigint' isa? iff 1n else 1 swap << ]

to immovable [ ]

/* >>
word> var
lookahead> name
description> declares a new variable, initialized to `undefined`.
sed> --
*/
to var do
    ]'[ name
    dup
    $ "var_" swap ++ word tuck
    ' [ stack undefined ] ]define[
    $ ":" swap ++ word swap
    nested ' [ copy ] concat ]define[
end

/* >>
word> var,
lookahead> name
description> declares a new variable, initialized to top stack value.
sed> v --
*/
to var, do
    temp put
    ]'[ name
    dup
    $ "var_" swap ++ word tuck
    ' [ stack ] temp take nested concat ]define[
    $ ":" swap ++ word swap
    nested ' [ copy ] concat ]define[
end

/* >>
word> is
lookahead> name
description> puts a value into a variable.
sed> v --
*/
to is do
    ]'[ name
    $ "var_" swap ++
    word run
    put
end

/* >>
word> stack
description> placed at the start of an word, makes the word an ancillary stack.
sed> -- a
*/
to stack [ immovable ]this[ ]done[ ]

/* >>
word> release
description> removes the first item from an array and discards it. Mutates the array.
sed> a --
*/
to release [ take drop ]

/* >>
word> copy
description> copies the last item of the array a onto the stack.
sed> a -- i
*/
to copy [ dup take dup rot put ]

/* >>
word> replace
description> replaces the last item on the array a with i
sed> i a --
*/
to replace [ dup release put ]

/* >>
word> replace
description> moves the last item from the array b to the array a.
sed> a b --
*/
to move [ swap take swap put ]

/* >>
word> tally
description> adds n to the last item of the array a.
sed> n a --
*/
to tally [ dup take rot + swap put ]

/* >>
word> temp
description> temp is a general purpose ancillary [[stack]].
sed> -- a
*/
to temp [ stack ]

/* >>
word> done
description> jumps immediately to the end of the array.
sed> --
example>
    [ foo bar done baz ]
    // foo bar will run, baz will not
*/
to done [ ]done[ ]

/* >>
word> again
description> jumps immediately to the start of the array.
sed> --
example>
    [ foo bar again baz ]
    // foo bar will run infinitely
*/
to again [ ]again[ ]

/* >>
word> if
description> if the top of stack is false, skips the next item
sed> t --
example>
    [ foo bar if baz ]
    // if bar returns false, baz will be skipped
*/
to if [ 1 ]cjump[ ]

/* >>
word> iff
description> if the top of stack is false, skips the next two items
sed> t --
example>
    [ foo iff bar baz ]
    // if foo returns false, bar baz will be skipped
*/
to iff [ 2 ]cjump[ ]

/* >>
word> else
description> unconditionally skips the next item
sed> --
example>
    [ foo else bar baz ]
    // bar will not run.
*/
to else [ false 1 ]cjump[ ]

/* >>
word> until
description> if the top of stack is false, jumps back to the start of the array.
sed> t --
example>
    [ foo bar baz until ]
    // repeats foo bar baz until baz returns true.
*/
to until [ not if ]again[ ]

/* >>
word> while
description> if the top of stack is false, jumps to the end of the array.
sed> t --
example>
    [ foo while baz again ]
    // runs foo at least once, then repeats bar foo until foo returns false
*/
to while [ not if ]done[ ]

to switch.arg [ stack ]

/* >>
word> switch
description> begins a switch staement: puts the value to be switched upon in a temporary stack (not [[temp]]).
sed> v --
see-also> case default
*/
to switch [ switch.arg put ]

/* >>
word> default
description> ends a switch staement: empties the switch value from the stack it is stored on.
sed> v --
see-also> switch case
*/
to default [ switch.arg release ]

/* >>
word> case
lookahead> action
description> if the value on the stack is not the switch value, skips action. If it is, runs action and then jumps to the end of the array (skipping the other cases and the [[default]]).
sed> v --
see-also> switch default
*/
to case do
    switch.arg copy
    != [ 4 ]cjump[ ]
         false 1 ]cjump[ done
    default
    ]'[ run ]done[
end

/* >>
word> '
lookahead> value
description> puts the value following it on the stack instead of running it.
sed> -- v
example>
    [ 1 2 3 ] // results in 3 items on the stack
    ' [ 1 2 3 ] // results in 1 item, the array [1, 2, 3]
*/
to ' [ ]'[ ]

/* >>
word> run
description> runs the item on the stack as code.
sed> c --
*/
to run [ ]run[ ]

/* >>
word> this
description> puts a reference to the current array on the stack.
sed> -- a
*/
to this [ ]this[ ]

/* >>
word> table
description> placed at the start of a word, turns it into a lookup table. Takes the n-th item after the `table` and puts it on the stack, and then skips everything after it.
sed> n -- i
*/
to table [ immovable dup -1 > + ]this[ swap peek ]done[ ]

/* >>
word> recurse
description> causes the current array to run itself again.
sed> --
*/
to recurse [ ]this[ run ]

to times.start [ stack ]
to times.count [ stack ]
to times.action [ stack ]

/* >>
word> times
lookahead> block
description> runs body the specified numbe of times.
sed> n --
*/
to times do
    ]'[ times.action put
    dup times.start put
    do
        1- dup -1 > while
        times.count put
        times.action copy run
        times.count take
        again
    end
    drop
    times.action release
    times.start release
end

/* >>
word> i
description> inside of a [[times]] loop, gets the number of iterations left to do after this one.
sed> -- n
*/
to i [ times.count copy ]

/* >>
word> i^
description> inside of a [[times]] loop, gets the number of iterations done since the loop started.
sed> -- n
*/
to i^ [ times.start copy i 1+ - ]

/* >>
word> j
description> inside of a doubly nested [[times]] loop, gets the number of iterations left to do in the **outer** loop after this one.
sed> -- n
*/
to j do
    times.count temp move
    i
    temp times.count move
end

/* >>
word> j^
description> inside of a doubly nested [[times]] loop, gets the number of iterations done by the **outer** loop since the loop started.
sed> -- n
*/
to j^ do
    times.start temp move
    times.count temp move
    i^
    temp times.count move
    temp times.start move
end

/* >>
word> step
description> adds n to the current [[times]] loop's iteration counter. 
sed> n --
*/
to step [ times.count take 1+ swap - times.count put ]

/* >>
word> restart
description> sets the current [[times]] loop's iteration counter to the original value it started at, restarting the loop. 
sed> --
*/
to restart [ times.start copy times.count replace ]

/* >>
word> break
description> sets the current [[times]] loop's iteration counter to 0, causing the loop to end after this iteration is done.
sed> --
*/
to break [ 0 times.count replace ]

/* >>
word> printable
description> given a character c, treurns true or false whether it is in the printable region of ASCII (i.e. greater than 31).
sed> c -- t
*/
to printable? [ ord 31 > ]

/* >>
word> trim
description> trims the leading whitespace from a string.
sed> s -- t
*/
to trim [ dup findwith printable? noop split nip ]

/* >>
word> nextword
description> given a string that does not start with whitespace, returns the first word and the rest of the string.
sed> s -- r w
s> string
r> remainder of string
w> first word
*/
to nextword [ dup findwith [ printable? not ] noop split swap ]

/* >>
word> split$
description> splits a string s into an array a of individual words.
sed> s -- a
*/
to split$ do
    [] swap
    do
        trim
        dup len while
        nextword
        swap dip concat again
    end
    drop
end

/* >>
word> nested
description> puts an item in its own array.
sed> i -- a
*/
to nested [ [] tuck put ]

/* >>
word> len
description> gets the length of the array or string.
sed> a -- l
*/
to len [ .length ]

/* >>
word> pluck
description> pulls the n-th item out of the array a and returns the shortened array and the item i.
sed> a n -- a i
see-also> stuff
*/
to pluck [ split 1 split swap dip join 0 peek ]

/* >>
word> stuff
description> reverse of [[pluck]], it puts the item back.
sed> a i n -- a
*/
to stuff [ split rot nested swap join join ]

/* >>
word> behead
description> returns the first item of the array a, and the rest. The original array is not mutated.
sed> a -- a i
*/
to behead [ 0 pluck ]

/* >>
word> join
description> joins two arrays or strings, selecting between [[++]] and `concat` depending on the type of the arguments.
sed> a b -- ab
*/
to join [ 2dup $ 'string' isa? dip [ $ 'string' isa? end and iff ++ else concat ]

/* >>
word> of
description> makes an array with n x's in it.
sed> x n -- a 
*/
to of do
    dip do
        dup $ 'string' isa? iff $ '' else []
    end
    swap unrot
    dup 1 < iff
        2drop done
    do
        2 /mod over while
        if do
            dip do
                tuck join swap
            end
        end
        dip [ dup join ]
        again
    end
    2drop join
end

/* >>
word> reverse
description> reverses the array
sed> arr -- rra 
*/
to reverse do
    dup $ 'array' isa? if do
        [] swap witheach [ nested swap concat ]
    end
end

/* >>
word> reverse$
description> [[reverse]] but for strings.
sed> x -- x 
*/
to reverse$ do
    dup $ 'string' isa? if do
        $ '' swap witheach [ swap ++ ]
    end
end

/* >>
word> reflect
description> [[reverse]] but digs down into sub-arrays and reflects them too.
sed> x -- x 
*/
to reflect do
    dup $ 'array' isa? if do
        [] swap witheach [ reflect nested swap concat ]
    end
end

to with.hold [ stack ]

/* >>
word> makewith
description>
    places the code in a loop and returns the generated code.
    
    The returned code takes an array or string on the stack and calls the original code passed 
    to `makewith` with each item of the array or string.
sed> c -- l 
*/
to makewith do
    nested
    ' [ dup with.hold put len times ]
    ' [ with.hold copy i^ peek ]
    rot concat
    nested concat
    ' [ with.hold release ]
    concat
end

/* >>
word> witheach
lookahead> block
description> takes an array or string and runs block for each item in it.
sed> a -- 
*/
to witheach [ ]'[ makewith run ]

/* >>
word> fold
description>
    takes a function and an array and reduces the array by calling the function with pairs of the items from the array:

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
                                              result
sed> a r -- s
*/
to fold do
    over [] = iff drop done
    dip do
        behead swap
        ' [ witheach ] 
    end
    nested join run
end

/* >>
word> foldr
description> same as [[fold]] but applies the operation in reverse order.
sed> a r -- s
*/
to foldr [ dip reverse fold ]

/* >>
word> map
description> passes each item of array a through function r and concatentates the returned values.
sed> a r -- s
*/
to map do
    ' [ [ ] ] rot join swap
    nested
    ' [ nested join ] join
    fold
end

/* >>
word> filter
description> passes each item of array a through function r and returns the items for which r returns true.
sed> a r -- s
*/
to filter do
    ' [ [ ] ] rot join swap
    nested ' dup swap join
    ' [ iff [ nested join ] else drop ] join
    fold
end

/* >>
word> split
description> splits the array between the n-th and n+1-th items and returns the parts, second half on top.
sed> a n -- x y
*/
to split do
    2dup
    nested ' [ 0 ] swap concat .slice()
    unrot
    nested .slice()
end

to mi.tidyup [ stack ]
to mi.result [ stack ]

/* >>
word> matchitem
description> uses the provided functions to find an item. returns the index of the first found item
sed> a f c -- i
a> array to search
f> criteria function to test if item matches
c> cleanup function to clean the stack
*/
to matchitem do
    mi.tidyup put
    over len mi.result put
    ' [
        if do
            i^ mi.result replace
            break
        end
    ]
    concat makewith run
    mi.tidyup take run
    mi.result take
end

/* >>
word> find
description> finds the first index where item x occurs in the array a.
sed> a x -- i
*/
to find do
    dup len unrot
    swap nested
    .indexOf()
    over +
    swap mod
end

/* >>
word> findwith
lookahead> criteria cleanup
description> same as [[matchitem]] but uses lookahead for cleanup and criteria.
sed> a -- i
*/
to findwith [ ]'[ ]'[ matchitem ]

to findseq do
    over len over len
    dup temp put
    swap - 1+ times do
        2dup over len
        split drop = if do
            i^ temp replace
            break
        end
        behead drop
    end
    2drop temp take
end

/* >>
word> found?
description> true if i is a valid index into array a.
sed> a i -- t
example>
    to has-foo? [ dup $ "foo" find found? ]
*/
to found? [ len < ]

/* >>
word> lower
description> turns a string lowercase
sed> s -- s
*/
to lower [ .toLowerCase@ ]

/* >>
word> upper
description> turns a string uppercase
sed> s -- s
*/
to upper [ .toUpperCase@ ]

/* >>
word> ++
description> concatenates 2 items after casting both to string type.
sed> s1 s2 -- s1s2
*/
to ++ [ stringify swap stringify + ]

/* >>
word> num>$
description> writes number x in base n
sed> x n -- s
*/
to num>$ [ nested .toString() ]

/* >>
word> $>num
description> parses string s as a number in base n.
sed> s n -- x
*/
to $>num [ 2 pack window swap .parseInt() ]

/* >>
word> big
description> turns number n into a `BigInt`.
sed> n -- b
*/
to big [ nested window swap .BigInt() ]

to sort.test [ stack ]

/* >>
word> sortwith
lookahead> comp
description> using comparator comp, sorts the array. Does not mutate the array.
sed> a -- s
*/
to sortwith do
    ]'[ sort.test put
    [] swap witheach do
        swap 2dup findwith
            [ over sort.test copy run ]
            noop
        nip stuff
    end
    sort.test release
end

/* >>
word> sort
description> sort an array of numbers
sed> a -- s
*/
to sort [ sortwith > ]

/* >>
word> sort$
description> sort an array of strings
sed> a -- s
*/
to sort$ [ sortwith $> ]

to try.hist [ stack ]

/* >>
word> try
lookahead> block except
description> runs block, and if it threw an error, runs except with the error on the stack. If block ran fine, skips except.
sed> --
*/
to try do
    {} try.hist put
    try.prt copy
    do
        dup len while
        behead
        dup resolve len swap
        try.hist copy swap
        set
        again
    end
    drop

    ]'[
    ]sandbox[

    dup dup if do
        try.prt copy
        do
            dup len while
            behead
            dup resolve len over
            try.hist copy get
            - do
                dup while
                over run take
                1-
            end
            drop
        end
        true
    end
    try.hist release
    1 ]cjump[
end

/* >>
word> nestdepth
description> puts the current recursion depth on the stack.
sed> -- n
*/
to nestdepth [ self .returnStack .length ]

/* >>
word> stacksize
description> puts the number of items on the stack, on the stack.
sed> -- n
*/
to stacksize [ self .workStack .length ]

/* >>
word> to-do
description> to-do is a general purpose ancillary [[stack]].
sed> -- a
*/
to to-do [ stack ]

/* >>
word> new-do
description> initializes the [[stack]] a as a to-do stack by putting [[done]] on it.
sed> a --
*/
to new-do [ ' done swap put ]

/* >>
word> add-to
description> puts the action c and its arguments xxx* (the number of which is n) on the to-do stack a.
sed> xxx* c n a --
*/
to add-to [ dip [ 1+ pack ] put ]

/* >>
word> now-do
description> runs all the queued items on the to-do stack, until it hits the [[done]] put there by [[new-to]].
sed> a --
*/
to now-do [ [ dup take unpack run again ] drop ]

/* >>
word> do-now
description> same as [[now-do]] but does the items in reverse order.
sed> a --
*/
to do-now [ 1 split reverse concat now-do ]

/* >>
word> not-do
description> removes all the queued items from the to-do stack a without running them.
sed> a --
*/
to not-do [ [ dup take ' done = until ] drop ]

/* >>
word> chr
description> returns the character with the Unicode code point n.
sed> n -- s
*/
to chr [ nested window .String swap .fromCharCode() ]

/* >>
word> ord
description> reverse of [[chr]], it gets the code point of the character
sed> s -- n
*/
to ord [ ' [ 0 ] .charCodeAt() ]

/* >>
word> isa?
description> true if item a's [[type]] is the same as s.
sed> a s -- t
*/
to isa? [ swap type = ]

/* >>
word> isoneof
description> same as [[isa?]] but accepts an array of types, which will succeed if any of them is the [[type]] of a.
sed> a ss -- t
*/
to isoneof? [ dip type ' [ over = ] map nip ' or fold ]

/* >>
word> stringify
description> converts a to an string.
sed> a -- s
*/
to stringify [ .toString@ ]

/* >>
word> arrayify
description> converts a to an array.
sed> x -- a
*/
to arrayify [ dup $ 'array' isa? not if nested ]

/* >>
word> phoo
description> compile and run the code.
sed> c --
*/
to phoo [ compile run ]

/* >>
word> new@
description> Constructs the function f by calling it with no arguments.
sed> f -- o
*/
to new@ [ [] swap new ]

/* >>
word> call@
description> Calls the function f with no arguments.
sed> f -- r
*/
to call@ [ [] swap call ]

/* >>
word> !!todo!!
description> Throws `'todo'`.
sed> --
*/
to !!todo!! [ $ 'todo' die ]

/* >>
word> use
lookahead> path/to/module
description> Imports the module, skipping if it was already imported.
sed> --
*/
to use do
    ]'[ false ]import[
end

/* >>
word> reuse
lookahead> path/to/module
description> Imports the module, force-reloading it even if it is already loaded.
sed> --
*/
to reuse do
    ]'[ true ]import[
end

protect dip.hold
protect switch.arg
protect times.start
protect times.action
protect times.count
protect with.hold
protect mi.tidyup
protect mi.result
protect sort.test

/* >>
word> dir
description> Returns an list of the names of all the available words in this scope.
sed> -- a
*/
to dir do
    self .module nested
    self .scopeStack concat
    [] temp put
    witheach do
        .words .map .keys@
        window .Array swap nested .from()
        temp take
        concat temp put
    end
    temp take
end
