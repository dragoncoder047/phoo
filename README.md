# Phoo
## Pleas note the new URL: [https://**phoo-lang**.github.io/phoo/](https://phoo-lang.github.io/phoo/)

<!-- cSpell:ignore phoo -->

**Not thoroughly tested, some features don't work**

Phoo is a programming language inspired by [Quackery][], bearing resemblance to both [Forth][] and [Ruby][] at the same time, and with elements of [Python][], [Lua][], and possibly some other esoteric languages that I can't remember. And it's (mostly) bootstrapped.

Phoo is an easy-to-learn scripting language suitable for embedding. Phoo is able to leverage (most) all of the power of the Javascript environment it is run in, and is a simple and concise scripting language suitable for many applications.

The Phoo interpreter-compiler environment plus its (for the time being) minimalist standard library are distributed as a web app which can be found at <https://dragoncoder047.github.io/phoo/>. The Phoo interpreter is easily extensible and embeddable by defining Javascript callbacks for the script to hook into.

[Quackery]: https://github.com/GordonCharlton/Quackery
[Forth]: https://www.forth.com/forth/
[Ruby]: https://www.ruby-lang.org/
[Python]: https://www.python.org/
[Lua]: https://www.lua.org/

The documentation (which is minimal for the time being) can be found at <https://dragoncoder047.github.io/phoo/docs/index.html>.

## Credits

* The Phoo web app's terminal uses Jakub T. Jankiewicz's [jquery.terminal plugin](https://github.com/jcubic/jquery.terminal). MIT license.
* The font used is the "IBM CGA" font by VileR found at <https://int10h.org/oldschool-pc-fonts/>. CC BY-SA 4.0 license.
* The `lorem` module was adapted from [@sfischer13/python-lorem](https://github.com/sfischer13/python-lorem). MIT license.
* The code for `random.normaldist` and `random.expodist` was taken from the [Python `random` module](https://github.com/python/cpython/blob/86a5e22dfe/Lib/random.py). The code for the random number generator itself is from [Bob Jenkins](https://burtleburtle.net/bob/rand/smallprng.html).
* The `math/floatingpoint` and `math/integer` modules' code is copied (mostly) from Lode Vandevenne's [LogicEmu](https://github.com/lvandeve/logicemu) (MIT license), except for Minkowski's question-mark function, which is taken from the [wikipedia article](https://en.wikipedia.org/wiki/Minkowski%27s_question-mark_function#Algorithm).
