/* >>
plain>
<https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API>
*/

/* >>
word> geolocation.can?
description> Returns true if the user's device has a GPS unit, that is, whether getting the
geolocation is even possible. Note that this will strill return true if the user denied permission
to access their location.
sed> -- t
*/
to geolocation.can? do
    window .navigator .geolocation
    undefined !=
end

/* >>
word> geolocation.getpos
description> Returns a [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition)
object with the user's position, or throws an error if the user denied permission or GPS is not available.
sed> -- p
*/
to geolocation.getpos do
    promise swap 2 pack
    window .navigator .geolocation swap .getCurrentPosition() drop
    await
end

/* >>
plain>
## Example, which prints your location:

```phoo
use web/geolocation

geolocation.can? iff do
    geolocation.getpos
    .coords
    dup
    $ "Your position: " echo
    .longitude dup 0 > iff $ "degrees N" else $ "degrees S" ++ echo
    .latitude dup 0 > iff $ "degrees E" else $ "degrees W" ++ echo
end
else do
    $ "Position not available." echo
end
```
*/
