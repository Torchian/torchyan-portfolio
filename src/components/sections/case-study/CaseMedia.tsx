'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { accents, neutrals } from '@/styles/tokens/colors';
import { spacing } from '@/styles/tokens/spacing';
import type { CaseImage, CaseVideo } from './caseStudyConfig';

/*
 * One piece of case imagery: a screenshot, or a short screen recording.
 *
 * A recording plays muted and looped, like a moving screenshot, and only while
 * it's on screen. It never starts by itself for visitors who prefer reduced
 * motion: they see its poster and can press play. Everyone gets a pause
 * button (WCAG 2.2.2: anything moving for more than five seconds can be
 * stopped), and a recording someone paused stays paused.
 */

const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Toggle = styled.button`
  position: absolute;
  right: ${spacing[200]}px;
  bottom: ${spacing[200]}px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(11, 9, 21, 0.72);
  color: ${neutrals[100]};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
  }
`;

function PlayIcon({ playing }: { playing: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
      {playing ? (
        <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />
      ) : (
        <path d="M5 3l8 5-8 5z" fill="currentColor" />
      )}
    </svg>
  );
}

function LoopVideo({ video, position }: { video: CaseVideo; position?: string }) {
  const t = useTranslations('caseMedia');
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  /** The visitor's own choice wins over visibility and the motion preference. */
  const choice = useRef<'play' | 'pause' | null>(null);
  const visible = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const want = choice.current ? choice.current === 'play' : !reduced.matches;
      if (want && visible.current) el.play().catch(() => setPlaying(false));
      else el.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    reduced.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', sync);
    };
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      choice.current = 'play';
      el.play().catch(() => setPlaying(false));
    } else {
      choice.current = 'pause';
      el.pause();
    }
  };

  return (
    <>
      <Video
        ref={ref}
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        style={{ objectPosition: position }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <Toggle type="button" onClick={toggle} aria-label={playing ? t('pause') : t('play')}>
        <PlayIcon playing={playing} />
      </Toggle>
    </>
  );
}

interface CaseMediaProps {
  image: CaseImage;
  /** next/image `sizes`, for a screenshot. */
  sizes: string;
  alt?: string;
  /** CSS object-position; screenshots read from the top by default. */
  position?: string;
}

/** Fills its (positioned) parent, as `next/image` with `fill` does. */
export function CaseMedia({ image, sizes, alt = '', position = 'top' }: CaseMediaProps) {
  if (image.video) return <LoopVideo video={image.video} position={position} />;
  return (
    <Image
      src={image.src}
      alt={alt}
      fill
      sizes={sizes}
      draggable={false}
      style={{ objectFit: 'cover', objectPosition: position }}
    />
  );
}
