'use client';

import styled from 'styled-components';
import { Text, Container } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals, transparents } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { duration, easing } from '@/styles/tokens/motion';
import { media } from '@/styles/media';

const SKILL_CIRCLES = [
  'Information Architecture',
  'UI Pattern Libraries',
  'Dark Mode',
  'WCAG Standards',
  'React Components',
  'Component Abstraction',
  'Data Mapping',
  'Mobile Optimization',
  'UX Heuristics',
  'Agile Collaboration',
  'Design Tokens',
  'Responsive Layouts',
  'Multilingual Interfaces',
  'Component Reusability',
  'Performance Tuning',
  'Design Handoff',
  'System Migration',
  'Web Performance',
  'Frontend Architecture',
  'Interaction Design',
  'Grid Systems',
  'Semantic HTML',
  'CSS Architecture',
  'Design Systems',
] as const;

const Section = styled.section`
  padding: ${spacing[2000]}px 0;
  min-height: 100vh;
  display: flex;
  align-items: center;

  ${media.down('m')} {
    padding: ${spacing[1000]}px 0;
  }
`;

const Inner = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
`;

const CirclesGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${spacing[400]}px;
  justify-items: center;

  ${media.down('m')} {
    grid-template-columns: repeat(3, minmax(100px, 1fr));
    gap: ${spacing[300]}px;
  }
`;

const CircleRoot = styled.div`
  position: relative;
  width: 156px;
  height: 156px;
  border-radius: ${radius.round}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${spacing[300]}px ${spacing[200]}px;
  isolation: isolate;
  cursor: default;
  flex: none;
  flex-grow: 0;

  ${media.down('m')} {
    width: 130px;
    height: 130px;
    padding: ${spacing[250]}px ${spacing[150]}px;
  }
`;

const CircleBg = styled.div`
  position: absolute;
  inset: 0;
  background: ${transparents.transparent25};
  filter: blur(40px);
  border-radius: ${radius.round}px;
  z-index: 0;
  transition:
    background ${duration.fast} ${easing.out},
    filter ${duration.fast} ${easing.out};

  ${CircleRoot}:hover & {
    background: ${accents.primary};
    filter: blur(5px);
  }
`;

const CircleText = styled(Text)`
  position: relative;
  z-index: 1;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.body.s}px;
  line-height: ${lineHeight.body.m}px;
  letter-spacing: ${letterSpacing.xxl}px;
  text-align: center;
  color: ${neutrals[100]};
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition:
    opacity ${duration.fast} ${easing.out},
    transform ${duration.fast} ${easing.out},
    visibility ${duration.fast} ${easing.out},
    font-size ${duration.fast} ${easing.out},
    line-height ${duration.fast} ${easing.out},
    letter-spacing ${duration.fast} ${easing.out};

  ${CircleRoot}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }
`;

const CirclePlaceholder = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 16px;
`;

const Circle = ({ label }: { label: string }) => (
  <CircleRoot>
    <CircleBg />
    <CirclePlaceholder aria-hidden />
    <CircleText as="p">{label}</CircleText>
  </CircleRoot>
);

const Caption = styled(Text)`
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[500]};
  text-align: center;
  max-width: 720px;
`;

export function AboutSkillsCirclesSection() {
  return (
    <Section>
      <Inner>
        <Caption as="p">
          The circles below map the areas where I&apos;ve repeatedly designed, shipped,
          and stress-tested interface systems—from architecture and interaction design
          to performance, accessibility, and front-of-stack engineering.
        </Caption>
        <CirclesGrid>
          {SKILL_CIRCLES.map((label) => (
            <Circle key={label} label={label} />
          ))}
        </CirclesGrid>
      </Inner>
    </Section>
  );
}

