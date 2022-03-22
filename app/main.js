import { Phoo, initBuiltins } from '../src/index.js';

function $(sel) { return document.querySelector(sel); }

var term = new Terminal();
term.open($('main'));
term.fit();
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

clearTimeout(loading);
term.clear();

term.onData = function(data) {
    term.write(data);
}