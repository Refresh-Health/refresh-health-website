#!/usr/bin/env python3
"""Render one or more SVGs onto a chosen background colour for visual QA."""
import subprocess, sys, os, tempfile, argparse
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ap=argparse.ArgumentParser(); ap.add_argument('svgs',nargs='+'); ap.add_argument('--bg',default='#B4C6D1')
ap.add_argument('--out',required=True); ap.add_argument('--w',type=int,default=1000); ap.add_argument('--cols',type=int,default=3)
a=ap.parse_args()
cells=''.join(f'<figure><img src="file://{os.path.abspath(s)}"><figcaption>{os.path.basename(s)}</figcaption></figure>' for s in a.svgs)
html=f"""<!doctype html><meta charset=utf-8><style>
body{{margin:0;background:{a.bg};font:11px/1.4 -apple-system,sans-serif;color:#111}}
.grid{{display:grid;grid-template-columns:repeat({a.cols},1fr);gap:14px;padding:14px}}
figure{{margin:0;background:rgba(255,255,255,.14);border:1px solid rgba(0,0,0,.15);padding:6px;text-align:center}}
img{{max-width:100%;height:auto;display:block;margin:0 auto}}
figcaption{{margin-top:5px;word-break:break-all;opacity:.85}}</style>
<div class=grid>{cells}</div>"""
with tempfile.TemporaryDirectory() as td:
    p=os.path.join(td,'p.html'); open(p,'w').write(html)
    subprocess.run([CHROME,'--headless','--disable-gpu','--no-sandbox','--virtual-time-budget=12000',
        f'--screenshot={os.path.abspath(a.out)}',f'--window-size={a.w},{a.w}','file://'+p],capture_output=True,timeout=180)
print('wrote',a.out)
