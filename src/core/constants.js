/**
 * @fileoverview
 * Various constants and keys used in Phoo internally and syntax.
 */

/**
 * The property put in word arrays to hold a reference to their name.
 */
export var WORD_NAME_SYMBOL = Symbol('pWordName');

/**
 * The property set on a {@linkcode Phooey} when it is wrapped with a stack.
 */
export var STACK_TRACE_SYMBOL = Symbol('pStackTrace');