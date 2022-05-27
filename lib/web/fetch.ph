to fetchText do
    nested
    window swap .fetch() await
    .text@ await
end

to fetchJSON do
    nested
    window swap .fetch() await
    .json@ await
end