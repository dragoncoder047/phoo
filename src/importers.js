/**
 * @fileoverview
 * Classes that import loaders for different types of Phoo modules.
 */

import { ModuleNotFoundError } from './errors.js';

/**
 * Base class for an finder - which locates and retrieves the Phoo code.
 */
export class BaseImporter {
    /**
     * @param {Phoo} phoo The owner that these modules will be loaded into.
     */
    setup(phoo) {
        this.phoo = phoo;
    }
    async find(name, currentModule) {
        throw 'override me';
    }
}

export class FetchImporter extends BaseImporter {
    constructor(basePath, fetchOptions = {}) {
        super();
        this.basePath = basePath;
        this.fetchOptions = fetchOptions;
    }
    async find(name, currentModule) {
        var qualName = this.phoo.qualifyName(name, currentModule);
        if (this.phoo.modules.has(qualName))
            return this.phoo.modules.get(qualName);
        var path = this.basePath + this.phoo.nameToURL(qualName) + '.ph';
        var resp = await fetch(path, this.fetchOptions);
        if (!resp.ok)
            throw new ModuleNotFoundError(`Module ${qualName} could not be imported`);
        var thread = this.phoo.createThread(qualName);
        await thread.run(await resp.text());
        return thread.module;
    }
}

export class ES6Importer extends BaseImporter {
    constructor(basePath, fetchOptions = {}) {
        super();
        this.basePath = basePath;
    }
    async find(name, currentModule) {
        var qualName = this.phoo.qualifyName(name, currentModule);
        if (this.phoo.modules.has(qualName))
            return this.phoo.modules.get(qualName);
        var path = this.basePath + this.phoo.nameToURL(qualName) + '.js';
        var mod;
        try {
            mod = await import(path);
        } catch(e) {
            throw ModuleNotFoundError.wrap(e);
        }
        return mod;
    }
}

/*

Grammar for imports:
import foo -> module foo in loaded modules
import* foo -> module foo in starred modules
importfrom foo [ bar baz ] -> module foo in loaded modules, bar and baz aliased to path
importfrom foo bar -> same as importfrom foo [ bar ]
import $ "/path/to/x.ph" -> some url imported as x



This here is probably all dead.

/**
 * This function implements the import system of Phoo (the word `import`).
 * @this {Thread}
 *
async function meta_import() {
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
            for (var m in w1) { /* jshint ignore:line * /
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



*/
