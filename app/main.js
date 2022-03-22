import { Phoo, initBuiltins } from '../src/index.js';

function $(sel) { return document.querySelector(sel); }

var term = new Terminal();
term.open($('main'));
term.write('Phoo is loading... ')

var loading = (function load() {
    var x = '/-|\\';
    var i = 0;
    (function test() {
        term.write('\b');
        term.write(x[i]);
        if (++i == x.length) i = 0;
        setTimeout(test, 250);
    })();
})();

// do load

return;

clearTimeout(loading);
term.clear();