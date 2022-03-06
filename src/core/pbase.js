

import { PhooError, UnknownWordError, StackOverflowError, StackUnderflowError, UnreachableError, TypeMismatchError, DubiousSyntaxError, BadNestingError, UnexpectedEOFError, RaceConditionError, ExternalInterrupt } from './errors.js';
import { w, name, type } from './utils.js';
import { Namespace } from './namespace.js';
import { Threadlock } from './locks.js';

/**
 * Base class for Phoo interpreter. Some methods are overridden in {@linkcode Phoo}.
 */
export class PBase {


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
}