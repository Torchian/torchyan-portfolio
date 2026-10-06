'use client';

import { useEffect, useRef, type RefObject } from 'react';
import styled from 'styled-components';

/*
 * The About hero's backdrop: the character is the sun. Rays of dots run out
 * from all around them in every direction, filling the screen: big and
 * bright close in, smaller and fainter the further they go, and drifting
 * slowly outwards. The rays reach on down into the section below, dimmer
 * still.
 *
 * The rays start from the character's own outline, all the way round: their
 * image layers are traced onto a small offscreen grid, padded, and a ray
 * starts every few px along it, running out along the outline's normal. No dot is drawn over the character, and dots
 * all but vanish across the title's band.
 *
 * One canvas, animated only while on screen; a still frame under reduced motion.
 */

/** One ray every this many px along the outline. */
const SPACING = 16;
/** How many cells round an outline point its normal is taken over. */
const NORMAL = 4;
/** Each gap along a ray is this much longer than the one before it. */
const STEP = 1.13;
/** The first gap along a ray, in px. */
const GAP = 34;
/** The outline grid's cell, in px, and how many cells of air dots keep from the character. */
const CELL = 6;
const PAD = 3;
/** The brightest a dot gets, right at the outline. */
const MAX_ALPHA = 0.7;
/** Seconds for a dot to move out to where the next one was. */
const DRIFT = 2.4;
const GREEN = [12, 175, 10];
const PINK = [198, 20, 230];

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  /* Runs on into the section below, where it fades away. */
  height: 150%;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, #000 62%, transparent);
`;

export interface AboutRaysProps {
  /** The character's box: the rays start from its head and stay off it. */
  stage: RefObject<HTMLElement | null>;
  /** The title: dots fade out across it. */
  title: RefObject<HTMLElement | null>;
}

export function AboutRays({ stage, title }: AboutRaysProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    // In canvas px: the title's band, and how far a ray runs.
    const geo = { titleTop: 0, titleBottom: 0, reach: 0 };
    // The character's outline, padded, on a coarse grid: true where a dot mustn't go.
    let mask = { cols: 0, rows: 0, cells: new Uint8Array(0) };
    // The rays: each starts on the outline and runs out along the outline's normal there.
    let emitters: { x: number; y: number; nx: number; ny: number; offset: number }[] = [];

    const inside = (x: number, y: number) => {
      const c = Math.floor(x / CELL);
      const r = Math.floor(y / CELL);
      if (c < 0 || r < 0 || c >= mask.cols || r >= mask.rows) return false;
      return mask.cells[r * mask.cols + c] === 1;
    };

    /**
     * Draws the character's image layers, as they are on screen, onto a small
     * offscreen canvas and keeps where they aren't transparent, grown by PAD:
     * the outline the rays start from.
     */
    const traceOutline = () => {
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const cells = new Uint8Array(cols * rows);
      const box = canvas.getBoundingClientRect();
      const off = document.createElement('canvas');
      off.width = cols;
      off.height = rows;
      const octx = off.getContext('2d', { willReadFrequently: true });
      const imgs = stage.current?.querySelectorAll('img') ?? [];
      if (octx) {
        for (const img of imgs) {
          if (!img.complete || !img.naturalWidth || getComputedStyle(img).opacity === '0') continue;
          const r = img.getBoundingClientRect();
          try {
            octx.drawImage(img, (r.left - box.left) / CELL, (r.top - box.top) / CELL, r.width / CELL, r.height / CELL);
          } catch {
            // An image that can't be drawn just leaves its part of the outline out.
          }
        }
        let data: Uint8ClampedArray | null = null;
        try {
          data = octx.getImageData(0, 0, cols, rows).data;
        } catch {
          data = null;
        }
        if (data) {
          const solid = new Uint8Array(cols * rows);
          for (let i = 0; i < cols * rows; i++) solid[i] = data[i * 4 + 3] > 40 ? 1 : 0;
          // Grow it by PAD cells all round, so dots keep a little air from the edge.
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (!solid[r * cols + c]) continue;
              for (let dr = -PAD; dr <= PAD; dr++) {
                for (let dc = -PAD; dc <= PAD; dc++) {
                  const rr = r + dr;
                  const cc = c + dc;
                  if (rr >= 0 && cc >= 0 && rr < rows && cc < cols && dr * dr + dc * dc <= PAD * PAD)
                    cells[rr * cols + cc] = 1;
                }
              }
            }
          }
        }
      }
      mask = { cols, rows, cells };
      // Points along the outline, one per SPACING px, each with its outward normal.
      const found: typeof emitters = [];
      const taken = new Set<string>();
      const solidAt = (c: number, r: number) => c >= 0 && r >= 0 && c < cols && r < rows && cells[r * cols + c] === 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!solidAt(c, r)) continue;
          if (solidAt(c - 1, r) && solidAt(c + 1, r) && solidAt(c, r - 1) && solidAt(c, r + 1)) continue;
          const x = (c + 0.5) * CELL;
          const y = (r + 0.5) * CELL;
          const key = `${Math.floor(x / SPACING)},${Math.floor(y / SPACING)}`;
          if (taken.has(key)) continue;
          // The normal: away from the character, summed over the cells around.
          let nx = 0;
          let ny = 0;
          for (let dr = -NORMAL; dr <= NORMAL; dr++) {
            for (let dc = -NORMAL; dc <= NORMAL; dc++) {
              if (!solidAt(c + dc, r + dr)) {
                nx += dc;
                ny += dr;
              }
            }
          }
          const len = Math.hypot(nx, ny);
          // Inside a notch, or the character's cut-off bottom edge: no ray.
          if (len < 1 || ny / len > 0.5) continue;
          taken.add(key);
          found.push({ x, y, nx: nx / len, ny: ny / len, offset: (found.length * 0.37) % 1 });
        }
      }
      emitters = found;
    };

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const box = canvas.getBoundingClientRect();
      const t = title.current?.getBoundingClientRect();
      if (t) {
        geo.titleTop = t.top - box.top;
        geo.titleBottom = t.bottom - box.top;
      }
      // How far a ray runs before it's gone.
      geo.reach = Math.max(width, height) * 0.6;
      traceOutline();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const phase = (time / 1000 / DRIFT) % 1;
      for (const e of emitters) {
        for (let k = 0; ; k++) {
          const dist = GAP * (Math.pow(STEP, k + phase + e.offset) - 1) + CELL;
          if (dist > geo.reach) break;
          const x = e.x + e.nx * dist;
          const y = e.y + e.ny * dist;
          if (x < -4 || x > width + 4 || y < -4 || y > height + 4) break;
          if (inside(x, y)) continue;
          const onTitle = y > geo.titleTop - 12 && y < geo.titleBottom + 12;
          // 0 at the outline, 1 at the end of the ray.
          const out = Math.min(1, dist / geo.reach);
          const size = 5 * Math.pow(1 - out, 2) + 0.8;
          const alpha = Math.pow(1 - out, 1.8) * MAX_ALPHA * (onTitle ? 0.12 : 1);
          if (alpha < 0.02) break;
          const col = GREEN.map((g, i) => Math.round(g + (PINK[i] - g) * out));
          ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (time: number) => {
      draw(time);
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    measure();
    if (still) draw(0);
    else frame = requestAnimationFrame(loop);

    const onResize = () => {
      measure();
      if (still) draw(0);
    };
    window.addEventListener('resize', onResize);
    // The character settles its size after fonts and images load.
    // The outline changes as the character's layers load, and when it's dressed again.
    const stageEl = stage.current;
    stageEl?.addEventListener('load', onResize, true);
    const resizer = new ResizeObserver(onResize);
    if (stage.current) resizer.observe(stage.current);
    if (title.current) resizer.observe(title.current);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame && !still) frame = requestAnimationFrame(loop);
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizer.disconnect();
      stageEl?.removeEventListener('load', onResize, true);
      window.removeEventListener('resize', onResize);
    };
  }, [stage, title]);

  return <Canvas ref={ref} aria-hidden />;
}
