# The Internals of Phoo (Javascript)

<!-- cSpell:ignore phoo -->
[TOC]

A the highest level a Phoo system looks like this:

* A `Phoo` instance, which acts as the global "manager" for controlling and executing code.
* One or more `Thread`s that actually do the compiling and running of the code.
* `Scopes`s that the threads jump in and out of, fetch definitions from, and write new definitions to while running code.
* `Loader`s attached to the main Phoo manager instance that fetch external modules from wherever they are stored (filesystem, network, RAM, etc) so they can be run.

In code, the simplest example looks like this:

```js
import { Phoo, initBuiltins, FetchLoader, ES6Loader } from 'phoo/src/index.js';
async function main() {
    const p = new Phoo({ loaders: [new FetchLoader('lib/'), new ES6Loader('../lib/')] });
    const thread = p.createThread('__main__');
    await initBuiltins(thread, '/path/to/builtins.ph');
    await thread.run(/* some code as a string */);
    /* now do something with thread.workStack */
}
main()
```

Line 1 imports the required functions from the Phoo source code. Line 3 creates the Phoo manager class. (Do note the paths passed to `ES6Loader` -- for some odd reason **it's relative to the `src/` directory!**) Line 4 creates a thread (the name of `__main__` is only a convention borrowed from Python; it doesn't have to be that) and line 5 sets up the builtin library on the thread. Then line 6 runs whatever code needs to be run. The rest of it is up to you!

## Inside the `Thread`

The process triggered by calling `:::js thread.run('some code')` is complex. On the highest level, it is simply this:

1. Compile the code into some lower-level bytecode representation.
2. Step through the bytecode to execute it.

Granted, that can probably be said of many of the other mainstream scripting languages -- Python, Ruby, Lua, even Forth, which Phoo is most like syntactically -- but Phoo's approach is even a little different from Forth's.

### Program Structure

Gordon Charlton's [Quackery](https://github.com/GordonCharlton/Quackery) programming language was the main inspiration for Phoo, and so their internal bytecode representations are the most similar. Bytecode in the sense that Python and Lua use is actually a misnomer for Phoo (and Quackery), actually. The compiled representation of a program is a tree of nested arrays filled with instructions. This way, control structures need only jump over one or two elements (which may be sub-arrays containing whole blocks of code) instead of an arbitrarily large number of instructions as would be the case with a flat bytecode array. This makes compiling fast and simple.

### Thread State

The state of any thread at any time is controlled by two stacks: the **work stack** and the **return stack**. The work stack stores the data values that the program is operating on, and the return stack stores entries necessary for returning from function calls and implementing control structures. In practice there is an additional entry held in a separate variable (called the 'current state'), and so pushing and popping from the return stack doesn't actually push and pop the 'top' item because it isn't actually on the stack. This prevents accidental corruption of the current state, and allows meta-words (which access the returns stack) to be used within user-defined words to implement new control structures.

### Compilation

In a program, there can be many different elements to the syntax, such as strings, numbers, lists, definitions, boolean values, even precompilable constants. This may seem complex, but the simplicity of Phoo lies in realizing they can all be classified into three categories:

* **literals**, which represent just that, a specific string, number, boolean, or other value,
* **macros**, which provide syntactic sugar for common tasks and workarounds for any limitations, and
* **words**, which cover everything else.

Given a source string, the process of compilation is dead simple:

1. Initialize an empty array as the currently compiled array.
2. Chop off the first 'word' in the source string, a 'word' being any sequence of non-whitespace characters separated by whitespace.
3. Look up the word to see if it has been defined as a macro. If it is:
    1. Push the rest of the source string after the macro and the currently compiled array to the work stack, to give the macro access to them.
    2. Run the macro's code.
    3. Pop the (possibly modified) array and string back off the stack.
4. If it is not a macro, test it against the regular expressions that match literals (which I call 'literalizers' for lack of a better word). If any match:
    1. Push the match object to the work stack.
    2. Run the literalizer's code to turn it into the actual value it represents.
    3. Pop the value off the stack and add it to the current array.
5. If it is neither a macro nor a literalizer, simply turn it into a Javascript `:::js Symbol` and add it to the array. The word will be looked up later, during execution.
6. If there is still code left to be compiled, go back to step 2.

There's no complicated PEG grammar like Python has. Because whitespace is largely ignored (aside from there actually being some), there are absolutely no restrictions on formatting.

### Execution

While compilation is simple, execution is even simpler. Execution proceeds following these steps (beginning, of course, with compiling the code if it isn't already):

1. Record the initial return stack depth, push the old state to the return stack, and initialize the new state. The new state consists of the array being run, the program counter (index in the array) of the next item to be run, and a couple more state variables that handle the current module the code is running in so imports can be resolved (more on that later).
2. Step through the program:
    1. Get the item at the current index of the array.
    2. If it is a symbol, look up its definition using the name-lookup procedure (below).
    3. If the definition is a function, call the function.
    4. If it is an array, push the old state to the return stack, and set the new state to the beginning of this sub-array.
    5. Otherwise, it is just an object literal. Push it to the work stack.
3. Repeat step 2 until the return stack returns to its original length.

That's all there is to execution.

## Module System

Phoo's naming system is largely governed by the user. Each thread is isolated in its own module, but within the module, all names are counted as in the "global" scope. That is, if you define a function within a function, that inner function can still be accessed from outer functions. This also applies to modules -- whereas `:::py import mymodule` in Python would put all the functions "inside" the `mymodule` module object, `:::phoo use mymodule` in Phoo is more like `:::ruby require 'mymodule'` in Ruby, in that it just behaves as if you had pasted all the code in that module in place of the `:::phoo use` statement.

Due to the fact that names are not scoped, most of the modules in the standard library observe a manual (yes, manual!) naming convention of `<module>.<name>` (for example, `random.choose`) to avoid name collisions. You don't have to follow this convention if you don't like it, and it may even be advantageous not to if the words are very commonly used (such as those from the `math` module -- none are namespaced).

### Word Lookup

In the simplest case, the only thing looking up a word entails is a simple map lookup. If the word is in the map, its definition is retrieved, and if it isn't, some word-not-found procedure is run (which usually involves throwing an error).

There are some edge cases, however. If a word is *aliased* to mean another word, the definition retrieved will be a `:::js Symbol`. This case is detected and the word-lookup procedure is repeated until the retrieved definition isn't a Symbol.

A Phoo thread also has a third, "shadow", stack it manages during execution, called the **scope stack**. This stack isn't used much because it is only brought into play manually. When it is used, however, it adds a little more complexity to the lookup procedure. When there are scopes on the scope stack, the top scope is searched first for a local definition, and if it is not found, the next one under that, and so on up to the global scope. Only if it is not found anywhere is the word-not-found procedure run.
