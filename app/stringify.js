import { type } from '../src/utils.js';


export default function stringify(obj, colorize = x => x) {
    console.debug('stringifying a ' + type(obj));
    switch (type(obj)) {
        case 'number': return colorize(obj, 'blue');
        case 'boolean': return colorize(obj, 'magenta');
        case 'string': return colorize(stringy(obj), 'green');
        case 'bigint': return colorize(obj.toString() + 'n', 'pink');
        case 'array': return `[${obj.map(item => stringify(item, colorize)).join(', ')}]`;
        case 'regexp': return colorize(`/${obj.source}/`, 'red');
        case 'undefined': return colorize('undefined', 'gray');
        case 'symbol': return colorize(`@@${stringy(Symbol.keyFor(obj))}`, 'lime');
        case 'Map': return colorize(`Map {${[...obj.entries()].map(i => stringify(i[0], colorize) + ' => ' + stringify(i[1], colorize)).join(', ')}}`, 'orange');
        case 'Set': return colorize(`Set {${[...obj.values()].map(i => stringify(i, colorize)).join(', ')}}`, 'yellow');
        default:
            if (obj === null) return colorize('null', 'purple');
            // var pairs = [], key$, prop$, itm;
            // var items = Object.getOwnPropertyNames(obj);
            // var itemSymbols = Object.getOwnPropertySymbols(obj);
            // for (itm of items) {
            //     prop$ = stringify(obj[itm]);
            //     if (/^[$_a-z][$_a-z0-9]*/i.test(itm)) key$ = itm;
            //     else key$ = `[${stringy(itm)}]`;
            //     pairs.push([key$, prop$]);
            // }
            // for (itm of itemSymbols) {
            //     prop$ = stringify(obj[itm]);
            //     key$ = strigify(itm);
            //     pairs.push([key$, prop$]);
            // }
            // return `{ ${pairs.map(p => p[0] + ': ' + p[1]).join(', ')} }`;
            return colorize(obj.toString(), 'tan');
    }
}

function stringy(string) {
    // replace single quotes
    string = string.replaceAll("'", "\\'");
    // replace nonprintable characters < \x20
    const cabbrev = { 0: '0', 7: 'a', 8: 'b', 9: 't', 10: 'n', 11: 'v', 12: 'f', 13: 'r' };
    string = string.replace(/[\x00-\xFF]/g, match => cabbrev[match.charCodeAt(0)] ? `\\${cabbrev[match.charCodeAt(0)]}` : `\\x${match.charCodeAt(0).toString(16).padStart(2, '0')}`);
    // replace nonprintable characters
    string = string.replace(/[\u0100-\uFFFF]/g, match => `\\u${match.charCodeAt(0).toString(16).padStart(4, '0')}`);
    string = string.replace(/[\u00FFFF-\u10FFFF]/g, match => `\\u{${match.charCodeAt(0).toString(16)}}`);
    return "'" + string + "'";
}