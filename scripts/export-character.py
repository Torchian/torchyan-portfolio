"""Figma fills -> tight-cropped WebP parts + characterLayout.json.

Run when the character art changes in Figma:
  1. `get_design_context` (Figma MCP) on Character Body 3871:1230, Character Head
     3183:6631 and character_glasses 3875:1182, and download each image URL into
     one folder as body-<slug>.png, glasses-<style>.png and <part>.png
     (face, cap, beard, ear-left, eye-left, brow-left, ...).
  2. python3 scripts/export-character.py <that folder>
Boxes below are the Figma values; update them if the art moves. New outfits go
in BODIES.

Boxes come from Figma metadata (head symbol 3183:6631 is 420x780; body symbols are
1024x1024). Each fill is placed exactly as Figma draws it (fill / cover / crop,
ear rotation), rendered at SCALE x its box, trimmed to its alpha bounding box, and
the trimmed box written back in the frame's own px.
"""
import json, os, sys
from PIL import Image
import numpy as np

RAW = sys.argv[1] if len(sys.argv) > 1 else 'raw'
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f'{REPO}/public/character/v2'
LAYOUT = f'{REPO}/src/components/composites/character/characterLayout.json'
SCALE = 2          # head parts: 2x the 420x780 head frame
ALPHA_FLOOR = 8    # stray alpha below this is export noise, not art

def load(name):
    return Image.open(f'{RAW}/{name}.png').convert('RGBA')

def fill(img, w, h):
    return img.resize((round(w), round(h)), Image.LANCZOS)

def cover(img, w, h):
    s = max(w / img.width, h / img.height)
    big = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x = (big.width - round(w)) // 2
    y = (big.height - round(h)) // 2
    return big.crop((x, y, x + round(w), y + round(h)))

def crop_rows(img, w, h, top_frac, height_frac):
    """Figma's image crop: the image drawn at width 100%, height `height_frac` of the box, offset `top_frac`."""
    big = img.resize((round(w), round(h * height_frac)), Image.LANCZOS)
    y = round(-h * top_frac)
    return big.crop((0, y, round(w), y + round(h)))

def rotated(img, w, h, deg, cw, ch):
    """An image box w x h rotated `deg` (CSS sense) about its centre, inside a cw x ch container."""
    part = img.resize((round(w), round(h)), Image.LANCZOS)
    rot = part.rotate(-deg, resample=Image.BICUBIC, expand=True)
    canvas = Image.new('RGBA', (round(cw), round(ch)))
    canvas.alpha_composite(rot, ((canvas.width - rot.width) // 2, (canvas.height - rot.height) // 2))
    return canvas

def clean(img):
    a = np.array(img)
    a[a[..., 3] < ALPHA_FLOOR] = 0
    return Image.fromarray(a)

def save(img, rel, box, scale):
    """Trim to alpha, write WebP, return the trimmed box in frame px."""
    img = clean(img)
    bbox = img.split()[3].getbbox()
    img = img.crop(bbox)
    path = f'{OUT}/{rel}.webp'
    img.save(path, 'WEBP', quality=85, method=6, alpha_quality=90)
    x, y, _, _ = box
    return {
        'src': f'/character/v2/{rel}.webp',
        'x': round(x + bbox[0] / scale, 2),
        'y': round(y + bbox[1] / scale, 2),
        'width': round(img.width / scale, 2),
        'height': round(img.height / scale, 2),
        'bytes': os.path.getsize(path),
    }

S = SCALE
head = {}
def head_part(key, name, box, place, **kw):
    x, y, w, h = box
    img = place(load(name), w * S, h * S, **kw)
    head[key] = save(img, f'head/{key}', box, S)

# Bottom to top, as in the Figma symbol.
head_part('eye-left', 'eye-left', (255, 274, 83, 43), fill)
head_part('eye-right', 'eye-right', (82, 274.64, 80, 41), cover)
# Ears: the image box is rotated inside its container; bake the rotation in.
# Containers come from the design-context insets: metadata x/y on a rotated
# node is its rotated origin, not its bounding box (8px off for the left ear).
x, y, w, h = 420 * 0.0249, 780 * 0.3576, 420 * (1 - 0.8382 - 0.0249), 780 * (1 - 0.4511 - 0.3576)
head['ear-right'] = save(rotated(load('ear-right'), 54.019 * S, 147.975 * S, -1.36, w * S, h * S), 'head/ear-right', (x, y, w, h), S)
x, y, w, h = 420 * 0.8336, 780 * 0.357, 420 * (1 - 0.03 - 0.8336), 780 * (1 - 0.4494 - 0.357)
head['ear-left'] = save(rotated(load('ear-left'), 49 * S, 148.492 * S, 3.22, w * S, h * S), 'head/ear-left', (x, y, w, h), S)
head_part('face', 'face', (0, 38, 422, 572.04), fill)
head_part('brow-left', 'brow-left', (237.05, 223.1, 120.43, 44.32), fill)
head_part('brow-right', 'brow-right', (63.52, 226.81, 112.41, 38.04), fill)
head_part('cap', 'cap', (34, 2, 353, 275), fill)
head_part('beard', 'beard', (47, 395, 325.42, 383), fill)

glasses = {}
GX, GY = 41, 258
glasses['default'] = save(fill(load('glasses-default'), 337 * S, 108 * S), 'glasses/default', (GX, GY, 337, 108), S)
glasses['matrix'] = save(cover(load('glasses-matrix'), 337 * S, 108 * S), 'glasses/matrix', (GX, GY, 337, 108), S)
glasses['pixel'] = save(crop_rows(load('glasses-pixel'), 337 * S, 96 * S, -1.6816, 4.4048), 'glasses/pixel', (GX, GY, 337, 96), S)
glasses['optical'] = save(cover(load('glasses-optical'), 337 * S, 108 * S), 'glasses/optical', (GX, GY, 337, 108), S)

BODIES = [
    ('default', 'Default', '3870:16064'),
    ('russian-90s', "Russian 90's", '3871:1178'),
    ('hoodie', 'Hoodie', '3872:1190'),
    ('retro-classic', 'Retro Classic', '3872:1192'),
    ('jacket-hoodie', 'Jacket Hoodie', '3872:1194'),
    ('fight-club', 'Fight Club', '3872:1198'),
    ('matrix', 'Matrix 2', '3872:1200'),
    ('scarface', 'Scarface', '3872:1201'),
    ('big-lebowski', 'Big Lebowski', '3872:1202'),
    ('pulp-fiction', 'Pulp Fiction', '3872:1203'),
    ('wall-street', 'Wall Street', '3872:1209'),
    ('armenian-traditional', 'Armenian Traditional 2', '3872:1211'),
]
bodies = {}
for slug, name, node in BODIES:
    # Clothing box: inset 1.95% 0 0 0 of 1024, object-fit cover. The source caps at 1024, so 1x.
    box = (0, 1024 * 0.0195, 1024, 1024 * (1 - 0.0195))
    part = save(cover(load(f'body-{slug}'), box[2], box[3]), f'body/{slug}', box, 1)
    bodies[slug] = {'figma': name, 'node': node, **part}

layout = {
    '$comment': 'Generated from Figma (Character Body 3871:1230, Character Head 3183:6631, character_glasses 3875:1182, Character - Head + Body 3884:1468). Boxes are px in their frame. Regenerate rather than hand-edit.',
    'frame': {'width': 1024, 'height': 1024},
    'head': {'x': 319.9572, 'y': 0, 'width': 384.0855, 'height': 713.3017, 'frame': {'width': 420, 'height': 780}},
    'faceFrame': {'x': 0, 'y': 38, 'width': 421, 'height': 573},
    'order': ['eye-left', 'eye-right', 'ear-right', 'ear-left', 'face', 'brow-left', 'brow-right', 'glasses', 'cap', 'beard'],
    'parts': head,
    'glasses': glasses,
    'bodies': bodies,
}
def strip(d):
    return {k: ({kk: vv for kk, vv in v.items() if kk != 'bytes'} if isinstance(v, dict) else v) for k, v in d.items()}
with open(LAYOUT, 'w') as f:
    json.dump({**layout, 'parts': strip(head), 'glasses': strip(glasses), 'bodies': strip(bodies)}, f, indent=2)
    f.write('\n')

tot = sum(p['bytes'] for p in list(head.values()) + list(glasses.values()) + list(bodies.values()))
for group, d in (('head', head), ('glasses', glasses), ('bodies', bodies)):
    for k, v in d.items():
        print(f"{group:8} {k:22} {v['width']:7} x {v['height']:7}  {v['bytes']//1024:4} KB")
print('total', tot // 1024, 'KB')
