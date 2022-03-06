/**
 * @fileoverview
 * Contains functions defining the import system of Phoo, and for starting a fresh new Phoo instance.
 *
 * This module assumes a browser environment (i.e., the [`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * and [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#:~:text=There%20is%20also%20a%20function-like%20dynamic%20import()) APIs),
 * so you will need to edit this file if you are using Nodejs.
 */

// cSpell:ignore symstr

import { BadSyntaxError, IllegalOperationError, UnreachableError, ModuleNotFoundError, TypeMismatchError } from '../core/errors.js';
import { Phoo } from '../core/index.js';
import { Module } from '../core/namespace.js';
import { type, name } from '../core/utils.js';
import { module as builtinsModule } from './builtins.js';

/**
 * Runs the builtin modules on the Phoo instance, initializing it for basic use.
 * @param {Phoo} p The {@linkcode Phoo} instance to load onto.
 * @param {boolean} [allowImport=false] Whether to add the `import` word as well, to allow the module to import other modules. Default false to prevent unintended security issues by allowing malicious users to import bad code.
 * @returns {Promise<void>} When initialization is complete.
 */
export async function initBuiltins(p, allowImport = false) {
    if (!p.namespaceStack.includes(builtinsModule))
        p.namespaceStack.unshift(builtinsModule);
    var resp = await fetch('./builtins.ph');
    if (resp.status >= 300)
        throw new UnreachableError('Fetch error');
    p.namespaceStack.push(builtinsModule); // <<+-- these are to make sure the definitions end up in the builtins module
    await p.run(await resp.text());        //   |
    p.namespaceStack.pop();                // <<+
    if (allowImport) p.namespaceStack[0].words.add('import', [meta_import]);
}

/**
 * This function implements the import system of Phoo (the word `import`).
 * @this {Thread}
 */
export async function meta_import() {
    const self = this;
    async function next(type) {
        await self.run("]'[");
        self.expect(type);
        return self.pop();
    }

    async function nextSymStr() {
        return name(await next('symbol'));
    }

    async function backup() {
        await self.run('false -1 ]cjump[');
    }

    async function importFromURL(url, mname, wildcard = false) {
        if (self.phoo.modules.some(m => m.name === mname))
            return; // already loaded the module
        self.phoo.namespaceStack.push(new Module(mname));
        var urlPH = url.replace(/js$/, 'ph');
        var urlJS = url.replace(/ph$/, 'js');
        async function loadFromJS() {
            var mod = await import(urlJS); // jshint ignore:line
            self.phoo.namespaceStack.pop();
            self.phoo.namespaceStack.push(mod.module);
        }
        async function loadFromPH() {
            var resp = await fetch(urlPH);
            if (resp.status >= 300)
                throw new UnreachableError('Fetch error');
            var text = await resp.text();
            await self.run(text);
        }

        if (url.endsWith('.js')) {
            try {
                loadFromJS();
            }
            catch (e) {
                loadFromPH();
            }
        } else {
            try {
                loadFromPH();
            }
            catch (e) {
                loadFromJS();
            }
        }
        var m = self.phoo.namespaceStack.pop();
        if (wildcard) self.phoo.namespaceStack.push(m);
        self.phoo.modules.push(m);
    }

    function alias(n, a) {
        self.phoo.getNamespace(0).words.add(a, w(n));
    }

    async function importFromName(n, wildcard = false) {
        await importFromURL(n.startsWith('_') ? `./${n.slice(1)}.js` : `./${n.replace(self.phoo.namepathSeparator, '/')}.ph`, n, wildcard);
    }

    var w1 = await next(/symbol|array|string/);
    var w1n, w2n, w3, w3n, w4n, w5n;
    if (type(w1) === 'symbol') {
        // import XX ...
        w1n = name(w1);
        if (w1n === '*') {
            // import * from foo
            // import * from [ foo bar ]
            // import * from $ '/path/to/module.ph'
            w2n = await nextSymStr();
            if (w2n !== 'from')
                throw new BadSyntaxError('import: expected \'from\' after \'import *\'');
            w3 = await next(/symbol|array|string/);
            if (type(w3) !== 'array') w3 = [w3];
            for (var m of w3) {
                switch (type(m)) {
                    case 'symbol':
                        await importFromName(name(m), true);
                        break;
                    case 'string':
                        await importFromURL(m, `urlimport-${m}`, true);
                        break;
                    default:
                        throw new TypeMismatchError(`import: can\'t do wildcard import on ${type(m)}`);
                }
            }
        }
        else {
            // import foo
            // import foo as bar
            // import foo as bar from baz
            // import foo from bar
            // import foo from bar as baz
            w2n = await nextSymStr();
            if (w2n !== 'as' || w2n !== 'from') {
                backup(); // undo call to next()
                await importFromName(w1n);
            }
            else if (w2n === 'as') {
                w3n = await nextSymStr();
                w4n = await nextSymStr();
                if (w4n !== 'from') {
                    // import foo as bar
                    backup();
                    await importFromName(w1n, w3n);
                }
                else {
                    // import foo as bar from baz
                    w5n = await nextSymStr();
                    await importFromName(w5n);
                    alias(`${w5n}${this.namepathSeparator}${w1n}`, w3n);
                }
            }
            else if (w2n === 'from') {
                // import foo from bar
                // import foo from bar as baz
                w3n = await nextSymStr();
                w4n = await nextSymStr();
                await importFromName(w3n);
                if (w4n !== 'as') {
                    backup();
                    alias(`${w3n}${this.namepathSeparator}${w1n}`, w1n);
                } else {
                    w5n = await nextSymStr();
                    alias(`${w3n}${this.namepathSeparator}${w1n}`, w5n);
                }
            }
        }
    } else if (type(w1) === 'string') {
        // import $ '/path/to/module.ph' as module
        w2n = await nextSymStr();
        if (w2n !== 'as')
            throw new BadSyntaxError('import: expected \'as\' after \'import <url>\'');
        w3n = await nextSymStr();
        await importFromURL(w1, `urlimport-${w1}`, w3n);
    } else if (type(w1) === 'array') {
        // import [ foo bar ]
        // import [ foo bar ] from baz
        w2n = await nextSymStr();
        if (w2n !== 'from') {
            backup();
            for (var m in w1) { /* jshint ignore:line */
                switch (type(m)) {
                    case 'symbol':
                        await importFromName(name(m));
                        break;
                    default:
                        throw new TypeMismatchError(`import: expected array of names, not ${type(m)}`);
                }
            }
        } else {
            w3n = await nextSymStr();
            await importFromName(w3n);
            for (var n of w1) {
                var nn = name(n);
                alias(`${w3n}${this.namepathSeparator}${nn}`, nn);
            }
        }
    }
}