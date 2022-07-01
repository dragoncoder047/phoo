/**
 * @fileoverview
 * Convenience functions.
 */

/**
 * Like the `:::js typeof` operator, but returns the object's constructor's
 * name instead where `:::js typeof` would return `:::js 'object'`.
 * Because `:::js Array` and `:::js RegExp` are primitive types (i.e. there is a literal syntax
 * for them), when an array or regexp is passed in the result is `:::js 'array'`, and `:::js 'regexp'`,
 * not `:::js 'Array'` or `:::js 'RegExp'`.
 * @param {any} obj
 * @param {boolean} [guess_containers=false] Whether to guess the type of objects held by containers.
 * @returns {string} The name of the object's type.
 * @example
 * type(1) // => 'number'
 * type(false) // => 'boolean'
 * type(1234567890n) // => 'bigint'
 * type(/a*ba{2,}cd/) // => 'regexp'
 * type([1, 2, 3]) // => 'array'
 * type([1, 2, 3], true) // => 'array<number>'
 */
export function type(obj, guess_containers = false) {
    var t = typeof obj;
    if (t == 'object') t = Array.isArray(obj) ? 'array' : 'object';
    if (t == 'object' && obj !== null && obj.constructor === RegExp) t = 'regexp';
    if (t == 'object' && obj !== null && obj.constructor !== null && obj.constructor !== undefined && obj.constructor !== Object) t = obj.constructor.name;
    if (guess_containers) {
        var all_same, keys, values, keys_same, values_same;
        switch (t) {
            case 'array':
                all_same = obj.map(type).every(i => i === type(obj[0], true));
                if (all_same)
                    t = `array<${type(obj[0])}>`;
                break;

            case 'Map':
                keys = obj.keys();
                values = obj.values();
                keys_same = keys.map(type).every(i => i === type(keys[0]));
                values_same = values.map(type).every(i => i === type(values[0]));
                if (keys_same && values_same)
                    t = `Map<${type(keys[0])}, ${type(values[0])}>`;
                break;

            case 'Set':
                values = obj.values();
                values_same = values.map(type).every(i => i === type(values[0]));
                if (values_same)
                    t = `Set<${type(values[0])}>`;
        }
    }
    return t;
}

/**
 * Shorthand for `:::js Symbol.for(name)`, it returns the global symbol
 * for the word that Phoo will look up.
 *
 * Alias: `w`
 * @param {string} name The name to be transformed into a word.
 * @returns {Symbol}
 */
export function word(name) {
    return Symbol.for(name);
}

export const w = word;

/**
 * Reverse of {@linkcode word}, it takes a symbol and looks up the name.
 * @param {Symbol} sym The symbol to look for the name.
 * @returns {string}
 */
export function name(sym) {
    return Symbol.keyFor(sym);
}

/**
 * Recursively clones an array, cloning *only* the array elements
 * (not the objects or anything else) if parameter `objects` is `:::js false`.
 * @param {Array} a The array to be cloned.
 * @param {boolean} [objects=false] Whether to clone objects as well.
 * @param {boolean} [deep=true] If `objects` is `:::js true`, whether {@linkcode clone} should recursively clone its objects too.
 * @param {Map} [seen] Map of objects already seen, to prevent a stack overflow when a self-referencing object is encountered. Do not pass this manually.
 * @returns {Array} The clone.
 */
export function cloneArray(a, objects = false, deep = true, seen = new Map()) {
    if (seen.has(a)) return seen.get(a);
    var n = [];
    for (var i of a) {
        var c = seen.get(i);
        if (c === undefined) {
            if (type(i) == 'array')
                c = cloneArray(i, objects, deep, seen);
            else if (objects)
                c = clone(i, deep, seen);
            else
                c = i;
            seen.set(i, c);
        }
        n.push(c);
    }
    return n;
}

/**
 * Clone an object, including symbol keys.
 * @param {any} o The object to clone.
 * @param {boolean} [deep=true] Whether to recursively clone all properties, instead of just the top layer.
 * @param {Map} [seen] Map of objects already seen, to prevent a stack overflow when a self-referencing object is encountered. Do not pass this manually.
 * @returns {any} The clone.
 */
export function clone(o, deep = true, seen = new Map()) {
    if (seen.has(o)) return seen.get(o);
    if (!o) return o; // handles null, undefined, false, 0, '', etc...
    var n, c;
    switch (type(o)) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'regexp':
        case 'undefined':
        case 'function':
            return o;
        case 'array':
            c = cloneArray(o, true, deep, seen);
            seen.set(o, c);
            return c;
        case 'Map':
            n = new Map();
            for (var [a, b] in o.entries()) {
                var ac = clone(a, deep, seen);
                var bc = clone(b, deep, seen);
                n.set(ac, bc);
            }
            return n;
        case 'Set':
            n = new Set();
            for (var i in o.values()) {
                var ic = clone(i, deep, seen);
                n.add(ic);
            }
    }
    for (var p in Object.keys(o).concat(Object.getOwnPropertySymbols(o))) {
        var v = o[p];
        c = seen.get(v);
        if (deep && c === undefined) {
            c = clone(v, true, seen);
            seen.set(v, c);
        }
        else {
            c = v;
        }
        n[p] = c;
    }
    return n;
}
