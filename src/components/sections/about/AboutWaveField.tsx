'use client';

import { useEffect, useRef } from 'react';
import styled from 'styled-components';

/*
 * The About hero's backdrop: a field of points laid out as a 3D grid and seen
 * in perspective, rolling like a sea from one side of the screen to the other,
 * low behind the character so it opens out on both sides of them. Where the
 * pointer goes, the field swells up in a ring that spreads out. High points
 * glow green, the troughs fade to the site's pink.
 *
 * One canvas, drawn by requestAnimationFrame only while it's on screen. Under
 * reduced motion it draws one still frame and no pointer swell.
 */

const COLS = 72;
const ROWS = 34;
const GREEN = [12, 175, 10];
const PINK = [198, 20, 230];

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* Gone near the top, where the title is; whole along the bottom. */
  mask-image: linear-gradient(to bottom, transparent 25%, #000 60%);
`;

export function AboutWaveField() {
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
    // The pointer in field units (x across −1..1, z depth 0..1), and when its swell began.
    const swell = { x: 0, z: 0.5, at: -10, strength: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, width, height);
      const horizon = height * 0.42;
      const sinceSwell = t - swell.at;
      for (let r = 0; r < ROWS; r++) {
        // Depth: 1 far away, near 0 close up.
        const z = 1 - r / (ROWS - 1);
        const depth = 0.35 + z * 2.6;
        const points: { x: number; y: number; lift: number }[] = [];
        for (let c = 0; c < COLS; c++) {
          const x = (c / (COLS - 1)) * 2 - 1;
          let y =
            Math.sin(x * 3.2 + t * 0.9) * 0.22 +
            Math.sin(z * 5.5 - t * 1.3) * 0.18 +
            Math.sin((x + z) * 7 + t * 0.6) * 0.07;
          // The pointer's ring, spreading out and dying away.
          if (swell.strength > 0) {
            const d = Math.hypot(x - swell.x, (z - swell.z) * 2);
            const ring = d - sinceSwell * 0.9;
            y += Math.exp(-ring * ring * 30) * 0.45 * swell.strength * Math.exp(-sinceSwell * 0.8);
          }
          points.push({
            x: width / 2 + (x * width * 1.1) / depth,
            y: horizon + (height * 0.42 - y * height * 0.45) / depth,
            lift: Math.max(0, Math.min(1, (y + 0.45) / 0.9)),
          });
        }
        const fade = 1 - z * 0.7;
        // The row as a wireframe line, then its points over it.
        ctx.beginPath();
        points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.strokeStyle = `rgba(246, 246, 246, ${(0.07 * fade).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        for (const p of points) {
          if (p.x < -10 || p.x > width + 10 || p.y > height + 10) continue;
          const col = PINK.map((v, i) => Math.round(v + (GREEN[i] - v) * p.lift));
          const alpha = (0.25 + p.lift * 0.75) * fade;
          const size = (2.2 + p.lift * 2.4) / depth + 0.6;
          ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha.toFixed(3)})`;
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }
      }
    };

    const loop = (time: number) => {
      draw(time);
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    resize();
    if (still) {
      draw(0);
    } else {
      frame = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      if (still) draw(0);
    };
    window.addEventListener('resize', onResize);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame && !still) frame = requestAnimationFrame(loop);
    });
    observer.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (still) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      if (px < 0 || px > 1 || py < 0 || py > 1) return;
      const now = performance.now() / 1000;
      // A new ring at most a few times a second, so it reads as ripples, not noise.
      if (now - swell.at < 0.35) return;
      swell.x = px * 2 - 1;
      swell.z = Math.max(0, Math.min(1, 1 - (py - 0.5) * 2));
      swell.at = now;
      swell.strength = 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <Canvas ref={ref} aria-hidden />;
}
