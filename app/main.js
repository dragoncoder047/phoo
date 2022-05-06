import { Phoo, initBuiltins, Module, FetchImporter, ES6Importer, STACK_TRACE_SYMBOL, type } from '../src/index.js';
import stringify from './stringify.js';

var count = 0;
var run;
const esc = $.terminal.escape_brackets;
const naiveColorize = (text, color) => `[[;${color};]${esc(text)}]`;
const color = (text, color) => naiveColorize(esc(text), color);
var p;

const term = $('body').terminal(c => run(c), {
    enabled: false,
    exit: false,
    greetings: 'Phoo is loading...',
    prompt: () => color(`[${count}]--> `, 'magenta'),
    autocompleteMenu: true,
    async completion() {
        var text = this.get_command(), list = [];
        if (text === '') {
            list = [
                '%run ',
                '%edit ',
            ];
        } else if (/^%[a-z]+\s/.test(text)) {
            list = [
                '%browse',
                'foo.ph',
            ];
        }
        return list;
    },
});

$.terminal.syntax('phoo');
$.terminal.prism_formatters = {
    prompt: false,
    echo: false,
    command: true,
};

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
        p = new Phoo({ importers: [new FetchImporter('lib/'), new ES6Importer('lib/')] });

        await initBuiltins(p);

        const thread = p.createThread('__main__');

        run = async function runCommand(c) {
            try {
                term.echo(naiveColorize('[DEBUG] Running: ' + c, 'green'));
                await thread.run(c);
            } catch (e) {
                count++;
                term.error('Error! ' + type(e) !== 'string' ? e.message : e);
                term.error(e[STACK_TRACE_SYMBOL] || 'Oops, no stack trace!');
            }
            term.echo('Stack: ' + stringify(thread.workStack, naiveColorize));
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
        term.error('Phoo stack trace:');
        term.error(e[STACK_TRACE_SYMBOL]);
        term.echo('Thread work stack:');
        term.echo(stringify(thread.workStack));
        term.echo('If this continues to occur, please report it:');
        term.echo('https://github.com/dragoncoder047/phoo/issues');
        term.disable();
        term.freeze();
        throw e;
    }
})();
