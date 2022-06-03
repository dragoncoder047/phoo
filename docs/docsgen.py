from glob import glob
import re
from textwrap import dedent

files = glob('lib/*.js') + glob('lib/*.ph')

COMMENT_RE = re.compile(r'/\* >>\n(?P<body>[\s\S]+?)\n\*/', re.M)
def findComments(txt):
    return map(lambda match: match.group('body'), COMMENT_RE.finditer(txt))

ONE_THING_RE = re.compile(r'(?P<tag>[a-z]+)>(?P<body> [^\n])')
def parseComment(body):
    last = ''
    out = {}
    for line in body.split('\n'):
        if (match := ONE_THING_RE.match(line)) is not None:
            last = match.group('tag')
            out[last] = match.group('body')
        else:
            out[last] += line
    return out
