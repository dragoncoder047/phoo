to maketag do
    nested
    window .document swap .createElement()
end

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
    dup $ "string" isa? iff do
        .innerHTML=
    end
    else do
        swap nested .appendChild()
    end
end

to pop.put do
    .document .body tag.put
end

to tag.clear do
    $ "" tag.put
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
