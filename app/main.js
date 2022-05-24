import { Phoo, initBuiltins, FetchLoader, ES6Loader, STACK_TRACE_SYMBOL, type } from '../src/index.js';
import { module as shell_module } from './shell_module.js';
import stringify from './stringify.js';

var count = 0;
var run;
const esc = $.terminal.escape_brackets;
const naiveColorize = (text, color) => `[[;${color};]${esc(text)}]`;
// TODO: fix font size getting bigger
const color = (text, color) => `<span style="color:${color};font-size:inherit">${text}</span>`;
var p, thread;

export const term = $('body').terminal(c => run(c), {
    enabled: false,
    exit: false,
    greetings: 'Phoo is loading...',
    prompt: () => naiveColorize(`(${count})--> `, 'magenta'),
    // autocompleteMenu: true,
    // async completion() {
    //     var text = this.get_command(), list = [];
    //     AAAAAAAAAAAA
    // },
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
        p = new Phoo({ loaders: [new FetchLoader('lib/'), new ES6Loader('lib/')] });

        thread = p.createThread('__main__');

        // patch console to show debug messages in terminal 
        window.console.debug = function patched(...items) {
            var joined = items.map(x => type(x) === 'string' ? x : stringify(x, color)).join(' ');
            term.echo(color(`[DEBUG] ${joined}`, 'lime'), { raw: true });
        }

        await initBuiltins(thread);
        thread.getScope(0).copyFrom(shell_module);

        run = async function runCommand(c) {
            try {
                await thread.run(c);
            } catch (e) {
                count++;
                term.error('Error! ' + type(e) !== 'string' ? e.message : e);
                term.error(e[STACK_TRACE_SYMBOL] || 'No stack trace');
            }
            term.echo('Stack: ' + color(stringify(thread.workStack, color), 'inherit'), { raw: true });
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
        term.echo(color(stringify(thread.workStack, color), 'inherit'), { raw: true });
        term.echo('If this continues to occur, please report it:');
        term.echo('https://github.com/dragoncoder047/phoo/issues');
        term.disable();
        term.freeze();
        throw e;
    }
})();
