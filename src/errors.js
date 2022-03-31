/**
 * @fileoverview
 * Contains classes for all the different types of things that can go wrong in a Phoo program.
 */

import { WORD_NAME_SYMBOL, STACK_TRACE_SYMBOL } from "./constants.js";

/**
 * Generic error thrown when something goes wrong with a Phoo program.
 *
 * Extends the native `Error` type.
 */
export class PhooError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
    /**
     * 'Wrap' another error in a {@linkcode PhooError}. The stack trace is copied.
     * @param {Error} otherError The error to be wrapped.
     * @param {Array} [stackToTrace] The Phoo return stack to be traced with this error.
     * @returns {PhooError}
     */
    static wrap(otherError, stackToTrace = null) {
        var me;
        if (stackToTrace !== null)
            me = this.withPhooStack(otherError.message, stackToTrace);
        else
            me = new this(otherError.message);
        me.stack += '\n\nThe above error was caused by the following error:\n\n';
        me.stack += otherError.stack;
        return me;
    }
    /**
     * Stringify and associate the Phoo return stack with this error.
     * @param {string} message The error message.
     * @param {Array} stackToTrace The Phoo return stack at the time of the error.
     * @returns {PhooError}
     */
    static withPhooStack(message, stackToTrace = []) {
        var me = new this(message);
        me[STACK_TRACE_SYMBOL] = stringifyReturnStack(stackToTrace);
        return me;
    }
}

/**
 * Error raised when a word cannot be found.
 */
export class UnknownWordError extends PhooError { }

/**
 * Error raised when a module cannot be found.
 * Subclass of {@linkcode UnknownWordError}.
 */
export class ModuleNotFoundError extends UnknownWordError { }

/**
 * Error raised when a program tries to do something it isn't allowed to do.
 */
export class IllegalOperationError extends PhooError { }

/**
 * Error raised when a word is trying to be redefined, but strict mode is enabled.
 * Subclass of {@linkcode IllegalOperationError}.
 */
export class AlreadyDefinedError extends IllegalOperationError { }

/**
 * Error raised when something goes wrong in the internal Phoo machinery.
 */
export class UnreachableError extends PhooError { }

/**
 * Error raised when the Phoo code recurses too deeply and the return stack blows up.
 */
export class StackOverflowError extends PhooError { }

/**
 * Error raised when the stack is empty when it's not supposed to be.
 */
export class StackUnderflowError extends PhooError { }

/**
 * Error raised when a race condition would result.
 */
export class RaceConditionError extends PhooError { } // Is this even needed anymore (see #1)

/**
 * Error raised when the program is manually interrupted.
 */
export class ExternalInterrupt extends PhooError { }

/**
 * Error raised when an object of one type was expected, but got another.
 */
export class TypeMismatchError extends PhooError { }

/**
 * Error raised when there is an issue with syntax in a Phoo program.
 */
export class PhooSyntaxError extends PhooError { }

/**
 * Error raised when there is an issue with brackets.
 * Subclass of {@linkcode PhooSyntaxError}.
 */
export class BadNestingError extends PhooSyntaxError { }

/**
 * Error raised when the input stream abruptly ends, but more data was expected.
 * Subclass of {@linkcode PhooSyntaxError}.
 */
export class UnexpectedEOFError extends PhooSyntaxError { }


export function stringifyReturnStack(stack = []) {
    var stackText = '';
    for (var item of stack) {
        stackText += `{${item.arr && item.arr[WORD_NAME_SYMBOL] || '...'} ${item.pc || NaN}} `;
    }
    return stackText;
}