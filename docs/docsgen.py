from glob import glob
import re
from textwrap import dedent
try:
    from markdown import Markdown
except ModuleNotFoundError:
    from os import system
    system('pip3 install -U markdown')
    from markdown import Markdown

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
ISOLATED_WORD = r'(?<=[^a-zA-Z])(%s)(?=[^a-zA-z])'
def inlines(text, tags):
    words_to_codeify = tags.get('sed', '').replace('--', '').split() + tags.get('lookahead', '').split()
    for word in words_to_codeify:
        text = re.sub(ISOLATED_WORD % re.escape(word), r'`\1`', text)
    text = DOUBLE_BRACKET_WORD.sub(lambda m: f'[`{m.group(1)}`](#{encURI(m.group(1))})', text)
    return text

BAD_AN_1 = re.compile(r'(?<=\s)an(?=\s+[^aeiouy])', re.I)
BAD_AN_2 = re.compile(r'(?<=\s)a(?=\s+[aeiouy])', re.I)
def fixTypos(txt):
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
        return 'yyyyyyyyyyyyy'

USE_RE = re.compile(r'(?:\s|^)(?:re)?use\s(?!\S+>|do)(\S+)')
def findDependencies(txt):
    return [m.group(1) for m in USE_RE.finditer(txt)]

styles = 'code+.dpar{padding-left:10px;display:none;opacity:50%;font-size:75%}code:hover+.dpar,code:focus+.dpar{display:inline-block}.shadowed{opacity:50%}'

mkdP = Markdown(extensions=['attr_list', 'fenced_code', 'md_in_html', 'tables', 'smarty'])

docFiles = glob('lib/**/*.js', recursive=True) + glob('lib/**/*.ph', recursive=True)
allModulesList = []
for file in docFiles:
    print('processing', file)
    modulename = file.removesuffix('.ph').removesuffix('.js').removeprefix('lib/')
    fp = modulename.replace('/', '')
    with open(file) as f:
        txt = f.read()
    out_md = f'# `use {modulename}`\n\n'
    if (deps := findDependencies(txt)):
        out_md += '**Dependencies:** ' + ', '.join(f"[`{d.strip()}`]({d.strip().replace('/', '')}.html)" for d in deps)
    cmt = None
    for ctext in findComments(txt):
        cmt = buildMD(parseComment(ctext))
        if cmt == 'yyyyyyyyyyyyy':
            break
        out_md += '\n\n' + cmt
    else:
        out_md += '\n\n**TODO**'
    if cmt == 'yyyyyyyyyyyyy':
        continue
    out_md += '\n\n---\n\n[back to index](index.html)'
    mkdP.reset()
    html = mkdP.convert(out_md)
    with open(f'docs/{fp}.html', 'w') as htf:
        htf.write(f'<!DOCTYPE html><html><head><title>{modulename} :: Phoo docs</title><style>{styles}</style></head><body>{html}</body></html>')
    allModulesList.append((fp, modulename))

miscFiles = glob('docs/**/*.md', recursive=True)
miscFiles.remove('docs/index.md')
FIRST_HEADING_REGEX = re.compile(r'<([Hh][0-6])\b[^>]*>(.*?)</\1>')
miscFilesList = []
for file in miscFiles:
    print('processing ', file)
    mkdP.reset()
    with open(file) as mf:
        html = mkdP.convert(mf.read() + '\n\n---\n\n[back to index](index.html)')
    title = FIRST_HEADING_REGEX.search(html)
    if title:
        title = title.group(2)
    file = file.removesuffix('.md') + '.html'
    with open(file, 'w') as of:
        of.write(f'<!DOCTYPE html><html><head><title>{title or file} :: Phoo docs</title><style>{styles}</style></head><body>{html}</body></html>')
    miscFilesList.append((file.removeprefix('docs/'), title or file))

mkdP.reset()
print('generating index page')
with open('docs/index.md') as im:
    imht = mkdP.convert(im.read())

with open('docs/index.html', 'w') as df:
    df.write(f'<!DOCTYPE html><html><head><title>home :: Phoo docs</title><style>{styles}</style></head><body><h1>Phoo documentation index</h1>{imht}<h2>All modules</h2><ul>')
    for m in allModulesList:
        df.write(f'<li><a href="{m[0]}.html">{m[1]}</a></li>')
    if miscFilesList:
        df.write('</ul><h2>Miscellaneous pages</h2><ul>')
        for p in miscFilesList:
            df.write(f'<li><a href="{p[0]}">{p[1]}</a></li>')
    df.write('</ul></body></html>')
