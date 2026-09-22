'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { CaseBlocks } from './CaseBlocks';
import type { CaseImage, CaseStudyCopy, GallerySet } from './caseStudyConfig';

/*
 * Figma: Timeline — 1920 (3155:10993), 1024 (3920:8968), 480 (3921:10881);
 * Timeline Gallery (3155:11129).
 *
 * The steps run down the left half. On desktop and tablet the gallery sits
 * beside them, running out to the page's right edge, pinned under the header
 * while the steps scroll past, and it changes to each step's images as that
 * step crosses the middle of the screen. On a phone there's no room beside the
 * text, so each step is followed by one image instead.
 */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${spacing[1000]}px;
  /* The gallery bleeds to the viewport edge; never let that widen the page. */
  overflow-x: clip;

  ${media.down('m')} {
    padding-top: ${spacing[600]}px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    gap: ${spacing[1000]}px;
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
  }
`;

const Heading = styled(SectionHeading)`
  h2 {
    color: ${neutrals[500]};
  }

  /* The subtitle is two sentences on two lines. */
  p {
    white-space: pre-line;
  }
`;

/** The text column's width, and the space between it and the gallery (Figma 688 / 60, 544 / 48). */
const TEXT = { desktop: 688, tablet: 544 } as const;
const TEXT_GAP = { desktop: 60, tablet: 48 } as const;

const Body = styled.div`
  position: relative;
`;

const Steps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${spacing[1000]}px;
  width: ${TEXT.desktop}px;
  max-width: calc(50% - ${TEXT_GAP.desktop / 2}px);
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    gap: ${spacing[500]}px;
    width: ${TEXT.tablet}px;
    max-width: calc(55% - ${TEXT_GAP.tablet / 2}px);
  }

  ${media.down('m')} {
    gap: 0;
    width: 100%;
    max-width: none;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing[400]}px;
  padding: ${spacing[500]}px 0;

  ${media.down('xl')} {
    gap: ${spacing[300]}px;
    padding: ${spacing[300]}px 0;
  }
`;

const CardHeading = styled.h3`
  display: flex;
  flex-direction: column;
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};

  small {
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const CardBody = styled(CaseBlocks)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[500]};
`;

/* ---------- Gallery (desktop and tablet) ---------- */

const GalleryColumn = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(min(${TEXT.desktop}px, 50% - ${TEXT_GAP.desktop / 2}px) + ${TEXT_GAP.desktop}px);
  /* To the viewport's right edge: past the container's padding and margin. */
  right: calc((100% - 100vw) / 2);

  ${media.down('xl')} {
    left: calc(min(${TEXT.tablet}px, 55% - ${TEXT_GAP.tablet / 2}px) + ${TEXT_GAP.tablet}px);
  }

  ${media.down('m')} {
    display: none;
  }
`;

/** Pinned under the header; as tall as the design allows, or the screen does. */
const Gallery = styled.div`
  position: sticky;
  top: ${spacing[1000] + spacing[300]}px;
  height: min(1146px, calc(100svh - ${spacing[1000] + spacing[600]}px));
`;

const GallerySetView = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  gap: ${spacing[400]}px;
  opacity: 0;
  transition: opacity 500ms ease-out;

  &[data-active='true'] {
    opacity: 1;
  }

  ${media.down('xl')} {
    gap: ${spacing[200]}px;
  }

  ${media.reducedMotion} {
    transition: none;
  }
`;

const GalleryCol = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: inherit;
  min-width: 0;
`;

/** One image of a set; `grow` shares the column's height (Figma 292 : 216 on the right). */
const GalleryShot = styled.div<{ $grow: number }>`
  position: relative;
  flex: ${(p) => p.$grow} 1 0;
  min-height: 0;
  overflow: hidden;

  img {
    object-fit: cover;
    object-position: top;
  }
`;

function Shot({ image, grow, width }: { image: CaseImage; grow: number; width: number }) {
  return (
    <GalleryShot $grow={grow}>
      <Image src={image.src} alt="" fill sizes={`${width}px`} draggable={false} />
    </GalleryShot>
  );
}

/* ---------- Inline image (phones) ---------- */

const InlineShot = styled.div`
  display: none;

  ${media.down('m')} {
    position: relative;
    display: block;
    height: 315px;
    overflow: hidden;

    img {
      object-fit: cover;
      object-position: top;
    }
  }
`;

export function CaseStudyTimeline({
  copy,
  gallery,
}: {
  copy: CaseStudyCopy['timeline'];
  gallery: GallerySet[];
}) {
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // Only the set on show and the one fading out are mounted (plus the next,
  // warming up): a gallery-sized layer and three decoded images each.
  const [previous, setPrevious] = useState(-1);
  const activeRef = useRef(0);

  useEffect(() => {
    const els = stepRefs.current.filter((el): el is HTMLLIElement => el !== null);
    // A thin band across the middle of the screen: the step crossing it is the one shown.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = els.indexOf(entry.target as HTMLLIElement);
          if (index === activeRef.current) continue;
          setPrevious(activeRef.current);
          activeRef.current = index;
          setActive(index);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Section>
      <Container>
        <Heading title={copy.title} subtitle={copy.subtitle.join('\n')} />
        <Body>
          <Steps>
            {copy.steps.map((cards, s) => (
              <li
                key={cards[0].title}
                ref={(el) => {
                  stepRefs.current[s] = el;
                }}
              >
                {cards.map((card) => (
                  <Card key={card.title}>
                    <CardHeading>
                      {card.phase && <small>{card.phase}</small>}
                      {card.title}
                    </CardHeading>
                    <CardBody blocks={card.blocks} />
                  </Card>
                ))}
                {gallery[s] && (
                  <InlineShot>
                    <Image src={gallery[s].side[0].src} alt="" fill sizes="480px" draggable={false} />
                  </InlineShot>
                )}
              </li>
            ))}
          </Steps>

          <GalleryColumn aria-hidden>
            <Gallery>
              {gallery.map((set, s) => (
                <Fragment key={s}>
                  {(s === active || s === previous || s === active + 1) && (
                    <GallerySetView data-active={s === active}>
                      <GalleryCol>
                        <Shot image={set.main} grow={1} width={450} />
                      </GalleryCol>
                      <GalleryCol>
                        <Shot image={set.side[0]} grow={292} width={450} />
                        <Shot image={set.side[1]} grow={216} width={450} />
                      </GalleryCol>
                    </GallerySetView>
                  )}
                </Fragment>
              ))}
            </Gallery>
          </GalleryColumn>
        </Body>
      </Container>
    </Section>
  );
}
