'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { TextInput, RadioInput, Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily, letterSpacing } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';

/*
 * Figma: Contact — Desktop 1920 (2836:5878), 1440 (2670:11025), 1280 (2670:11372),
 * Tablet 1024 (2670:11695), Mobile 480 (2670:12337).
 *
 *  - Desktop (from 1025px): heading beside the form, one word per line — Black 96 uppercase in the
 *    1440 and 1920 frames, Bold 72 in the 1280 frame.
 *  - Tablet (481–1024px): heading above the form as a wrapping SemiBold 58 line; Name and Email share a row.
 *  - Mobile (up to 480px): SemiBold 36; every field full width, intents one per line, stage and
 *    timeline two per line.
 */

const Section = styled.section`
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[800]}px;
  /* 1440px of content in the 1920 frame; 32px sides in the 1440 frame. */
  max-width: ${grid.maxWidth + 2 * spacing[400]}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.between('m', 'xl')} {
    padding: 0 ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[500]}px;
    padding: 0 ${spacing[200]}px;
  }

  ${media.up('xl')} {
    flex-direction: row;
    align-items: flex-start;
  }

  ${media.up('xxxl')} {
    gap: ${spacing[600]}px;
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

  ${media.up('m')} {
    padding-right: ${spacing[500]}px;
    font-family: ${fontFamily.display};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }

  /* One word per line beside the form. */
  ${media.up('xl')} {
    flex: none;
    white-space: nowrap;
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;

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
  gap: ${spacing[400]}px;
  min-width: 0;

  /* The submit spans the form (the Button itself sizes to its content), 48px below the last field. */
  > button[type='submit'] {
    width: 100%;
    max-width: none;
    margin-top: ${spacing[200]}px;
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
`;

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px;
`;

/** Intents keep their own width; one per line on mobile. */
const IntentOption = styled(RadioInput)`
  ${media.down('m')} {
    flex: 1 0 100%;
  }
`;

/** Project Stage / Timeline options share each row equally; two per line on mobile. */
const StretchedOption = styled(RadioInput)`
  flex: 1 0 0;

  ${media.down('m')} {
    flex: 0 0 calc(50% - ${spacing[100]}px);
  }
`;

/** Name and Email: one row on desktop and tablet, separate full-width fields on mobile. */
const NameEmailRow = styled.div`
  display: flex;
  gap: ${spacing[200]}px;

  > * {
    flex: 1 0 0;
  }

  ${media.down('m')} {
    display: contents;
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
  const Option = stretch ? StretchedOption : IntentOption;
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
  const t = useTranslations('contact');
  const headingWords = t('heading').split(' ');

  return (
    <Section id="contact" aria-labelledby="contact-heading">
      <Inner>
        <Heading id="contact-heading">
          {headingWords.map((word, i) => (
            <span key={i}>
              {word}
              {i < headingWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </Heading>

        <Form onSubmit={(e) => e.preventDefault()}>
          <OptionGroup
            id="contact-intent"
            label={t('intentLabel')}
            options={t.raw('intentOptions') as string[]}
            value={intent}
            onChange={setIntent}
          />

          <NameEmailRow>
            <Field>
              <FieldLabel htmlFor="contact-name">{t('nameLabel')}</FieldLabel>
              <TextInput id="contact-name" name="name" type="text" autoComplete="name" placeholder={t('namePlaceholder')} />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-email">{t('emailLabel')}</FieldLabel>
              <TextInput
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
              />
            </Field>
          </NameEmailRow>

          <Field>
            <FieldLabel htmlFor="contact-building">{t('buildingLabel')}</FieldLabel>
            <TextInput
              as="textarea"
              id="contact-building"
              name="building"
              placeholder={t('buildingPlaceholder')}
            />
          </Field>

          <OptionGroup
            id="contact-stage"
            label={t('stageLabel')}
            options={t.raw('stageOptions') as string[]}
            value={stage}
            onChange={setStage}
            stretch
          />

          <OptionGroup
            id="contact-timeline"
            label={t('timelineLabel')}
            options={t.raw('timelineOptions') as string[]}
            value={timeline}
            onChange={setTimeline}
            stretch
          />

          <Button as="button" type="submit" $variant="secondary">
            {t('submit')}
          </Button>
        </Form>
      </Inner>
    </Section>
  );
}
