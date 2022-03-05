/**
 * @fileoverview
 * Contains the base class needed to implement a Phoo-like program, as well as some typedefs
 * for often-used Phoo constructs.
 */

import { PhooError, UnknownWordError, StackOverflowError, StackUnderflowError, UnreachableError, TypeMismatchError, DubiousSyntaxError, BadNestingError, UnexpectedEOFError, RaceConditionError, ExternalInterrupt } from './errors.js';
import { w, name, type } from './utils.js';

/**
 * Base class for Phoo interpreter. Some methods are overridden in {@linkcode Phoo}.
 */
export class PBase {
    /**
     * @param {Object} [opts={}]
     * @param {Array<any>} [opts.stack=[]] The initial items into the stack.
     * @param {_PWordMap_} [opts.words={}] The initial words to use,
     * @param {_PWordMap_} [opts.builders={}] The initial builders to use.
     * @param {number} [opts.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     */
    constructor({
        words = {},
        builders = {},
        stack = [],
        maxDepth = 10000,
    }) {
        /**
         * Mapping of words to code
         * @type {_PWordMap_}
         * @default no words
         */
        this.words = words;
        /**
         * Mapping of builders to code
         * @type {_PWordMap_}
         * @default no builders
         */
        this.builders = builders;
        /**
         * Stack that working values are
         * pushed and popped from during execution.
         * @type {Array}
         * @default []
         */
        this.workStack = stack;
        /**
         * Stack that outer arrays and current PC's are saved on
         * when the Phoo machine 'jumps in' to an inner array.
         * @type {Array<_PReturnStackEntry_>}
         */
        this.returnStack = [];
        /**
         * The maximum length of {@linkcode PBase.returnStack}
         * before a {@linkcode StackOverflowError} error is thrown.
         * @type {number}
         * @default 10000
         */
        this.maxDepth = maxDepth;
        /**
         * Internal flag indicating if the mechanisms are in
         * the proper state to allow a new thread to be run.
         * @type {boolean}
         * @private
         */
        this._safeToRun = true;
        /**
         * Internal flag indicating if the current thread is paused.
         * @type {boolean}
         * @private
         */
        this._paused = false;
        /**
         * Internal flag changed when {@linkcode PBase.kill} is called
         * to indicate to the running thread that it should abort itself.
         *
         * 0 = normal, 1 = kill just this thread, 2 = force-kill child threads too.
         * @type {number}
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
         * Promise-resolver callback used to notify {@linkcode PBase.kill}
         * that termination has finished.
         * @type {PromiseResolverCallback}
         * @private
         */
        this._outerKillResolver = null;
        /**
         * Promise-resolver callback used to notify {@linkcode PBase.checkForPaused}
         * to continue on running.
         * @type {PromiseResolverCallback}
         * @private
         */
        this._innerPauseResolver = null;
        /**
         * Promise-rejector callback used to deliberately crash
         * {@linkcode PBase.checkForPaused} if {@linkcode PBase.kill} is
         * called while the thread is paused.
         * @type {PromiseRejectorCallback}
         * @private
         */
        this._innerPauseRejector = null;
        /**
         * Promise-resolver callback used to notify {@linkcode PBase.pause}
         * that the thread has been paused successfully.
         * @type {PromiseResolverCallback}
         * @private
         */
        this._outerPauseResolver = null;
        /**
         * List of child threads that will be killed along with this one.
         * @type {Array<PBase>}
         */
        this.children = [];
    }

    /**
     * Look up the definition of a word and retrieve it.
     * Should defer to {@linkcode PBase.undefinedWord} if the word cannot otherwise
     * be found.
     *
     * Does nothing by default, but it is overridden in {@linkcode Phoo}.
     * @param {string} word The word to be looked up.
     * @abstract
     * @returns {_PWordDef_}
     */
    lookupWord(word) {
        // stub method
    }

    /**
     * Look up the definition of a builder and retrieve it.
     * Should return `:::js undefined` if the builder cannot be found.
     *
     * Does nothing by default, but it is overridden in {@linkcode Phoo}.
     * @param {string} builder The builder to be looked up.
     * @abstract
     * @returns {_PWordDef_}
     */
    lookupBuilder(builder) {
        // stub method
    }
    /**
     * Try to transform the word into a literal.
     * Should return `:::js true` if the operation succeeded, and the transformed value
     * was successfully `push`ed to the end of `a`. Return `:::js false` if the
     * operation fails.
     *
     * Does nothing (except return `:::js false`) by default, but it is overridden in {@linkcode Phoo}.
     * @param {string} word The word to be converted.
     * @param {Array} a The current array being compiled.
     * @abstract
     * @returns {Promise<boolean>} Whether processing succeeded.
     */
    async compileLiteral(word, a) {
        // stub method
        return false;
    }

    /**
     * Callback when a non-array is encountered
     * during execution. By default it calls functions and 
     * pushes everything else to the stack as a literal
     * @param {any} item Thing to be dealt with.
     */
    async executeOneItem(item) {
        if (type(item) === 'function')
            await item.call(this);
        else
            this.push(item);
    }

    /**
     * Compile the code, but do not run it. This **will** invoke any builders and/or literalizers used.
     * @param {string|Array} source The code to be compiled. If it is an array already, this is a no-op.
     * @returns {Promise<Array>}
     */
    async compile(source) {
        switch (type(source)) {
            case 'string':
                break; // default behavior
            case 'array':
                return source; // already compiled
            default:
                return [source]; // just wrap it
        }
        this._checkRaceCondition();
        this._safeToRun = false;
        var code = source.slice();
        var origLength = this.stack.length;
        var word, b, a = [];
        var _; // keep from creating extraneous global variable
        try {
            while (code.length > 0) {
                await this.checkIfKilled(false);
                [word, code] = code.split(/\s+/, 2);
                b = this.lookupBuilder(word);
                if (b !== undefined) {
                    this.push(a);
                    this.push(code);
                    switch (type(b)) {
                        case 'function':
                            await b.call(this);
                            break;
                        case 'array':
                            this._safeToRun = true;
                            await this.run(b);
                            this._safeToRun = false;
                            break;
                        default:
                            throw new TypeMismatchError(`Unexpected '${type(source)}' as builder.`);
                    }
                    code = this.pop('string');
                    a = this.pop('array');
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
            throw DubiousSyntaxError.wrap(e, this.stack);
        }
        finally {
            this._safeToRun = true;
            this._killed = 0;
        }
        if (this.stack.length !== origLength)
            throw BadNestingError.withPhooStack('During compilation: stack not returned to original length', this.stack);
        return a;
    }

    /**
     * Internal method, throws if not in the right state to begin compiling or running.
     * @private
     */
    _checkRaceCondition() {
        if (!this._safeToRun)
            throw new RaceConditionError();
    }

    /**
     * Pop an item off the stack.
     *
     * Pass one argument prefixed with ">" to perform type casting. Available options:
     * `:::js '>bool'`, `:::js '>boolean'`,
     * `:::js '>num'`, `:::js '>number'`,
     * `:::js '>str'`, `:::js '>string'`,
     * `:::js '>bignum'` (which works the same as `:::js '>number'` except if 
     * it is a `:::js BigInt`, in which case it is left a `:::js BigInt`),
     * and `:::js '>symstr'` (which expects a symbol but passes it through {@linkcode name}
     * and casts it to a string before returning it).
     * @param {...string} types The names of the allowable types (see `type`)
     * @returns {any}
     * @throws {StackUnderflow} if there are no items on the stack.
     * @throws {WrongType} if the top item wan't one of the requested types
     * @example
     * var p = new Phoo;
     * p.pop(); // throws StackUnderflow: Stack unexpectedly empty
     * p.push(123);
     * p.pop('string'); // throws WrongType: expected string on stack, got number: 123
     * p.pop('>string'); // returns "123" -- casted to string
     * p.push(random_choice([new Foo, new Bar]));
     * p.pop('Foo', 'Bar'); // never fails, will always match one of those types
     */
    pop(...types) {
        if (this.workStack.length == 0)
            throw new StackUnderflowError('Stack unexpectedly empty');
        var thing = this.workStack.pop();
        if (types.length == 1 && types[0][0] == '>') {
            switch (types[0].slice(1)) {
                case 'boolean':
                case 'bool':
                    thing = !!thing;
                    break;
                case 'number':
                case 'num':
                    thing = +thing;
                    break;
                case 'string':
                case 'str':
                    thing = '' + thing;
                    break;
                // cSpell:ignore bignum
                case 'bignum':
                    if (type(thing) != 'bigint') thing = +thing;
                    break;
                // cSpell:ignore symstr
                case 'symstr':
                    if (type(thing) != 'symbol')
                        throw TypeMismatchError.withPhooStack(`Expected symbol on stack, got ${type(thing)}`, this.returnStack);
                    thing = name(thing);
                    break;
                default:
                    throw new UnreachableError(`In ${arguments.callee.name}: Unknown casting type argument: pop('${types[0]}')`); /* jshint ignore:line */
            }
            return thing;
        }
        if (types.length > 0) {
            var ok = false;
            for (var t of types) {
                if (type(thing) == t) {
                    ok = true;
                    break;
                }
            }
            if (!ok) {
                this.push(thing);
                var types_string;
                if (types.length > 2) types_string = `${types.slice(1).join(', ')}, or ${types[0]}`;
                else types_string = types.join(' or ');
                throw TypeMismatchError.withPhooStack(`Expected ${types_string} on stack, got ${type(thing)}`, this.returnStack);
            }
        }
        return thing;
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
    /**
     * Execute the compiled code contained in the array.
     * @param {Array} c The compiled array (returned by {@linkcode PBase.compile})
     * @returns {Promise<Array>} The stack after execution.
     */
    async execute(c) {
        this._checkRaceCondition();
        this._safeToRun = false;
        var pc = 0;
        try {
            while (true) {
                await this.checkIfKilled(false);
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
                    ci = this.lookupWord(ciw);
                }
                if (type(ci) === 'array') {
                    this.retPush({ pc, arr: c });
                    c = ci;
                    pc = -1;
                } else
                    await this.executeOneItem(ci);
                pc++;
            }
        } catch (e) {
            if (e instanceof PhooError) throw e;
            throw PhooError.wrap(e, this.returnStack);
        }
        finally {
            this._safeToRun = true;
            this._killed = 0;
        }
        return this.workStack;
    }

    /**
     * Invokes the compiler and then runs the compiled code, all in one call.
     * @param {string|Array|_PProgram_} code The code to be run.
     * @returns {Promise<Array>} The stack after execution (same as what {@linkcode PBase.execute} returns)
     */
    async run(code) {
        return await this.execute(await this.compile(code));
    }

    /**
     * Called to dynamically create the definition of a word when {@linkcode PBase.lookupWord}
     * otherwise fails to find it.
     * By default this just throws an {@linkcode UnknownWordError}.
     * @param {string} word The word that is not defined.
     * @returns {_PWordDef_} The temporary definition of the offending word.
     */
    undefinedWord(word) {
        throw UnknownWordError.withPhooStack(`Word ${word} does not exist.`, this.returnStack);
    }

    /**
     * Should be called periodically during long tasks
     * to allow the user or controlling system to abort
     * execution of code. If {@linkcode PBase.kill} has been called,
     * this will throw an error. Otherwise, it does nothing.
     * You can catch the error if you need to clean up, but you should
     * re-throw it after cleanup is complete.
     * @param {boolean} [recursive=true] Should child threads be killed as well.
     */
    async checkIfKilled(recursive = true) {
        if (this._killed > 0) {
            if (this._killed === 2 || recursive) {
                for (var child in this.children) {
                    await child.kill(true);
                }
            }
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
     * @param {boolean} recursive Whether to force-kill child threads too.
     * @returns {Promise<void>}
     */
    async kill(recursive = false) {
        var self = this;
        if (!recursive) {
            if (!this._paused && this._safeToRun) return; // not running
            else if (this._paused && this._innerPauseRejector !== null) {
                this._innerPauseRejector();
                this._innerPauseRejector = null;
                return;
            }

            await new Promise(r => {
                self._outerKillResolver = r;
                self._killed = 1;
            });
        }
        else {
            if (this._paused && this._innerPauseResolver !== null) {
                this._innerPauseResolver();
                this._innerPauseResolver = null;
            }
            await new Promise(r => {
                self._outerKillResolver = r;
                self._killed = 2;
            });
        }
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
            self._innerPauseRejector = async err => {
                for (var child in self.children)
                    await child.kill(true);
                rej(err);
            };
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
     * If the thread is not paused, automatically calls {@linkcode PBase.pause}.
     * Resolves once the thread has completed the step.
     * @returns {Promise<void>}
     */
    async step() {
        if (this._paused !== 'paused') await this.pause();
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
