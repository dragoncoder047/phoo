/* >>
word> b64.encode
description> Encode the string using base64.
sed> s -- s
*/
to b64.encode do
    nested
    window swap .btoa()
end

/* >>
word> b64.decode
description> Decode the string using base64. Incorrect padding (`=`) throws an error.
sed> s -- s
*/
to b64.decode do
    nested
    window swap .atob()
end

/* >>
word> b16.encode
description> Encode the string using base16 (i.e. hexadecimal).
sed> s -- s
*/
to b16.encode do
    $ "" swap
    witheach do
        ord 16 num>$ upper
        ++
    end
end

to b16.decode do
    $ "" swap
    do
        dup while
        2 split swap
        16 $>num chr ++
        again
    end
    nip
end