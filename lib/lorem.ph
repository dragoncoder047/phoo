/* >>
plain>
Lorem Ipsum generator based upon [@sfischer13/python-lorem](https://github.com/sfischer13/python-lorem/blob/master/lorem/text.py).
*/

use random

$ "adipisci aliquam amet consectetur dolor dolore dolorem eius est et
incidunt ipsum labore magnam modi neque non numquam porro quaerat qui
quia quisquam sed sit tempora ut velit voluptatem" split$

/* >>
word> :lorem.words
description> the variable `lorem.words` is a list of words that will randomly be chosen between to generate lorem ipsum.
sed> -- a
*/
var, lorem.words

/* >>
word> :lorem.numwords
description> controls the number of words per sentence in [[lorem.sentence]].
sed> -- a
*/
' [ 4 10 ] var, lorem.numwords

/* >>
word> :lorem.numsentences
description> controls the number of sentences per paragraph in [[lorem.paragraph]].
sed> -- a
*/
' [ 5 10 ] var, lorem.numsentences

/* >>
word> :lorem.numparagraphs
description> controls the number of paragraphs in [[lorem]].
sed> -- a
*/
' [ 3  6 ] var, lorem.numparagraphs

/* >>
word> lorem.sentence
description> creates a random sentence of lorem ipsum.

The number of words in the sentence is controlled by the variable [[:lorem.numwords]].
sed> -- s
*/
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

/* >>
word> lorem.paragraph
description> creates a random paragraph of lorem ipsum.

The number of sentences in the paragraph is controlled by the variable [[:lorem.numsentences]].
sed> -- s
*/
to lorem.paragraph do
    $ ""
    :lorem.numsentences unpack random.range times do
        lorem.sentence
        $ " " ++ ++
    end
    reverse$ behead drop reverse$
end

/* >>
word> lorem
description> creates a few random pargraphs of lorem ipsum.

The number of paragraphs is controlled by the variable [[:lorem.numparagraphs]].
sed> -- s
*/
to lorem do
    $ ""
    :lorem.numparagraphs unpack random.range times do
        lorem.paragraph
        $ "

"       ++ ++
    end
    reverse$ behead drop reverse$
end
