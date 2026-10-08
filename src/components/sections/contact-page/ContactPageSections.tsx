'use client';

import styled, { keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/composites';
import { Link } from '@/i18n/navigation';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/*
 * /start-a-project, after the reach map: what happens once the form is sent.
 * Three numbered stops on one track, in the map's language: a grey line with
 * a green comet running along it, each stop lighting up as the comet reaches
 * it. Across on desktop and tablet, down on phones. Under reduced motion the
 * track stands still.
 */

/** One run of the comet, stop to stop, and the pause before the next. */
const CYCLE = 6;
/** The share of a cycle the comet's head takes from the first stop to the last. */
const RUN = 0.6;
const NODE = 64;
const NODE_PHONE = 48;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    gap: ${spacing[800]}px;
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

/*
 * The comet is 40% of the track. In its own widths the track is 2.5, so the
 * head sits on the first stop at -100% and on the last at 150%; by 250% the
 * tail has left too.
 */
const runAcross = keyframes`
  0% { transform: translateX(-100%); }
  ${RUN * 100}% { transform: translateX(150%); }
  ${(RUN + 0.2) * 100}%, 100% { transform: translateX(250%); }
`;

const runDown = keyframes`
  0% { transform: translateY(-100%); }
  ${RUN * 100}% { transform: translateY(150%); }
  ${(RUN + 0.2) * 100}%, 100% { transform: translateY(250%); }
`;

/** A stop glows as the head passes and settles back. */
const flare = keyframes`
  0% {
    box-shadow: 0 0 0 6px rgba(12, 175, 10, 0.2), 0 0 32px rgba(12, 175, 10, 0.45);
  }
  18%, 100% {
    box-shadow: 0 0 0 0 rgba(12, 175, 10, 0);
  }
`;

const Track = styled.ol`
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing[400]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('m')} {
    grid-template-columns: minmax(0, 1fr);
    gap: ${spacing[500]}px;
  }
`;

/** The line, from the first stop's centre to the last's, under the stops. */
const Line = styled.div`
  position: absolute;
  top: ${NODE / 2 - 0.5}px;
  left: calc((100% - 2 * ${spacing[400]}px) / 6);
  right: calc((100% - 2 * ${spacing[400]}px) / 6);
  height: 1px;
  overflow: hidden;
  background: rgba(246, 246, 246, 0.14);

  &::after {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 40%;
    background: linear-gradient(to right, rgba(12, 175, 10, 0), ${accents.primary});
    transform: translateX(-100%);
    animation: ${runAcross} ${CYCLE}s linear infinite;
  }

  ${media.down('m')} {
    top: ${NODE_PHONE / 2}px;
    bottom: ${NODE_PHONE / 2}px;
    left: ${NODE_PHONE / 2 - 0.5}px;
    right: auto;
    width: 1px;
    height: auto;
    /* It runs on past the last stop, beside its text: let it fade out there. */
    mask-image: linear-gradient(to bottom, #000 70%, transparent);

    &::after {
      inset: 0 0 auto 0;
      width: auto;
      height: 40%;
      background: linear-gradient(to bottom, rgba(12, 175, 10, 0), ${accents.primary});
      transform: translateY(-100%);
      animation-name: ${runDown};
    }
  }

  ${media.reducedMotion} {
    &::after {
      animation: none;
      opacity: 0;
    }
  }
`;

const Step = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
  text-align: center;

  ${media.down('m')} {
    display: grid;
    grid-template-columns: ${NODE_PHONE}px minmax(0, 1fr);
    align-items: start;
    column-gap: ${spacing[300]}px;
    text-align: left;
  }
`;

const Node = styled.span`
  display: grid;
  place-items: center;
  width: ${NODE}px;
  height: ${NODE}px;
  /* A lighter rim on the green. */
  border: 1px solid rgba(246, 246, 246, 0.24);
  border-radius: 50%;
  background: ${accents.primary};
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.body.xl}px;
  line-height: 1;
  color: ${neutrals[100]};
  font-variant-numeric: tabular-nums;
  animation: ${flare} ${CYCLE}s ease-out infinite;

  ${media.down('m')} {
    width: ${NODE_PHONE}px;
    height: ${NODE_PHONE}px;
    font-size: ${fontSize.body.l}px;
  }

  ${media.reducedMotion} {
    animation: none;
  }
`;

const StepText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[100]}px;
  max-width: 400px;

  ${media.down('m')} {
    padding-top: ${spacing[100]}px;
  }
`;

const StepTitle = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('xl')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
  }
`;

const StepBody = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[500]};

  ${media.down('xl')} {
    font-size: ${fontSize.body.m}px;
    line-height: ${lineHeight.body.m}px;
  }
`;

const Question = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[500]};
  text-align: center;

  a {
    color: ${accents.primary};
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  a:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
  }
`;

export function NextStepsSection() {
  const t = useTranslations('contactPage.next');
  const steps = t.raw('steps') as { title: string; body: string }[];

  return (
    <Section aria-labelledby="next-steps-title">
      <Container>
        <SectionHeading id="next-steps-title" title={t('title')} subtitle={t('subtitle')} size="large" />
        <Track>
          <Line aria-hidden />
          {steps.map((step, i) => (
            <Step key={step.title}>
              {/* Lit as the comet's head reaches it: the stops are evenly spaced along its run. */}
              <Node aria-hidden style={{ animationDelay: `${((i / (steps.length - 1)) * RUN * CYCLE).toFixed(2)}s` }}>
                {String(i + 1).padStart(2, '0')}
              </Node>
              <StepText>
                <StepTitle>{step.title}</StepTitle>
                <StepBody>{step.body}</StepBody>
              </StepText>
            </Step>
          ))}
        </Track>
        <Question>
          {t.rich('question', {
            link: (chunks) => <Link href="/contact">{chunks}</Link>,
          })}
        </Question>
      </Container>
    </Section>
  );
}
