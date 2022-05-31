to permissions.assert do
    not if do
        $ "Permission denied by user." die
    end
end

to permissions.query do
    {} tuck swap .name=
    nested
    window .navigator .permissions swap .query() await
    switch do
        $ "denied" case false
        $ "granted" case true
        $ "prompt" case undefined
        otherwise undefined
    end
end