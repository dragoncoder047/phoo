import [ log exp sqrt ] from math

to 64bits [ 0xFFFFFFFFFFFFFFFFn & ]

to bob.a [ stack ]
to bob.b [ stack ]
to bob.c [ stack ]
to bob.d [ stack ]

// https://github.com/GordonCharlton/Quackery/blob/cbacedd1e69af8749570524c6684c186b90c67a6/quackery.py#L1120-L1135
to bob do
    bob.a share
    bob.b share tuck
    7n rot64 - 64bits swap
    bob.c share tuck
    13n rot64 ^ bob.a replace
    bob.d share tuck
    37n rot64 + 64bits bob.b replace
    over + 64bits bob.c replace
    bob.a share + 64bits
    dup bob.d replace
end

to seed do
    0xF1EA5EADn bob.a replace
    dup bob.b replace
    dup bob.c replace
    bob.d replace
    20 times [ bob drop ]
end

time big seed

to random do
    // convert 32bit bigint to float in [0, 1)
    !!todo!!
end

/* cSpell:ignore fbelow ibelow */
to fbelow [ random * ]

to ibelow [ fbelow ~ ~ ]

to randrange [ over - ibelow + ]

to choose [ dup # ibelow peek ]

to shuffle do
    [] swap dup
    # times do
        dup # ibelow pluck
        nested rot concat swap
    end
    drop
end

to sample [ dip shuffle split drop ]

to choices do
    0 swap of
    map [ drop dup choose ]
    nip
end

def normal do
    do
        random dup random
        0.5 - / [ 4 0.5 exp * 2 sqrt / ] const *
        dup dup * 4 /
        rot
        log negate
        <= until
    end
    * +
end

def expo [ 1 random - log negate / ]