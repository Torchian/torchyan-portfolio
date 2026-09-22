'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';
import { CrosshairName } from './CrosshairName';

/*
 * Figma: hero_section — 1920 (3285:8498), 1440 (2670:10805), 1280 (2670:11152),
 * 1024 (2670:11499), 768 (2670:11821), 480 (2670:12142), 320 (2670:12463).
 *
 *  - 1280 frame and up (from 1025px): "Design Engineer" over STEPAN TORCHYAN,
 *    the description, the CTA and the skills row.
 *  - 1024 frame (769–1024px): the name leads in sentence case, the CTA floats
 *    between the heading and the description.
 *  - 768 frame and below (up to 768px): a centred stack with one colour portrait
 *    under the CTA; no skills row.
 *
 * From the 1024 frame up, the lines background and both side portraits are
 * SideCharacters (SiteLayout); below it SideCharacters keeps only the lines.
 */

/** Baked with scripts/bake-character.py (Big Lebowski, no cap or glasses); see ADR 0005. */
const PORTRAIT = { src: '/hero/character-portrait.webp', width: 1024, height: 1024 } as const;

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  padding-top: ${spacing[1000]}px;
  overflow: hidden;
`;

/** Figma Hero Background: four blurred glows, pre-rendered. */
const Glow = styled.div`
  position: absolute;
  inset: 0;
  background: url('/hero/hero-glow.webp') center / 100% 100% no-repeat;
  pointer-events: none;
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;
  /* In the 768 frame and below, the portrait closes the section: no padding under it. */
  padding: ${spacing[300]}px ${spacing[200]}px 0;

  ${media.up('m')} {
    padding: ${spacing[300]}px ${spacing[300]}px 0;
  }

  ${media.up('l')} {
    padding: ${spacing[400]}px ${spacing[600]}px;
  }

  ${media.up('xxl')} {
    padding: ${spacing[800]}px ${spacing[800]}px ${spacing[400]}px;
  }

  ${media.up('xxxl')} {
    padding: ${spacing[1000]}px ${spacing[400]}px ${spacing[400]}px;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  /* 1024: heading on top, description at the bottom, CTA centred between (auto margins). */
  ${media.up('l')} {
    flex: 1;
    padding-bottom: ${spacing[1000]}px;
  }

  ${media.up('xl')} {
    flex: none;
    padding: ${spacing[500]}px 0;
  }
`;

const Name = styled.h1`
  order: 1;
  margin: ${spacing[250]}px 0 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[500]};

  /* 480 / 320: "Stepan" and "Torchyan" on their own lines. */
  ${media.down('m')} {
    max-width: 7em;
  }

  ${media.up('m')} {
    margin-top: ${spacing[300]}px;
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }

  ${media.up('l')} {
    margin-top: ${spacing[500]}px;
  }

  ${media.up('xl')} {
    order: 2;
    margin-top: ${spacing[1000]}px;
    font-weight: ${fontWeight.black};
    font-size: ${fontSize.display.xl}px;
    line-height: ${lineHeight.display.xl}px;
    letter-spacing: ${letterSpacing.xxs}px;
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

const Role = styled.p`
  order: 2;
  margin: ${spacing[250]}px 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${accents.primary};
  white-space: nowrap;

  ${media.up('m')} {
    margin: ${spacing[400]}px 0 ${spacing[300]}px;
    font-family: ${fontFamily.display};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.up('l')} {
    margin: ${spacing[600]}px 0 ${spacing[500]}px;
  }

  ${media.up('xl')} {
    order: 1;
    margin: 0;
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }
`;

const Description = styled.p`
  order: 3;
  max-width: 100%;
  margin: ${spacing[600]}px 0 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};

  ${media.down('s')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
    letter-spacing: ${letterSpacing.s}px;
  }

  ${media.up('m')} {
    max-width: 500px;
  }

  ${media.up('l')} {
    order: 4;
    max-width: 442px;
    margin-top: auto;
  }

  ${media.up('xl')} {
    order: 3;
    max-width: 624px;
    margin-top: ${spacing[1000]}px;
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
    letter-spacing: ${letterSpacing.xs}px;
  }
`;

const CtaSlot = styled.div`
  order: 4;
  margin-top: ${spacing[600]}px;

  ${media.up('l')} {
    order: 3;
    margin-top: auto;
  }

  ${media.up('xl')} {
    order: 4;
    margin-top: ${spacing[2000]}px;
  }

  ${media.up('xxl')} {
    margin-top: ${spacing[1000]}px;
  }

  ${media.up('xxxl')} {
    margin-top: ${spacing[2000]}px;
  }
`;

/*
 * Tablet / mobile: the colour portrait centred under the CTA, head ≈150px wide
 * at 320 and ≈218px from 480 (the head is 30.9% of the image). The whole bust
 * shows, down to the shoulders; only the image's hard bottom edge fades out.
 */
const CenterPortrait = styled.div`
  --portrait-size: min(150vw, 705px);

  order: 5;
  position: relative;
  width: 100%;
  height: var(--portrait-size);
  margin-top: ${spacing[800]}px;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, #000 82%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent 100%);

  img {
    position: absolute;
    top: 0;
    left: 50%;
    width: var(--portrait-size);
    max-width: none;
    height: auto;
    transform: translateX(-50%);
  }

  ${media.up('m')} {
    margin-top: ${spacing[100]}px;
  }

  ${media.up('l')} {
    display: none;
  }
`;

const Skills = styled.ul`
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.up('l')} {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: ${spacing[300]}px;
    margin-top: auto;
    font-family: ${fontFamily.heading};
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    letter-spacing: ${letterSpacing.m}px;
    color: ${neutrals[500]};
    white-space: nowrap;
  }

  li {
    display: flex;
    align-items: center;
    gap: ${spacing[300]}px;
  }

  li:not(:last-child)::after {
    content: '×' / '';
  }
`;

export function HeroSection() {
  const t = useTranslations('hero');
  const skills = t.raw('skills') as string[];

  return (
    <Section aria-labelledby="hero-name">
      <Glow aria-hidden />

      <Container>
        <Body>
          <Name id="hero-name">
            <CrosshairName name={t('name')} />
          </Name>
          <Role>{t('role')}</Role>
          <Description>{t('description')}</Description>
          <CtaSlot>
            <Button as="a" href="#work" $variant="primary">
              {t('cta')}
            </Button>
          </CtaSlot>
          <CenterPortrait aria-hidden>
            <Image
              src={PORTRAIT.src}
              width={PORTRAIT.width}
              height={PORTRAIT.height}
              alt=""
              sizes="705px"
              loading="lazy"
            />
          </CenterPortrait>
        </Body>

        <Skills aria-label={t('skillsLabel')}>
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </Skills>
      </Container>
    </Section>
  );
}
