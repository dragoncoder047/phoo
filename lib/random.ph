/* >>
plain>

The `random` module contains a seedable random number generator, which is adapted from
the one used in Quackery, which is itself the 64-bit version of 
Bob Jenkins' "A small noncryptographic PRNG" which can be found at
<https://burtleburtle.net/bob/rand/smallprng.html>.
*/

use math

0n dup 2dup
var, rng.a
var, rng.b
var, rng.c
var, rng.d

to 64bits [ 0xFFFFFFFFFFFFFFFFn & ]

to rot64 do
    dip 64bits 2dup << 64bits
    unrot 64n swap - >> |
end

/* >>
word> random.seed
description> Seeds the random number generator using the value on top of the stack, which must be coercible to BigInt.
sed> s --
*/
to random.seed do
    big
    4058668781n is rng.a
    dup is rng.b
    dup is rng.c
    is rng.d
    20 times [ random.01 drop ]
end

/* >>
word> random.01
description> Returns a random floating point number in the range [0, 1).
sed> -- n
*/
to random.01 do
    :rng.a
    :rng.b tuck
    7n rot64 - 64bits swap
    :rng.c tuck
    13n rot64 ^ is rng.a
    :rng.d tuck
    37n rot64 + 64bits is rng.b
    over + 64bits is rng.c
    :rng.a + 64bits dup is rng.d
    unbig 0xFFFFFFFFFFFFFFFF /
end

time random.seed

/* cSpell:ignore fbelow ibelow */

/* >>
word> random.fbelow
description> Returns a random floating point number in the range [0, n).
sed> n -- r
*/
to random.fbelow [ random.01 * ]

/* >>
word> random.ibelow
description> Returns a random integer from 0 to n-1.
sed> n -- r
*/
to random.ibelow [ random.fbelow ~ ~ ]

/* >>
word> random.1in
description> Returns true 1/n-th of the time.
sed> n -- t
*/
to random.1in [ random.ibelow 0 = ]

/* >>
word> random.range
description> Returns an random integer from a to b-1.
sed> a b -- t
*/
to random.range [ over - random.ibelow + ]

/* >>
word> random.choose
description> Returns an random item from the array a.
sed> a -- i
*/
to random.choose [ dup len random.ibelow peek ]

/* >>
word> random.shuffle
description> Returns an new array containing the items of a in an random order.
sed> a -- s
*/
to random.shuffle do
    [] swap dup
    len times do
        dup len random.ibelow pluck
        nested rot concat swap
    end
    drop
end

/* >>
word> random.sample
description> Returns an new array containing n randomly selected items of a, **without** replacement.
If n >= the length of a, the returned array will be an shuffled copy of a.
sed> a n -- s
see-also> random.choices
*/
to random.sample [ dip random.shuffle split drop ]

/* >>
word> random.choices
description> Returns an new array containing n randomly selected items of a, **with** replacement.
sed> a n -- s
see-also> random.sample
*/
to random.choices do
    0 swap of
    swap temp put
    ' [ drop temp copy random.choose ] map
    temp release
end

0.5 exp 4 * 2 sqrt / var, normal._magic

/* >>
word> random.normaldist
description> Returns an number distributed in the standard normal distribution with mean μ and standard deviation σ.
sed> μ σ -- n
*/
to random.normaldist do
    do
        1 random.01 - dup random.01
        0.5 - / :normal._magic *
        dup dup * 4 /
        rot
        log negate
        <= until drop
    end
    * +
end

/* >>
word> random.expodist
description> Returns an number distributed in the exponential distribution with mean 1/λ.
sed> λ -- n
*/
to random.expodist [ 1 random.01 - log negate / ]
