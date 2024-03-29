# Phoo

> **Note**
> 
> While I am sad to do this, Phoo is now archived.
> 
> I haven't been able to work on this much at all lately, and I still can't figure out the bugs, so I am abandoning Phoo.
> 
> If you are interested, you can always fork Phoo. If youur changes are something important (like fixing a bug!) you can let me know on [my username repository](https://github.com/dragoncoder047/dragoncoder047/discussions) and I'll happily unarchive this repository and have a look at your pull request. Until then, this repository will be archived.

<!-- cSpell:ignore phoo -->

A programming language that's supposed to look like this:

```forth
$ "0000000000000000000000000000000000001" var, world
110 var, rule
to tick do
    :world ' [ $ "" ] .split() ' do
        :world i^ 1- peek swap ++
        :world i^ 1+ :world len mod peek ++
        2 $>num bit :rule & 0 = iff $ "0" else $ "1"
    end map
    ' ++ fold is world
end
to printworld do
    :world ' do
        $ "1" = iff $ "[[;;white]&nbsp;]"
        else $ "&nbsp;"
    end map
    ' ++ fold
    echo
end
' [ printworld tick ] functionize nested 30 concat window swap .setInterval()
```

**Not thoroughly tested, some features don't work, the shell is broken.**

Phoo is a stack-based programming language inspired by [Quackery][], bearing resemblance to both [Forth][] and [Ruby][] at the same time, and with elements of [Python][], [Lua][], and possibly some other esoteric languages that I can't remember.

The Phoo interpreter-compiler environment plus its (for the time being) minimalist standard library can be explored at this web app: <https://dragoncoder047.github.io/phoo/tryit/tryit.html>. Currently this doesn't work the way it should, and I have no idea as to why. Use at your own risk - it may crash your browser from time to time.

[Quackery]: https://github.com/GordonCharlton/Quackery
[Forth]: https://www.forth.com/forth/
[Ruby]: https://www.ruby-lang.org/
[Python]: https://www.python.org/
[Lua]: https://www.lua.org/

The documentation (which is minimal for the time being) can be found at <https://dragoncoder047.github.io/phoo/docs/index.html>.

## Installation and usage

Phoo is not published to NPM (yet!), so the best way to install Phoo is with git.

```bash
git clone https://github.com/phoo-lang/phoo.git
```

In all practicicality, only the `src/` and `lib/` directories are necessary, so you can delete everything else. Please note that there are files in `lib/` that reference files in `src/`, so the two directories must be put next to each other.

Once that is done, import `Phoo`, `initBuiltins`, and whatever loaders are necessary (all exported by `src/index.js`) to set up and start Phoo:

```js
import { Phoo, initBuiltins, FetchLoader, ES6Loader } from 'phoo/src/index.js';
async function main() {
    const p = new Phoo({ loaders: [new FetchLoader('phoo/lib/'), new ES6Loader('../lib/')] });
    const thread = p.createThread('__main__');
    await initBuiltins(thread, 'phoo/lib/builtins.ph');
    await thread.run(/* some code as a string */);
    /* now do something with thread.workStack */
}
main()
```

> **Note**
> 
> Relative paths passed to the `FetchLoader` and the `ES6Loader` are different because of how the semantics of `fetch()`/`import()` differ. With a relative path, the `FetchLoader` uses the directory of the page's `.html` file is in as the root, whereas the `ES6Loader` uses the directory of the file that `import()` is called from (which is always `src/`). Make sure you keep this in mind when you set up the paths.

Another good example is the Phoo web REPL, which runs Phoo code in a callback; [code for that here](https://github.com/phoo-lang/phoo-lang.github.io/blob/main/app/main.js).

### Use with a bundler (webpack, browserify, rollup, etc.)

As Phoo is *not* pure JS, bundling all the yes-JS files into one and only using that will likely cause hiccups when the non-JS (Phoo) files are searched for and not found. As such, those files will also have to be served alongside the JS bundle. If that is not possible, you can fork this repository and try to write a plugin for your bundler that bundles Phoo files as a string constant module. I am not sure how that will affect the dynamic loading with `fetch()` and that will likely have to be patched as well. I am not going to do this myself as I do not use a bundler.

## Credits

* The `lorem` module was adapted from [@sfischer13/python-lorem](https://github.com/sfischer13/python-lorem). MIT license.
* The code for `random.normaldist` and `random.expodist` was taken from the [Python `random` module](https://github.com/python/cpython/blob/86a5e22dfe/Lib/random.py). The code for the random number generator itself is from [Bob Jenkins](https://burtleburtle.net/bob/rand/smallprng.html).
* The `math/floatingpoint` and `math/integer` modules' code is copied (mostly) from Lode Vandevenne's [LogicEmu](https://github.com/lvandeve/logicemu) (MIT license), except for Minkowski's question-mark function, which is taken from the [wikipedia article](https://en.wikipedia.org/wiki/Minkowski%27s_question-mark_function#Algorithm).
