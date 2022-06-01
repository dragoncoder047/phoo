do
    $ "<(?<tag>[a-z]+)>"r 
    ' do
        .groups .tag nested nested
        ' [ window .document ] swap concat
        ' [ .createElement() ] concat
    end
    2 pack
    self ' [ 0 ] .getScope()
    .literalizers swap .add() drop
end now!
