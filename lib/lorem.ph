/* 
https://github.com/sfischer13/python-lorem/blob/master/lorem/text.py
*/


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
    behead upper swap ++
end