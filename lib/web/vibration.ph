/* >>
word> vibrate
description> Causes the device to vibrate for n milliseconds if it has the ability to do so.
Alternatively, n can be an array or values, alternating on, off, on, off.
sed> n --
*/
to vibrate do
    arrayify
    window .navigator swap .vibrate() drop
end

/* >>
word> vibrate.stop
description> Stops any ongoing vibration pattern started by [[vibrate]].
sed> --
*/
to vibrate.stop do
    0 vibrate
end
