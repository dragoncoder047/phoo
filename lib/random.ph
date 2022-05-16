use math
use _random

/* cSpell:ignore fbelow ibelow */
to ramdom.fbelow [ random * ]

to random.ibelow [ fbelow ~ ~ ]

to random.range [ over - ibelow + ]

to random.choose [ dup len ibelow peek ]

to random.shuffle do
    [] swap dup
    len times do
        dup len ibelow pluck
        nested rot concat swap
    end
    drop
end

to random.sample [ dip shuffle split drop ]

to random.choices do
    0 swap of
    map [ drop dup choose ]
    nip
end

to random.normaldist do
    do
        random dup random
        0.5 - / [ 4 0.5 exp * 2 sqrt / ] /* const */ *
        dup dup * 4 /
        rot
        log negate
        <= until
    end
    * +
end

to random.expodist [ 1 random - log negate / ]
