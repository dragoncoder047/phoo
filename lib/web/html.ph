to newhtml do
    ]'[ name nested
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
