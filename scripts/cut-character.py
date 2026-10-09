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
  3. Fills what a flat picture can't have: the face under the beard, which is
     the template's own chin and lips in the new art's colours and line style.
     The beard covers it whenever it's shown, but What I Do shows the face
     alone first. The face, ears, eyebrows and beard move together on the
     site (DEPTH in characterLayout.ts), so nothing else is ever uncovered.
  4. Writes trimmed WebP parts at 2x the head frame to
     public/character/<version>/head/ and their boxes into characterLayout.json.
     The cap and the glasses aren't in the picture and are left as they are.

Needs Pillow, numpy, scipy and scikit-image. Check the result
before shipping it (--preview writes a sheet: full head, bare face, other parts).
"""
import argparse
import hashlib
import io
import json
from pathlib import Path

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
BEARD_GROW_HOLE = 9
# The face's outline is a glowing rim a few px wide; pixels this close outside
# the template's outline are rim, and must move with the face, not an ear.
FACE_RIM = 8
# How far each ear keeps the source under the face's edge (2x px).
EAR_UNDER = 6
# The template's mouth, in 2x head-frame px: the lips (centre x, y, radii) keep
# their own lines; the rest of the hidden face takes a coarser mesh, scaled
# about `centre` by MESH_SCALE to match the new art's line spacing.
MOUTH = {'lips': (430, 980, 170, 60), 'centre': (430, 1060)}
MESH_SCALE = 1.25


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
    grown = ndimage.grey_dilation(alpha['beard'], footprint=disk(BEARD_GROW))
    # Inside the mouth hole the whiskers reach further; they go with the beard too.
    solid = alpha['beard'] > 0.5
    hole = ndimage.binary_fill_holes(solid) & ~solid
    grown = np.where(hole, ndimage.grey_dilation(alpha['beard'], footprint=disk(BEARD_GROW_HOLE)), grown)
    alpha['beard'] = np.maximum(alpha['beard'], grown)
    union = np.max(np.stack(list(alpha.values())), 0)
    hard = np.zeros((H, W), np.int32)
    for i, k in enumerate(reversed(TOP_DOWN)):
        hard[alpha[k] > 0.5] = i + 1
    _, (iy, ix) = ndimage.distance_transform_edt(hard == 0, return_indices=True)
    near = hard[iy, ix]
    face_label = len(TOP_DOWN) - TOP_DOWN.index('face')
    near_face = ndimage.distance_transform_edt(alpha['face'] < 0.5) <= FACE_RIM
    near[(union < 0.5) & near_face] = face_label
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


def colour_field(img, mask, sy, sx, levels=(1, 2, 4, 8, 16)):
    """The low-frequency colour of `img` where `mask`, carried outward into the rest.

    Anisotropic: the face is teal on one side and orange on the other, split down
    the middle, so colour is carried mostly down each column, not across.
    """
    out = np.zeros_like(img)
    filled = np.zeros(mask.shape, np.float32)
    for k in levels:
        s = (sy * k, sx * k)
        num = np.dstack([ndimage.gaussian_filter(img[..., c] * mask, s) for c in range(img.shape[2])])
        den = ndimage.gaussian_filter(mask, s)
        weight = np.clip(den / 0.15, 0, 1) * (1 - filled)
        out += num / np.maximum(den, 1e-6)[..., None] * weight[..., None]
        filled += weight
    return out / np.maximum(filled, 1e-6)[..., None]


def detail(lum, mask, s=3):
    """The lines: luminance minus its local average."""
    return lum - ndimage.gaussian_filter(lum * mask, s) / np.maximum(ndimage.gaussian_filter(mask, s), 1e-6)


def face_under_beard(tpl, rgb, a, own, beard):
    """The face, whole: what the source shows, and the template's chin and lips
    where the beard hides it, in the source's colours and line contrast, matched
    to the source where the two meet so no outline shows."""
    old = tpl['face']
    old_a = old[..., 3]
    shows = np.clip(a * own['face'], 0, 1)
    brows = (tpl['brow-left'][..., 3] > 0.02) | (tpl['brow-right'][..., 3] > 0.02)
    skin = (shows > 0.95) & (old_a > 0.95) & ~brows
    skin = ndimage.binary_erosion(skin, iterations=2).astype(np.float32)
    lab_new = color.rgb2lab(rgb)
    lab_old = color.rgb2lab(np.clip(old[..., :3], 0, 1))
    # Colour: the source's, carried down from the cheeks and lips; form: the template's.
    syn = lab_old - colour_field(lab_old, (old_a > 0.9).astype(np.float32), 30, 6) + colour_field(lab_new, skin, 30, 6)
    # Lines: the template's mesh is ~25% finer than the new art's, so away from the
    # lips (and the jaw's outline) it's drawn 1.25x coarser, then set to the
    # source's line contrast.
    d_new = detail(lab_new[..., 0], skin)
    d_old = detail(lab_old[..., 0], (old_a > 0.5).astype(np.float32))
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy = MOUTH['centre']
    coarse = ndimage.map_coordinates(d_old, [cy + (yy - cy) / MESH_SCALE, cx + (xx - cx) / MESH_SCALE], order=1, mode='nearest')
    hidden = (beard > 0.3) & (old_a > 0.5)
    coarse *= np.std(d_old[hidden]) / np.std(coarse[hidden])
    lx, ly, rx, ry = MOUTH['lips']
    keep = np.clip(1.6 - np.hypot((xx - lx) / rx, (yy - ly) / ry), 0, 1)
    keep = np.maximum(keep, np.clip(1 - ndimage.distance_transform_edt(old_a > 0.5) / 12, 0, 1))
    lines = d_old * keep + coarse * (1 - keep)
    gain = float(np.std(d_new[skin > 0][::7]) / np.std(d_old[hidden][::7]))
    syn[..., 0] += lines * gain - d_old
    # Where they meet: the difference to the source, fading out ~20px into the hidden part.
    edge = ndimage.binary_dilation(skin > 0) & ~ndimage.binary_erosion(skin > 0, iterations=14)
    diff = colour_field(lab_new - syn, edge.astype(np.float32), 5, 5, levels=(1, 2, 4))
    syn += diff * np.exp(-ndimage.distance_transform_edt(skin == 0) / 22)[..., None]
    under = np.clip(color.lab2rgb(syn), 0, 1)
    cover = (1 - shows / np.maximum(a, 1e-3)) * (old_a > 0.02)
    k = np.where(skin > 0, 0, np.clip(ndimage.gaussian_filter(cover, 2.5), 0, 1))
    face_rgb = rgb * (1 - k[..., None]) + under * k[..., None]
    face_alpha = np.where(old_a < 0.02, shows, np.maximum(shows, old_a * beard))
    print(f'face under the beard: line contrast x{gain:.2f}')
    return face_rgb, face_alpha


def split_ear(tpl, rgb, a, own, name):
    """Where the face's rim ends and the ear begins, row by row: the dark crease
    between them. Everything on the face's side goes to the face, so its rim
    turns with it; the ear keeps a few px of the source under the face's edge."""
    right = name == 'ear-left'          # the character's left ear is on the picture's right
    ear_t = tpl[name][..., 3] > 0.3
    face_t = tpl['face'][..., 3] > 0.5
    lum = ndimage.gaussian_filter(0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2], (4, 1))
    crease = {}
    for y in np.where(ear_t.any(1))[0]:
        cols = np.where(face_t[y])[0]
        if not len(cols):
            continue
        e = cols.max() if right else cols.min()
        # The rim sits just outside the template's outline on the right, just inside it on the left.
        xs = np.arange(e + 2, e + 15) if right else np.arange(e - 8, e + 5)
        xs = xs[a[y, xs] > 0.5]
        if len(xs):
            crease[y] = xs[np.argmin(lum[y, xs])]
    ys = np.array(sorted(crease))
    cs = ndimage.median_filter(np.array([crease[y] for y in ys], float), size=31, mode='nearest')
    cs = ndimage.uniform_filter1d(cs, 15, mode='nearest')

    xx = np.arange(W)[None, :]
    band = np.zeros((H, W), bool)
    band[ys] = np.abs(xx - cs[:, None]) <= 40
    c_map = np.zeros(H)
    c_map[ys] = cs
    # A soft, 1px split, so the face's edge here is as clean as the rest of its outline.
    ear_side = np.clip(((xx - c_map[:, None]) if right else (c_map[:, None] - xx)) + 0.5, 0, 1) * band
    pair = own['face'] + own[name]
    own['face'] = np.where(band, pair * (1 - ear_side), own['face'])
    own[name] = np.where(band, pair * ear_side, own[name])

    shows = np.clip(a * own[name], 0, 1)
    # Under the face's edge: the source's own pixels, a few px wide. The ear and
    # the face move together (DEPTH), so this is never uncovered; it only keeps
    # the two soft edges from leaving a hairline where they meet, and where the
    # ear is drawn over the face (What I Do) it's the same pixels as the face's.
    side = 1 if right else -1
    part_rgb = rgb.copy()
    part_a = shows.copy()
    for y, c in zip(ys, np.round(cs).astype(int)):
        if shows[y, min(max(c + side * 2, 0), W - 1)] < 0.3:
            continue
        for d in range(EAR_UNDER):
            x = c - side * d
            if 0 <= x < W:
                part_a[y, x] = max(part_a[y, x], a[y, x])
    return part_rgb, part_a


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

    # Ears first: they hand the face's rim back to the face.
    for name in ('ear-left', 'ear-right'):
        parts[name] = split_ear(tpl, rgb, a, own, name)
    parts['face'] = face_under_beard(tpl, rgb, a, own, np.clip(ext['beard'], 0, 1))

    # Eyes: what shows, plus the source's own pixels where the template eye goes
    # under the face. In <Character /> they sit under the face and only peek out
    # as the gaze moves; in What I Do they're drawn over it, where these are the
    # face's own pixels, so nothing changes.
    covers = ndimage.gaussian_filter(tpl['face'][..., 3], 1) > 0.3
    for name in ('eye-left', 'eye-right'):
        tpl_a = tpl[name][..., 3]
        shows = np.clip(a * own[name], 0, 1)
        hidden = (tpl_a > 0.02) & (shows <= 0.6) & covers
        parts[name] = (rgb, np.maximum(shows, np.where(hidden, np.minimum(tpl_a, a), 0)))
    return parts, new


def write(parts, version):
    layout = json.loads(LAYOUT.read_text())
    out_dir = PUBLIC / 'character' / version / 'head'
    out_dir.mkdir(parents=True, exist_ok=True)
    # Each file is named after its content: the site caches resized images for
    # 31 days (next.config.ts), so a part that changes needs a new URL.
    for old in out_dir.glob('*.webp'):
        old.unlink()
    for name, (rgb, alpha) in parts.items():
        a8 = (np.clip(alpha, 0, 1) * 255 + 0.5).astype(np.uint8)
        a8[a8 < ALPHA_FLOOR] = 0
        img = Image.fromarray(np.dstack([(np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8), a8]), 'RGBA')
        bbox = img.getchannel('A').getbbox()
        img = img.crop(bbox)
        buf = io.BytesIO()
        img.save(buf, 'WEBP', quality=85, method=6, alpha_quality=90)
        digest = hashlib.sha1(buf.getvalue()).hexdigest()[:8]
        path = out_dir / f'{name}.{digest}.webp'
        path.write_bytes(buf.getvalue())
        layout['parts'][name] = {
            'src': f'/character/{version}/head/{path.name}',
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
