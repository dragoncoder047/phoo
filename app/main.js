function $(sel) { return document.querySelector(sel); }

var term = new Terminal();
term.open($('main'));
term.write('Phoo is loading... ')
var x = '/-|\\';
var i = 0;
(function test() {
    term.write('\b');
    term.write(x[i]);
    if (++i == x.length) i = 0;
    setTimeout(test, 50);
})();