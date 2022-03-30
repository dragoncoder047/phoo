
var count = 0;
var run;
const esc = $.terminal.escape_brackets;
const color = (text, color) => `[[;${color};]${esc(text)}]`;
var p;

const term = $('body').terminal(c => run(c), {
    enabled: false,
    exit: false,
    greetings: 'Phoo is loading...',
    prompt: () => color(`[${count}]--> `, 'magenta'),
    keymap: {
        ENTER(e, original) {
            var i = nextIndentLevel(this.get_command());
            if (i === 0) {
                original();
            } else if (i < 0) {
                term.echo(color('Too many ] / end', 'red'));
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
(async () => {
    try {
        const { Phoo, initBuiltins, Module } = await import('../index.js');

        p = new Phoo({ mainModule: new phoo.Module('__main__') });

        await initBuiltins(p);

        const thread = p.createThread('__main__');

        run = async function runCommand(c) {
            try {
                await thread.run(c);
            } catch (e) {
                count++;
                term.error('Error! ' + e.message);
                term.error(phoo.stringifyReturnStack(e[phoo.STACK_TRACE_SYMBOL]));
                return;
            }
            term.echo('Stack: ' + thread.workStack.toString());
            count++;
        };

        loading = false;
        term.update(0, 'Welcome to Phoo.');
        term.enable();
        term.focus();

    } catch (e) {
        loading = false;
        term.error('\nFatal error!');
        term.exception(e);
        term.echo($('<span style="color: red; font-size: 16px;">If this continues to occur, please <a href="https://github.com/dragoncoder047/phoo/issues">report it.</a></span>'));
        term.disable();
        term.freeze();
        throw e;
    }
})();

function nextIndentLevel(text) {
    var count = 0;
    const levels = { do: 1, end: -1, '[': 1, ']': -1 };
    for (var word of text.split(/\s+/)) count += levels[word] || 0;
    return count;
}