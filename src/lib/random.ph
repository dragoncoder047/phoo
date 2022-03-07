import [ log exp sqrt ] from math

// see https://github.com/imneme/pcg-c-basic/blob/master/pcg_basic.c
to pcg.state [ stack [ 0x853c49e6748fea9bn 0xda3e39cb94b95bdbn ] ]
to pcg do
    !!todo!!
end

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
        0.5 - / [ 4 0.5 exp * 2 sqrt / ] constant *
        dup dup * 4 /
        rot
        log negate
        <= until
    end
    * +
end

def expo [ 1 random - log negate / ]