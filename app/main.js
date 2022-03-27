
var count = 0;
var run;
const esc = $.terminal.escape_brackets;
var p;

const term = $('body').terminal(c => run(c), {
    enabled: false,
    exit: false,
    greetings: 'Phoo is loading...',
    prompt: () => `[[;magenta;]${esc(`[${count}]`)}-->] `,
    keymap: {
        ENTER(e, original) {
            var i = next_indent_level(this.get_command());
            if (i === 0) {
                original();
            } else if (i < 0) {
                term.error('Too many ] / end');
            } else {
                this.insert('\n' + ' '.repeat(4 * Math.max(0, i)));
            }
        }
    },
    autocompleteMenu: true,
    async completion() {
        return []; // TODO
    },
});

run = () => term.error('Still loading... be patient...');

var loading = true;
(function () {
    var chars = '-\\|/';
    var i = 0;
    (function tick() {
        if (loading) {
            setTimeout(tick, 100);
            term.update(0, `Phoo is loading... ${chars[i]}`);
            if (++i == chars.length) i = 0;
        }
    })();
})();

// do load
import('../src/index.js').then(async phoo => {
    loading = false;
    term.update(0, 'Welcome to Phoo.');
    term.enable();
    term.focus();

    p = new phoo.Phoo({ mainModule: new phoo.Module('__main__') });

    await phoo.initBuiltins(p);

    run = async function runCommand(c) {
        await p.spawn(c).promise;
    };

}).catch(e => {
    loading = false;
    term.error('\nFatal error!');
    term.exception(e);
    term.error('If this continues to occur, please [[!;;;;https://github.com/dragoncoder047/phoo/issues]report it.]');
    term.freeze();
    throw e;
});

function next_indent_level(text) {
    var count = 0;
    const levels = { do: 1, end: -1, '[': 1, ']': -1 };
    for (var word of text.split(/\s+/)) count += levels[word] || 0;
    return count;
}