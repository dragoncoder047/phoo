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
    ' [ $ "" ] .split()
    ' [ ord 16 num>$ upper ] map
    ' ++ fold
end

/* >>
word> b16.decode
description> Decode the string using base16 (i.e. hexadecimal).
sed> s -- s
*/
to b16.decode do
    dup len 2 mod 0 != iff $ "base16 string cannot have odd length" die
    ' [ $ ".."rg ] .matchAll()
    nested window .Array swap .from()
    ' [ 16 $>num chr ] map
    ' ++ fold
end
