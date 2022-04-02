/**
 * @fileoverview
 * Contains the base runner for a Phoo-like program, as well as some typedefs
 * for often-used Phoo constructs.
 */

import { PhooError, StackOverflowError, StackUnderflowError, TypeMismatchError, PhooSyntaxError, BadNestingError, ExternalInterrupt } from './errors.js';
import { w, name, type } from './utils.js';
import { Scope } from './namespace.js';
import { Threadlock } from './locks.js';
import { Phoo } from './index.js';

/**
 * Configuration options.
 * @typedef {{parent: Phoo, module: Module, scopes: Scope[], starModules: Module[], modules: Module[], stack: any[], maxDepth: number}} IThreadOptions
 */

/**
 * this is the actual compiler/runner for the code
 */
export class Thread {

    /**
     * @param {IThreadOptions} [opts]
     * @param {Phoo} [opts.parent] Owner of this thread.
     * @param {Module} [opts.module] Module this thread is handling.
     * @param {Scope[]} [opts.scopes] The initial namespace stack.
     * @param {Module[]} [opts.starModules] Modules imported using import*.
     * @param {Module[]} [opts.modules] Pre-imported modules.
     * @param {any[]} [opts.stack=[]] The initial items on the work stack.
     * @param {number} [opts.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     */
    constructor({
        parent,
        module,
        starModules = [],
        modules = [],
        stack = [],
        scopes = [],
        maxDepth = 10000
    }) {
        /**
         * Owner of this thread.
         * @type {Phoo}
         */
        this.phoo = parent;
        /**
         * The module that this thread writes to.
         * @type {Module}
         */
        this.module = module;
        /**
         * Modules imported using import*.
         * @type {Module[]}
         */
        this.starModules = starModules;
         /**
         * Pre-loaded modules.
         * @type {Module[]}
         */
        this.modules = modules;
        /**
         * Stack that working values are pushed and popped from during execution.
         * @type {Array}
         * @default []
         */
        this.workStack = stack;
        /**
         * Stack of namespace scopes.
         * @type {Scope[]}
         */
        this.scopeStack = scopes;
        /**
         * Stack that outer arrays and current PC's are saved on
         * when the Phoo machine 'jumps in' to an inner array.
         * @type {Array<IPhooReturnStackEntry>}
         */
        this.returnStack = [];
        /**
         * The maximum length of {@linkcode Thread.returnStack}
         * before a {@linkcode StackOverflowError} error is thrown.
         * @type {number}
         * @default 10000
         */
        this.maxDepth = maxDepth;
        /**
         * @type {Threadlock}
         * @private
         */
        this.lock = new Threadlock();
    }

    /**
     * Callback when a non-array is encountered
     * during execution. Functions are simply called.
     * 
     * See property [strictMode]{@linkcode Phoo.strictMode} for the behavior of this.
     * @param {any} item Thing to be dealt with.
     */
    async executeOneItem(item) {
        if (type(item) === 'symbol')
            item = this.resolveNamepath(name(item));
        if (item === 'use loose')
            this.strictMode = false;
        else if (item === 'use strict')
            this.strictMode = true;
        else if (type(item) === 'function') {
            await item.call(this);
        }
        else
            this.push(item);
    }

    /**
     * Sequentially goes through and checks each regular expression
     * in {@linkcode Phoo.literalizers|:::js this.literalizers}, and when one matches, it pushes
     * the match result, runs the corresponding code, and pushes the
     * top value on the stack to the compiled array.
     * @param {string} word The word to be converted.
     * @param {Array} a The current array being compiled.
     * @returns {Promise<boolean>} Whether processing succeeded.
     */
    async compileLiteral(word, a) {
        for (var ns of this.scopeStack.concat([this.module]).reverse()) {
            for (var [regex, code] in ns.literalizers.map) {
                var result = regex.exec(word);
                if (result) {
                    this.push(result);
                    await this.run(code, true);
                    a.push(this.pop());
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Compile the code, but do not run it. This **will** invoke any macros and/or literalizers used.
     * @param {string|Array} source The code to be compiled. If it is an array already, this will just return it unchanged.
     * @param {boolean} [hasLockAlready=false] ***FOR INTERNAL USE ONLY!!!***
     * @returns {Promise<Array>}
     */
    async compile(source, hasLockAlready = false) {
        switch (type(source)) {
            case 'string':
                break; // default behavior
            case 'array':
                return source; // assume already compiled
            default:
                return [source]; // just wrap it
        }
        var unlock;
        if (!hasLockAlready) unlock = await this.lock.acquire();
        var code = source.slice();
        var origLength = this.workStack.length;
        var word, b, a = [];
        try {
            while (code.length > 0) {
                [, word, code] = /(\s+)(.*)/s.exec(code.trim()); /*jshint ignore:line*/
                b = this.resolveNamepath(word, 'macros');
                if (b !== undefined) {
                    this.push(a);
                    this.push(code);
                    switch (type(b)) {
                        case 'function':
                            await b.call(this);
                            break;
                        case 'array':
                            if (!hasLockAlready) unlock();
                            await this.execute(b, forceNoLock);
                            if (!hasLockAlready) unlock = await this.lock.acquire();
                            break;
                        default:
                            throw new TypeMismatchError(`Unexpected ${type(source)} as macro.`);
                    }
                    this.expect('string', 'array');
                    code = this.pop();
                    a = this.pop();
                }
                else { // try looking up in literals
                    var succeeded = await this.compileLiteral(word, a);
                    if (!succeeded) {
                        a.push(w(word));
                    }
                }
            }
        }
        catch (e) {
            throw PhooSyntaxError.wrap(e, this.workStack);
        }
        finally {
            if (!hasLockAlready) unlock();
            this._killed = 0;
        }
        if (this.workStack.length !== origLength)
            throw BadNestingError.withPhooStack('During compilation: stack not returned to original length', this.workStack);
        return a;
    }

    /**
     * 'Expects' the objects on top of the stack, and throws if they aren't the right type.
     * If the first argument is a number, asserts that there are at least that many items on the stack to begin.
     * @param {string|RegExp|number} ...types The types to check against
     * @throws {TypeMismatchError} if any of the items don't match
     * @throws {StackUnderflowError} if there are too few items on the stack.
     */
    expect(...types) {
        if (type(types[0]) === 'number') {
            if (this.workStack.length < types[0])
                throw new StackUnderflowError(`Expected at least ${types[0]} items on stack, got ${this.workStack.length}`);
            types = types.slice(1);
        }
        for (var index = 0; index < types.length; index++) {
            var item = this.peek(index);
            var eType = types[index];
            var gType = type(item);
            if ((type(eType) === 'string' && eType !== gType) || (type(eType) === 'regexp' && !eType.test(gType)))
                throw new TypeMismatchError(`Expected ${eType} on stack, got ${gType}: ${item}`);
        }
    }

    /**
     * @param {number} [depth=0] how far down to pop.
     * @throws {StackUnderflowError} if there are not enough items.
     */
    pop(depth = 0) {
        if (this.workStack.length < (depth + 1))
            throw new StackUnderflowError(`Expected at least ${depth + 1} items on stack, got ${this.workStack.length}`);
        return this.workStack.splice(this.workStack.length - depth - 1, 1)[0];
    }

    /**
     * @param {number} [depth=0] how far down to peek. 
     */
    peek(depth = 0) {
        return this.workStack[this.workStack.length - 1 - depth];
    }

    /**
     * Wrapper for pushing item to the stack.
     * @param {any} item The item to be pushed to the stack.
     */
    push(item) {
        this.workStack.push(item);
    }

    /**
     * Pops an item of the return stack.
     * @returns {IPhooReturnStackEntry}
     * @throws {StackUnderflow} if the stack is empty.
     */
    retPop() {
        var item = this.returnStack.pop();
        if (item == undefined)
            throw new StackUnderflowError('Return stack unexpectedly empty');
        return item;
    }

    /**
     * Wrapper for pushing items to the return stack.
     * @param {IPhooReturnStackEntry} item The item to be pushed.
     * @throws {StackOverflow} if the maximum stack depth is now exceeded.
     */
    retPush(item) {
        this.returnStack.push(item);
        if (this.returnStack.length > this.maxDepth)
            throw new StackOverflowError('Maximum return stack length exceeded');
    }

    enterScope() {
        this.scopeStack.push(new Scope());
    }

    exitScope() {
        if (this.scopeStack.length === 0)
            throw new StackUnderflowError.withPhooStack('No scope to exit from', this.returnStack);
        this.scopeStack.pop();
    }

    /**
     * Execute the compiled code contained in the array.
     * @param {Array} c The compiled array (returned by {@linkcode Thread.compile})
     * @param {boolean} [hasLockAlready=false] ***FOR INTERNAL USE ONLY!!!***
     * @returns {Promise<Array>} The stack after execution.
     */
    async execute(c, hasLockAlready = false) {
        var unlock;
        if (!hasLockAlready) unlock = await this.lock.acquire();
        var pc = 0;
        try {
            while (true) {
                if (pc >= c.length) {
                    if (this.returnStack.length == 0) break;
                    var entry = this.retPop();
                    pc = entry.pc + 1;
                    c = entry.arr;
                    continue;
                }
                var ci = c[pc];
                if (type(ci) == 'symbol') {
                    var ciw = name(ci);
                    ci = this.resolveNamepath(ciw);
                }
                if (type(ci) === 'array') {
                    this.retPush({ pc, arr: c });
                    c = ci;
                    pc = -1;
                } else
                    await this.executeOneItem(ci);
                // TODO - this might cause a lockout when using `]sandbox[` that calls this recursively. Hence `hasLockAlready` parameter
                pc++;
            }
        } catch (e) {
            if (e instanceof PhooError) throw e;
            throw PhooError.wrap(e, this.returnStack);
        }
        finally {
            if (!hasLockAlready) unlock();
            this._killed = 0;
        }
        return this.workStack;
    }

    /**
     * Invokes the compiler and then runs the compiled code, all in one call.
     * @param {string|Array|IPhooRunnable} code The code to be run.
     * @param {boolean} [hasLockAlready=false] ***FOR INTERNAL USE ONLY!!!***
     * @returns {Promise<Array>} The stack after execution (same as what {@linkcode Thread.execute} returns)
     */
    async run(code, hasLockAlready = false) {
        return await this.execute(await this.compile(code, hasLockAlready), hasLockAlready);
    }

    /**
     * Find the namespace in the namespace stack.
     * @param {number} idx The depth in the stack to look.
     * @returns {Scope}
     */
    getScope(idx) {
        return this.scopeStack[this.scopeStack.length - 1 - idx] || this.module;
    }

    /**
     * Recursively look up the word/macro's definition, following symlinks and traversing the module tree.
     * @param {string} word The name of the word/macro
     * @param {'words'|'macros'} [where='words'] Words or macros.
     * @returns {IPhooDefinition}
     */
    resolveNamepath(word, where = 'words') {
        var def;
        for (var i = 0; i <= this.scopeStack.length && def === undefined; i++) def = this.getScope(i)[where].find(word);
        if (def === undefined && where === 'words')
            def = this.phoo.undefinedWord(word);
        if (type(def) === 'symbol')
            return this.resolveNamepath(name(def), where);
        return def;
    }
}

/**
 * A word capable of being run by Phoo.
 * @typedef {Array|Function|Symbol|IPhooLiteral} IPhooDefinition
 */
/**
 * An object that will just be pushed to the stack as a literal object.
 * @typedef {any} IPhooLiteral
 */
/**
 * A program compiled and ready to be run.
 * @typedef {Array<IPhooDefinition|IPhooRunnable>} IPhooRunnable
 */

/**
 * A return stack entry containing the current array (`arr`),
 * the index of the program counter (`pc`) and some other stuff.
 * @typedef {{pc: number, arr: Array}} IPhooReturnStackEntry
 */

// exporting dummy typedefs here to satisfy the browser module system
// they don't parse the JSDoc comments
export const IPhooDefinition = null;
export const IPhooLiteral = null;
export const IPhooRunnable = null;
export const IPhooReturnStackEntry = null;
