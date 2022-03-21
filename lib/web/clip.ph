import web:permissions as _p

to can-write? do
    $ "clipboard-write" _p:query
end

to can-read? do
    $ "clipboard-read" _p:query
end

to read do
    can-read? _p:assert
    window .navigator .clipboard .readText@ await
end

to write do
    can-write? _p:assert
    nested
    window .navigator .clipboard .writeText() await drop
end