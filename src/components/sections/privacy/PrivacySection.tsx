'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

/*
 * The privacy notice: a plain reading page in the site's type and colours.
 * Copy lives in messages/*.json under privacyPage. It describes what the site
 * actually does (contact form → Resend, hosting and cookieless analytics →
 * Vercel) and must be reviewed, with the data-controller details added, before
 * the site is opened to visitors.
 */

const Article = styled.article`
  max-width: 760px;
  margin: 0 auto;
  padding: ${spacing[2000]}px ${spacing[400]}px ${spacing[1000]}px;
  font-family: ${fontFamily.body};
  color: ${neutrals[500]};

  ${media.down('m')} {
    padding: ${spacing[1000] + spacing[300]}px ${spacing[200]}px ${spacing[600]}px;
  }
`;

const Title = styled.h1`
  margin: 0 0 ${spacing[200]}px;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  color: ${neutrals[100]};

  ${media.down('m')} {
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;
  }
`;

const Updated = styled.p`
  margin: 0 0 ${spacing[600]}px;
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
`;

const Part = styled.section`
  margin-bottom: ${spacing[500]}px;

  h2 {
    margin: 0 0 ${spacing[150]}px;
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
    color: ${neutrals[100]};
  }

  p {
    margin: 0 0 ${spacing[150]}px;
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;

    ${media.down('m')} {
      font-size: ${fontSize.body.l}px;
      line-height: ${lineHeight.body.l}px;
    }
  }

  a {
    color: ${accents.primary};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export function PrivacySection() {
  const t = useTranslations('privacyPage');
  const sections = t.raw('sections') as { title: string; body: string[] }[];

  return (
    <Article aria-labelledby="privacy-title">
      <Title id="privacy-title">{t('title')}</Title>
      <Updated>{t('updated')}</Updated>
      {sections.map((section) => (
        <Part key={section.title}>
          <h2>{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Part>
      ))}
    </Article>
  );
}
