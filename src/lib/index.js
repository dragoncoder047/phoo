/**
 * @fileoverview
 * Contains functions defining the import system of Phoo, and for starting a fresh new Phoo instance.
 *
 * This module assumes a browser environment (i.e., the [`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * and [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#:~:text=There%20is%20also%20a%20function-like%20dynamic%20import()) APIs),
 * so you will need to edit this file if you are using Nodejs.
 */

// cSpell:ignore symstr

import { DubiousSyntaxError, IllegalOperationError, UnreachableError, ModuleNotFoundError } from '../core/errors.js';
import { Phoo } from '../core/index.js';
import { type, name } from '../core/utils.js';
import { init as loadLowLevel } from './builtins.js';

/**
 * Runs the builtin modules on the Phoo instance, initializing it for basic use.
 * @param {Phoo} p The {@linkcode Phoo} instance to load onto.
 * @param {boolean} [allowImport=false] Whether to add the `import` word as well, to allow the module to import other modules. Default false to prevent unintended security issues by allowing malicious users to import bad code.
 * @returns {Promise<void>} When initialization is complete.
 */
export async function initBuiltins(p, allowImport = false) {
    /**await /**/loadLowLevel(p);
    var resp = await fetch('./builtins.ph');
    if (resp.status >= 300)
        throw new UnreachableError('Fetch error');
    await p.run(await resp.text());
    if (allowImport) p.addWord('import', import_);
}

/**
 * This function implements the import system of Phoo (the word `import`).
 */
export async function import_() {
    const self = this;
    async function next(...types) {
        await self.run("]'[");
        return self.pop(...types);
    }

    async function backup() {
        await self.run('false -1 ]cjump[');
    }

    async function importFromURL(url, mname, alias) {
        if (self.children.filter(m => m.moduleName === mname && m.aliasName === alias).length)
            return; // already loaded the module
        var newPhoo;
        if (alias !== '*') {
            newPhoo = new Phoo({
                stack: self.workStack,
                moduleName: mname,
                aliasName: alias,
                parentModule: self,
                maxDepth: self.maxDepth,
                namepathSeparator: self.namepathSeparator,
            });
            await initBuiltins(newPhoo, true);
        }
        else {
            newPhoo = self;
        }
        var resp, jsMod;
        if (url.endsWith('.js')) {
            try {
                jsMod = await import(url); /* jshint ignore:line */
                await jsMod.init(newPhoo);
            }
            catch (e) {
                // try phoo code
                resp = await fetch(url.replace(/.js$/, '.ph'));
                if (resp.status >= 300)
                    throw new ModuleNotFoundError('Fetch error');
                await newPhoo.run(await resp.text());
            }
        }
        else {
            resp = await fetch(url);
            if (resp.status >= 300) {
                // try javascript module
                try {
                    jsMod = await import(url.replace(/.ph$/, '.js')); /* jshint ignore:line */
                    await jsMod.init(newPhoo);
                }
                catch (e) {
                    throw new ModuleNotFoundError('Fetch error');
                }
            }
            await newPhoo.run(await resp.text());
        }
        if (alias !== '*') {
            self.children.push(newPhoo);
        }
    }

    function alias(n, a) {
        self.addWord(a, w(n));
    }

    async function importFromName(n, alias) {
        await importFromURL(n.startsWith('_') ? `./${n.slice(1)}.js` : `./${n}.ph`, n, alias);
    }

    var w1 = await next('symbol', 'array', 'string');
    var w1n, w2n, w3, w3n, w4n, w5n;
    if (type(w1) === 'symbol') {
        // import XX ...
        w1n = name(w1);
        if (w1n === '*') {
            // import * from foo
            // import * from [ foo bar ]
            // import * from $ '/path/to/module.ph'
            w2n = await next('>symstr');
            if (w2n !== 'from')
                throw new DubiousSyntaxError('import: expected \'from\' after \'import *\'');
            w3 = await next('symbol', 'array', 'string');
            if (type(w3) !== 'array') w3 = [w3];
            for (var m of w3) {
                switch (type(m)) {
                    case 'symbol':
                        await importFromName(name(m), '*');
                        break;
                    case 'string':
                        await importFromURL(m, `urlimport-${m}`, '*');
                        break;
                    default:
                        throw new IllegalOperationError(`import: can\'t do wildcard import on ${type(m)}`);
                }
            }
        }
        else {
            // import foo
            // import foo as bar
            // import foo as bar from baz
            // import foo from bar
            // import foo from bar as baz
            w2n = await next('>symstr');
            if (w2n !== 'as' || w2n !== 'from') {
                backup(); // undo call to next()
                await importFromName(w1n);
            }
            else if (w2n === 'as') {
                w3n = await next('>symstr');
                w4n = await next('>symstr');
                if (w4n !== 'from') {
                    // import foo as bar
                    backup();
                    await importFromName(w1n, w3n);
                }
                else {
                    // import foo as bar from baz
                    w5n = await next('>symstr');
                    await importFromName(w5n);
                    alias(`${w5n}${this.namepathSeparator}${w1n}`, w3n);
                }
            }
            else if (w2n === 'from') {
                // import foo from bar
                // import foo from bar as baz
                w3n = await next('>symstr');
                w4n = await next('>symstr');
                await importFromName(w3n);
                if (w4n !== 'as') {
                    backup();
                    alias(`${w3n}${this.namepathSeparator}${w1n}`, w1n);
                } else {
                    w5n = next('>symstr');
                    alias(`${w3n}${this.namepathSeparator}${w1n}`, w5n);
                }
            }
        }
    } else if (type(w1) === 'string') {
        // import $ '/path/to/module.ph' as module
        w2n = await next('>symstr');
        if (w2n !== 'as')
            throw new DubiousSyntaxError('import: expected \'as\' after \'import <url>\'');
        w3n = await next('>symstr');
        await importFromURL(w1, `urlimport-${w1}`, w3n);
    } else if (type(w1) === 'array') {
        // import [ foo bar ]
        // import [ foo bar ] from baz
        w2n = await next('>symstr');
        if (w2n !== 'from') {
            backup();
            for (var m in w1) { /* jshint ignore:line */
                switch (type(m)) {
                    case 'symbol':
                        await importFromName(name(m));
                        break;
                    default:
                        throw new IllegalOperationError(`import: expected array of names, not ${type(m)}`);
                }
            }
        } else {
            w3n = await next('>symstr');
            await importFromName(w3n);
            for (var n of w1) {
                var nn = name(n);
                alias(`${w3n}${this.namepathSeparator}${nn}`, nn);
            }
        }
    }
}