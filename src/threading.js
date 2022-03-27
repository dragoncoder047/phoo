/**
 * @fileoverview
 * Contains the base runner for a Phoo-like program, as well as some typedefs
 * for often-used Phoo constructs.
 */

import { PhooError, StackOverflowError, StackUnderflowError, TypeMismatchError, BadSyntaxError, BadNestingError, ExternalInterrupt } from './errors.js';
import { w, name, type } from './utils.js';
import { Namespace } from './namespace.js';
import { Threadlock } from './locks.js';
import { Phoo } from './index.js';


/**
 * this is the actual compiler/runner for the code
 */
export class Thread {

    /**
     * @param {Object} [opts]
     * @param {Phoo} [opts.parent] Owner of this thread.
     * @param {Module} [opts.module] Module this thread is handling.
     * @param {Namespace[]} [opts.scopes] The initial namespace stack.
     * @param {any[]} [opts.stack=[]] The initial items on the work stack.
     * @param {number} [opts.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     */
    constructor({
        parent,
        module,
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
         * Stack that working values are pushed and popped from during execution.
         * @type {Array}
         * @default []
         */
        this.workStack = stack;
        /**
         * Stack of namespace scopes.
         * @type {Namespace[]}
         */
        this.scopeStack = scopes;
        /**
         * Stack that outer arrays and current PC's are saved on
         * when the Phoo machine 'jumps in' to an inner array.
         * @type {Array<_PReturnStackEntry_>}
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
         * Internal flag indicating if the current thread is paused.
         * @type {boolean}
         * @private
         */
        this._paused = false;
        /**
         * Internal flag changed when {@linkcode Thread.kill} is called
         * to indicate to the running thread that it should abort itself.
         *
         * 0 = normal, 1 = kill just this thread, 2 = force-kill child threads too.
         * @type {0|1|2}
         * @private
         */
        this._killed = 0;
        /**
         * Internal flag indicating that the current thread,
         * although it is running, it should re-pause itself and
         * only run one step.
         * @type {boolean}
         * @private
         */
        this._stepwise = false;
        /**
         * Promise-resolver callback used to notify {@linkcode Thread.kill}
         * that termination has finished.
         * @type {PromiseResolverCallback}
         * @private
         */
        this._outerKillResolver = null;
        /**
         * Promise-resolver callback used to notify {@linkcode Thread.checkForPaused}
         * to continue on running.
         * @type {PromiseResolverCallback}
         * @private
         */
        this._innerPauseResolver = null;
        /**
         * Promise-rejector callback used to deliberately crash
         * {@linkcode Thread.checkForPaused} if {@linkcode Thread.kill} is
         * called while the thread is paused.
         * @type {PromiseRejectorCallback}
         * @private
         */
        this._innerPauseRejector = null;
        /**
         * Promise-resolver callback used to notify {@linkcode Thread.pause}
         * that the thread has been paused successfully.
         * @type {PromiseResolverCallback}
         * @private
         */
        this._outerPauseResolver = null;
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
                await this.checkIfKilled();
                code = code.trim();
                word = /^(\S+)/.exec(code)[0];
                code = code.substring(word.length);
                b = this.resolveNamepath(word, 'macros');
                console.log(word, b, this.workStack);
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
            throw BadSyntaxError.wrap(e, this.workStack);
        }
        finally {
            if (!hasLockAlready) unlock();
            this._killed = 0;
        }
        if (this.workStack.length !== origLength)
            throw BadNestingError.withPhooStack('During compilation: stack not returned to original length', this.workStack);
        console.log(a);
        return a;
    }

    /**
     * 'Expects' the objects on top of the stack, and throws if they aren't the right type.
     * @param {string|RegExp} ...types The types to check against
     * @throws {TypeMismatchError} if any of the items don't match
     */
    expect(...types) {
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
     * @returns {_PReturnStackEntry_}
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
     * @param {_PReturnStackEntry_} item The item to be pushed.
     * @throws {StackOverflow} if the maximum stack depth is now exceeded.
     */
    retPush(item) {
        this.returnStack.push(item);
        if (this.returnStack.length > this.maxDepth)
            throw new StackOverflowError('Maximum return stack length exceeded');
    }

    enterScope() {
        this.scopeStack.push(new Namespace());
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
                await this.checkIfKilled();
                await this.checkForPaused();
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
     * @param {string|Array|_PProgram_} code The code to be run.
     * @param {boolean} [hasLockAlready=false] ***FOR INTERNAL USE ONLY!!!***
     * @returns {Promise<Array>} The stack after execution (same as what {@linkcode Thread.execute} returns)
     */
    async run(code, hasLockAlready = false) {
        return await this.execute(await this.compile(code, hasLockAlready), hasLockAlready);
    }

    /**
     * Find the namespace in the namespace stack.
     * @param {number} idx The depth in the stack to look.
     * @returns {Namespace}
     */
    getScope(idx) {
        return this.scopeStack[this.scopeStack.length - 1 - idx] || this.module;
    }

    /**
     * Recursively look up the word/macro's definition, following symlinks and traversing the module tree.
     * @param {string} word The name of the word/macro
     * @param {'words'|'macros'} [where='words'] Words or macros.
     * @returns {_PWordDef_}
     */
    resolveNamepath(word, where = 'words') {
        var def, nps = this.phoo.settings.namepathSeparator;
        if (word.indexOf(nps) > -1) {
            var s;
            if (word.startsWith(nps)) {
                s = word.substring(nps.length).split(nps).concat([nps]);
            } else {
                s = word.split(nps);
            }
            def = this.module.findSubmodule(s[0]);
            for (var p of s.slice(1, -1)) {
                def = def.findSubmodule(p);
                if (def === undefined) break;
            }
            if (def !== undefined && s[s.length - 1] !== nps) {
                def = def[where].find(s[s.length - 1]);
            }
        } else {
            for (var i = 0; i <= this.scopeStack.length && def === undefined; i++) def = this.getScope(i)[where].find(word);
        }
        if (def === undefined && where === 'words')
            def = this.phoo.undefinedWord(word);
        if (type(def) === 'symbol')
            return this.resolveNamepath(name(def), where);
        return def;
    }

    /**
     * Should be called periodically during long tasks
     * to allow the user or controlling system to abort
     * execution of code. If {@linkcode Thread.kill} has been called,
     * this will throw an error. Otherwise, it does nothing.
     * You can catch the error if you need to clean up, but you should
     * re-throw it after cleanup is complete.
     */
    async checkIfKilled() {
        if (this._killed) {
            if (this._outerKillResolver !== null) {
                this._outerKillResolver();
                this._outerKillResolver = null;
            }
            throw new ExternalInterrupt();
        }
    }

    /**
     * Stop this thread from executing.
     * Resolves when termination has completed.
     * @returns {Promise<void>}
     */
    async kill() {
        var self = this;
        if (!this.lock.locked) return; // not running
        else if (this._paused && this._innerPauseRejector !== null) {
            this._innerPauseRejector();
            this._innerPauseRejector = null;
            return;
        }

        await new Promise(r => {
            self._outerKillResolver = r;
            self._killed = true;
        });
    }

    /**
     * Call this to alow execution to be paused in a long task.
     * For time-sensitive tasks, do not use this.
     */
    async checkForPaused() {
        if (!this._paused) return; // not paused
        var self = this;
        await new Promise((res, rej) => {
            self._innerPauseResolver = res;
            self._innerPauseRejector = rej;
            if (self._outerPauseResolver !== null) {
                self._outerPauseResolver();
                self._outerPauseResolver = null;
            }
        });
    }
    /**
     * Pause this thread from executing.
     * Resolves when pause is complete.
     * @returns {Promise<void>}
     */
    async pause() {
        if (this._paused) return; // already paused
        this._stepwise = true;
        var self = this;
        await new Promise(r => {
            self._outerPauseResolver = r;
            self._paused = true;
        });
    }

    /**
     * Step the thread one step.
     * If the thread is not paused, automatically calls {@linkcode Thread.pause}.
     * Resolves once the thread has completed the step.
     * @returns {Promise<void>}
     */
    async step() {
        if (!this._paused) await this.pause();
        var self = this;
        await new Promise(r => {
            self._outerPauseResolver = r;
            self._innerPauseResolver(); // let it go, but don't set paused state variable back
        });
    }
    /**
     * Resumes execution of the thread if it was paused.
     */
    resume() {
        if ((this._stepwise || this._paused) && this._innerPauseResolver !== null) {
            this._stepwise = false;
            this._paused = false;
            this._innerPauseResolver();
            this._innerPauseResolver = null;
        }
    }
}

/**
 * A word capable of being run by Phoo.
 * @typedef {Array|Function|Symbol|_PLiteralObject_} _PWordDef_
 */
/**
 * An object that will just be pushed to the stack as a literal object.
 * @typedef {any} _PLiteralObject_
 */
/**
 * A mapping of names to their definitions.
 * @typedef {Object<string, _PWordDef_>} _PWordMap_
 */
/**
 * A program compiled and ready to be run.
 * @typedef {Array<_PWordDef_|_PProgram_>} _PProgram_
 */

/**
 * A return stack entry containing the current array (`arr`),
 * the index of the program counter (`pc`) and some other stuff.
 * @typedef {{pc: number, arr: Array}} _PReturnStackEntry_
 */

// exporting dummy typedefs here to satisfy the browser module system
// they don't parse the JSDoc comments
export const _PWordDef_ = null;
export const _PLiteralObject_ = null;
export const _PWordMap_ = null;
export const _PProgram_ = null;
export const _PReturnStackEntry_ = null;
