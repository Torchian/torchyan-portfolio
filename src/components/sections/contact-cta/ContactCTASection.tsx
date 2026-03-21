'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Container, Reveal, TextInput } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily, letterSpacing } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { neutrals, accents, glass, blur } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { border } from '@/styles/tokens/border';
import { duration, easing } from '@/styles/tokens/motion';

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
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
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
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[700]};
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[200]}px;
  align-items: center;
`;

const ChipDot = styled.span<{ $selected?: boolean }>`
  width: ${spacing[150]}px;
  height: ${spacing[150]}px;
  border-radius: ${radius.round}px;
  background: ${(p) => (p.$selected ? accents.primary : neutrals[700])};
  filter: blur(${(r) => (r.$selected ? 0 : blur.xl)});
  flex-shrink: 0;
  transition: background-color ${duration.normal} ${easing.inOut},
    filter ${duration.normal} ${easing.inOut};
`;

const Chip = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing[200]}px;
  padding: ${spacing[75]}px ${spacing[250]}px;
  height: ${spacing[600]}px;
  background: ${glass.bg};
  border: ${border.medium}px solid ${(p) => (p.$selected ? accents.primary : glass.border)};
  border-radius: ${radius.round}px;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${(r) => (r.$selected ? accents.primary : neutrals[700])};
  cursor: pointer;
  transition: background-color ${duration.normal} ${easing.inOut},
    border-color ${duration.normal} ${easing.inOut},
    color ${duration.normal} ${easing.inOut};

  input {
    display: none;
  }

  &:hover {
    color: ${accents.primary};
  }

  &:hover ${ChipDot} {
    background: ${accents.primary};
    filter: blur(${(r) => (r.$selected ? 0 : blur.sm)});
  }
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

const SubmitButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing[150]}px ${spacing[500]}px;
  min-width: 140px;
  height: ${spacing[600]}px;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.1px;
  color: ${neutrals[100]};
  background: ${accents.primary};
  border: none;
  border-radius: ${radius.round}px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }
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
            <Reveal>
              <SectionHeading
                title="Let's Talk About What You're Building"
                $align="left"
              />
            </Reveal>
          </HeadingColumn>

          <FormColumn>
            <Reveal delay={0.1}>
              <>
                <IntroText>
                  A short conversation to understand the problem, scope, and whether we&apos;re a good fit.
                </IntroText>

                <Form onSubmit={(e) => e.preventDefault()}>
              <FormGroup>
                <FormLabel>Select Your Intent</FormLabel>
                <ChipGroup>
                  {INTENT_OPTIONS.map((opt) => (
                    <Chip key={opt} $selected={intent === opt}>
                      <input
                        type="radio"
                        name="intent"
                        value={opt}
                        checked={intent === opt}
                        onChange={() => setIntent(opt)}
                      />
                      <ChipDot $selected={intent === opt} />
                      {opt}
                    </Chip>
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
                    <Chip key={opt} $selected={stage === opt}>
                      <input
                        type="radio"
                        name="stage"
                        value={opt}
                        checked={stage === opt}
                        onChange={() => setStage(opt)}
                      />
                      <ChipDot $selected={stage === opt} />
                      {opt}
                    </Chip>
                  ))}
                </ChipGroup>
              </FormGroup>

              <FormGroup>
                <FormLabel>Timeline</FormLabel>
                <ChipGroup>
                  {TIMELINE_OPTIONS.map((opt) => (
                    <Chip key={opt} $selected={timeline === opt}>
                      <input
                        type="radio"
                        name="timeline"
                        value={opt}
                        checked={timeline === opt}
                        onChange={() => setTimeline(opt)}
                      />
                      <ChipDot $selected={timeline === opt} />
                      {opt}
                    </Chip>
                  ))}
                </ChipGroup>
              </FormGroup>

              <SubmitButton type="submit">Contact</SubmitButton>
            </Form>
              </>
            </Reveal>
          </FormColumn>
        </TwoColumn>
      </Container>
    </Section>
  );
}
