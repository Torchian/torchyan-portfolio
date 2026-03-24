'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { Container, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';
import { getCaseStudyContent } from '@/components/sections/case-study/caseStudyContent';

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${neutrals[900]};
`;

const Top = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing[2000]}px ${spacing[400]}px ${spacing[1000]}px;

  ${media.down('m')} {
    padding: ${spacing[1000]}px ${spacing[300]}px ${spacing[600]}px;
  }
`;

const Inner = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[600]}px;
  max-width: 920px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.xl};
  line-height: ${fluidLineHeight.display.xl};
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${accents.primary};

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.m};
    line-height: ${fluidLineHeight.display.m};
  }
  ${media.down('m')} {
    font-size: ${fluidFontSize.display.s};
    line-height: ${fluidLineHeight.display.s};
  }
`;

const Tagline = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.m};
  line-height: ${fluidLineHeight.heading.m};
  color: ${neutrals[100]};
`;

const Intro = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[500]};
  max-width: 720px;
`;

const MetaGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[400]}px;
  width: 100%;
  margin-top: ${spacing[200]}px;
`;

const MetaRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[200]}px;
  width: 100%;
`;

const MetaLabel = styled.span`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.s}px;
  line-height: ${lineHeight.body.s}px;
  letter-spacing: ${letterSpacing.m}px;
  text-transform: uppercase;
  color: ${neutrals[100]};
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[200]}px;
`;

const Pill = styled.span`
  border-radius: ${radius.round}px;
  background: ${neutrals[100]};
  color: ${neutrals[900]};
  padding: ${spacing[100]}px ${spacing[200]}px;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  font-weight: ${fontWeight.semibold};
`;

/** Full-bleed strip at the bottom of the hero (full device width). */
const FullBleed = styled.div`
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-top: auto;
`;

const CollageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  grid-auto-rows: clamp(52px, 7vw, 88px);
  gap: ${spacing[50]}px;
  min-height: 260px;
  padding: 0 ${spacing[50]}px ${spacing[400]}px;

  ${media.down('m')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: clamp(44px, 12vw, 72px);
    min-height: 200px;
  }
`;

const CollageCell = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: ${radius.s}px;
`;

const HERO_COLLAGE_COUNT = 24;

export interface CaseStudyHeroSectionProps {
  project: ProjectConfig;
}

export function CaseStudyHeroSection({ project }: CaseStudyHeroSectionProps) {
  const cs = getCaseStudyContent(project);
  const imgs = project.images;
  const collage: { src: string; alt: string }[] = [];
  if (imgs.length > 0) {
    for (let i = 0; i < HERO_COLLAGE_COUNT; i += 1) {
      collage.push(imgs[i % imgs.length]);
    }
  }

  return (
    <Section aria-labelledby="case-study-hero-title">
      <Top>
        <Inner>
          <Title id="case-study-hero-title">{cs.heroTitle}</Title>
          <Tagline as="p">{cs.tagline}</Tagline>
          <Intro as="p">{cs.intro}</Intro>
          <MetaGrid>
            {(cs.heroMetaRows ?? [
              { label: 'Role', values: cs.meta.role },
              { label: 'Scope', values: cs.meta.scope },
              { label: 'Platform', values: cs.meta.platform },
              { label: 'Stack', values: cs.meta.stack },
            ]).map((row) => (
              <MetaRow key={row.label}>
                <MetaLabel>{row.label}</MetaLabel>
                <Pills>
                  {row.values.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </Pills>
              </MetaRow>
            ))}
          </MetaGrid>
        </Inner>
      </Top>

      {collage.length > 0 && (
        <FullBleed aria-hidden>
          <CollageGrid>
            {collage.map((img, i) => (
              <CollageCell key={`${img.src}-${i}`}>
                <Image
                  src={img.src}
                  alt=""
                  fill
                  priority={i < 2}
                  sizes="(max-width: 768px) 20vw, 10vw"
                  style={{ objectFit: 'cover' }}
                />
              </CollageCell>
            ))}
          </CollageGrid>
        </FullBleed>
      )}
    </Section>
  );
}
