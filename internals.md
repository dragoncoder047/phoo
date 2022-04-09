# The Internals of Phoo

<!-- cSpell:ignore phoo -->
<!-- [TOC] -->

A the highest level a Phoo system looks like this:

* A `Phoo` instance, which acts as the global "manager" for controlling and executing code.
* One or more `Thread`s that actually do the compiling and running of the code.
* `Module`s that the threads jump in and out of, fetch definitions from, and write new definitions to while running code.
* `Importer`s attached to the main Phoo manager instance that fetch external modules from wherever they are stored so they can be run.

In code, the simplest example looks like this:

```js
import { Phoo, initBuiltins, FetchImporter, ES6Importer } from 'phoo/src/index.js';
async function main() {
    const p = new Phoo({ importers: [new FetchImporter('lib/'), new ES6Importer('lib/')] });
    await initBuiltins(p);
    const thread = p.createThread('__main__');
    const code = /* some code */;
    await thread.run(code);
    /* now do something with thread.workStack */
}
main()
```
