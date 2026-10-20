'use client';

import { useEffect, useRef } from 'react';
import styled from 'styled-components';

/*
 * The signal rippling out behind the contact circle, drawn on one canvas.
 *
 * It used to be five page-sized elements (the circle plus 30% all round, about
 * 1300px square on a laptop), each with a blurred glow, animated under a mask.
 * Every frame the browser composited all five through the mask at full device
 * resolution, and on a laptop that alone held the section to 20–30 frames a
 * second, with nothing else moving. Here the same picture is one surface: each
 * ripple is a single ring-shaped fill, at one canvas px per CSS px (it is all
 * soft glow), 30 times a second, and nothing is drawn while it's off screen or
 * the tab is hidden.
 *
 * What it draws is the CSS it replaced: a 1px ring with a 32px glow outside and
 * a fainter one inside, leaving the circle's edge, thinning as it spreads and
 * gone at the box's rim; over a glow that breathes once per ripple.
 */

/** The box is the circle plus 30% all round; FROM is the circle's own edge within it. */
const BOX = 1.6;
const FROM = 1 / BOX;
const WAVES = 5;
/** One ripple's whole life, and the gap between one ripple and the next. */
const PERIOD = 10_000;
const GAP = PERIOD / WAVES;
/** When a ripple is at its brightest, as a share of its life, and how bright. */
const PEAK_AT = 0.12;
const PEAK = 0.9;
/** The glow either side of the ring, in CSS px at full size (box-shadow's 32px blur). */
const GLOW = 32;
const OUTER_ALPHA = 0.5;
const INNER_ALPHA = 0.26;
/** Whole up to this share of the box's radius, fading to nothing at its rim. */
const MASK_FROM = 0.45;
/** The breathing glow: its radius as a share of the box's, and its colour's strength. */
const BREATH_RADIUS = 0.56 * 0.7;
const BREATH_ALPHA = 0.22;
const TINT_MS = 600;
/**
 * Glow is soft: drawn at one canvas px per CSS px it can't be told from the
 * CSS at device resolution (compared side by side at 2×), for a quarter of the
 * pixels to fill.
 */
const MAX_DENSITY = 1;
/**
 * A ripple crosses about 20px a second, so 30 drawings a second are as smooth
 * as 60 and cost half.
 */
const FRAME_MS = 1000 / 30;

type Rgb = [number, number, number];

const hex = (color: string): Rgb => {
  const n = parseInt(color.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgba = ([r, g, b]: Rgb, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

/** CSS cubic-bezier(x1, y1, x2, y2) as a function of progress. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(mid, x1, x2) < x) lo = mid;
      else hi = mid;
    }
    return at((lo + hi) / 2, y1, y2);
  };
}

const ease = bezier(0.2, 0.6, 0.3, 1);
const easeInOut = bezier(0.42, 0, 0.58, 1);

/** The CSS keyframes it replaces: scale FROM → 1 over the whole life; opacity 0 → PEAK → 0, eased per segment. */
function ripple(t: number) {
  const scale = FROM + (1 - FROM) * ease(t);
  const opacity = t < PEAK_AT ? PEAK * ease(t / PEAK_AT) : PEAK * (1 - ease((t - PEAK_AT) / (1 - PEAK_AT)));
  return { scale, opacity };
}

/** The mask the waves sat under: whole near the circle, gone at the box's rim. */
const mask = (r: number) => Math.max(0, Math.min(1, (1 - r) / (1 - MASK_FROM)));

/** A blurred edge's falloff, d px from it with a blur of `blur` px (σ = blur / 2). */
function falloff(d: number, blur: number) {
  const x = d / ((blur / 2) * Math.SQRT2);
  // erfc, Abramowitz–Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 - Math.sign(x) * erf);
}

const Canvas = styled.canvas`
  position: absolute;
  inset: -30%;
  width: 160%;
  /* The global reset caps media at its container's width. */
  max-width: none;
  height: 160%;
  pointer-events: none;
`;

interface ContactWavesProps {
  /** Each ripple's colour, round the ring at rest; the last is also the breathing glow's. */
  colors: readonly string[];
  /** Every ripple in this colour while a channel is chosen. */
  tint: string | null;
}

export function ContactWaves({ colors, tint }: ContactWavesProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef<{ colors: readonly string[]; tint: string | null }>({ colors, tint });
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    target.current = { colors, tint };
    wake.current();
  }, [colors, tint]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let size = 0;
    let density = 1;
    let visible = false;
    let raf = 0;
    const start = performance.now();

    // Each ripple's colour eases to its target, as the CSS transition did.
    const shown: Rgb[] = Array.from({ length: WAVES }, (_, i) => hex(colors[i % colors.length]));
    let from: Rgb[] = shown.map((c) => [...c] as Rgb);
    let to: string[] = [];
    let tintedAt = 0;

    const aim = (now: number) => {
      const { colors: base, tint: lit } = target.current;
      const next = shown.map((_, i) => lit ?? base[i % base.length]);
      if (next.join() !== to.join()) {
        from = shown.map((c) => [...c] as Rgb);
        to = next;
        tintedAt = now;
      }
      const k = still.matches ? 1 : easeInOut(Math.min(1, (now - tintedAt) / TINT_MS));
      shown.forEach((c, i) => {
        const end = hex(to[i]);
        for (let j = 0; j < 3; j++) c[j] = from[i][j] + (end[j] - from[i][j]) * k;
      });
      return k < 1;
    };

    const ring = (scale: number, opacity: number, color: Rgb) => {
      const half = size / 2;
      const r = half * scale;
      const glow = GLOW * density * scale;
      const inner = Math.max(0, r - glow * 1.2);
      const outer = r + glow * 1.2;
      const g = ctx.createRadialGradient(half, half, inner, half, half, outer);
      const steps = 12;
      for (let s = 0; s <= steps; s++) {
        const at = inner + ((outer - inner) * s) / steps;
        const d = at - r;
        const alpha = d >= 0 ? OUTER_ALPHA * falloff(d, glow) : INNER_ALPHA * falloff(-d, glow);
        g.addColorStop(s / steps, rgba(color, alpha * opacity * mask(at / half)));
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(half, half, outer, 0, Math.PI * 2);
      ctx.arc(half, half, inner, 0, Math.PI * 2, true);
      ctx.fill();
      // The 1px border itself.
      ctx.strokeStyle = rgba(color, opacity * mask(r / half));
      ctx.lineWidth = Math.max(1, density * scale);
      ctx.beginPath();
      ctx.arc(half, half, r - ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.stroke();
    };

    const draw = (now: number) => {
      const time = now - start;
      const tinting = aim(now);
      ctx.clearRect(0, 0, size, size);
      if (!size) return tinting;

      const half = size / 2;
      // The last ripple is the site's green at rest, as the glow is, and turns with the rest.
      const breathColor = shown[WAVES - 1];
      const breath = still.matches ? 0.55 : 0.55 + 0.45 * easeInOut(1 - Math.abs(((time / (GAP * 2)) % 1) * 2 - 1));
      const radius = half * BREATH_RADIUS;
      const g = ctx.createRadialGradient(half, half, 0, half, half, radius);
      g.addColorStop(0, rgba(breathColor, BREATH_ALPHA * breath));
      g.addColorStop(1, rgba(breathColor, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(half, half, radius, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < WAVES; i++) {
        if (still.matches) {
          ring(FROM + (1 - FROM) * ((i + 1) / WAVES), 0.22, shown[i]);
          continue;
        }
        const t = (((time + i * GAP) % PERIOD) + PERIOD) % PERIOD / PERIOD;
        const { scale, opacity } = ripple(t);
        if (opacity > 0.002) ring(scale, opacity, shown[i]);
      }
      return tinting;
    };

    let drawnAt = 0;
    const tick = (now: number) => {
      raf = 0;
      if (now - drawnAt < FRAME_MS - 4) {
        raf = requestAnimationFrame(tick);
        return;
      }
      drawnAt = now;
      const tinting = draw(now);
      if (visible && !document.hidden && (!still.matches || tinting)) raf = requestAnimationFrame(tick);
    };

    const run = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    wake.current = run;

    // Measured on the stage the canvas overhangs: hidden, the canvas itself has no box.
    const stage = canvas.parentElement ?? canvas;
    const resize = () => {
      if (!visible) return;
      const css = stage.clientWidth * BOX;
      density = Math.min(window.devicePixelRatio || 1, MAX_DENSITY);
      const next = Math.round(css * density);
      if (next !== size) {
        size = next;
        canvas.width = canvas.height = size;
      }
      draw(performance.now());
    };

    /*
     * Off screen the canvas goes altogether, backing store and all: even
     * undrawn, a canvas in the page is handed to the compositor again on every
     * frame (about a millisecond each, measured while scrolling the sections
     * above it).
     */
    const show = (on: boolean) => {
      visible = on;
      canvas.hidden = !on;
      if (on) {
        resize();
        run();
      } else {
        size = 0;
        canvas.width = canvas.height = 0;
      }
    };
    show(false);

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(stage);
    const viewObserver = new IntersectionObserver(([entry]) => show(entry.isIntersecting), {
      // The ripples overhang the stage by 30% each way.
      rootMargin: '30% 0px',
    });
    viewObserver.observe(stage);
    document.addEventListener('visibilitychange', run);
    still.addEventListener('change', run);

    return () => {
      cancelAnimationFrame(raf);
      wake.current = () => {};
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener('visibilitychange', run);
      still.removeEventListener('change', run);
    };
    // The colours are read through `target`; the loop is set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Canvas ref={ref} aria-hidden />;
}
