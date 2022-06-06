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

/* >>
word> tag.put
description> Appends a string of text or another HTML node to the element.
sed> x e --
e> element to append to
x> item to append
see-also> pop.put
*/
to tag.put do 
    swap nested .append() drop
end

/* >>
word> pop.put
description> Appends a string of text or another HTML node to the popup's `<body>` tag.
sed> x w --
w> window object
x> item to append
see-also> tag.put
*/
to pop.put do
    .document .body tag.put
end

/* >>
word> tag.clear
description> empties the contents of the element.
sed> e --
see-also> pop.clear
*/
to tag.clear do
    $ "" .innerHTML=
end

/* >>
word> pop.clear
description> empties the entire popup window.
sed> w --
see-also> tag.clear
*/
to pop.clear do
    .document .body tag.clear
end

/* >>
word> tag.find
description> Searches for the first child element of e that matches the selector s and returns it.
sed> e s -- c
see-also> tag.clear
*/
to tag.find do
    nested .querySelector()
end

/* >>
word> tag.style
description> applies the CSS style pair `s: v;` to the element e.
sed> v e s --
v> style value
s> style name
e> element to style
*/
to tag.style do
    swap .style swap set
end
