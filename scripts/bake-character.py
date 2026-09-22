#!/usr/bin/env python3
"""Bake one Character combination into a single WebP, for places that show a
still (the hero, the footer) instead of the live <Character /> component.

It reads the same characterLayout.json the component does, so a bake and the
live component are the same picture. Needs Pillow (`pip install pillow`).

  python3 scripts/bake-character.py --clothes hoodie --glasses matrix --no-cap \
      --size 1024 --out public/hero/character-hoodie.webp

Flags mirror the component's props: --clothes, --glasses <style|none>,
--no-cap, --no-beard, --no-ears, --no-eyes, --no-eyebrows, --no-face,
--head-only. Output-only extras:
  --grayscale         the black-and-white treatment (Rec. 709 luminance, which is
                      what the previous hero's negative portrait was)
  --half left|right   keep only that half, for placements that hang the other
                      half off the screen edge (the hero's side characters)
The bottom fade is not baked in; it stays a CSS mask.
"""
import argparse
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LAYOUT = json.loads((ROOT / 'src/components/composites/character/characterLayout.json').read_text())
PUBLIC = ROOT / 'public'

# Which toggle hides which head parts.
TOGGLES = {
    'ears': ('ear-left', 'ear-right'),
    'eyes': ('eye-left', 'eye-right'),
    'eyebrows': ('brow-left', 'brow-right'),
    'face': ('face',),
    'cap': ('cap',),
    'beard': ('beard',),
}


def paste(canvas, part, ox, oy, scale):
    img = Image.open(PUBLIC / part['src'].lstrip('/')).convert('RGBA')
    w = round(part['width'] * scale)
    h = round(part['height'] * scale)
    img = img.resize((w, h), Image.LANCZOS)
    canvas.alpha_composite(img, (round(ox + part['x'] * scale), round(oy + part['y'] * scale)))


def bake(args):
    head = LAYOUT['head']
    hidden = {name for toggle, names in TOGGLES.items() if not getattr(args, toggle) for name in names}

    if args.head_only:
        frame = head['frame']
        scale = args.size / frame['height']
        canvas = Image.new('RGBA', (round(frame['width'] * scale), args.size))
        hx = hy = 0
        head_scale = scale
    else:
        frame = LAYOUT['frame']
        scale = args.size / frame['width']
        canvas = Image.new('RGBA', (args.size, round(frame['height'] * scale)))
        paste(canvas, LAYOUT['bodies'][args.clothes], 0, 0, scale)
        hx = head['x'] * scale
        hy = head['y'] * scale
        head_scale = scale * head['width'] / head['frame']['width']

    for name in LAYOUT['order']:
        if name == 'glasses':
            if args.glasses != 'none':
                paste(canvas, LAYOUT['glasses'][args.glasses], hx, hy, head_scale)
        elif name not in hidden:
            paste(canvas, LAYOUT['parts'][name], hx, hy, head_scale)

    if args.grayscale:
        alpha = canvas.getchannel('A')
        gray = canvas.convert('RGB').convert('L', matrix=(0.2126, 0.7152, 0.0722, 0))
        canvas = Image.merge('RGBA', (gray, gray, gray, alpha))
    if args.half:
        mid = canvas.width // 2
        canvas = canvas.crop((0, 0, mid, canvas.height) if args.half == 'left' else (mid, 0, canvas.width, canvas.height))

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out, 'WEBP', quality=args.quality, method=6, alpha_quality=90)
    print(f'{out}  {canvas.width}x{canvas.height}  {out.stat().st_size // 1024} KB')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--clothes', default='default', choices=sorted(LAYOUT['bodies']))
    p.add_argument('--glasses', default='default', choices=[*sorted(LAYOUT['glasses']), 'none'])
    for toggle in TOGGLES:
        p.add_argument(f'--no-{toggle}', dest=toggle, action='store_false')
    p.add_argument('--head-only', action='store_true', help='just the 420x780 head, no body')
    p.add_argument('--grayscale', action='store_true', help='black-and-white treatment')
    p.add_argument('--half', choices=['left', 'right'], help='keep only this half of the picture')
    p.add_argument('--size', type=int, default=1024, help='output width (height with --head-only), px')
    p.add_argument('--quality', type=int, default=85)
    p.add_argument('--out', required=True)
    bake(p.parse_args())


if __name__ == '__main__':
    main()
