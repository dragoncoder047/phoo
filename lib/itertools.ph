/* >>
word> array-from
description> make the object on the stack into an array using `:::js Array.from`.
sed> o -- a
*/
to array-from do
    nested window .Array swap .from()
end

/* >>
word> zip
description> given an array of arrays `[a, b, ...]`, returns the zipped arrays `[[a0, b0, ...], [a1, b1, ...], [a2, b2, ...]...]`.
sed> zi -- zo
*/
to zip do
    array-from
    dup to-do put
    ' len map ' max fold range
    ' do
        temp put
        to-do copy ' do
            temp copy 2dup swap found? iff peek
            else [ 2drop undefined ]
        end map
        temp release
    end map
    to-do release
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

/* >>
word> killdups
description> Remove all the duplicates in the array a, and return an new array.
sed> a -- a
*/
to killdups do
    nested window .Set new
    array-from
end

/*
word> bag
description> reduces an array of items `[a, b, c, ...]` into an array of `[item, count]`.
sed> ia -- ca
*/
to bag do
    array-from
    dup killdups
    ' [ nested 0 concat ] map
    temp put
    witheach do
        temp copy witheach do
            2dup 0 peek =
            over 1 peek +
            swap replace
        end
        drop
    end
    temp take
end
