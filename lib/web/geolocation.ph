to geolocation.can? do
    window .navigator .geolocation
    undefined !=
end

to geolocation.getpos do
    promise 2 pack
    window .navigator .geolocation swap .getCurrentPosition() drop
    await
end