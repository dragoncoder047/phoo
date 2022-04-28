import $ "math.ph" math
alias log math:log alias exp math:exp alias sqrt math:sqrt
import* $ "_random.js"

/* cSpell:ignore fbelow ibelow */
to fbelow [ random * ]

to ibelow [ fbelow ~ ~ ]

to randrange [ over - ibelow + ]

to choose [ dup len ibelow peek ]

to shuffle do
    [] swap dup
    len times do
        dup len ibelow pluck
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

to normal do
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

to expo [ 1 random - log negate / ]
