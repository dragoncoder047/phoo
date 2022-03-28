/**
 * @fileoverview
 * Main import file for Phoo.
 * Also includes some helpers at the bottom.
 * Contains functions defining the import system of Phoo, and for starting a fresh new Phoo instance.
 *
 * This module assumes a browser environment (i.e., the [`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
 * and [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#:~:text=There%20is%20also%20a%20function-like%20dynamic%20import()) APIs),
 * so you will need to edit this file if you are using Nodejs.
 */

import { BasePhoo } from './base.js';
import { BadSyntaxError, ModuleNotFoundError, TypeMismatchError } from './errors.js';
import { Module } from './namespace.js';
import { type, name, word } from './utils.js';
import { module as builtinsModule } from '../lib/builtins.js';

/**
 * A Phoo interpreter.
 */
export class Phoo extends BasePhoo {
    /**
     * @param {Object} [opts={}] options
     * @param {Object} [opts.settings] Settings to start a new Thread with.
     * @param {Array<any>} [opts.settings.stack=[]] The initial items into the stack.
     * @param {number} [opts.settings.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     * @param {boolean} [opts.settings.strictMode=true] Enable or disable strict mode (see {@linkcode Phoo.strictMode})
     * @param {string} [opts.settings.namepathSeparator=':'] Separator used to split name paths in modules (e.g. `math:sqrt`)
     * @param {Module} [opts.mainModule] The global (`__main__`) module
     * @param {Map<string, Module>} [opts.modules] The loaded modules cache.
     */
    constructor(opts) {
        super(opts);
        this.mainModule.words.add('import', [this.meta_import]);
        this.modules = opts.modules || new Map();
    }

    /**
     * This function implements the import system of Phoo (the word `import`).
     * @this {Thread}
     */
    async meta_import() {
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
            if (self.phoo.mainModule.findSubmodule(mname) !== null)
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
                    throw new ModuleNotFoundError('Fetch error');
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
            self.phoo.mainModule.submodules.set(mname, m);
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

}


/*re*/export { word, name, w } from './utils.js';
/*re*/export * from './errors.js';
/*re*/export * from './constants.js';
/*re*/export * from './namespace.js';
/*re*/export * from './constants.js';

//-------------------------Helpers------------------------

/**
 * Add a function easily as a word, taking the arguments in order off the
 * top of the stack and pushing the return value.
 * @param {Namespace} ns The namespace instance to add to.
 * @param {Array<string|RegExp>} inputTypes The names of the acceptable types for each parameter.
 * @param {string} [name] The name of the word (default: the `name` of the function)
 * @param {function} func The function (duh)
 */
export function addFunctionAsWord(ns, inputTypes, name, func) {
    if (type(name) == 'function') { // allow name to be omitted
        func = name;
        name = func.name;
    }
    function wordFunction() {
        this.expect(...inputTypes);
        var args = [];
        for (var i = 0; i < inputTypes.length; i++)
            args.push(this.pop());
        this.push(func.apply(this, args));
    }
    ns.words.add(name, wordFunction);
}

/**
 * Naively compile the string, converting each word into its corresponding symbol,
 * not invoking macros or literalizers.
 * @param {string} string
 * @returns {symbol[]}
 */
export function naiveCompile(string) {
    return string.split(/\s+/).map(word);
}

// cSpell:ignore symstr

/**
 * Runs the builtin modules on the Phoo instance, initializing it for basic use.
 * @param {Phoo} p The {@linkcode Phoo} instance to load onto.
 * @returns {Promise<void>} When initialization is complete.
 */
export async function initBuiltins(p) {
    if (!p.mainModule.findSubmodule('__builtins__')) {
        p.mainModule.submodules.set('__builtins__', builtinsModule);
        var resp = await fetch('./lib/builtins.ph');
        if (resp.status >= 300)
            throw new ModuleNotFoundError('Fetch error');
        await p.spawn(await resp.text(), builtinsModule, true);
    }
}
