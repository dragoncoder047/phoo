import { Phoo, initBuiltins, FetchLoader, ES6Loader, STACK_TRACE_SYMBOL } from '/phoo/src/index.js';
import { ExternalInterrupt, stringifyReturnStack } from '/phoo/src/errors.js';
import { type } from '/phoo/src/utils.js';
import stringify from './stringify.js';

const color = (text, color) => `<span style="color:${color};font-size:inherit">${text}</span>`;
var p, thread;

export const term = $('body').terminal(() => term.error('Hey! you should never see this'), {
    enabled: false,
    exit: false,
    greetings: 'Phoo is loading...',
    clear: false,
    scrollOnEcho: true,
    mousewheel: () => true,
    autocompleteMenu: true,
    completion() {
        if (!p.settings.autocomplete) return [];
        return Array.from(thread.module.words.map.keys());
    },
});

$.terminal.syntax('phoo');
$.terminal.prism_formatters = { prompt: false, echo: false, command: true };

Object.assign(window, { stringify, color, term, FetchLoader, ES6Loader });

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
        p = new Phoo({ loaders: [new FetchLoader('/phoo/lib/'), new ES6Loader('../lib/')] });
        Object.assign(window, { p });

        thread = p.createThread('__main__');
        p.settings.autocomplete = true;

        // patch console to show debug messages in terminal 
        window.console.debug = function patched(...items) {
            var joined = items.map(x => type(x) === 'string' ? x : stringify(x, { colorize: color })).join(' ').replaceAll("\n", "\\n");
            term.echo(color(`[DEBUG] ${joined}`, 'lime'), { raw: true });
            var stack;
            try {
                throw new Error("DebugGetStack");
            } catch (e) {
                stack = e.stack;
            }
            term.echo(color(`<details><summary>Stack trace</summary>${stack}</details>`, 'lime'), { raw: true });
            term.echo(color("Return stack: " + stringifyReturnStack(thread.returnStack), 'lime'), { raw: true });
            term.echo(color("Work stack: " + stringify(thread.workStack, { colorize: color }), 'lime'), { raw: true });
            term.echo();
        }

        await initBuiltins(thread, '/phoo/lib/builtins.ph');
        await thread.run(await (await fetch('/app/shell.ph')).text());

        loading = false;
        term.clear().enable().focus();
        await thread.run('__m__');
        throw ExternalInterrupt.withPhooStack('Phoo exited unexpectedly.', thread.returnStack);
    } catch (e) {
        loading = false;
        term.error('\nEither an error occurred loading Phoo, or you\nmanaged to break the shell.');
        term.exception(e);
        term.error('Phoo stack trace:');
        term.error(e[STACK_TRACE_SYMBOL]);
        term.error('Thread work stack:');
        term.echo(color(stringify(thread.workStack, { colorize: color }), 'red'), { raw: true });
        term.error('If this continues to occur, please report it:');
        term.error('https://github.com/phoo-lang/phoo/issues');
        term.pause();
        throw e;
    }
})();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/app/sw.js");
}
