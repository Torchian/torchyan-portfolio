'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { TextInput, RadioInput, Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily, letterSpacing } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/*
 * Figma: Contact — Desktop 1920 (2836:5878), 1440 (2670:11025), 1280 (2670:11372),
 * Tablet 1024 (2670:11695), 768 (2670:12016), Mobile 480 (2670:12337), 320 (2670:12657).
 *
 *  - 1280 frame and up (from 1025px): heading and form side by side; the heading sets one word per line
 *    (Black 96 uppercase in the 1440 and 1920 frames, Bold 72 in the 1280 frame). Name and Email share a row.
 *  - 1024 frame and below (up to 1024px): heading above the form as a wrapping line (Bold 72 → SemiBold 58 at
 *    480 → SemiBold 36 at 320); every field full width.
 */

const HEADING_WORDS = ['Let’s', 'talk', 'about', 'what', 'you’re', 'building'];

const INTENT_OPTIONS = [
  'Product UI / Design System',
  'Frontend / UI Engineering',
  'Design × Engineering',
  'Consultation / Audit',
  'Something experimental',
];

const STAGE_OPTIONS = ['Idea', 'In Progress', 'Scaling', 'Fixing'];

const TIMELINE_OPTIONS = ['ASAP', '1-2 months', 'Flexible'];

const Section = styled.section`
  padding: ${spacing[1000]}px 0;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[1000]}px;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.down('m')} {
    gap: ${spacing[500]}px;
    padding: 0 ${spacing[300]}px;
  }

  ${media.up('xl')} {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const Heading = styled.h2`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[500]};

  ${media.up('s')} {
    font-family: ${fontFamily.display};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  ${media.up('m')} {
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }

  ${media.up('l')} {
    padding-right: ${spacing[500]}px;
  }

  /* One word per line beside the form. */
  ${media.up('xl')} {
    flex: none;
    white-space: nowrap;

    span {
      display: block;
    }
  }

  ${media.up('xxl')} {
    font-weight: ${fontWeight.black};
    font-size: ${fontSize.display.xl}px;
    line-height: ${lineHeight.display.l}px;
    letter-spacing: ${letterSpacing.xxs}px;
    text-transform: uppercase;
  }
`;

const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing[600]}px;
  min-width: 0;

  /* The submit spans the form (the Button itself sizes to its content). */
  > button[type='submit'] {
    width: 100%;
    max-width: none;
  }
`;

const Intro = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.medium};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('m')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${spacing[200]}px;
  min-width: 0;

  ${media.down('m')} {
    gap: ${spacing[100]}px;
  }
`;

const FieldLabel = styled.label`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
    letter-spacing: ${letterSpacing.s}px;
  }
`;

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[300]}px;

  ${media.down('s')} {
    gap: ${spacing[200]}px;
  }
`;

/** Project Stage / Timeline options share each row equally. */
const StretchedOption = styled(RadioInput)`
  flex: 1 0 0;
`;

/** Name and Email: one row beside the heading, separate full-width fields in the 1024 frame and below. */
const NameEmailRow = styled.div`
  display: contents;

  ${media.up('xl')} {
    display: flex;
    gap: ${spacing[600]}px;

    > * {
      flex: 1 0 0;
    }
  }
`;

interface OptionGroupProps {
  id: string;
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  stretch?: boolean;
}

function OptionGroup({ id, label, options, value, onChange, stretch }: OptionGroupProps) {
  const Option = stretch ? StretchedOption : RadioInput;
  return (
    <Field role="radiogroup" aria-labelledby={id}>
      <FieldLabel as="p" id={id}>
        {label}
      </FieldLabel>
      <Options>
        {options.map((option) => (
          <Option
            key={option}
            label={option}
            name={id}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
        ))}
      </Options>
    </Field>
  );
}

export function ContactCTASection() {
  const [intent, setIntent] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);

  return (
    <Section id="contact" aria-labelledby="contact-heading">
      <Inner>
        <Heading id="contact-heading">
          {HEADING_WORDS.map((word, i) => (
            <span key={word}>
              {word}
              {i < HEADING_WORDS.length - 1 ? ' ' : ''}
            </span>
          ))}
        </Heading>

        <Form onSubmit={(e) => e.preventDefault()}>
          <Intro>A short conversation to understand the problem, scope, and whether we’re a good fit.</Intro>

          <OptionGroup
            id="contact-intent"
            label="Select Your Intent"
            options={INTENT_OPTIONS}
            value={intent}
            onChange={setIntent}
          />

          <NameEmailRow>
            <Field>
              <FieldLabel htmlFor="contact-name">Name</FieldLabel>
              <TextInput id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your Name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <TextInput
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Your Email"
              />
            </Field>
          </NameEmailRow>

          <Field>
            <FieldLabel htmlFor="contact-building">What are you building?</FieldLabel>
            <TextInput
              as="textarea"
              id="contact-building"
              name="building"
              placeholder="Product, idea, or problem in a few lines"
            />
          </Field>

          <OptionGroup
            id="contact-stage"
            label="Project Stage"
            options={STAGE_OPTIONS}
            value={stage}
            onChange={setStage}
            stretch
          />

          <OptionGroup
            id="contact-timeline"
            label="Timeline"
            options={TIMELINE_OPTIONS}
            value={timeline}
            onChange={setTimeline}
            stretch
          />

          <Button as="button" type="submit" $variant="secondary">
            Contact
          </Button>
        </Form>
      </Inner>
    </Section>
  );
}
