function $(sel) { return document.querySelector(sel); }

const term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    cursorStyle: 'block',
});
term.open($('#terminal'));
const fitter = new FitAddon.FitAddon(); // webpack glitch; should be just `new FitAddon()`
const readline = new LocalEchoController(term, { // note: this is a monkeypatched version.
    historySize: Infinity,
    incompleteTest: function isIncomplete(text) {
        var words = text.split(/\s+/);
        var weights = { do: 1, end: -1, '[': 1, ']': -1 };
        var count = 0;
        for (var w of words) count += weights[w] || 0;
        return count > 0;
    }
});
term.loadAddon(fitter);
fitter.fit();
term.write('Phoo is loading... ');

var loading = true;
(function load() {
    var x = '/-\\|';
    var i = 0;
    (function test() {
        if (loading) {
            setTimeout(test, 100);
            term.write('\b');
            term.write(x[i]);
            if (++i == x.length) i = 0;
        }
    })();
})();

// do load
import('../src/index.js').then(async imodule => {
    await new Promise(r => setTimeout(r, 500));
    loading = false;
    term.writeln('\x1b[2K\x1b[20DWelcome to Phoo.');
    term.focus();

    const PROMPT_1 = '\x1b[34m->\x1b[0m ';
    const PROMPT_2 = '\x1b[34m..\x1b[0m ';

    while (true) {
        runCommand(await readline.read(PROMPT_1, PROMPT_2));
    }
    function runCommand(c) {
        term.writeln(`\x1b[31mYou wrote:\n${c}\x1b[0m`);
    }

    function kill() {
        term.writeln('\x1b[31mKilled\x1b[0m');
    }

}).catch(e => {
    loading = false;
    term.write('\x1b[31m');
    term.writeln('\nFatal error!');
    term.writeln(e);
    term.writeln(e.stack);
    throw e;
});
