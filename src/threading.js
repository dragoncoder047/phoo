/**
 * @fileoverview
 * Contains the base runner for a Phoo-like program, as well as some typedefs
 * for often-used Phoo constructs.
 */

import { PhooError, StackOverflowError, StackUnderflowError, TypeMismatchError, PhooSyntaxError, BadNestingError, ExternalInterrupt, ModuleNotFoundError } from './errors.js';
import { w, name, type } from './utils.js';
import { Scope, Module } from './namespace.js';
import { Threadlock } from './locks.js';
import { Phoo } from './index.js';

/**
 * Configuration options.
 * @typedef {{parent: Phoo, module: Module, starModules: Module[], modules: Map<symbol, Module>, stack: any[], maxDepth: number}} IThreadOptions
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
     * @param {number} [opts.maxDepth=10000] The maximum return stack length before a {@linkcode StackOverflowError} error is thrown.
     */
    constructor({
        parent,
        module,
        starModules = [],
        modules = new Map(),
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
         * Stack that working values are pushed and popped from during execution.
         * @type {Array}
         * @default []
         */
        this.workStack = stack;
        /**
         * Stack that outer arrays and current PC's are saved on
         * when the Phoo machine 'jumps in' to an inner array.
         * @type {Array<IPhooReturnStackEntry>}
         */
        this.returnStack = [];
        /**
         * Current execution state.
         * @type {IPhooReturnStackEntry}
         */
        this.state = { arr: [], pc: NaN, mod: module, modules, starModules };
        /**
         * The maximum length of {@linkcode Thread.returnStack}
         * before a {@linkcode StackOverflowError} error is thrown.
         * @type {number}
         * @default 10000
         */
        this.maxDepth = maxDepth;
    }

    get currentModule() {
        return this.state.mod;
    }
    get currentModules() {
        return this.state.modules;
    }
    get currentStarModules() {
        return this.state.starModules;
    }
    // HELPER PUSHPOP METHODS

    /**
     * 'Expects' the objects on top of the stack, and throws if they aren't the right type.
     * If the first argument is a number, asserts that there are at least that many items on the stack to begin.
     * @param {string|RegExp|number} ...args The types to check against
     * @throws {TypeMismatchError} if any of the items don't match
     * @throws {StackUnderflowError} if there are too few items on the stack.
     */
    expect(...args) {
        var types;
        if (type(args[0]) === 'number') {
            if (this.workStack.length < args[0])
                throw new StackUnderflowError(`Expected at least ${args[0]} items on stack, got ${this.workStack.length}`);
            types = args.slice(1);
        }
        else
            types = args.slice();
        for (var index = 0; index < types.length; index++) {
            var item = this.peek(index);
            var eType = types[index];
            var gType = type(item);
            if ((type(eType) === 'string' && eType !== gType) || (type(eType) === 'regexp' && !eType.test(gType)))
                throw TypeMismatchError.withPhooStack(`Expected ${eType} on stack, got ${gType}: ${type(item) === 'symbol' ? name(item) : item}`, this.returnStack);
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
    async executeOneItem(item, module) {
        if (type(item) === 'symbol') {
            ({def: item, module} = this.resolveNamepath(name(item)));
        }
        else if (type(item) === 'function') {
            await item.call(this);
        }
        else if (type(item) === 'array') {
            var newState = {
                pc: -1,
                arr: item,
                modules: module.loadedModules || this.currentModules,
                mod: module || this.currentModule,
                starModules: module.starModules || this.currentStarModules
            };
            this.retPush(this.state);
            this.state = newState;
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
        for (var ns of this.returnStack.flatMap(e => e.modules.values().concat(e.starModules)).reverse()) {
            for (var [regex, code] of ns.literalizers.map) {
                var result = regex.exec(word);
                if (result) {
                    this.push(result);
                    await this.run(code);
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
        var word, module, b, a = [];
        try {
            while (code.length > 0) {
                // https://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurrence
                [word, code] = code.trim().split(/(?<=^\S+)\s/);
                code = code || '';
                ({def: b, module} = this.resolveNamepath(word, true));
                if (b !== undefined) {
                    this.push(a);
                    this.push(code);
                    switch (type(b)) {
                        case 'function':
                            await b.call(this);
                            break;
                        case 'array':
                            await this.executeOneItem(b, module);
                            break;
                        default:
                            throw new TypeMismatchError(`Unexpected ${type(b)} as macro.`);
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
            throw PhooSyntaxError.wrap(e, this.returnStack);
        }
        if (this.workStack.length !== origLength)
            throw BadNestingError.withPhooStack('During compilation: stack not returned to original length', this.workStack);
        return a;
    }

    /**
     * Advance the internal state by one step.
     */
    async tick() {
        try {
            if (this.state.pc >= this.state.arr.length)
                this.state = this.retPop();
            else
                await this.executeOneItem(this.state.arr[this.state.pc]);
            this.state.pc++;
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
        this.retPush(this.state);
        this.state = { pc: 0, arr: compiled, modules: this.currentModules, mod: this.currentModule, starModules: this.currentStarModules };
        while (this.returnStack.length > origDepth) await this.tick();
        return this.workStack;
    }

    /**
     * Recursively look up the word/macro's definition, following symlinks and traversing the module tree.
     * @param {string} word The name of the word/macro
     * @param {boolean} [macro=false] Words or macros.
     * @returns {{def: IPhooDefinition, module: Module}}
     */
    resolveNamepath(word, macro = false) {
        var def, module;
        if (word.indexOf(this.phoo.settings.namepathSeparator) === -1) {
            if (macro) {
                def = this.currentModule.macros.find(word);
                if (def === undefined) {
                    for (var mm of this.currentStarModules) {
                        def = mm.macros.find(word);
                        if (def !== undefined) break;
                    }
                }
            }
            else {
                def = this.currentModule.words.find(word);
                if (def === undefined) {
                    for (var mm of this.currentStarModules) {
                        def = mm.words.find(word);
                        if (def !== undefined) break;
                    }
                }
            }
        }
        else {
            var qualName = this.phoo.qualifyName(word, this.currentModule);
            throw 'todo';
        }
        if (def === undefined && !macro)
            def = this.phoo.undefinedWord(word);
        if (type(def) === 'symbol')
            return this.resolveNamepath(name(def), macro);
        return {def, module: module || this.currentModule};
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
 * the index of the program counter (`pc`) and the module the word is defined in (`mod`).
 * @typedef {{pc: number, arr: Array, mod: Module, modules: Map<symbol, Module>, starModules: Module[]}} IPhooReturnStackEntry
 */

// exporting dummy typedefs here to satisfy the browser module system
// they don't parse the JSDoc comments
export const IPhooDefinition = null;
export const IPhooLiteral = null;
export const IPhooRunnable = null;
export const IPhooReturnStackEntry = null;
