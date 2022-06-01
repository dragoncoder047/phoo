/* 
https://github.com/sfischer13/python-lorem/blob/master/lorem/text.py
*/

use random

$ "adipisci aliquam amet consectetur dolor dolore dolorem eius est et
incidunt ipsum labore magnam modi neque non numquam porro quaerat qui
quia quisquam sed sit tempora ut velit voluptatem" split$

var, lorem.words

' [ 4 10 ] var, lorem.numwords
' [ 5 10 ] var, lorem.numsentences
' [ 3  6 ] var, lorem.numparagraphs

to lorem.sentence do
    $ ""
    :lorem.numwords unpack random.range times do
        :lorem.words random.choose
        $ " " ++ ++
    end
    behead upper swap ++
    reverse$ behead drop reverse$
    $ "." ++
end

to lorem.paragraph do
    $ ""
    :lorem.numsentences unpack random.range times do
        lorem.sentence
        $ " " ++ ++
    end
    reverse$ behead drop reverse$
end

to lorem do
    $ ""
    :lorem.numparagraphs unpack random.range times do
        lorem.paragraph
        $ "

"       ++ ++
    end
    reverse$ behead drop reverse$
end
