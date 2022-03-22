function $(sel) { return document.querySelector(sel); }

var term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    cursorStyle: 'block',
    rows: 25,
    cols: 80,
});
var fitter = new FitAddon();
term.loadAddon(fitter);
term.open($('#terminal'));
fitter.fit();
term.write('Phoo is loading... ')

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

// clearTimeout(loading);
// term.clear();
// term.writeln('Hello world')

// const PROMPT_1 = '\x1b[31m->\x1b[0m '
// const PROMPT_2 = '\x1b[31m..\x1b[0m ';
// const PROMPT_WIDTH = 3;
// var command = '';
// var multiline = false;

// term.onData(data => {
//     switch (data) {
//         case '\x03': // Ctrl+C
//             term.write('^C');
//             kill();
//             term.write('\r\n' + PROMPT_1);
//             break;
//         case '\r': // Enter
//             [multiline, command] = runCommand(command);
//             term.write(multiline ? PROMPT_2 : PROMPT_1);
//             break;
//         case '\x7F': // Backspace (DEL)
//             // Do not delete the prompt
//             if (term._core.buffer.x > PROMPT_WIDTH) {
//                 term.write('\b \b'); // back up and erase a char
//                 if (command.length > 0) {
//                     command = command.substring(0, command.length - 1);
//                 }
//                 else {
//                     term.write('\a'); // bell
//                 }
//             }
//             else {
//                 term.write('\a'); // bell
//             }
//             break;
//         default: // Print all other characters
//             if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7B) || e >= '\u00a0') {
//                 command += e;
//                 term.write(e);
//             }
//     }
// });

// function runCommand(c) {
//     term.writeln(`\x1b[31m${c}\x1b[0m`);
// }

// function kill() {
//     term.writeln('\x1b[31mKilled\x1b[0m')
// }

// term.focus();
