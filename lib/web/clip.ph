import _p

to can-write? do
    $ "clipboard-write" {} tuck .name=
    nested
    window .navigator .permissions .query() await
end

to can-read? do
    $ "clipboard-read" {} tuck .name=
    nested
    window .navigator .permissions .query() await
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