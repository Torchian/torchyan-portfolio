'use client';

import { useId, useState } from 'react';
import styled from 'styled-components';
import { TextInput, RadioInput, Button } from '@/components/primitives';
import { accents } from '@/styles/tokens/colors';
import { gaEvents } from '@/lib/analytics/gtag';
import { ymGoals } from '@/lib/analytics/ym';
import { useLocale } from 'next-intl';
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

  /* One screen on desktop: the form's own rhythm tightens to reach it. */
  ${media.up('xl')} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100svh;
    padding: ${spacing[1000]}px 0 clamp(${spacing[300]}px, 4svh, ${spacing[500]}px);
  }

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
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;

    span {
      display: block;
    }
  }

  ${media.up('xxl')} {
    font-weight: ${fontWeight.black};
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
    letter-spacing: ${letterSpacing.xxs}px;
    text-transform: uppercase;
  }
`;

/**
 * The honeypot. Not `display: none`: some bots skip what a browser would not
 * render. It is off the page, out of the tab order and hidden from assistive
 * tech, so only something filling fields by name will touch it — and the server
 * drops any submission that does.
 */
const Honeypot = styled.div`
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

/**
 * The result of a submission, announced as well as shown: `role="status"` is
 * polite, so a screen reader reads it once the field it is in has settled.
 */
const Status = styled.p<{ $tone: 'success' | 'error' }>`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  letter-spacing: ${letterSpacing.xs}px;

  /* The token set has no error colour — the design has never needed one. This
     literal is a stand-in until it does; see TODO.md. It is 7.1:1 on the page
     background, so it reads either way. */
  color: ${(p) => (p.$tone === 'success' ? accents.primary : '#ff6b6b')};
`;

const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing[300]}px;
  min-width: 0;

  /* Six labelled groups and a submit have to share one screen, so the rhythm
     between them follows its height rather than staying at the frame's 32. */
  ${media.up('xl')} {
    gap: clamp(${spacing[300]}px, 2.2svh, ${spacing[400]}px);

    textarea {
      height: clamp(56px, 8svh, 86px);
      min-height: 0;
    }
  }

  /* The submit spans the form (the Button itself sizes to its content), 48px below the last field. */
  > button[type='submit'] {
    width: 100%;
    max-width: none;
    margin-top: ${spacing[300]}px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${spacing[200]}px;
  min-width: 0;

  ${media.up('xl')} {
    gap: ${spacing[100]}px;
  }

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

  /* Holds the frame's 24 on a normal screen; gives a little on a short one. */
  ${media.up('xl')} {
    font-size: clamp(${fontSize.body.l}px, 2.7svh, ${fontSize.body.xl}px);
    line-height: clamp(${lineHeight.body.l}px, 3.6svh, ${lineHeight.body.xl}px);
  }

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
  }
`;

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${spacing[200]}px;

  ${media.up('xl')} {
    gap: clamp(${spacing[100]}px, 1.2svh, ${spacing[200]}px);
  }
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

/** Where a submission has got to. `sending` locks the button so one click is one message. */
type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export function ContactCTASection() {
  const [intent, setIntent] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');
  const t = useTranslations('contact');
  const locale = useLocale();
  const statusId = useId();
  const headingWords = t('heading').split(' ');

  const intentOptions = t.raw('intentOptions') as string[];
  const stageOptions = t.raw('stageOptions') as string[];
  const timelineOptions = t.raw('timelineOptions') as string[];

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending') return;
    // Held onto now: `event.currentTarget` is only the form while the event is
    // being dispatched, and it is null by the time the fetch below resolves.
    const form = event.currentTarget;
    const data = new FormData(form);
    setState('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('building'),
          // Indexes, not labels: the labels are translated, so the same answer
          // would reach the inbox as three different strings. The server reads
          // them back off the English list.
          intent: intent === null ? null : intentOptions.indexOf(intent),
          stage: stage === null ? null : stageOptions.indexOf(stage),
          timeline: timeline === null ? null : timelineOptions.indexOf(timeline),
          locale,
          company: data.get('company'),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
    } catch {
      // Whatever went wrong — offline, a 400, a 502 — the sender can do one
      // thing about it, so they are told one thing: it did not send.
      setState('error');
      return;
    }
    // Outside the try on purpose. These run only once the message is away, and
    // if one of them threw in there it would report a failure that never
    // happened — which is exactly what a stale `currentTarget` used to do.
    setState('sent');
    gaEvents.contactFormSubmit();
    ymGoals.contactFormSubmit();
    form.reset();
    setIntent(null);
    setStage(null);
    setTimeline(null);
  };

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

        <Form onSubmit={onSubmit} noValidate>
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
              <TextInput
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                placeholder={t('namePlaceholder')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-email">{t('emailLabel')}</FieldLabel>
              <TextInput
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
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
              required
              maxLength={4000}
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

          <Honeypot aria-hidden>
            <label htmlFor="contact-company">{t('companyLabel')}</label>
            <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </Honeypot>

          <Button
            as="button"
            type="submit"
            $variant="secondary"
            disabled={state === 'sending'}
            aria-describedby={state === 'sent' || state === 'error' ? statusId : undefined}
          >
            {state === 'sending' ? t('submitSending') : t('submit')}
          </Button>

          {(state === 'sent' || state === 'error') && (
            <Status id={statusId} role="status" $tone={state === 'sent' ? 'success' : 'error'}>
              {state === 'sent' ? t('submitSuccess') : t('submitError')}
            </Status>
          )}
        </Form>
      </Inner>
    </Section>
  );
}
