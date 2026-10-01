'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { InfoCard, InfoCardBody, InfoCardTitle, SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, lineHeight } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/*
 * /contact, after the form: what happens next (three steps, from the existing
 * info card) and the direct alternatives. The reach map follows on the page.
 */

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
  gap: ${spacing[800]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: 0 ${spacing[400]}px;

  ${media.down('xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: 0 ${spacing[200]}px;
  }
`;

const Steps = styled.ol`
  display: flex;
  align-items: stretch;
  gap: ${spacing[600]}px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    gap: ${spacing[300]}px;
  }

  ${media.down('l')} {
    flex-direction: column;

    /* Stacked, each card takes its content's height: InfoCard's flex-basis of 0
       with its phone min-height would otherwise cap it and let the text spill. */
    > li {
      flex: none;
    }
  }
`;

const Direct = styled.p`
  margin: 0;
  max-width: 640px;
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
`;

const EMAIL = 'hello@torchyan.design';
const LINKEDIN = 'https://www.linkedin.com/in/torchian/';

export function NextStepsSection() {
  const t = useTranslations('contactPage');
  const steps = t.raw('next.steps') as { title: string; body: string }[];

  return (
    <Section aria-labelledby="next-steps-title">
      <Container>
        <SectionHeading id="next-steps-title" title={t('next.title')} />
        <Steps>
          {steps.map((step) => (
            <InfoCard key={step.title}>
              <InfoCardTitle>{step.title}</InfoCardTitle>
              <InfoCardBody>{step.body}</InfoCardBody>
            </InfoCard>
          ))}
        </Steps>
        <SectionHeading title={t('direct.title')} size="medium" />
        <Direct>
          {t.rich('direct.body', {
            email: (chunks) => (
              <a href={`mailto:${EMAIL}`} data-outbound="email">
                {chunks}
              </a>
            ),
            linkedin: (chunks) => (
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" data-outbound="linkedin">
                {chunks}
              </a>
            ),
          })}
        </Direct>
      </Container>
    </Section>
  );
}
