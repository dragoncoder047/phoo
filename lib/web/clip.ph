use web/permissions

to clip.can-copy? do
    $ "clipboard-write" permissions.query
end

to clip.can-read? do
    $ "clipboard-read" permissions.query
end

to clip.share do
    clip.can-read? permissions.assert
    window .navigator .clipboard .readText@ await
end

to clip.put do
    clip.can-copy? permissions.assert
    nested
    window .navigator .clipboard .writeText() await drop
end