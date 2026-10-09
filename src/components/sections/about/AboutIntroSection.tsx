'use client';

import styled from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';

/*
 * Figma: About Me Info — 1920 (2973:16233), 1024 (3960:15393), 480 (3983:11074).
 * Three centred paragraphs under the hero, the name picked out in green. Each
 * is its own part: well apart, with a short hairline between them.
 */

/**
 * \`#main-content\` (styles/global.ts) puts 160px between every top-level
 * section — 80px below the \`m\` breakpoint — so every other pair on the page
 * gets that rhythm. Only Hero→Info wants closer: it's pulled up to 24px with a
 * negative margin, at each of the global gap's own two sizes.
 */
const CLOSER = 24;

const Section = styled.section`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: -${spacing[2000] - CLOSER}px;

  /* More air before Experience on a tablet and phone. */
  ${media.down('xl')} {
    margin-bottom: ${spacing[1000]}px;
  }

  ${media.down('m')} {
    margin-top: -${spacing[1000] - CLOSER}px;
  }
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
  width: 100%;
  max-width: 1024px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  /* Figma: 36/48 on the 1920 and tablet frames, 24/32 on the phone. */
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
  color: ${neutrals[500]};

  p {
    margin: 0;
  }

  /* The hairline sits halfway between two parts. */
  p + p {
    position: relative;
  }

  p + p::before {
    content: '';
    position: absolute;
    top: calc(${spacing[800]}px / -2);
    left: 50%;
    width: 48px;
    height: 1px;
    background: rgba(246, 246, 246, 0.2);
    transform: translateX(-50%);
  }

  ${media.down('xl')} {
    gap: ${spacing[600]}px;
    max-width: none;
    padding: 0 ${spacing[800]}px;
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;

    p + p::before {
      top: calc(${spacing[600]}px / -2);
    }
  }

  ${media.down('m')} {
    gap: ${spacing[500]}px;
    /* Clear of the timeline's line, which runs down the left edge. */
    padding: 0 ${spacing[500]}px;
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;

    p + p::before {
      top: calc(${spacing[500]}px / -2);
    }
  }
`;

const Name = styled.strong`
  font-weight: inherit;
  color: ${accents.primary};
`;

export function AboutIntroSection() {
  const t = useTranslations('about.hero');

  return (
    <Section>
      <Text>
        <p>{t.rich('intro', { name: (chunks) => <Name>{chunks}</Name> })}</p>
        <p>{t('execution')}</p>
        <p>{t('resilience')}</p>
      </Text>
    </Section>
  );
}
