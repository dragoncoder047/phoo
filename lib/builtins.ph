to #pragma do
    ]'[ name
    self .phoo .settings
    ]'[ set
end

to try.prt [ stack [ ] ]

to protect do
    try.prt take
    ]'[ nested concat
    try.prt put
end

to in_scope do
    self .enterScope@
    ]'[ run
    self .exitScope@
end

to noop [ ]

to alias to

macro const do
    dip do
        [] = iff
            $ 'const: need something before to precompile' die
        dup take run
        nested
        concat
    end
end

macro now! do
    dip [ dup take run ]
end

macro // do
    dup $ '' = not while
    behead
    dup 10 chr = dip [ 13 chr = ] or until
end

to dup [ 0 pick ]

to over [ 1 pick ]

to swap [ 1 roll ]

to rot [ 2 roll ]

to unrot [ rot rot ]

to nip [ swap drop ]

to tuck [ dup unrot ]

to 2dup [ over over ]

to 2drop [ drop drop ]

to 2swap [ rot dip rot ]

to 2over [ dip [ dip 2dup ] 2swap ]

to pack do
    [] swap times do
        swap nested concat
    end
    reverse
end

to unpack [ witheach noop ]

to dip.hold [ stack ]
to dip [ dip.hold put ]'[ run dip.hold take ]

to abs [ dup 0 < if negate ]

to - [ negate + ]

to /~ [ /mod drop ]

to mod [ /mod nip ]

to != [ = not ]

to <= [ 2dup swap > dip = or ]

to < [ swap > ]

to >= [ swap <= ]

to min [ 2dup > if swap drop ]

to max [ 2dup < if swap drop ]

to clamp [ rot min max ]

to within [ rot tuck > unrot > not and ]

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

to $> [ swap $< ]

to not [ dup nand ]

to and [ nand not ]

to or [ not swap not nand ]

to xor [ not swap not != ]

to >> [ negate << ]

to bit [ dup $ 'bigint' isa? iff 1n else 1 swap << ]

to immovable [ ]

to stack [ immovable ]this[ ]done[ ]

to release [ take drop ]

to copy [ dup take dup rot put ]

to replace [ dup release put ]

to move [ swap take swap put ]

to tally [ dup take rot + swap put ]

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

to to-do [ stack ]

to new-do [ ' done swap put ]

to add-to [ dip [ 1+ pack ] put ]

to now-do [ [ dup take unpack run again ] drop ]

to do-now [ 1 split reverse concat now-do ]

to not-do [ [ dup take ' done = until ] drop ]

to ord [ ' [ 0 ] swap .charCodeAt() ]

to isa? [ swap type = ]

to isoneof? [ [] unrot witheach [ dip dup isa? swap dip concat ] drop false swap witheach or ]

to stringify [ .toString@ ]

to arrayify [ dup $ 'array' isa? not if nested ]

to phoo [ compile run ]

to new! [ [] swap new ]

to !!todo!! [ $ 'todo' die ]

to use do
    ]'[ ]import[
end

1 0x20 3n 36#hexatrigesimal-n true false null undefined $ zstringzzwithzzdelimitersz
$ >(1?12?)*>r
$ FTESTF die

protect dip.hold
protect switch.arg
protect times.start
protect times.action
protect times.count
protect with.hold
protect mi.tidyup
protect mi.result
protect sort.test
