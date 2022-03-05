function (p) {
    var o = p.pop();
    return print(type(o) == 'string' ? o : deep_repr(o, {sub: new Map([[p, 'self']])}));
} is print

function (p) {
    var o = p.pop();
    return print(type(o) == 'string' ? o : deep_repr(o, {sub: new Map([[p, 'self']])}), true);
} is print-html

function (p, cArr, {nextChar}) {
    p.builders.$(p, cArr, {nextChar});
    cArr.push(Symbol.for('print'));
} builds say

function (p, cArr, {nextChar}) {
    p.builders.$(p, cArr, {nextChar});
    cArr.push(Symbol.for('print-html'));
} builds html

function (p) {
    alert(p.pop('string'));
} is alert

function (p) {
    p.push(confirm(p.pop('string')));
} is confirm

// ]input[ is defined in main.js
[ print ]input[ await dup print nl ] is input

// cSpell:ignore inputbox
function (p) {
    p.push(prompt(p.pop('string')));
} is inputbox

[ 10 chr print ] is nl

[ 32 chr print ] is sp

function () {
    clear_console();
} is cc

async-function (p) {
    if (!'Notification' in window) p.bail('Notifications are not supported');
    if (Notification.permission == 'default') await Notification.requestPermission();
    if (Notification.permission != 'granted') p.bail('Permission denied for notifications');
    var body = p.pop('string');
    var title = p.pop('string');
    new Notification(title, { body });
} is notify

function () {
    hide_cursor();
} is hc

function () {
    show_cursor();
} is sc

async-function (p) {
    var d = p.pop('>num');
    await new Promise(r => setTimeout(r, d));
} is wait

// cSpell:ignore stacksize
[ stacksize while drop again ] is drop-all

// cSpell:ignore repr
function (p) {
    p.push(deep_repr(p.pop()));
} is repr

function (p) {
    var s = p.work_stack;
    print(`\nStack: (${s.length}) ${deep_repr(s)}\n`);
} is echostack // cSpell:ignore echostack

[
    [
        try [ PINQ ]
        [
            say "Error: "
            . message print
        ]
        echostack
    ]
    $ '> ' input again
] is shell

function () {
    // cSpell:ignore pinq
    window.open('../../pinq/doc/std', '_blank');
} is ?

[ ? ] is help
