'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Container, TextInput, RadioInput, Button } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily, letterSpacing } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[500]}px 0;
  }
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${spacing[2000]}px;
  align-items: start;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.down('l')} {
    grid-template-columns: 1fr;
    gap: ${spacing[800]}px;
  }

  ${media.down('m')} {
    padding: 0 ${spacing[300]}px;
  }
`;

const HeadingColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 460px;
  `;
  
const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[600]}px;
  width: 100%;
`;

const IntroText = styled.p`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  color: ${neutrals[100]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing[500]}px;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[150]}px;
  width: 100%;
`;

const FormLabel = styled.label`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[300]}px;
  align-items: center;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing[600]}px;
  width: 100%;

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
`;

const INTENT_OPTIONS = [
  'Product UI / Design System',
  'Frontend / UI Engineering',
  'Design x Engineering',
  'Consultation / Audit',
  'Something experimental',
];

const STAGE_OPTIONS = ['Idea', 'In Progress', 'Scaling', 'Fixing'];

const TIMELINE_OPTIONS = ['ASAP', '1-2 months', 'Flexible'];

export function ContactCTASection() {
  const [intent, setIntent] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);

  return (
    <Section id="contact">
      <Container $padding={false}>
        <TwoColumn>
          <HeadingColumn>
            <SectionHeading
              title="Let's Talk About What You're Building"
              $align="left"
            />
          </HeadingColumn>

          <FormColumn>
            <IntroText>
              A short conversation to understand the problem, scope, and whether we&apos;re a good fit.
            </IntroText>

            <Form onSubmit={(e) => e.preventDefault()}>
              <FormGroup>
                <FormLabel>Select Your Intent</FormLabel>
                <ChipGroup>
                  {INTENT_OPTIONS.map((opt) => (
                    <RadioInput
                      key={opt}
                      label={opt}
                      name="intent"
                      value={opt}
                      checked={intent === opt}
                      onChange={() => setIntent(opt)}
                    />
                  ))}
                </ChipGroup>
              </FormGroup>

              <FormGroup>
                <InputRow>
                  <InputField>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <TextInput id="name" type="text" placeholder="Your Name" />
                  </InputField>
                  <InputField>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextInput id="email" type="email" placeholder="Your Email" />
                  </InputField>
                </InputRow>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="building">What are you building?</FormLabel>
                <TextInput
                  as="textarea"
                  id="building"
                  placeholder="Product, idea, or problem in a few lines"
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Project Stage</FormLabel>
                <ChipGroup>
                  {STAGE_OPTIONS.map((opt) => (
                    <RadioInput
                      key={opt}
                      label={opt}
                      name="stage"
                      value={opt}
                      checked={stage === opt}
                      onChange={() => setStage(opt)}
                    />
                  ))}
                </ChipGroup>
              </FormGroup>

              <FormGroup>
                <FormLabel>Timeline</FormLabel>
                <ChipGroup>
                  {TIMELINE_OPTIONS.map((opt) => (
                    <RadioInput
                      key={opt}
                      label={opt}
                      name="timeline"
                      value={opt}
                      checked={timeline === opt}
                      onChange={() => setTimeline(opt)}
                    />
                  ))}
                </ChipGroup>
              </FormGroup>

              <Button as="button" type="submit" $variant="secondary" style={{ width: '100%' }}>
                Contact
              </Button>
            </Form>
          </FormColumn>
        </TwoColumn>
      </Container>
    </Section>
  );
}
