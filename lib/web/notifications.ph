/* >>
plain>

This wraps the [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API).

Note that not all features are implemented: for example, you can't use the `actions` property to show buttons to the user.
That requires the use of a service worker, and I haven't quite figured that out yet.

*/

use web/permissions

/* >>
word> notifications.can?
description> prompts the user for permission to send notifications,
and then returns true, false, or undefined depending on whether they granted, denied,
or just closed the box. Note this will just return false immediately if you didn't call this
as a result of a user gesture.
sed> -- t
*/
to notifications.can? do
    window .Notification .requestPermission@ await
    switch do
        $ "granted" case true
        $ "denied" case false
        $ "default" case undefined
        default undefined
    end
end

/* >>
word> notification.send
description> sends a notification using the provided title t and options object o, returning the `Notification` object.
As a shortcut, o can be a string, in which case it is interpreted as the `body` of the notification.

The available option for o are described [here](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification#parameters).
TODO: #12 add support for `actions` using service worker.
sed> o t -- n
o> options object
t> title for notification
n> notification object
*/
to notification.send do
    notifications.can? permissions.assert
    over $ "string" isa? if do
        dip do
            {} dup
            rot .body=
        end
    end
    swap 2 pack
    window .Notification new
end
