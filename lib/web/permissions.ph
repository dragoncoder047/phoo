/* >>
word> permissions.assert
description> If the top value is false, throws "Permission denied by user" error.
sed> t --
*/
to permissions.assert do
    not if do
        $ "Permission denied by user." die
    end
end

/* >>
word> permissions.query
description> Queries the [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
for the specified permission, and returns true, false, or undefined, corresponding to granted, denied, or ignored.
sed> t --
*/
to permissions.query do
    {} tuck swap .name=
    nested
    window .navigator .permissions swap .query() await
    .state
    switch do
        $ "denied" case false
        $ "granted" case true
        $ "prompt" case undefined
        default undefined
    end
end
