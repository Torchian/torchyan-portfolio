'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { CaseBlocks } from './CaseBlocks';
import type { CaseImage, CaseStudyCopy } from './caseStudyConfig';

/*
 * Figma: Visual System Architecture — 1920 (3155:11151), 1024 (3920:9126),
 * 480 (3921:11039).
 *
 * Use cases in rows of text and one image, the image running out to the page
 * edge with its inner corners rounded; they alternate sides. (Figma shows a
 * screenshot grid in each; the page takes a single image.) On a phone the image
 * follows its text. As a row scrolls into view its text slides in from its own
 * side and the image from the other, both fading up; scrolled back below the
 * screen, they reset to play again.
 */

type Side = 'left' | 'right';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2000]}px;
  padding-top: ${spacing[1000]}px;
  overflow-x: clip;

  ${media.down('xl')} {
    gap: ${spacing[1000]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[800]}px;
    padding-top: ${spacing[600]}px;
  }
`;

const HeadingWrap = styled.div`
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    padding: 0 ${spacing[200]}px;
  }
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2000]}px;
  width: 100%;

  ${media.down('xl')} {
    gap: ${spacing[1000]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[800]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

const TRAVEL = 'clamp(48px, 8vw, 160px)';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** In place when the row is shown; off towards `from` and transparent otherwise. */
const reveal = (from: Side, delay: number) => css`
  transition:
    opacity 700ms ease-out ${delay}ms,
    transform 900ms ${EASE} ${delay}ms;

  [data-shown='false'] > & {
    opacity: 0;
    transform: translateX(calc(${from === 'left' ? -1 : 1} * ${TRAVEL}));
  }

  ${media.reducedMotion} {
    transform: none !important;
    transition: opacity 400ms ease-out;
  }
`;

const Row = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: ${spacing[300]}px;
  min-height: 460px;

  ${media.down('m')} {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }
`;

const Text = styled.div<{ $side: Side }>`
  ${(p) => reveal(p.$side, 0)}
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  width: 100%;
  padding: 0 ${spacing[800]}px;
  color: ${neutrals[100]};

  ${media.down('xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    order: 0;
    padding: 0;
  }
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;

  ${media.down('xl')} {
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const Body = styled(CaseBlocks)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
`;

const Media = styled.div<{ $side: Side }>`
  ${(p) => reveal(p.$side, 120)}
  position: relative;
  align-self: stretch;
  min-height: 460px;
  overflow: hidden;
  border-radius: ${(p) =>
    p.$side === 'right' ? `${radius.xxl}px 0 0 ${radius.xxl}px` : `0 ${radius.xxl}px ${radius.xxl}px 0`};
  order: ${(p) => (p.$side === 'left' ? -1 : 0)};

  img {
    object-fit: cover;
    object-position: top left;
  }

  ${media.down('m')} {
    order: 1;
    min-height: 336px;
    border-radius: ${radius.xl}px;
  }
`;

function UseCase({
  title,
  blocks,
  image,
  imageSide,
}: CaseStudyCopy['architecture']['useCases'][number] & { image?: CaseImage; imageSide: Side }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Hidden only by script, and only if it starts below the screen: without
    // JavaScript, or already in view, the row simply shows.
    if (el.getBoundingClientRect().top > window.innerHeight) el.dataset.shown = 'false';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.dataset.shown = 'true';
        // Only reset once it's gone below the screen, so scrolling on past it doesn't replay it.
        else if (entry.boundingClientRect.top > 0) el.dataset.shown = 'false';
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const textSide: Side = imageSide === 'right' ? 'left' : 'right';
  return (
    <Row ref={ref}>
      <Text $side={textSide}>
        <Title>{title}</Title>
        <Body blocks={blocks} />
      </Text>
      {image && (
        <Media $side={imageSide} aria-hidden>
          <Image src={image.src} alt="" fill sizes="(max-width: 480px) 100vw, 50vw" draggable={false} />
        </Media>
      )}
    </Row>
  );
}

export function CaseStudyArchitecture({
  copy,
  images,
}: {
  copy: CaseStudyCopy['architecture'];
  images: CaseImage[];
}) {
  return (
    <Section>
      <HeadingWrap>
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />
      </HeadingWrap>
      <Rows>
        {copy.useCases.map((useCase, i) => (
          <UseCase
            key={useCase.title}
            {...useCase}
            image={images[i]}
            imageSide={i % 2 === 0 ? 'right' : 'left'}
          />
        ))}
      </Rows>
    </Section>
  );
}
