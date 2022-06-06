/* >>
word> maketag
description> Given a string tag name, creates a new HTML tag.
sed> t -- e
t> tag name
e> element object
*/
to maketag do
    nested
    window .document swap .createElement()
end

/* >>
word> popup
description> Creates a popup window, with the dimensions and placement specified in
the dimensions array d. In order, the elements of d are top, left, width, and height.
The rest are ignored.
sed> d -- w
d> dimensions array
w> window object
*/
to popup do
    ' [ $ "about:blank" $ "_new" ] swap
    behead $ "top=" swap ++
    swap behead rot swap
    $ ",left=" swap ++ ++
    swap behead rot swap
    $ ",width=" swap ++ ++
    swap behead rot swap
    $ ",height=" swap ++ ++
    nip concat
    window swap .open()
end

to tag.put do 
    swap nested .append() drop
end

to pop.put do
    .document .body tag.put
end

to tag.clear do
    $ "" .innerHTML=
end

to pop.clear do
    .document .body tag.clear
end

to tag.find do
    nested .querySelector()
end

to tag.style do
    unrot .style rot swap set
end
