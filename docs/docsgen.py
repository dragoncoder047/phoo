from glob import glob
import re
from textwrap import dedent
from os import system
system('pip3 install -U markdown')
from markdown import Markdown

COMMENT_RE = re.compile(r'/\* >>\n(?P<body>[\s\S]+?)\n\*/', re.M)
def findComments(txt):
    return [match.group('body') for match in COMMENT_RE.finditer(txt)]

ONE_THING_RE = re.compile(r'(?P<tag>[a-z]+)>\s*(?P<body>[^\n]*)?')
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

DOUBLE_BRACKET_WORD = re.compile(r'\[\[(\S+)\]\]')
ISOLATED_WORD = r'(?<=[^a-zA-Z])(%s)(?=[^a-zA-z])'
def inlines(text, tags):
    words_to_codeify = list(set(tags.get('sed', '').split()) - {'--'} + set(tags.get('lookahead', '')))
    for word in words_to_codeify:
        text = re.sub(ISOLATED_WORD % word, r'`\1`', text)
    text = DOUBLE_BRACKET_WORD.sub(r'[`\1`](#\1)', text)
    return text

BAD_AN_1 = re.compile(r'(?<=\s)an(?=\s+[^aeiouy])', re.I)
BAD_AN_2 = re.compile(r'(?<=\s)a(?=\s+[aeiouy])', re.I)
def fixTypos(txt):
    txt = BAD_AN_1.sub(txt, 'a')
    txt = BAD_AN_2.sub(txt, 'an')
    return txt.capitalize().rstrip('.') + '.'

def buildMD(tags):
    wname = tags.get('word') or tags.get('macro') or ''
    description = tags.get('description', '')
    lookaheads = [f'*`{xx.strip()}`*{{.shadowed}}' for xx in tags.get('lookahead', '').split()]
    sed_text = tags.get('sed', '')
    st_left, st_right = sed_text.split('--', 1)
    seds_l = [f'`{i.strip()}`*{tags.get(i.strip(), "")}*{{.description}}' for i in st_left]
    seds_r = [f'`{i.strip()}`*{tags.get(i.strip(), "")}*{{.description}}' for i in st_right]
    example = tags.get('example')
    seealsos = [f'[`{t.strip()}`](#{t.strip()})' for t in tags.get('see-also', '').split()]
    body = f'## `{wname}` {" ".join(lookaheads)} ( {" ".join(seds_l)} &rarr; {" ".join(seds_r)} )\n\n{dedent(fixTypos(inlines(description, tags)))}\n{{#{wname}}}'
    if example:
        body += f'\n\n```phoo\n{dedent(example)}\n```'
    if seealsos:
        body += f'\n\n **See Also:** {", ".join(seealsos)}'
    return body

styles = 'code+.description{display:none;opacity:50%}code:hover+.description{display:inline-block}.shadowed{opacity:50%}'

files = glob('lib/*.js') + glob('lib/*.ph')

mkdP = Markdown(extensions=['attr_list', 'fenced_code', 'md_in_html', 'tables', 'smarty'])

for file in files:
    print('processing', file)
    base = file.removesuffix('.ph').removesuffix('.js').replace('/', '')
    with open(file) as f:
        txt = f.read()
    out_md = ''
    for ctext in findComments(txt):
        out_md += buildMD(parseComment(ctext))
    with open(f'docs/{base}.md', 'w') as mdf:
        mdf.write(out_md)
    mkdP.reset()
    html = mkdP.convert(out_md)
    with open(f'docs/{base}.html', 'w') as htf:
        htf.write(f'<!DOCTYPE html><html><head><title>Phoo docs for {file}</title><style>{styles}</style></head><body>{html}</body></html>')
