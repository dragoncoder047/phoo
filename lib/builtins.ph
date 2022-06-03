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
description> no-op.
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
description> precomputes a value.
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
description> placed at the start of a word, makes the word an ancillary stack.
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

to done [ ]done[ ]

to again [ ]again[ ]

to if [ 1 ]cjump[ ]
to iff [ 2 ]cjump[ ]

to else [ false 1 ]cjump[ ]

to until [ not if ]again[ ]

to while [ not if ]done[ ]

to switch.arg [ stack ]

to switch [ switch.arg put ]

to default [ switch.arg release ]

to case do
    switch.arg copy
    != [ 4 ]cjump[ ]
         false 1 ]cjump[ done
    default
    ]'[ run ]done[
end

to ' [ ]'[ ]

to run [ ]run[ ]

to this [ ]this[ ]

to table [ immovable dup -1 > + ]this[ swap peek ]done[ ]

to recurse [ ]this[ run ]

to times.start [ stack ]
to times.count [ stack ]
to times.action [ stack ]

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

to i [ times.count copy ]

to i^ [ times.start copy i 1+ - ]

to j do
    times.count temp move
    i
    temp times.count move
end

to j^ do
    times.start temp move
    times.count temp move
    i^
    temp times.count move
    temp times.start move
end

to step [ times.count take 1+ swap - times.count put ]

to restart [ times.start copy times.count replace ]

to break [ 0 times.count replace ]

to printable? [ ord 32 > ]

to trim [ dup findwith printable? noop split nip ]

to nextword [ dup findwith [ printable? not ] noop split swap ]

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

to nested [ [] tuck put ]

to len [ .length ]

to pluck [ split 1 split swap dip join 0 peek ]

to stuff [ split rot nested swap join join ]

to behead [ 0 pluck ]

to join [ 2dup $ 'string' isa? dip [ $ 'string' isa? end and iff ++ else concat ]

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

to reverse do
    dup $ 'array' isa? if do
        [] swap witheach [ nested swap concat ]
    end
end

to reverse$ do
    dup $ 'string' isa? if do
        $ '' swap witheach [ swap ++ ]
    end
end

to reflect do
    dup $ 'array' isa? if do
        [] swap witheach [ reflect nested swap concat ]
    end
end

to with.hold [ stack ]

to makewith do
    nested
    ' [ dup with.hold put len times ]
    ' [ with.hold copy i^ peek ]
    rot concat
    nested concat
    ' [ with.hold release ]
    concat
end

to witheach [ ]'[ makewith run ]

to fold do
    over [] = iff drop done
    dip do
        behead swap
        ' [ witheach ] 
    end
    nested join run
end

to foldr [ dip reverse fold ]

to map do
    ' [ [ ] ] rot join swap
    nested
    ' [ nested join ] join
    fold
end

to filter do
    ' [ [ ] ] rot join swap
    nested ' dup swap join
    ' [ iff [ nested join ] else drop ] join
    fold
end

to split do
    2dup
    nested ' [ 0 ] swap concat .slice()
    unrot
    nested .slice()
end

to mi.tidyup [ stack ]
to mi.result [ stack ]

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

to find do
    dup len unrot
    swap nested
    .indexOf()
    over +
    swap mod
end

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

to found? [ len < ]

to lower [ .toLowerCase@ ]

to upper [ .toUpperCase@ ]

to ++ [ stringify swap stringify + ]

to num>$ [ nested .toString() ]

to $>num [ 2 pack window swap .parseInt() ]

to big [ nested window swap .BigInt() ]

to sort.test [ stack ]

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

to sort [ sortwith > ]

to sort$ [ sortwith $> ]

to try.hist [ stack ]

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

to nestdepth [ self .returnStack .length ]

to stacksize [ self .workStack .length ]

to to-do [ stack ]

to new-do [ ' done swap put ]

to add-to [ dip [ 1+ pack ] put ]

to now-do [ [ dup take unpack run again ] drop ]

to do-now [ 1 split reverse concat now-do ]

to not-do [ [ dup take ' done = until ] drop ]

to chr [ nested window .String swap .fromCharCode() ]

to ord [ ' [ 0 ] .charCodeAt() ]

to isa? [ swap type = ]

to isoneof? [ [] unrot witheach [ dip dup isa? swap dip concat ] drop false swap witheach or ]

to stringify [ .toString@ ]

to arrayify [ dup $ 'array' isa? not if nested ]

to phoo [ compile run ]

to new@ [ [] swap new ]

to call@ [ [] swap call ]

to !!todo!! [ $ 'todo' die ]

to use do
    ]'[ false ]import[
end

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
