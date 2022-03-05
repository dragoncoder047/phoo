import [ random setrand seed ] from _random

import log from math

/* cSpell:ignore fbelow ibelow */
def fbelow [ random * ]

def ibelow [ fbelow ~ ~ ]

def randrange [ over - ibelow + ]

def choose [ dup # ibelow peek ]

def shuffle [
    [] swap dup
    # times [
        dup # ibelow pluck
        nested rot concat swap
    ]
    drop
]

def sample [ dip shuffle split drop ]

def choices [
    0 swap of
    map [ drop dup choose ]
    nip
]

def normal [
    [
        random dup random
        0.5 - / [ 4 0.5 exp * 2 sqrt / ] constant *
        dup dup * 4 /
        rot
        log negate
        <= until
    ]
    * +
]

def expo [ 1 random - log negate / ]