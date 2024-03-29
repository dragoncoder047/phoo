/* jshint -W086 */

import { type } from '/phoo/src/utils.js';

const DEFAULT_PALETTE = {
    max_depth_exceeded: 'gray',
    number: 'blue',
    boolean: 'magenta',
    string: 'green',
    bigint: 'purple',
    regexp: 'pink',
    undefined: 'gray',
    symbol: 'yellow',
    function: 'red',
    Map: 'orange',
    Set: 'lime',
    null: 'purple'
};

export default function stringify(obj, { colorize = x => x, max_depth = 5, palette = DEFAULT_PALETTE, indent = false }) {
    if (max_depth === 0)
        return colorize('...', palette.max_depth_exceeded);
    const options = { colorize, max_depth: max_depth - 1, palette, indent };
    //console.debug('stringifying a ' + type(obj));
    var inner, symbols;
    switch (type(obj)) {
        case 'number':
            return colorize(obj, palette.number);
        case 'Number':
            return `Number {${stringify(obj.valueOf(), options)}}`;
        case 'boolean':
            return colorize(obj, palette.boolean);
        case 'Boolean':
            return `Boolean {${stringify(obj.valueOf(), options)}}`;
        case 'string':
            return colorize(stringy(obj), palette.string);
        case 'String':
            return `String {${stringify(obj.valueOf(), options)}}`;
        case 'bigint':
            return colorize(obj.toString() + 'n', palette.bigint);
        case 'array':
            if (!obj.length)
                return '[]';
            if (max_depth == 1) return '[' + colorize('...' + obj.length, palette.max_depth_exceeded) + ']';
            inner = obj.map(item => stringify(item, options));
            symbols = Object.getOwnPropertySymbols(obj).map(s => `${stringify(s, options)}: ${stringify(obj[s], options)}`);
            if (!indent)
                return '[' + inner.concat(symbols).join(', ') + ']';
            else
                return '[\n' + indent_lines(inner.concat(symbols).join(',\n'), indent) + '\n]';
        case 'regexp':
            return colorize(`/${obj.source}/${obj.flags}`, palette.regexp);
        case 'undefined':
            return colorize('undefined', palette.undefined);
        case 'symbol':
            return colorize(Symbol.keyFor(obj), palette.symbol);
        case 'function':
            return colorize(`${obj.name || "<anonymous>"}()`, palette.function);
        case 'Map':
            if (!obj.size)
                return colorize('Map {empty}', palette.Map);
            if (max_depth == 1) return colorize('Map {', palette.Map) + colorize('...' + obj.size, palette.max_depth_exceeded) + colorize('}', palette.Map);
            inner = [...obj.entries()].map(i => stringify(i[0], options) + ' => ' + stringify(i[1], options));
            if (!indent)
                return colorize('Map { ' + inner.join(', ') + ' }', palette.Map);
            else
                return colorize('Map {\n' + indent_lines(inner.join(',\n'), indent) + '\n}', palette.Map);
        case 'Set':
            if (!obj.size)
                return colorize('Set {empty}', palette.Set);
            if (max_depth == 1) return colorize('Set {', palette.Set) + colorize('...' + obj.size, palette.max_depth_exceeded) + colorize('}', palette.Set);
            inner = [...obj.values()].map(i => stringify(i, options));
            if (!indent)
                return colorize('Set { ' + inner.join(', ') + ' }', palette.Set);
            else
                return colorize('Set {\n' + indent_lines(inner.join(',\n'), indent) + '\n}', palette.Set);
        default:
            if (obj === null)
                return colorize('null', palette.null);
            if (obj === window) {
                if (palette.window)
                    return colorize('Window', palette.window);
                else
                    return 'Window';
            }
            var pairs = [], key$, prop$, itm;
            var items = Object.getOwnPropertyNames(obj);
            var itemSymbols = Object.getOwnPropertySymbols(obj);
            for (itm of items) {
                prop$ = stringify(obj[itm], options);
                if (/^[$_a-z][$_a-z0-9]*/i.test(itm)) key$ = itm;
                else if (/^\d+$/.test(itm)) key$ = colorize(itm, palette.number);
                else key$ = `[${stringify(itm, options)}]`;
                pairs.push([key$, prop$]);
            }
            for (itm of itemSymbols) {
                prop$ = stringify(obj[itm], options);
                key$ = stringify(itm, options);
                pairs.push([key$, prop$]);
            }
            inner = pairs.map(p => p[0] + ': ' + p[1]);
            if (max_depth == 1 && inner.length) inner = [colorize('...' + pairs.length, palette.max_depth_exceeded)];
            var tt = type(obj);
            if (tt === 'object')
                tt = '';
            else
                tt += ' ';
            if (!inner.length)
                return tt + '{}';
            if (!indent)
                inner = tt + '{ ' + inner.join(', ') + ' }';
            else
                inner = tt + '{\n' + indent_lines(inner.join(',\n'), indent) + '\n}';
            if (palette[type(obj)])
                return colorize(inner, palette[type(obj)]);
            else
                return inner;
    }
}

const C_ABBREVIATIONS = {
    0: '0',
    7: 'a',
    8: 'b',
    9: 't',
    10: 'n',
    11: 'v',
    12: 'f',
    13: 'r'
};

function stringy(string) {
    var escaped = [...string].map(char => {
        const cc = char.charCodeAt(0);
        // replace double quotes
        if (char === '"') return '\\"';
        // escape < and & so they don't get interpreted as HTML
        if (char === '&') return '&amp;';
        if (char === '<') return '&lt;';
        // printable: no need to escape
        if (31 < cc && cc < 128) return char;
        // replace nonprintable characters < \x20
        if (cc in C_ABBREVIATIONS) return '\\' + C_ABBREVIATIONS[cc];
        // replace Unicode characters > ASCII range
        if (cc < 256) return '\\x' + cc.toString(16).padStart(2, '0');
        if (cc < 65536) return '\\u' + cc.toString(16).padStart(4, '0');
        return '\\u{' + cc.toString(16) + '}';
    }).join('');
    return '"' + escaped + '"';
}

function indent_lines(text, indent = '  ') {
    return text.split('\n').map(line => indent + line).join('\n');
}
