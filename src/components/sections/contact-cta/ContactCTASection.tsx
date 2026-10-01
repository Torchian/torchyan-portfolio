'use client';

import { useId, useRef, useState } from 'react';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import { TextInput, RadioInput, Button } from '@/components/primitives';
import { accents } from '@/styles/tokens/colors';
import { trackEvent } from '@/lib/analytics/track';
import { Link } from '@/i18n/navigation';
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
 *  - Tablet (481–1024px): heading above the form as a wrapping SemiBold 58 line; Name and Email
 *    share a row, as do Company and Website.
 *  - Mobile (up to 480px): SemiBold 36; every field full width, intents one per line, timeline
 *    two per line.
 *
 * The fields follow the studio's qualification needs: what the visitor needs
 * (one of the four areas, or "not sure"), who they are, their company and site,
 * the situation, and timing. Project Stage was dropped — it duplicated the
 * first question. A budget field waits for the founder's price ranges.
 *
 * Honest failure: success is shown only after the server accepted the message
 * (a 2xx). A validation error names the fields, a rate limit and a delivery
 * failure each say what happened and offer the email address instead.
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

/** A field's own error, tied to it with aria-describedby. */
const FieldError = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  color: #ff6b6b;
`;

const PrivacyNote = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.s}px;
  line-height: ${lineHeight.body.s}px;
  color: ${neutrals[500]};

  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  a:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
  }
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

  /* The submit spans the form (the Button itself sizes to its content). */
  > button[type='submit'] {
    width: 100%;
    max-width: none;
    margin-top: ${spacing[100]}px;
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

/** Timeline options share the row equally; two per line on mobile. */
const StretchedOption = styled(RadioInput)`
  flex: 1 0 0;

  ${media.down('m')} {
    flex: 0 0 calc(50% - ${spacing[100]}px);
  }
`;

/** Two fields side by side on desktop and tablet, separate full-width fields on mobile. */
const FieldRow = styled.div`
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
type SubmitState = 'idle' | 'sending' | 'sent' | 'validation' | 'rate_limited' | 'delivery';

/** The fields the server validates, and what it can say about each. */
type FieldName = 'name' | 'email' | 'website' | 'message';
type FieldIssue = 'required' | 'invalid';
type FieldIssues = Partial<Record<FieldName, FieldIssue>>;

/** Analytics labels for the "What do you need?" options, by index (contact.intentOptions). */
const NEED_AREAS = ['website', 'product-interface', 'design-system', 'improve-live', 'not-sure'] as const;

/** Order in which the first invalid field takes focus. */
const FIELD_ORDER: FieldName[] = ['name', 'email', 'website', 'message'];
const FIELD_INPUT_ID: Record<FieldName, string> = {
  name: 'contact-name',
  email: 'contact-email',
  website: 'contact-website',
  message: 'contact-message',
};

export function ContactCTASection() {
  const [intent, setIntent] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');
  const [issues, setIssues] = useState<FieldIssues>({});
  const started = useRef(false);
  const t = useTranslations('contact');
  const locale = useLocale();
  const pathname = usePathname() ?? '';
  const statusId = useId();
  const headingWords = t('heading').split(' ');

  const intentOptions = t.raw('intentOptions') as string[];
  const timelineOptions = t.raw('timelineOptions') as string[];

  const area = () => {
    const index = intent === null ? -1 : intentOptions.indexOf(intent);
    return index >= 0 ? NEED_AREAS[index] ?? 'unknown' : 'none';
  };

  const onFirstFocus = () => {
    if (started.current) return;
    started.current = true;
    trackEvent('contact_form_start', { page: pathname });
  };

  const fieldError = (field: FieldName) => {
    const issue = issues[field];
    if (!issue) return null;
    const message =
      issue === 'required'
        ? t('fieldErrors.required')
        : field === 'email'
          ? t('fieldErrors.email')
          : field === 'website'
            ? t('fieldErrors.url')
            : t('fieldErrors.required');
    return <FieldError id={`${FIELD_INPUT_ID[field]}-error`}>{message}</FieldError>;
  };

  /** aria wiring for a validated field. */
  const describe = (field: FieldName) =>
    issues[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': `${FIELD_INPUT_ID[field]}-error` }
      : {};

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending') return;
    // Held onto now: `event.currentTarget` is only the form while the event is
    // being dispatched, and it is null by the time the fetch below resolves.
    const form = event.currentTarget;
    const data = new FormData(form);
    setState('sending');
    setIssues({});

    let response: Response;
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          company: data.get('company'),
          website: data.get('website'),
          message: data.get('message'),
          // Indexes, not labels: the labels are translated, so the same answer
          // would reach the inbox as three different strings. The server reads
          // them back off the English list.
          intent: intent === null ? null : intentOptions.indexOf(intent),
          timeline: timeline === null ? null : timelineOptions.indexOf(timeline),
          locale,
          nickname: data.get('nickname'),
        }),
      });
    } catch {
      // Offline, or the request never reached the server.
      setState('delivery');
      trackEvent('contact_form_error', { kind: 'delivery' });
      return;
    }

    if (!response.ok) {
      if (response.status === 400) {
        const body = (await response.json().catch(() => null)) as { fields?: FieldIssues } | null;
        const fields = body?.fields ?? {};
        setIssues(fields);
        setState('validation');
        trackEvent('contact_form_error', { kind: 'validation' });
        // Take the reader to the first field that needs attention.
        const first = FIELD_ORDER.find((field) => fields[field]);
        if (first) form.querySelector<HTMLElement>(`#${FIELD_INPUT_ID[first]}`)?.focus();
        return;
      }
      const kind = response.status === 429 ? 'rate_limited' : 'delivery';
      setState(kind);
      trackEvent('contact_form_error', { kind });
      return;
    }

    // Outside the error paths on purpose. These run only once the message is
    // away, and if one of them threw it must not report a failure that never
    // happened.
    setState('sent');
    trackEvent('contact_form_submit', { area: area(), page: pathname });
    form.reset();
    setIntent(null);
    setTimeline(null);
  };

  const statusMessage =
    state === 'sent'
      ? t('submitSuccess')
      : state === 'validation'
        ? t('errors.validation')
        : state === 'rate_limited'
          ? t('errors.rateLimited')
          : state === 'delivery'
            ? t('errors.delivery')
            : null;

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

        <Form onSubmit={onSubmit} onFocus={onFirstFocus} noValidate>
          <OptionGroup
            id="contact-intent"
            label={t('intentLabel')}
            options={intentOptions}
            value={intent}
            onChange={(value) => {
              setIntent(value);
              const index = intentOptions.indexOf(value);
              trackEvent('service_interest', { area: NEED_AREAS[index] ?? 'unknown' });
            }}
          />

          <FieldRow>
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
                {...describe('name')}
              />
              {fieldError('name')}
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
                {...describe('email')}
              />
              {fieldError('email')}
            </Field>
          </FieldRow>

          <FieldRow>
            <Field>
              <FieldLabel htmlFor="contact-company">{t('companyField.label')}</FieldLabel>
              <TextInput
                id="contact-company"
                name="company"
                type="text"
                autoComplete="organization"
                maxLength={200}
                placeholder={t('companyField.placeholder')}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-website">{t('websiteField.label')}</FieldLabel>
              <TextInput
                id="contact-website"
                name="website"
                type="url"
                inputMode="url"
                autoComplete="url"
                maxLength={300}
                placeholder={t('websiteField.placeholder')}
                {...describe('website')}
              />
              {fieldError('website')}
            </Field>
          </FieldRow>

          <Field>
            <FieldLabel htmlFor="contact-message">{t('buildingLabel')}</FieldLabel>
            <TextInput
              as="textarea"
              id="contact-message"
              name="message"
              required
              maxLength={4000}
              placeholder={t('buildingPlaceholder')}
              {...describe('message')}
            />
            {fieldError('message')}
          </Field>

          <OptionGroup
            id="contact-timeline"
            label={t('timelineLabel')}
            options={timelineOptions}
            value={timeline}
            onChange={setTimeline}
            stretch
          />

          <Honeypot aria-hidden>
            <label htmlFor="contact-nickname">{t('trapLabel')}</label>
            <input id="contact-nickname" name="nickname" type="text" tabIndex={-1} autoComplete="off" />
          </Honeypot>

          <PrivacyNote>
            {t.rich('privacyNote', {
              link: (chunks) => <Link href="/privacy">{chunks}</Link>,
            })}
          </PrivacyNote>

          <Button
            as="button"
            type="submit"
            $variant="secondary"
            disabled={state === 'sending'}
            aria-describedby={statusMessage ? statusId : undefined}
          >
            {state === 'sending' ? t('submitSending') : t('submit')}
          </Button>

          {statusMessage && (
            <Status id={statusId} role="status" $tone={state === 'sent' ? 'success' : 'error'}>
              {statusMessage}
            </Status>
          )}
        </Form>
      </Inner>
    </Section>
  );
}
