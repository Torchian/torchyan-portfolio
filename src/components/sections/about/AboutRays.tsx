'use client';

import { useEffect, useRef, type RefObject } from 'react';
import styled from 'styled-components';

/*
 * The About hero's backdrop: the character is the sun. Rays of dots run out
 * from behind their head in every direction, filling the screen: big and
 * bright close in, smaller and fainter the further they go, and drifting
 * slowly outwards. The rays reach on down into the section below, dimmer
 * still.
 *
 * Kept off what has to be read and seen: no dot is drawn over the character
 * (inside the head and body's own outline, roughly), and dots fade right out
 * across the title's band.
 *
 * One canvas, animated only while on screen; a still frame under reduced motion.
 */

const RAYS = 84;
/** Each dot is this much further out than the one before it. */
const STEP = 1.13;
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
    // In canvas px: the head (the sun), the body below it, and the title's band.
    const geo = { cx: 0, cy: 0, head: 0, bodyTop: 0, bodyHalf: 0, titleTop: 0, titleBottom: 0, reach: 0 };

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const box = canvas.getBoundingClientRect();
      const s = stage.current?.getBoundingClientRect();
      const t = title.current?.getBoundingClientRect();
      if (s) {
        geo.cx = s.left + s.width / 2 - box.left;
        // The character's head sits about a third of the way down its square.
        geo.cy = s.top + s.height * 0.3 - box.top;
        geo.head = s.width * 0.17;
        geo.bodyTop = s.top + s.height * 0.5 - box.top;
        geo.bodyHalf = s.width * 0.36;
      }
      if (t) {
        geo.titleTop = t.top - box.top;
        geo.titleBottom = t.bottom - box.top;
      }
      geo.reach = Math.hypot(Math.max(geo.cx, width - geo.cx), Math.max(geo.cy, height - geo.cy));
    };

    /** How visible a dot may be at this point: none on the character, little on the title. */
    const room = (x: number, y: number) => {
      const dx = x - geo.cx;
      const dy = y - geo.cy;
      // The head: a circle. The body: a widening trapezoid from the shoulders down.
      if (Math.hypot(dx, dy * 0.85) < geo.head * 1.15) return 0;
      if (y > geo.bodyTop) {
        const half = geo.bodyHalf * Math.min(1.25, 0.6 + ((y - geo.bodyTop) / geo.bodyHalf) * 0.9);
        if (Math.abs(dx) < half) return 0;
      }
      if (y > geo.titleTop - 12 && y < geo.titleBottom + 12) return 0.12;
      return 1;
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const phase = (time / 1000 / DRIFT) % 1;
      const start = geo.head * 1.2;
      for (let r = 0; r < RAYS; r++) {
        const angle = (r / RAYS) * Math.PI * 2 + (r % 2 ? Math.PI / RAYS : 0) * 0.5;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        // Alternate rays start a half step out, so neighbours don't line up.
        const offset = r % 2 ? 0.5 : 0;
        for (let k = 0; ; k++) {
          const dist = start * Math.pow(STEP, k + phase + offset);
          if (dist > geo.reach) break;
          const x = geo.cx + cos * dist;
          const y = geo.cy + sin * dist;
          if (x < -4 || x > width + 4 || y < -4 || y > height + 4) continue;
          const space = room(x, y);
          if (!space) continue;
          // 0 at the sun, 1 at the farthest corner.
          const out = (dist - start) / (geo.reach - start);
          const size = 5.5 * Math.pow(1 - out, 1.6) + 0.8;
          const alpha = Math.pow(1 - out, 1.4) * 0.85 * space;
          if (alpha < 0.02) continue;
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
      window.removeEventListener('resize', onResize);
    };
  }, [stage, title]);

  return <Canvas ref={ref} aria-hidden />;
}
