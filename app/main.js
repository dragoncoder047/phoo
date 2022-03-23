function $(sel) { return document.querySelector(sel); }

const term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    cursorStyle: 'block',
    fontFamily: '"IBM Mono", monospace',
});
const fitter = new FitAddon.FitAddon(); // webpack glitch; should be just `new FitAddon()`
const readline = new LocalEchoController({ // note: this is a monkeypatched version.
    historySize: Infinity,
    incompleteTest: function isIncomplete(text) {
        var words = text.split(/\s+/);
        var weights = { do: 1, end: -1, '[': 1, ']': -1 };
        var count = 0;
        for (var w of words) count += weights[w] || 0;
        return count > 0;
    }
});
term.open($('#terminal'));
term.loadAddon(fitter);
term.loadAddon(readline);
fitter.fit();
term.write('Phoo is loading... ');

var loading = (function load() {
    var x = '/-\\|';
    var i = 0;
    return (function test() {
        term.write('\b');
        term.write(x[i]);
        if (++i == x.length) i = 0;
        return setTimeout(test, 250);
    })();
})();

// do load
import('../src/index.js').then(async imodule => {
    clearTimeout(loading);
    term.clear();
    term.writeln('Hello world');
    term.focus();

    const PROMPT_1 = '\x1b[31m->\x1b[0m ';
    const PROMPT_2 = '\x1b[31m..\x1b[0m ';

    while (true) {
        runCommand(await readline.read(PROMPT_1, PROMPT_2));
    }
    function runCommand(c) {
        term.writeln(`\x1b[31m${c}\x1b[0m`);
    }

    function kill() {
        term.writeln('\x1b[31mKilled\x1b[0m');
    }

}).catch(e => {
    term.clear();
    term.write('\x1b[41m');
    term.write('Fatal error!\n\n');
    term.write(e.stack);
});
