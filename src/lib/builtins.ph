def try.prt [ stack [ ] ]

def protect [
    try.prt take
    ]'[ nested concat
    try.prt put
]

def nop [ ]

def alias def

builder const [
    dip [
        [] = iff
            $ '"constant" needs something before it.' error
        dup take do
        nested
        concat
    ]
]

builder now! [ dip [ dup take do ] ]

builder // [
    dup $ '' = not while
    behead
    dup 10 chr = dip [ 13 chr = ] or until
]

def rot [ dip swap swap ]

def unrot [ rot rot ]

def over [ dip dup swap ]

def nip [ swap drop ]

def tuck [ dup unrot ]

def 2dup [ over over ]

def 2drop [ drop drop ]

def 2swap [ rot dip rot ]

def 2over [ dip [ dip 2dup ] 2swap ]

def pack [
    [] swap times [
        swap nested concat
    ]
    reverse
]

def unpack [ witheach nop ]

def dip.hold [ stack ]
protect dip.hold
def dip [ dip.hold put ]'[ do dip.hold take ]

def abs [ dup 0 < if negate ]

def - [ negate + ]

def /f [ /% drop ]

def % [ /% nip ]

def != [ = not ]

def <= [ 2dup swap > dip = or ]

def < [ swap > ]

def >= [ swap <= ]

def min [ 2dup > if swap drop ]

def max [ 2dup < if swap drop ]

def clamp [ rot min max ]

def within [ rot tuck > unrot > not and ]

def $< [
    [
        dup  $ '' = iff
            false done
        over $ '' = iff
            true done
        behead rot behead rot
        2dup = iff [
            2drop swap
        ] again
        ord swap ord >
    ]
    unrot 2drop
]

def $> [ swap $< ]

def not [ dup nand ]

def and [ nand not ]

def or [ not swap not nand ]

def xor [ not swap not != ]

def >> [ negate << ]

def bit [ dup $ 'bigint' isa? iff 1n else 1 swap << ]

def immovable [ ]

def stack [ immovable ]this[ ]done[ ]

def release [ take drop ]

def copy [ dup take dup rot put ]

def replace [ dup release put ]

def move [ swap take swap put ]

def tally [ dup take rot + swap put ]

def temp [ stack ]

def done [ ]done[ ]

def again [ ]again[ ]

def if [ 1 ]cjump[ ]
def iff [ 2 ]cjump[ ]

def else [ false 1 ]cjump[ ]

def until [ not if ]again[ ]

def while [ not if ]done[ ]

def switch.arg [ stack ]
protect switch.arg

def switch [ switch.arg put ]

def default [ switch.arg release ]

def case [
    switch.arg copy
    != [ 4 ]cjump[ ]
         false 1 ]cjump[ done
    default
    ]'[ do ]done[
]

def ' [ ]'[ ]

def do [ ]do[ ]

def [ ]this[ ]

def table [ immovable dup -1 > + ]this[ swap peek ]done[ ]

def recurse [ ]this[ do ]

def times.start [ stack ]
def times.count [ stack ]
def times.action [ stack ]
protect times.start
protect times.action
protect times.count

def times [
    ]'[ times.action put
    dup times.start put
    [
        1 - dup -1 > while
        times.count put
        times.action copy do
        times.count take
        again
    ]
    drop
    times.action release
    times.start release
]

def i [ times.count copy ]

def i^ [ times.start copy i 1+ - ]

def step [ times.count take 1+ swap - times.count put ]

def restart [ times.start copy times.count replace ]

def break [ 0 times.count replace ]

def printable [ ord 32 > ]

def trim [ dup findwith printable nop split nip ]

def nextword [ dup findwith [ printable not ] nop split swap ]

def split$ [
    [] swap
    [
        trim
        dup # while
        nextword
        swap dip concat again
    ]
    drop
]

def nested [ [] tuck put ]

def # [ .get length ]

def pluck [ split 1 split swap dip join 0 peek ]

def stuff [ split rot nested swap join join ]

def behead [ 0 pluck ]

def join [ 2dup $ 'string' isa? dip [ $ 'string' isa? ] and iff .. else concat ]

def of [
    dip [
        dup $ 'string' isa? iff $ '' else []
    ]
    swap unrot
    dup 1 < iff
        2drop done
    [
        2 /% over while
        if [
            dip [
                tuck join swap
            ]
        ]
        dip [ dup join ]
        again
    ]
    2drop join
]

def reverse [
    dup $ 'array' isa? if [
        [] swap witheach [ arrayify swap concat ]
    ]
]

def reverse$ [
    dup $ 'string' isa? if [
        $ '' swap witheach [ swap .. ]
    ]
]

def reflect [
    dup $ 'array' isa? if [
        [] swap witheach [ reflect arrayify swap concat ]
    ]
]

def with.hold [ stack ]
protect with.hold

def makewith [
    nested
    ' [ dup with.hold put # times ]
    ' [ with.hold copy i^ peek ]
    rot concat
    nested concat
    ' [ with.hold release ]
    concat
]

def witheach [ ]'[ makewith do ]

def map.hold [ stack ]

def map [
    ]'[ map.hold put
    [] swap
    witheach [
        map.hold copy do
        concat
    ]
    map.hold release
]

def mi.tidyup [ stack ]
def mi.result [ stack ]
protect mi.tidyup
protect mi.result

def matchitem [
    mi.tidyup put
    over # mi.result put
    ' [
        if [
            i^ mi.result replace
            break
        ]
    ]
    concat makewith do
    mi.tidyup take do
    mi.result take
]

def findwith [ ]'[ ]'[ matchitem ]

def findseq [
    over # over #
    dup temp put
    swap - 1+ times [
        2dup over #
        split drop = if [
            i^ temp replace
            break
        ]
        behead drop
    ]
    2drop temp take
]

def found [ # < ]

def sort.test [ stack ]
protect sort.test

def sortwith [
    ]'[ sort.test put
    [] swap witheach [
        swap 2dup findwith
            [ over sort.test copy do ]
            nop
        nip stuff
    ]
    sort.test release
]

def sort [ sortwith > ]

def sort$ [ sortwith $> ]

def try.hist [ stack ]

def try [
    {} try.hist put
    try.prt copy
    [
        dup # while
        behead
        dup do # swap
        try.hist copy swap
        set
        again
    ]
    drop

    ]'[
    ]sandbox[

    dup iff [
        try.prt copy
        [
            dup # while
            behead
            dup do # over
            try.hist copy get
            - [
                dup while
                over do take
                1-
            ]
            drop
        ]
        true
    ]
    else nop
    try.hist release
    1 ]cjump[
]

def to-do [ stack ]

def new-do [ ' done swap put ]

def add-to [ dip [ 1+ pack ] put ]

def now-do [ [ dup take unpack do again ] drop ]

def do-now [ 1 split reverse concat now-do ]

def not-do [ [ dup take ' done = until ] drop ]

def ord [ ' [ 0 ] swap .call charCodeAt ]

def isa? [ swap type = ]

def isoneof? [ [] unrot witheach [ dip dup isa? swap dip concat ] drop false swap witheach or ]

def stringify [ .call! toString ]

def arrayify [ dup $ 'array' isa? not if nested ]

def phoo [ compile do ]

def callprop [
    dip dup
    getprop
    dip nested
    $ 'bind' get call
    call
]

def .get [ ]'[ name get ]

def .set [ ]'[ name set ]

def .call [ ]'[ name callprop ]

def .call! [ [] swap ]'[ name callprop ]

def new! [ [] swap new ]