'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import type { CaseImage, CaseStudyCopy } from './caseStudyConfig';

/*
 * Figma: hero_container — 1920 (3155:10963), 1024 (3920:8940), 480 (3921:10853);
 * Case Study Carousel (3073:2504).
 *
 * The title steps down 96 Black uppercase → 72 Bold → 58 SemiBold. The meta
 * lists (Role, Scope, Platform, Stack) stack their label over the badges on
 * desktop, sit on one centred line on tablet, and on a phone read from the left
 * with the badges wrapping.
 *
 * Under it, the carousel: rows of screenshots that drift sideways with the
 * scroll, alternating direction — Figma's Start state as the carousel comes up
 * the screen, its End state as it leaves.
 */

/* 80 clear at the top for the fixed header, as the Figma frame has it. */
const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${spacing[1000]}px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: ${spacing[2000]}px ${spacing[400]}px ${spacing[1000]}px;

  ${media.down('xl')} {
    padding: ${spacing[1000]}px ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: ${spacing[1000]}px ${spacing[200]}px ${spacing[400]}px;
  }
`;

const Title = styled.h1`
  width: 100%;
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-align: center;
  text-transform: uppercase;
  color: ${accents.primary};

  ${media.down('xl')} {
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
    letter-spacing: ${letterSpacing.xs}px;
    text-transform: none;
  }

  ${media.down('m')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }
`;

const Subtitle = styled.p`
  width: 100%;
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[100]};

  ${media.down('m')} {
    font-family: ${fontFamily.heading};
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Description = styled.div`
  width: 100%;
  max-width: 820px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[500]};

  p {
    margin: 0;
  }

  ${media.down('xl')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  }
`;

const MetaList = styled.dl`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[600]}px;
  width: 100%;
  margin: 0;

  ${media.down('xl')} {
    gap: ${spacing[200]}px;
  }

  ${media.down('m')} {
    align-items: stretch;
    gap: ${spacing[250]}px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[100]}px;

  ${media.down('xl')} {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
  }

  ${media.down('m')} {
    justify-content: flex-start;
  }
`;

const MetaLabel = styled.dt`
  flex: none;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[500]};

  ${media.down('xl')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
  }
`;

/** The design's light badge, Large → Medium → Small with the breakpoint. */
const MetaItems = styled.dd`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[200]}px;
  margin: 0;

  span {
    display: flex;
    align-items: center;
    height: 28px;
    padding: ${spacing[50]}px ${spacing[250]}px;
    border-radius: 24px;
    background: ${neutrals[100]};
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
    white-space: nowrap;
    color: ${neutrals[900]};
  }

  ${media.down('xl')} {
    span {
      height: 24px;
      padding: ${spacing[50]}px ${spacing[200]}px;
      font-size: ${fontSize.body.l}px;
      line-height: ${lineHeight.body.l}px;
      letter-spacing: ${letterSpacing.m}px;
    }
  }

  ${media.down('m')} {
    flex: 1 1 0;
    justify-content: flex-start;
    gap: ${spacing[100]}px;

    span {
      height: 22px;
      padding: ${spacing[50]}px ${spacing[150]}px;
      font-size: ${fontSize.body.m}px;
      line-height: ${lineHeight.body.m}px;
      letter-spacing: ${letterSpacing.s}px;
    }
  }
`;

/* ---------- Carousel ---------- */

/** Row height per screen (Figma: 299 / 204 / 205) and the gap between everything. */
const ROW = { desktop: 299, tablet: 204, mobile: 205 } as const;
const GAP = spacing[200];

const Carousel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${GAP}px;
  width: 100%;
  overflow: hidden;
  /* The rows travel by the difference between their width and this one. */
  container-type: inline-size;
  --row: ${ROW.desktop}px;

  ${media.down('xl')} {
    --row: ${ROW.tablet}px;
  }

  ${media.down('m')} {
    --row: ${ROW.mobile}px;

    & > :nth-child(n + 3) {
      display: none;
    }
  }
`;

/**
 * How far along its run each row is at scroll progress --p (0 → 1): the first
 * row goes from its left edge to its right, the second the other way, the third
 * covers the second half only (Figma's Start and End states).
 */
const ROW_TRAVEL = [
  'var(--p, 0.5)',
  'calc(1 - var(--p, 0.5))',
  'calc(0.5 + var(--p, 0.5) * 0.5)',
];

const Row = styled.ul<{ $row: number }>`
  display: flex;
  flex: none;
  gap: ${GAP}px;
  width: max-content;
  margin: 0;
  padding: 0;
  list-style: none;
  transform: translateX(calc(${(p) => ROW_TRAVEL[p.$row % ROW_TRAVEL.length]} * (100cqw - 100%)));

  /* A GPU layer only while it's moving on screen: three rows this wide hold
     tens of megabytes of texture. */
  [data-live='true'] > & {
    will-change: transform;
  }
`;

const Shot = styled.li`
  position: relative;
  flex: none;
  height: var(--row);
  overflow: hidden;

  img {
    object-fit: cover;
  }
`;

function CaseCarousel({ rows }: { rows: CaseImage[][] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const gate = createInViewGate(el);
    let last = '';
    const unsubscribe = subscribeScroll<string>({
      active: () => gate.current,
      read: (frame) => {
        const r = frame.rect(el);
        const p = (frame.vh - r.top) / (frame.vh + r.height);
        return Math.min(1, Math.max(0, p)).toFixed(4);
      },
      write: (_frame, p) => {
        if (p === last) return;
        el.style.setProperty('--p', p);
        last = p;
      },
    });
    // The rows are layers only while the carousel is near the screen.
    const live = new IntersectionObserver(([entry]) => {
      el.dataset.live = String(entry.isIntersecting);
    }, { rootMargin: '50% 0px' });
    live.observe(el);
    return () => {
      unsubscribe();
      gate.disconnect();
      live.disconnect();
    };
  }, []);

  return (
    <Carousel ref={ref} aria-hidden>
      {rows.map((row, r) => (
        <Row key={r} $row={r}>
          {row.map((image, i) => (
            <Shot key={`${image.src}-${i}`} style={{ aspectRatio: String(image.aspect) }}>
              <Image
                src={image.src}
                alt=""
                fill
                sizes={`${Math.ceil(ROW.desktop * image.aspect)}px`}
                draggable={false}
              />
            </Shot>
          ))}
        </Row>
      ))}
    </Carousel>
  );
}

export function CaseStudyHero({ copy, carousel }: { copy: CaseStudyCopy['hero']; carousel: CaseImage[][] }) {
  return (
    <Section>
      <Container>
        <Title>{copy.title}</Title>
        <Subtitle>{copy.subtitle}</Subtitle>
        <Description>
          {copy.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Description>
        <MetaList>
          {copy.meta.map((row) => (
            <MetaRow key={row.label}>
              <MetaLabel>{row.label}</MetaLabel>
              <MetaItems>
                {row.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </MetaItems>
            </MetaRow>
          ))}
        </MetaList>
      </Container>
      <CaseCarousel rows={carousel} />
    </Section>
  );
}
