Welcome to the Phoo documentation!

These pages contain the description for all the modules included in the Phoo standard distribution.

## How to read (and use) this documentation

For each word, the heading shows the word's *signature*, including lookaheads that the word expects to be written after it as well as the SED (stack-effect diagram) of the values the word expects to be on the stack before it, and leaves on the stack after it.

For example:

> ### `foo` *`bar`*{.shadowed} ( `a`*item description*{.dpar} &rarr; `b`*item description*{.dpar} `c`*item description*{.dpar} )

This means that the word `foo` expects one item after it (`bar`) which will be consumed in a lookahead operation, and also expect one item on the stack (`a`), and will leave two (`b` and `c`).

Usually the parameters are mentioned in the description, but there are more specific descriptions of the parameters in the SED. You can hover over or click on the parameter, and additional information will appear. (Try it with the one above.)

Aside from the builtins modules, which are imported automatically, write `use <module>` in your Phoo code to import the module. (This code is listed at the very top of every module page.)

Please note this doumentation is under active development and may change at any time.
