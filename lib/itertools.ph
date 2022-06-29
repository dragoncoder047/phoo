/* >>
word> realArray
description> make the object on the stack into an array using `:::js Array.from`.
sed> o -- a
*/
to realArray do
    nested window .Array swap .from()
end

var zip.zipping

/* >>
word> zip
description> given an array of arrays `[a, b, ...]`, returns the zipped arrays `[[a0, b0, ...], [a1, b1, ...], [a2, b2, ...]...]`.
sed> zi -- zo
*/
to zip do
    realArray
    dup is zip.zipping
    ' len map ' max fold range
    ' do
        temp put
        :zip.zipping ' do
            temp copy 2dup swap found? iff peek
            else [ 2drop undefined ]
        end map
        temp release
    end map
end

/* >>
word> enumerate
description> Like [[zip]], but takes [a, b, c, d...] and returns [[0, a], [1, b], [2, c], [3, d]...]
sed> ei -- eo
*/
to enumerate do
    dup len range
    nested swap nested concat
    zip
end

/*
word> bag
description> reduces an array of items `[a, b, c, ...]` into an array of `[item, count]`.
sed> ia -- ca
*/
to bag do
    realArray
    {} nested swap concat
    [] temp put
    ' do
        dup temp copy put
        2dup get
        dup $ "undefined" isa? iff [ drop 0 ] else noop
        1+ unrot set
    end foldr
    temp take
    killdups
end
