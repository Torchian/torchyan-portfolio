#!/usr/bin/env python3
"""Cut a flat render of the character's head into the parts the site layers.

The head is drawn as separate parts (face, eyes, eyebrows, ears, beard) so the
live <Character /> can turn and look around and What I Do can assemble it on
scroll. New art usually arrives as one flat picture instead. This script cuts
that picture into the same parts, in the same frame, so every place that uses
the character picks it up without code changes.

  python3 scripts/cut-character.py scripts/character/head-v3-source.webp --version v3

  1. Lines the picture up with the head frame by the pupils: they have to land
     where the template's are, or the glasses stop fitting.
  2. Gives every pixel to the part that shows there in the template
     (scripts/character/template: the v2 parts from Figma). Pixels just outside
     the template's outline go to the nearest part.
  3. Fills what a flat picture can't have: the eyes and ears where the face
     covers them (continued from what shows), and the face under the beard,
     which is the template's own chin and lips, recoloured with the new art's
     colours. The beard covers it whenever it's shown, but What I Do shows the
     face alone first.
  4. Writes trimmed WebP parts at 2x the head frame to
     public/character/<version>/head/ and their boxes into characterLayout.json.
     The cap and the glasses aren't in the picture and are left as they are.

Needs Pillow, numpy, scipy, scikit-image and opencv-python. Check the result
before shipping it (--preview writes a sheet: full head, bare face, other parts).
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import color

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / 'scripts/character/template'
LAYOUT = ROOT / 'src/components/composites/character/characterLayout.json'
PUBLIC = ROOT / 'public'

SCALE = 2                           # parts are 2x the 420x780 head frame
W, H = 420 * SCALE, 780 * SCALE
ALPHA_FLOOR = 8                     # stray alpha below this is noise, not art
# Paint order, top first: who owns a pixel both parts cover.
TOP_DOWN = ['beard', 'brow-left', 'brow-right', 'face', 'ear-left', 'ear-right', 'eye-left', 'eye-right']
# The beard keeps its whisker tips: its template is widened this much (2x px)
# inside the outline, so what reads as beard in the new art stays with it.
BEARD_GROW = 5


def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def template():
    meta = json.loads((TEMPLATE / 'template.json').read_text())['parts']
    rgba = {}
    for name, p in meta.items():
        canvas = Image.new('RGBA', (W, H))
        img = Image.open(TEMPLATE / p['file']).convert('RGBA')
        img = img.resize((round(p['width'] * SCALE), round(p['height'] * SCALE)), Image.LANCZOS)
        canvas.alpha_composite(img, (round(p['x'] * SCALE), round(p['y'] * SCALE)))
        rgba[name] = np.asarray(canvas, np.float32) / 255
    return rgba


def pupil(rgba, box):
    """Centre of the darkest round spot in `box` (x0, y0, x1, y1): the pupil."""
    x0, y0, x1, y1 = (int(v) for v in box)
    sub = rgba[y0:y1, x0:x1]
    lum = 0.2126 * sub[..., 0] + 0.7152 * sub[..., 1] + 0.0722 * sub[..., 2]
    lum = np.where(sub[..., 3] > 0.8, lum, 1.0)
    lum = ndimage.uniform_filter(lum, 15)
    y, x = np.unravel_index(np.argmin(lum), lum.shape)
    return np.array([x0 + x, y0 + y], float)


def align(src, tpl):
    """The source in the head frame: scaled and moved so its pupils sit on the template's."""
    a = src[..., 3]
    ys, xs = np.where(a > 0.5)
    bx0, by0, bw, bh = xs.min(), ys.min(), xs.max() - xs.min(), ys.max() - ys.min()
    # The pupils are about a third of the way down, a quarter in from each side.
    s_right = pupil(src, (bx0 + 0.12 * bw, by0 + 0.25 * bh, bx0 + 0.45 * bw, by0 + 0.45 * bh))
    s_left = pupil(src, (bx0 + 0.55 * bw, by0 + 0.25 * bh, bx0 + 0.88 * bw, by0 + 0.45 * bh))

    def eye_centre(name):
        ys, xs = np.where(tpl[name][..., 3] > 0.5)
        return pupil(tpl[name], (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    t_right, t_left = eye_centre('eye-right'), eye_centre('eye-left')
    scale = np.linalg.norm(t_left - t_right) / np.linalg.norm(s_left - s_right)
    s_mid, t_mid = (s_left + s_right) / 2, (t_left + t_right) / 2
    print(f'pupils: source {s_right.round()} {s_left.round()}, template {t_right.round()} {t_left.round()}, scale {scale:.4f}')

    # Premultiplied, so the transparent surround doesn't darken the edges.
    pre = src.copy()
    pre[..., :3] *= pre[..., 3:4]
    inv = 1 / scale
    m = (inv, 0, s_mid[0] - t_mid[0] * inv, 0, inv, s_mid[1] - t_mid[1] * inv)
    chans = [Image.fromarray(pre[..., c]).transform((W, H), Image.AFFINE, m, resample=Image.BICUBIC) for c in range(4)]
    out = np.clip(np.dstack([np.asarray(c, np.float32) for c in chans]), 0, 1)
    out[..., :3] /= np.maximum(out[..., 3:4], 1e-4)
    return np.clip(out, 0, 1)


def ownership(tpl, new_alpha):
    """How much of each pixel each part owns (sums to 1 wherever the new art is)."""
    alpha = {k: tpl[k][..., 3].copy() for k in TOP_DOWN}
    alpha['beard'] = np.maximum(alpha['beard'], ndimage.grey_dilation(alpha['beard'], footprint=disk(BEARD_GROW)))
    union = np.max(np.stack(list(alpha.values())), 0)
    hard = np.zeros((H, W), np.int32)
    for i, k in enumerate(reversed(TOP_DOWN)):
        hard[alpha[k] > 0.5] = i + 1
    _, (iy, ix) = ndimage.distance_transform_edt(hard == 0, return_indices=True)
    near = hard[iy, ix]
    ext = {}
    for i, k in enumerate(reversed(TOP_DOWN)):
        e = alpha[k].copy()
        e[(union < 0.5) & (near == i + 1)] = 1
        ext[k] = e
    remaining = np.ones((H, W), np.float32)
    own = {}
    for k in TOP_DOWN:
        own[k] = ext[k] * remaining
        remaining = remaining * (1 - ext[k])
    for i, k in enumerate(reversed(TOP_DOWN)):
        own[k] = own[k] + remaining * (near == i + 1)
    return own, ext


def colour_field(img, mask, sigmas=(12, 30, 70, 160, 400)):
    """The low-frequency colour of `img` where `mask`, carried outward into the rest."""
    out = np.zeros_like(img)
    filled = np.zeros(mask.shape, np.float32)
    for s in sigmas:
        num = np.dstack([ndimage.gaussian_filter(img[..., c] * mask, s) for c in range(img.shape[2])])
        den = ndimage.gaussian_filter(mask, s)
        weight = np.clip(den / 0.2, 0, 1) * (1 - filled)
        out += num / np.maximum(den, 1e-6)[..., None] * weight[..., None]
        filled += weight
    return out / np.maximum(filled, 1e-6)[..., None]


def cut(src_path):
    tpl = template()
    src = np.asarray(Image.open(src_path).convert('RGBA'), np.float32) / 255
    # Flat exports often stop just short of opaque (~0.99); read that as solid.
    src[..., 3] = np.clip(src[..., 3] / 0.98, 0, 1)
    new = align(src, tpl)
    rgb, a = new[..., :3], new[..., 3]
    own, ext = ownership(tpl, a)
    parts = {}

    # Topmost parts: just what shows.
    for k in ('beard', 'brow-left', 'brow-right'):
        parts[k] = (rgb, a * own[k])

    # The face: what shows, plus the template's chin and lips under the beard,
    # moved into the new art's colours (Lab detail of the old, colour of the new).
    old = tpl['face']
    face_a_old = old[..., 3]
    beard = np.clip(ext['beard'], 0, 1)
    shows = np.clip(a * own['face'], 0, 1)
    skin = (shows > 0.9).astype(np.float32)
    lab_new = color.rgb2lab(rgb)
    lab_old = color.rgb2lab(np.clip(old[..., :3], 0, 1))
    under = color.lab2rgb(lab_old - colour_field(lab_old, (face_a_old > 0.9).astype(np.float32))
                          + colour_field(lab_new, skin))
    k = np.where(skin > 0, 0, np.clip(ndimage.gaussian_filter(beard, 2), 0, 1))
    face_rgb = rgb * (1 - k[..., None]) + under * k[..., None]
    face_alpha = np.where(face_a_old < 0.02, shows, np.maximum(shows, face_a_old * beard))
    parts['face'] = (face_rgb, face_alpha)

    # Eyes and ears sit under the face: continue what shows into what it covers,
    # so the head can turn and the eyes can move without an edge appearing.
    covers = ndimage.gaussian_filter(face_a_old, 1) > 0.3
    bgr = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
    for name in ('ear-left', 'ear-right', 'eye-left', 'eye-right'):
        tpl_a = tpl[name][..., 3]
        shows = np.clip(a * own[name], 0, 1)
        mine = shows > 0.6
        hidden = (tpl_a > 0.02) & ~mine & covers
        filled = cv2.inpaint(bgr, hidden.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)
        part_rgb = cv2.cvtColor(filled, cv2.COLOR_BGR2RGB).astype(np.float32) / 255
        parts[name] = (part_rgb, np.maximum(shows, np.where(hidden, tpl_a, 0)))
    return parts, new


def write(parts, version):
    layout = json.loads(LAYOUT.read_text())
    out_dir = PUBLIC / 'character' / version / 'head'
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, (rgb, alpha) in parts.items():
        a8 = (np.clip(alpha, 0, 1) * 255 + 0.5).astype(np.uint8)
        a8[a8 < ALPHA_FLOOR] = 0
        img = Image.fromarray(np.dstack([(np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8), a8]), 'RGBA')
        bbox = img.getchannel('A').getbbox()
        img = img.crop(bbox)
        path = out_dir / f'{name}.webp'
        img.save(path, 'WEBP', quality=85, method=6, alpha_quality=90)
        layout['parts'][name] = {
            'src': f'/character/{version}/head/{name}.webp',
            'x': round(bbox[0] / SCALE, 2),
            'y': round(bbox[1] / SCALE, 2),
            'width': round(img.width / SCALE, 2),
            'height': round(img.height / SCALE, 2),
        }
        print(f'{path.relative_to(ROOT)}  {img.width}x{img.height}  {path.stat().st_size // 1024} KB')
    LAYOUT.write_text(json.dumps(layout, indent=2) + '\n')


def preview(parts, new, path):
    order = [n for n in json.loads(LAYOUT.read_text())['order'] if n in parts]

    def comp(names):
        canvas = Image.new('RGBA', (W, H), (20, 16, 28, 255))
        for n in order:
            if n in names:
                rgb, alpha = parts[n]
                canvas.alpha_composite(Image.fromarray((np.dstack([rgb, alpha]) * 255).clip(0, 255).astype(np.uint8)))
        return canvas

    sheet = Image.new('RGBA', (W * 3, H))
    sheet.paste(comp(order), (0, 0))
    sheet.paste(comp(['face']), (W, 0))
    sheet.paste(comp([n for n in order if n != 'face']), (2 * W, 0))
    sheet.save(path)
    full = np.asarray(comp(order), np.float32)
    ref = Image.new('RGBA', (W, H), (20, 16, 28, 255))
    ref.alpha_composite(Image.fromarray((new * 255).clip(0, 255).astype(np.uint8)))
    diff = np.abs(full - np.asarray(ref, np.float32))[..., :3].mean(2)
    print(f'{path}  parts put back together vs the source: mean diff {diff.mean():.2f}/255, 99.9th percentile {np.percentile(diff, 99.9):.1f}')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('source', help='the flat head render, transparent background')
    p.add_argument('--version', default='v3', help='public/character/<version>/head')
    p.add_argument('--preview', help='also write a check sheet here (PNG)')
    args = p.parse_args()
    parts, new = cut(args.source)
    write(parts, args.version)
    if args.preview:
        preview(parts, new, args.preview)


if __name__ == '__main__':
    main()
