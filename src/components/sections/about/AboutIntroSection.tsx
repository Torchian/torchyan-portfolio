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
 * Three centred paragraphs under the hero, the name picked out in green.
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

  ${media.down('m')} {
    margin-top: -${spacing[1000] - CLOSER}px;
  }
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[400]}px;
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

  ${media.down('xl')} {
    max-width: none;
    padding: 0 ${spacing[800]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[300]}px;
    padding: 0 ${spacing[200]}px;
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
    letter-spacing: ${letterSpacing.s}px;
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
