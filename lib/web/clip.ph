/* >>
plain>
This module hooks into the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
which allows Phoo to put stuff on and read from the user's clipboard.
*/

use web/permissions

/* >>
word> clip.can-copy?
description> Returns true, false, or undefined depending on whether the user has granted, denied, or
dismissed the permission prompt for writing to the clipboard.
sed> -- t
*/
to clip.can-copy? do
    $ "clipboard-write" permissions.query
end

/* >>
word> clip.can-read?
description> Returns true, false, or undefined depending on whether the user has granted, denied, or
dismissed the permission prompt for reading the clipboard.
sed> -- t
*/
to clip.can-read? do
    $ "clipboard-read" permissions.query
end

/* >>
word> clip.share
description> Reads the text currently contained on the user's clipboard.
sed> -- s
*/
to clip.share do
    clip.can-read? permissions.assert
    window .navigator .clipboard .readText@ await
end

/* >>
word> clip.put
description> Puts a string onto the user's clipboard, equivalent to them selecting it and hitting copy.
sed> s --
*/
to clip.put do
    clip.can-copy? permissions.assert
    nested
    window .navigator .clipboard .writeText() await drop
end