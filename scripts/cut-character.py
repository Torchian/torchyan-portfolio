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
BEARD_GROW_HOLE = 9
# The face's outline is a glowing rim a few px wide; pixels this close outside
# the template's outline are rim, and must move with the face, not an ear.
FACE_RIM = 8
# How far each ear continues under the face (2x px). At a full turn the face
# moves ~14px further than the ears (DEPTH 0.6 vs 0.35 x TURN_X 26), so this
# has to be more than that, with a soft end beyond it.
EAR_UNDER = 24
EAR_FADE = 10
EAR_TAPER = 24     # rows over which that strip fades in and out at the ear's top and bottom
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
    turns with it; the ear's root goes on under the face, in shadow."""
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
    # Under the face: the ear's root, in shadow. Mirroring the ear itself there
    # drew a second, flipped ear (a "V" in the bowl) the moment the head turned,
    # so it's the ear's own darkest tone near the crease instead, as tall as the
    # ear's front edge in each row: opaque for EAR_UNDER px, then fading.
    side = 1 if right else -1
    shade = np.zeros((len(ys), 3), np.float32)
    edge_a = np.zeros(len(ys), np.float32)
    for i, (y, c) in enumerate(zip(ys, np.round(cs).astype(int))):
        xs = c + side * np.arange(1, 13)
        xs = xs[(xs >= 0) & (xs < W)]
        px = rgb[y, xs][shows[y, xs] > 0.6]
        if len(px):
            lum = px @ np.array([0.2126, 0.7152, 0.0722], np.float32)
            shade[i] = px[lum <= np.percentile(lum, 30)].mean(0)
        edge_a[i] = shows[y, c + side * np.arange(1, 4)].max() if 0 <= c + side * 3 < W else 0
    have = edge_a > 0.3
    if have.any():
        idx = np.arange(len(ys))
        for ch in range(3):
            shade[:, ch] = np.interp(idx, idx[have], shade[have, ch])
    shade = ndimage.gaussian_filter1d(shade, 6, axis=0) * 0.8
    # Only where the ear really meets the face, tapering at the top and bottom,
    # so the strip never pokes out above or below the ear.
    lab, n = ndimage.label(edge_a > 0.3)
    if n:
        keep = lab == (np.bincount(lab[lab > 0]).argmax())
        idx = np.where(keep)[0]
        taper = np.zeros(len(ys), np.float32)
        span = np.arange(idx[0], idx[-1] + 1)
        taper[span] = np.clip(np.minimum(span - idx[0], idx[-1] - span) / EAR_TAPER, 0, 1)
        edge_a = edge_a * taper
    edge_a = ndimage.gaussian_filter1d(edge_a, 2)
    # The ear's front edge, smoothed down the ear: per-row pixels stretched sideways read as streaks.
    edge_rgb = np.array([rgb[y, min(max(c + side * 2, 0), W - 1)] for y, c in zip(ys, np.round(cs).astype(int))])
    edge_rgb = ndimage.gaussian_filter1d(edge_rgb, 5, axis=0)
    part_rgb = rgb.copy()
    part_a = shows.copy()
    under = np.zeros((H, W), bool)
    for i, (y, c) in enumerate(zip(ys, np.round(cs).astype(int))):
        edge = edge_rgb[i]
        for d in range(EAR_UNDER + EAR_FADE):
            x = c - side * d                              # under the face
            if not 0 <= x < W:
                continue
            fade = 1.0 if d < EAR_UNDER else 1 - (d - EAR_UNDER + 1) / (EAR_FADE + 1)
            mix = min(1.0, d / 10)                        # from the ear's edge into the shadow
            part_rgb[y, x] = edge * (1 - mix) + shade[i] * mix
            part_a[y, x] = max(part_a[y, x], edge_a[i] * fade)
            under[y, x] = True
    # Row by row leaves stair-steps where the ear ends; soften them.
    zone = ndimage.binary_dilation(under, iterations=3) & ~(shows > 0.6)
    part_a = np.where(zone, np.minimum(part_a, ndimage.gaussian_filter(part_a, 1.5)), part_a)
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

    # Eyes sit under the face: continue what shows into what it covers, so they
    # can move in their sockets without an edge appearing.
    covers = ndimage.gaussian_filter(tpl['face'][..., 3], 1) > 0.3
    bgr = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
    for name in ('eye-left', 'eye-right'):
        tpl_a = tpl[name][..., 3]
        shows = np.clip(a * own[name], 0, 1)
        hidden = (tpl_a > 0.02) & (shows <= 0.6) & covers
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
