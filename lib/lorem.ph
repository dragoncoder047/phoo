/* 
https://github.com/sfischer13/python-lorem/blob/master/lorem/text.py
*/

use random

var lorem.words

$ "adipisci aliquam amet consectetur dolor dolore dolorem eius est et
incidunt ipsum labore magnam modi neque non numquam porro quaerat qui
quia quisquam sed sit tempora ut velit voluptatem" split$ is :lorem.words

to lorem.sentence do
    $ ""
    4 10 random.range times do
        :lorem.words random.choose
        $ " " ++ ++
    end
    behead upper swap ++
    reverse$ behead drop reverse$
    $ "." ++
end

to lorem.paragraph do
    $ ""
    5 10 random.range times do
        lorem.sentence
        $ " " ++ ++
    end
    reverse$ behead drop reverse$
end

to lorem do
    $ ""
    3 6 random.range times do
        lorem.paragraph
        $ "

"       ++ ++
    end
    reverse$ behead drop reverse$
end