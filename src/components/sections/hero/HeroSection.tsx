'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives';
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
import { zIndex } from '@/styles/tokens/z-index';
import { media } from '@/styles/media';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const SKILLS = [
  'Product Design',
  'Design Engineering',
  'UI Architecture',
  'Design Systems',
  'Experiments',
];

const EASE = [0.25, 0.1, 0.25, 1] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const footerFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE, delay: 1.0 } },
};

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing[1000]}px ${spacing[400]}px ${spacing[400]}px;
  max-width: 1440px;
  min-height: 100svh;
  margin: 0 auto;
  overflow: hidden;

  ${media.down('m')} {
    padding: ${spacing[1000]}px ${spacing[300]}px ${spacing[300]}px;
  }
`;

const HeroBody = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[500]}px 0;
  gap: ${spacing[2000]}px;
  width: 100%;
  z-index: ${zIndex.base};

  ${media.down('m')} {
    gap: ${spacing[1000]}px;
    padding: ${spacing[300]}px 0;
  }
`;

const HeroHeading = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;

  ${media.down('m')} {
    gap: ${spacing[600]}px;
  }
`;

const Eyebrow = styled(motion.p)`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fluidFontSize.display.m};
  line-height: ${fluidLineHeight.display.m};
  text-align: center;
  color: ${accents.primary};
  margin: 0;

  ${media.down('m')} {
    font-size: ${fluidFontSize.display.s};
    line-height: ${fluidLineHeight.display.s};
  }

  ${media.down('s')} {
    font-size: ${fluidFontSize.heading.l};
    line-height: ${fluidLineHeight.heading.l};
  }
`;

const Headline = styled(motion.h1)`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fluidFontSize.display.xl};
  line-height: ${fluidLineHeight.display.xl};
  text-align: center;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${neutrals[500]};
  margin: 0;

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.l};
    line-height: ${fluidLineHeight.display.l};
  }

  ${media.down('m')} {
    font-size: ${fluidFontSize.display.s};
    line-height: ${fluidLineHeight.display.s};
  }

  ${media.down('s')} {
    font-size: ${fluidFontSize.heading.l};
    line-height: ${fluidLineHeight.heading.l};
  }
`;

const Description = styled(motion.p)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  text-align: center;
  color: ${neutrals[500]};
  margin: 0;
  max-width: 624px;

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    max-width: 100%;
  }
`;

const MotionButton = styled(motion.div)``;

const HeroFooter = styled(motion.div)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${spacing[300]}px;
  width: 100%;
  flex-wrap: wrap;
  z-index: ${zIndex.base};

  ${media.down('m')} {
    gap: ${spacing[200]}px ${spacing[150]}px;
  }
`;

const FooterItem = styled.span`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};
  white-space: nowrap;

  ${media.down('m')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
  }
`;

const Separator = styled(FooterItem)``;

export function HeroSection() {
  const prefersReduced = useReducedMotion();
  const animate = prefersReduced ? undefined : 'visible';
  const initial = prefersReduced ? undefined : 'hidden';

  return (
    <Section>
      <HeroBody variants={stagger} initial={initial} animate={animate}>
        <HeroHeading variants={stagger}>
          <Eyebrow variants={fadeUp}>Design Engineer</Eyebrow>
          <Headline variants={fadeUp}>Stepan Torchyan</Headline>
          <Description variants={fadeUp}>
            I work between design and engineering, connecting product thinking,
            UI architecture, and front-end execution into one coherent process.
          </Description>
        </HeroHeading>

        <MotionButton variants={fadeUp}>
          <Button as="a" href="#contact" $variant="primary">
            Contact
          </Button>
        </MotionButton>
      </HeroBody>

      <HeroFooter variants={footerFade} initial={initial} animate={animate}>
        {SKILLS.map((skill, i) => (
          <span key={skill} style={{ display: 'contents' }}>
            <FooterItem>{skill}</FooterItem>
            {i < SKILLS.length - 1 && <Separator aria-hidden>×</Separator>}
          </span>
        ))}
      </HeroFooter>
    </Section>
  );
}
