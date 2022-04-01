* [ ] DOCUMENTATION!!!
* [ ] Finish core
    * [ ] ~~`local`~~ `@inline`
        * [ ] Have `to` automatically under-the-hood create a new scope and meta-def to actually do the defining
    * [X] Rename `builder` to ~~`new-macro!`~~ `macro` as a macro
    * [ ] (and follow convention that macros end with `!`)
    * ~~[ ] `import!` for importing macros and literalizers~~ Just use `now!`.
    * Renaming
        * [X] `[`/`]` -> `do`/`end`?
        * [X] `def` -> `to`
        * [ ] `say` -> `echo`
    * [ ] Fix bug in `execute`: record return stack depth and return when it gets back to that, not when it gets to 0
    * [X] Have separate `thread` and have that manage threads (each have own work and return stacks, but shared ~~namespaces~~ modules)
    * [ ] Namespacing:
        * [ ] Instead of having tree of nested Phoo interpreters, have a `sys.modules` map &agrave; la Python
        * [ ] Namespace stack for modules, classes, etc.
* [ ] Web app
* [ ] Modules:
    * [X] Big-math (logic emu)
    * [ ] p5.js
    * [ ] tone.js
    * [ ] jquery (DOM)
* Ideas:
    * [ ] Use literalizer `$foo` to make variables and `->` (using `]'[`) to set them
    * [X] Getter: `.prop`, setter: `.prop=`, caller `.prop()`, no-arg caller `.prop@`
    * [ ] Create different type of block (maybe using `{}` instead of using `[]`) that records its depth when entering and cleans up stack when an error is propagating
        * [ ] maybe just have `{}` make an 'anonymous function'-ish thing?
    * [ ] Type system: `typedef`:
        * [ ] Trap `to` and `@inline` hooks and write them to an object that will be used in `:::js Object.create(prototype)`-like construct
        * [ ] Operator overloading &agrave; la Python:
            * Have methods called `__op_+__`, `__op_-__`, etc. for any custom operator.
            * [ ] New definer called `oper` that takes a symbol and an arity and walks the modules and defines that word in all of them
