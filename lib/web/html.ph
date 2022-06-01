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

$ "adipisci aliquam amet consectetur dolor dolore dolorem eius est et
incidunt ipsum labore magnam modi neque non numquam porro quaerat qui
quia quisquam sed sit tempora ut velit voluptatem" split$

var, lorem.words

to lorem.sentence do
    use random
    $ ""
    4 8 random.range times do
        :lorem.words random.choose
        $ " " ++ ++
    end
    $ "." ++
    .capitalize@
end