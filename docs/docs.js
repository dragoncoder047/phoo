// enable KaTeX
window.addEventListener('DOMContentLoaded', _ => {
    renderMathInElement(document.body, {
        delimiters: [{
            left: '$$',
            right: '$$',
            display: true
        }, {
            left: '$',
            right: '$',
            display: false
        }]
    });
});

// add run button to Phoo snippets
Prism.plugins.toolbar.registerButton('run-code', function (env) {
    var pre = env.element.parentNode;
    var lang = Prism.util.getLanguage(pre);
    if (!pre || !/pre/i.test(pre.nodeName) || lang !== 'phoo') return;
    var a = document.createElement('a');
    a.setAttribute('href', `/?code=${btoa(pre.textContent)}`);
    a.setAttribute('target', '_blank');
    a.textContent = 'Run this code';
    return a;
});
