#!/usr/bin/env python3
"""
svgslice — deterministic extraction of sub-graphics out of a large Figma SVG export.

The Figma page exports are single flat SVGs whose top-level children are the page's
drawing operations in paint order. This tool lets you address those children by index
and lift a contiguous/arbitrary set of them into a standalone, self-contained SVG with
(a) only the <defs> they actually reference, and (b) a tight viewBox.

Commands
--------
  index   <page>                         print the manifest (index, tag, attrs, bbox)
  extract <page> --idx 3,5-9 --out F.svg lift those children into a standalone SVG

<page> is a key in PAGES below.

bboxes are measured by rendering in headless Chrome and calling getBBox(), so they are
exact rather than estimated from path data.
"""
import argparse, json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
PAGES = {
    'solutions': os.path.join(ROOT, 'solutions-skeleton.svg'),
    'platform':  os.path.join(ROOT, 'platform-skeleton.svg'),
}
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

VOID = {'path', 'circle', 'rect', 'ellipse', 'image', 'use', 'stop', 'line', 'polyline', 'polygon'}


# ---------------------------------------------------------------- tiny XML walker

class Node:
    __slots__ = ('tag', 'attrs', 'raw', 'children', 'start', 'end')

    def __init__(self, tag, attrs, raw, start):
        self.tag, self.attrs, self.raw, self.start = tag, attrs, raw, start
        self.children, self.end = [], None


TOKEN = re.compile(r'<(/?)([A-Za-z_][\w:.-]*)((?:"[^"]*"|\'[^\']*\'|[^>"\'])*?)(/?)>', re.S)
ATTR = re.compile(r'([\w:.-]+)\s*=\s*"([^"]*)"')


def parse(src):
    """Return (root_children, full_text). Only structural fidelity is needed."""
    stack, roots = [], []
    for m in TOKEN.finditer(src):
        closing, tag, attrs, selfclose = m.groups()
        if tag in ('?xml', '!DOCTYPE'):
            continue
        if closing:
            if stack and stack[-1].tag == tag:
                n = stack.pop()
                n.end = m.end()
                n.raw = src[n.start:n.end]
            continue
        node = Node(tag, dict(ATTR.findall(attrs)), None, m.start())
        if stack:
            stack[-1].children.append(node)
        else:
            roots.append(node)
        if selfclose or tag in VOID:
            node.end = m.end()
            node.raw = src[node.start:node.end]
        else:
            stack.append(node)
    return roots, src


def load(page):
    src = open(PAGES[page], encoding='utf-8').read()
    roots, _ = parse(src)
    svg = next(n for n in roots if n.tag == 'svg')
    defs = next((n for n in svg.children if n.tag == 'defs'), None)
    # the page content lives in the first <g clip-path=...> wrapper
    wrapper = next((n for n in svg.children if n.tag == 'g'), None)
    kids = wrapper.children if wrapper is not None else [n for n in svg.children if n.tag != 'defs']
    return src, svg, defs, wrapper, kids


# ---------------------------------------------------------------- bbox via Chrome

def measure(page):
    """getBBox() for every top-level child, measured in headless Chrome."""
    src, svg, defs, wrapper, kids = load(page)
    cache = os.path.join(ROOT, f'.bbox-{page}.json')
    if os.path.exists(cache):
        return json.load(open(cache))
    html = f"""<!doctype html><meta charset=utf-8><body>{src}
<pre id=out></pre><script>
const svg=document.querySelector('svg');
const wrap=svg.querySelector('g');
const kids=[...wrap.children];
const res=kids.map((el,i)=>{{let b=null;try{{b=el.getBBox()}}catch(e){{}}
 return {{i,tag:el.tagName,x:b?+b.x.toFixed(2):null,y:b?+b.y.toFixed(2):null,
 w:b?+b.width.toFixed(2):null,h:b?+b.height.toFixed(2):null}};}});
document.getElementById('out').textContent=JSON.stringify(res);
</script></body>"""
    with tempfile.TemporaryDirectory() as td:
        p = os.path.join(td, 'm.html')
        open(p, 'w', encoding='utf-8').write(html)
        dom = subprocess.run([CHROME, '--headless', '--disable-gpu', '--no-sandbox',
                              '--virtual-time-budget=15000', '--dump-dom', 'file://' + p],
                             capture_output=True, text=True, timeout=180).stdout
    m = re.search(r'<pre id="out">(\[.*?\])</pre>', dom, re.S)
    if not m:
        sys.exit('could not measure bboxes (Chrome returned no payload)')
    data = json.loads(m.group(1).replace('&quot;', '"'))
    json.dump(data, open(cache, 'w'))
    return data


# ---------------------------------------------------------------- defs resolution

REF = re.compile(r'url\(#([^)]+)\)|(?:xlink:)?href="#([^"]+)"')


def collect_refs(text):
    return {a or b for a, b in REF.findall(text)}


def resolve_defs(defs_node, needed):
    """Pull the referenced defs (transitively) preserving document order."""
    if defs_node is None:
        return [], set()
    by_id = {}
    for child in defs_node.children:
        i = child.attrs.get('id')
        if i:
            by_id[i] = child
    picked, seen = [], set()

    def walk(name):
        if name in seen or name not in by_id:
            return
        seen.add(name)
        node = by_id[name]
        for r in collect_refs(node.raw):
            walk(r)
        picked.append(node)

    for n in sorted(needed):
        walk(n)
    order = {c.attrs.get('id'): k for k, c in enumerate(defs_node.children)}
    picked.sort(key=lambda n: order.get(n.attrs.get('id'), 0))
    return picked, seen


# ---------------------------------------------------------------- commands

def parse_idx(spec):
    out = []
    for part in spec.split(','):
        part = part.strip()
        if not part:
            continue
        if '-' in part.lstrip('-') and not part.startswith('-'):
            a, b = part.split('-', 1)
            out.extend(range(int(a), int(b) + 1))
        else:
            out.append(int(part))
    return sorted(set(out))


def cmd_index(args):
    src, svg, defs, wrapper, kids = load(args.page)
    boxes = {b['i']: b for b in measure(args.page)}
    for i, k in enumerate(kids):
        b = boxes.get(i, {})
        hint = ''
        for a in ('fill', 'stroke', 'id', 'transform', 'clip-path', 'filter'):
            if a in k.attrs:
                hint += f' {a}={k.attrs[a][:34]}'
        geo = ''
        if b.get('w') is not None:
            geo = f"[{b['x']:>8.1f},{b['y']:>8.1f} {b['w']:>7.1f}x{b['h']:<7.1f}]"
        if args.bbox:
            x0, y0, x1, y1 = args.bbox
            if b.get('w') is None or not (b['x'] < x1 and b['x'] + b['w'] > x0
                                          and b['y'] < y1 and b['y'] + b['h'] > y0):
                continue
        print(f'{i:>4} {k.tag:<8}{geo}{hint[:96]}')


def cmd_extract(args):
    src, svg, defs, wrapper, kids = load(args.page)
    boxes = {b['i']: b for b in measure(args.page)}
    idx = parse_idx(args.idx)
    bad = [i for i in idx if i >= len(kids)]
    if bad:
        sys.exit(f'index out of range: {bad} (max {len(kids)-1})')

    chunks = [kids[i].raw for i in idx]
    body = '\n'.join(chunks)

    # tight viewBox over the selection
    sel = [boxes[i] for i in idx if boxes.get(i, {}).get('w')]
    if args.viewbox:
        x0, y0, w, h = args.viewbox
    elif sel:
        x0 = min(b['x'] for b in sel); y0 = min(b['y'] for b in sel)
        x1 = max(b['x'] + b['w'] for b in sel); y1 = max(b['y'] + b['h'] for b in sel)
        p = args.pad
        x0, y0, w, h = x0 - p, y0 - p, (x1 - x0) + 2 * p, (y1 - y0) + 2 * p
    else:
        sys.exit('selection has no measurable geometry; pass --viewbox')

    picked, _ = resolve_defs(defs, collect_refs(body))
    # the wrapper's clip-path would crop to the page; drop it, keep other wrapper attrs
    wattr = ' '.join(f'{k}="{v}"' for k, v in (wrapper.attrs if wrapper else {}).items()
                     if k != 'clip-path')
    open_g = f'<g {wattr}>' if wattr else ''
    close_g = '</g>' if wattr else ''

    defs_txt = ''
    if picked:
        defs_txt = '<defs>\n' + '\n'.join(d.raw for d in picked) + '\n</defs>\n'

    out = (f'<svg width="{w:.2f}" height="{h:.2f}" viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" '
           f'fill="none" xmlns="http://www.w3.org/2000/svg" '
           f'xmlns:xlink="http://www.w3.org/1999/xlink">\n'
           f'{defs_txt}{open_g}\n{body}\n{close_g}\n</svg>\n')

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    open(args.out, 'w', encoding='utf-8').write(out)
    print(f'wrote {args.out}  ({len(out):,}B)  viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}"  '
          f'{len(idx)} nodes, {len(picked)} defs')


def cmd_dump(args):
    """Print one top-level child's raw XML, one element per line, with child indices.

    Use this to sub-select inside a <g> (e.g. lift just the icon out of a card that also
    contains its label text), then hand the chosen lines to `compose`.
    """
    src, svg, defs, wrapper, kids = load(args.page)
    node = kids[args.i]
    print(f'<!-- child {args.i}: <{node.tag}> {node.attrs} -->')
    if args.children and node.children:
        for j, c in enumerate(node.children):
            print(f'\n=== [{j}] <{c.tag}> ===')
            print(c.raw if len(c.raw) <= args.max else c.raw[:args.max] + f'  …(+{len(c.raw)-args.max}B)')
    else:
        print(node.raw if len(node.raw) <= args.max else node.raw[:args.max] + f'  …(+{len(node.raw)-args.max}B)')


def cmd_compose(args):
    """Build a standalone SVG from literal XML fragments in a file, resolving defs from <page>."""
    src, svg, defs, wrapper, kids = load(args.page)
    body = open(args.fragments, encoding='utf-8').read().strip()
    picked, _ = resolve_defs(defs, collect_refs(body))
    defs_txt = '<defs>\n' + '\n'.join(d.raw for d in picked) + '\n</defs>\n' if picked else ''
    x, y, w, h = args.viewbox
    out = (f'<svg width="{w:.2f}" height="{h:.2f}" viewBox="{x:.2f} {y:.2f} {w:.2f} {h:.2f}" '
           f'fill="none" xmlns="http://www.w3.org/2000/svg" '
           f'xmlns:xlink="http://www.w3.org/1999/xlink">\n{defs_txt}{body}\n</svg>\n')
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    open(args.out, 'w', encoding='utf-8').write(out)
    print(f'wrote {args.out}  ({len(out):,}B)  {len(picked)} defs')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)

    c = sub.add_parser('dump', help="print a child's raw XML so you can sub-select")
    c.add_argument('page', choices=PAGES)
    c.add_argument('i', type=int)
    c.add_argument('--children', action='store_true', help='split into direct children with indices')
    c.add_argument('--max', type=int, default=6000, help='truncate each blob at N chars')
    c.set_defaults(fn=cmd_dump)

    d = sub.add_parser('compose', help='build an svg from a file of literal XML fragments')
    d.add_argument('page', choices=PAGES)
    d.add_argument('--fragments', required=True)
    d.add_argument('--viewbox', nargs=4, type=float, required=True, metavar=('X', 'Y', 'W', 'H'))
    d.add_argument('--out', required=True)
    d.set_defaults(fn=cmd_compose)

    a = sub.add_parser('index', help='list top-level children with bboxes')
    a.add_argument('page', choices=PAGES)
    a.add_argument('--bbox', nargs=4, type=float, metavar=('X0', 'Y0', 'X1', 'Y1'),
                   help='only show children intersecting this page-space rect')
    a.set_defaults(fn=cmd_index)

    b = sub.add_parser('extract', help='lift children into a standalone svg')
    b.add_argument('page', choices=PAGES)
    b.add_argument('--idx', required=True, help='e.g. 3,5-9,12')
    b.add_argument('--out', required=True)
    b.add_argument('--pad', type=float, default=0)
    b.add_argument('--viewbox', nargs=4, type=float, metavar=('X', 'Y', 'W', 'H'))
    b.set_defaults(fn=cmd_extract)

    args = ap.parse_args()
    args.fn(args)


if __name__ == '__main__':
    main()
