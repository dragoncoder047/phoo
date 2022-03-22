function $(sel) { return document.querySelector(sel); }

var t = new Terminal();
t.open($('main'));
t.write('testing 123...\n\nHello \x1B[1;3;31mphoo\x1B[0m')