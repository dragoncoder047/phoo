/**
 * @fileoverview
 * Contains the base runner for a Phoo-like program, as well as some typedefs
 * for often-used Phoo constructs.
 */

import { PhooError, StackOverflowError, StackUnderflowError, TypeMismatchError, PhooSyntaxError, BadNestingError, ExternalInterrupt, ModuleNotFoundError } from './errors.js';
import { w, name, type } from './utils.js';
import { Scope, Module } from './namespace.js';
import { Phoo } from './index.js';
import { WORD_NAME_SYMBOL } from './constants.js';

/**
 * Configuration options.
 * @typedef {{parent: Phoo, module: Module, stack: any[], scopes: Scope[], maxDepth: number}} IThreadOptions
 */

/**
 * this is the actual compiler/runner for the code
 */
export class Thread {

    /**
     * @param {IThreadOptions} [opts]
     * @param {Phoo} [opts.parent] Owner of this thread.
     * @param {Module} [opts.module] Module this thread is handling.
     * @param {Module[]} [opts.starModules] Modules imported using import*.
     * @param {Map<symbol, Module>} [opts.modules] Pre-imported modules.
     * @param {any[]} [opts.stack=[]] The initial items on the work stack.
     * @param {Scope[]} [opts.scopes=[]] The initial items on the scope stack.
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
         * The module this thread runs in
         * @type {Module}
         */
        this.module = module;
        /**
         * The name of this thread. Initialized as the name of the module.
         * @type {string}
         */
        this.name = module.name;
        /**
         * Stack that working values are pushed and popped from during execution.
         * @type {Array}
         * @default []
         */
        this.workStack = stack;
        /**
         * Stack that outer arrays and current PC's are saved on
         * when the Phoo machine 'jumps in' to an inner array.
         * @type {IPhooReturnStackEntry[]}
         */
        this.returnStack = [];
        /**
         * Stack that outer arrays and current PC's are saved on
         * when the Phoo machine 'jumps in' to an inner array.
         * @type {Scope[]}
         */
        this.scopeStack = [];
        /**
         * The maximum length of {@linkcode Thread.returnStack}
         * before a {@linkcode StackOverflowError} error is thrown.
         * @type {number}
         * @default 10000
         */
        this.maxDepth = maxDepth;
    }

    // HELPER PUSHPOP METHODS

    /**
     * 'Expects' the objects on top of the stack, and throws if they aren't the right type.
     * If the first argument is a number, asserts that there are at least that many items on the stack to begin.
     * @param {string|RegExp|number} ...args The types to check against
     * @throws {TypeMismatchError} if any of the items don't match
     * @throws {StackUnderflowError} if there are too few items on the stack.
     * @example
     * this.push(11); this.push('foo'); this.push(/ab+c?/)
     * this.expect(3, 'number', 'string', 'regexp');
     */
    expect(...args) {
        var types;
        if (type(args[0]) === 'number') {
            if (this.workStack.length < args[0])
                throw StackUnderflowError.withPhooStack(`Expected at least ${args[0]} items on stack, got ${this.workStack.length}`, this.returnStack);
            types = args.slice(1);
        }
        else
            types = args.slice();
        for (var index = 0; index < types.length; index++) {
            var item = this.peek(index);
            var eType = types[index];
            var gType = type(item);
            if ((type(eType) === 'string' && eType !== gType) || (type(eType) === 'regexp' && !eType.test(gType))) {
                throw TypeMismatchError.withPhooStack(`Expected ${eType} on stack, got ${gType}`, this.returnStack);
            }
        }
    }

    /**
     * @param {number} [depth=0] how far down to pop.
     * @throws {StackUnderflowError} if there are not enough items.
     */
    pop(depth = 0) {
        if (this.workStack.length < (depth + 1))
            throw StackUnderflowError.withPhooStack(`Expected at least ${depth + 1} items on stack, got ${this.workStack.length}`, this.returnStack);
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

    get state() {
        return this.returnStack.at(-1);
    }

    get prevState() {
        return this.returnStack.at(-2);
    }

    /**
     * Push a new scope onto the scope stack.
     */
    enterScope() {
        this.scopeStack.push(new Scope());
    }
    /**
     * Pop a scope from the scope stack.
     */
    exitScope() {
        if (this.scopeStack.length === 0)
            throw StackUnderflowError.withPhooStack('No scope to exit from', this.returnStack);
        this.scopeStack.pop();
    }

    // EXECUTION METHODS

    /**
     * Callback when a non-array is encountered
     * during execution. Functions are simply called;
     * arrays are pushed to the return stack and jumped into;
     * anything else is just pushed to the work stack.
     * 
     * See {@linkcode Phoo.strictMode} for the behavior of this.
     * @param {any} item Thing to be dealt with.
     */
    async executeOneItem(item) {
        if (type(item) === 'symbol')
            item = this.lookup(name(item));
        if (type(item) === 'function') {
            //console.debug('executing function', item[WORD_NAME_SYMBOL]);
            //console.debug('top stack item is a:', type(this.peek()));
            await item.call(this);
        }
        else if (type(item) === 'array') {
            this.retPush({
                pc: -1,
                arr: item,
            });
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
     * @returns {Promise<{succeeded: boolean, result: any}>}
     */
    async compileLiteral(word) {
        for (var [regex, code] of this.module.literalizers.map) {
            var result = regex.exec(word);
            if (result) {
                this.push(result);
                await this.run(code);
                return { succeeded: true, result: this.pop() };
            }
        }
        return { succeeded: false };
    }

    /**
     * Compile the code, but do not run it. This **will** invoke any macros and/or literalizers used.
     * @param {string|Array} source The code to be compiled. If it is an array already, this will just return it unchanged.
     * @returns {Promise<Array>}
     */
    async compile(source) {
        switch (type(source)) {
            case 'string':
                break; // default behavior
            case 'array':
                return source; // assume already compiled
            default:
                return [source]; // just wrap it
        }
        var code = source.slice();
        var origLength = this.workStack.length;
        var word, m, a = [];
        try {
            while (code.length > 0) {
                // https://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurrence
                [word, code] = code.trim().split(/(?<=^\S+)\s/);
                //console.debug('word:', word)
                code = code || '';
                m = this.lookup(word, true);
                if (m !== undefined) {
                    this.push(a);
                    this.push(code);
                    switch (type(m)) {
                        case 'function':
                            await m.call(this);
                            break;
                        case 'array':
                            console.debug('Got Phoo Macro', word);
                            await this.run(m);
                            break;
                        default:
                            throw new TypeMismatchError(`Unexpected ${type(m)} as macro.`);
                    }
                    this.expect('string', 'array');
                    code = this.pop();
                    a = this.pop();
                }
                else { // try looking up in literals
                    var { succeeded, result } = await this.compileLiteral(word);
                    a.push(succeeded ? result : w(word));
                }
            }
        }
        catch (e) {
            throw PhooSyntaxError.wrap(e, this.returnStack);
        }
        if (this.workStack.length !== origLength)
            throw new BadNestingError('One or more unmatched brackets');
        return a;
    }

    /**
     * Advance the internal state by one step.
     */
    async tick() {
        try {
            if (this.state.pc >= this.state.arr.length)
                this.retPop();
            else 
                await this.executeOneItem(this.state.arr[this.state.pc]);
            if (this.state) this.state.pc++;
        } catch (e) {
            if (e instanceof PhooError) throw e;
            throw PhooError.wrap(e, this.returnStack);
        }
    }

    /**
     * Invokes the compiler and then runs the compiled code to completion, all in one call.
     * @param {string|Array|IPhooRunnable} code The code to be run.
     * @returns {Promise<Array>} The stack after execution
     */
    async run(code) {
        var compiled = await this.compile(code);
        const origDepth = this.returnStack.length;
        this.retPush({ pc: 0, arr: compiled });
        try {
            while (this.returnStack.length > origDepth) await this.tick();
        } catch (e) {
            while (this.returnStack.length > origDepth) this.retPop();
            throw e;
        }
        return this.workStack;
    }

    /**
     * Recursively look up the word/macro's definition, following symlinks.
     * @param {string} word The name of the word/macro
     * @param {boolean} [macro=false] Words or macros.
     * @returns {IPhooDefinition}
     */
    lookup(word, macro = false) {
        var def;
        for (var mm of this.scopeStack) {
            def = mm[macro ? 'macros' : 'words'].find(word);
            if (def !== undefined) break;
        }
        if (def === undefined)
            def = this.module[macro ? 'macros' : 'words'].find(word);
        if (def === undefined && !macro)
            def = this.phoo.undefinedWord(word);
        if (type(def) === 'symbol')
            def = this.lookup(name(def), macro);
        return def;
    }

    /**
     * Peek into the scope stack.
     * @param {number} [depth=0] How far down to look.
     */
    getScope(depth = 0) {
        if (depth >= this.scopeStack.length) return this.module;
        return this.scopeStack[this.scopeStack.length - 1 - depth];
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
 * and the index of the program counter (`pc`).
 * @typedef {{pc: number, arr: Array}} IPhooReturnStackEntry
 */

// exporting dummy typedefs here to satisfy the browser module system
// they don't parse the JSDoc comments
export const IPhooDefinition = null;
export const IPhooLiteral = null;
export const IPhooRunnable = null;
export const IPhooReturnStackEntry = null;
