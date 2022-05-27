use math
use _random

/* cSpell:ignore fbelow ibelow */
to random.fbelow [ random.01 * ]

to random.ibelow [ random.fbelow ~ ~ ]

to random.range [ over - random.ibelow + ]

to random.choose [ dup len random.ibelow peek ]

to random.shuffle do
    [] swap dup
    len times do
        dup len random.ibelow pluck
        nested rot concat swap
    end
    drop
end

to random.sample [ dip random.shuffle split drop ]

to random.choices do
    0 swap of
    map [ drop dup random.choose ]
    nip
end

to random.normaldist do
    do
        random.01 dup random.01
        0.5 - / [ 4 0.5 exp * 2 sqrt / ] /* const */ *
        dup dup * 4 /
        rot
        log negate
        <= until
    end
    * +
end

to random.expodist [ 1 random.01 - log negate / ]
