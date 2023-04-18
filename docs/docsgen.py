from glob import glob
import re
from textwrap import dedent
from os import system, environ
try:
    from markdown import Markdown
except ModuleNotFoundError:
    system('pip3 install -U markdown')
    from markdown import Markdown

system('pip3 install pymdown-extensions')

COMMENT_RE = re.compile(r'/\* >>\n(?P<body>[\s\S]+?)\n\*/', re.M)
def findComments(txt):
    return [match.group('body') for match in COMMENT_RE.finditer(txt)]

ONE_THING_RE = re.compile(r'(?P<tag>[a-z0-9A-Z-_]+)>\s*(?P<body>[^\n]*)?')
def parseComment(body):
    last = ''
    out = {'raw_source': body}
    for line in body.split('\n'):
        if (match := ONE_THING_RE.match(line)) is not None:
            last = match.group('tag')
            out[last] = match.group('body')
        else:
            out[last] += '\n' + line
    return out

BAD_CHARS_RE = re.compile(r'[^a-z0-9]', re.I)
def encURI(x):
    return BAD_CHARS_RE.sub(lambda m: '%' + hex(ord(m.group(0)))[2:], x)

DOUBLE_BRACKET_WORD = re.compile(r'\[\[(\S+)\]\]')
ISOLATED_WORD = r"(?<=[^a-zA-Z'])(%s)(?=[^a-zA-z])"
def inlines(text, tags):
    words_to_codeify = tags.get('sed', '').replace('--', '').split() + tags.get('lookahead', '').split()
    for word in words_to_codeify:
        text = re.sub(ISOLATED_WORD % re.escape(word), r'`\1`', text)
    text = DOUBLE_BRACKET_WORD.sub(lambda m: f'[`{m.group(1)}`](#{encURI(m.group(1))})', text)
    return text

BAD_AN_1 = re.compile(r'(?<=\s)an(?=\s+[^aeiouy])', re.I)
BAD_AN_2 = re.compile(r'(?<=\s)a(?=\s+[aeiouy])', re.I)
def fixTypos(txt):
    txt = txt.strip()
    txt = BAD_AN_1.sub('a', txt)
    txt = BAD_AN_2.sub('an', txt)
    txt = txt.rstrip('.') + '.'
    txt = txt[0].capitalize() + txt[1:]
    return txt

def buildMD(tags):
    if 'word' in tags or 'macro' in tags:
        wname = tags.get('word') or tags.get('macro') or ''
        description = tags.get('description', '')
        lookaheads = [f'*`{xx.strip()}`*{{.shadowed}}' for xx in tags.get('lookahead', '').split()]
        sed_text = tags.get('sed', '')
        if '--' in sed_text:
            st_left, st_right = sed_text.split('--', 1)
        else:
            st_left, st_right = sed_text, ''
        seds_l = [f'`{i.strip()}`' + (f'*{tags.get(i.strip(), "")}*{{.dpar}}' if i.strip() in tags else '') for i in st_left.strip().split()]
        seds_r = [f'`{i.strip()}`' + (f'*{tags.get(i.strip(), "")}*{{.dpar}}' if i.strip() in tags else '') for i in st_right.strip().split()]
        example = tags.get('example')
        seealsos = [f'[`{t.strip()}`](#{encURI(t.strip())})' for t in tags.get('see-also', '').split()]
        body = f'### `{wname}` {" ".join(lookaheads)} ( {" ".join(seds_l)} &rarr; {" ".join(seds_r)} ) {{#{encURI(wname)}}}\n\n{fixTypos(dedent(inlines(description, tags)).strip())}'
        if example:
            body += f'\n\nExample:\n\n```phoo\n{dedent(example)}\n```'
        if seealsos:
            body += f'\n\n **See Also:** {", ".join(seealsos)}'
        return body
    elif 'plain' in tags:
        return dedent(tags['plain']).strip()
    elif 'hidemodule' in tags:
        return 'HIDDEN_SENTINEL'

USE_RE = re.compile(r'(?:\s|^)(?:re)?use\s(?!\S+>|do)(\S+)')
def findDependencies(txt):
    return [m.group(1) for m in USE_RE.finditer(txt)]

with open('__header__.html') as hhhh:
    headerContent = hhhh.read()

mkdP = Markdown(extensions=['attr_list', 'admonition', 'pymdownx.details', 'fenced_code', 'md_in_html', 'tables', 'toc', 'smarty', 'pymdownx.inlinehilite'])

# Clone the Phoo repository locally
# could use a Git submodule, but I'm lazy
system('git clone https://github.com/phoo-lang/phoo.git')
# Wipe the generated directories
system('rm -rf module')
system('mkdir module')
system('rm -rf more')
system('mkdir more')
docFiles = glob('phoo/lib/**/*.js', recursive=True) + glob('phoo/lib/**/*.ph', recursive=True)

allModulesList = []
for file in docFiles:
    print('processing', file)
    modulename = file.removesuffix('.ph').removesuffix('.js').removeprefix('phoo/lib/')
    fp = modulename.replace('/', '') + '.html'
    with open(file) as f:
        txt = f.read()
    out_md = f'# `use {modulename}`\n\n'
    if (deps := findDependencies(txt)):
        out_md += '**Dependencies:** ' + ', '.join(f"[`{d.strip()}`]({d.strip().replace('/', '')}.html)" for d in deps)
    cmt = None
    foundComments = findComments(txt)
    for ctext in foundComments:
        cmt = buildMD(parseComment(ctext))
        if cmt == 'HIDDEN_SENTINEL':
            break
        out_md += '\n\n' + cmt
    if len(foundComments) == 0:
        out_md += '\n\n**TODO**'
    if cmt == 'HIDDEN_SENTINEL':
        continue
    out_md += f'\n\n---\n\n[back to index](/docs/index.html)\n\ndocs@{environ["GITHUB_SHA"][:7]}\n{{.shadowed}}'
    mkdP.reset()
    html = mkdP.convert(out_md)
    with open(f'module/{fp}', 'w') as htf:
        htf.write(f'<!DOCTYPE html><html><head><title>{modulename} :: Phoo docs</title>{headerContent}</head><body>{html}</body></html>')
    allModulesList.append((fp, modulename))

# Clean the Phoo repository so it won't be committed
system('rm -rf phoo')

miscFiles = glob('**/*.md', recursive=True)
miscFiles.remove('index.md')
FIRST_HEADING_REGEX = re.compile(r'<([Hh][0-6])\b[^>]*>(.*?)</\1>')
miscFilesList = []
for file in miscFiles:
    print('processing', file)
    mkdP.reset()
    with open(file) as mf:
        html = mkdP.convert(mf.read() + f'\n\n---\n\n[back to index](/docs/index.html)\n\ndocs@{environ["GITHUB_SHA"][:7]}\n{{.shadowed}}')
    title = FIRST_HEADING_REGEX.search(html)
    if title:
        title = title.group(2)
        if title == 'HIDDEN':
            continue
    file = file.removesuffix('.md') + '.html'
    path = f'more/{file}' if file != '404.html' else file
    with open(path, 'w') as of:
        of.write(f'<!DOCTYPE html><html><head><title>{title or file} :: Phoo docs</title>{headerContent}</head><body class="line-numbers">{html}</body></html>')
    miscFilesList.append((file, title or file))

mkdP.reset()
print('generating index page...')
with open('index.md') as im:
    imht = mkdP.convert(im.read())

with open('index.html', 'w') as df:
    df.write(f'<!DOCTYPE html><html><head><title>home :: Phoo docs</title>{headerContent}</head><body class="line-numbers"><h1>Phoo documentation index</h1>{imht}<h2>All modules</h2><ul>')
    for mfile, mname in allModulesList:
        df.write(f'<li><a href="module/{mfile}">{mname}</a></li>')
    if miscFilesList:
        df.write('</ul><h2>Miscellaneous pages</h2><ul>')
        for filename, pagename in miscFilesList:
            df.write(f'<li><a href="more/{filename}">{pagename}</a></li>')
    df.write('</ul></body></html>')
