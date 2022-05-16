use web/permissions

to notifications.can? do
    window .Notification .requestPermission@ await
    switch do
        $ "granted" case true
        $ "denied" case false
        $ "default" case undefined
        otherwise undefined
    end
end

to notification.send do // options, title --> notification object
    notifications.can? permissions.assert
    over $ "string" isa? if do
        dip do
            {} tuck
            swap .body=
        end
    end
    2 pack
    window .Notification new()
end

to notification.hide do
    window .Notification .hide@ drop
end