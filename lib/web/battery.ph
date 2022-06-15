/* >>
word> battery
description> Returns the [`BatteryManager`](https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager) singleton,
which allows you to access the device's battery status, charge level, etc., and hook into events when the values change.
sed> -- m
*/
to battery do
    window .navigator .getBattery@ await
end
