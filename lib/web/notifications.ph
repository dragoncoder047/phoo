import _p

to has-permission? do
    window .Notification .requestPermission@ await
    switch do
        $ "granted" case true
        $ "denied" case false
        $ "default" case undefined
        otherwise undefined
    end
end

to send do // options, title --> notification object
    has-permission? _p:assert
    over $ "string" isa? if do
        dip do
            {} tuck
            swap .body=
        end
    end
    2 pack
    window .Notification new()
end

to hide do
    window .Notification .hide@ drop
end