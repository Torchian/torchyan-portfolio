'use client';

import { useId, useState } from 'react';
import styled from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import { Button, TextInput } from '@/components/primitives';
import { Link, usePathname } from '@/i18n/navigation';
import { trackEvent } from '@/lib/analytics/track';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';
import { ContactChannels } from './ContactChannels';

/*
 * Figma: Contact Page (4178:12149) — /contact, for anything that isn't a
 * project brief (that's /start-a-project).
 * LET'S TALK and its lead, then straight into a short form — name, email,
 * message, through the same endpoint as the project form — and then the ring
 * of contact channels (ContactChannels) for anyone who'd rather write directly.
 */

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${spacing[1000]}px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  padding: ${spacing[1500]}px ${spacing[400]}px ${spacing[1000]}px;

  ${media.down('xl')} {
    gap: ${spacing[800]}px;
    padding: ${spacing[1000]}px ${spacing[300]}px ${spacing[800]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: ${spacing[1000]}px ${spacing[200]}px ${spacing[600]}px;
  }
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
  width: 100%;
  text-align: center;
`;

/** Figma: display XL, Black, uppercase, green. */
const Display = styled.h1`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  color: ${accents.primary};

  ${media.down('xl')} {
    font-weight: ${fontWeight.heading};
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
    text-transform: none;
  }

  ${media.down('m')} {
    font-weight: ${fontWeight.semibold};
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }
`;

const Lead = styled.p`
  max-width: 1100px;
  margin: 0 auto;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('xl')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
  }
`;

interface TalkOpenerProps {
  /** Id for the h1, so the section is labelled by it. */
  titleId: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}

/**
 * The opener /contact and /start-a-project share: a green display title, its
 * lead, then the page's own content (a form, the channels) in one section.
 */
export function TalkOpener({ titleId, title, lead, children }: TalkOpenerProps) {
  return (
    <Section aria-labelledby={titleId}>
      <Container>
        <Heading>
          <Display id={titleId}>{title}</Display>
          <Lead>{lead}</Lead>
        </Heading>
        {children}
      </Container>
    </Section>
  );
}

export function ContactHeroSection() {
  const t = useTranslations('talkPage');
  return (
    <TalkOpener titleId="talk-title" title={t('title')} lead={t('subtitle')}>
      <ContactForm />
      <ContactChannels />
    </TalkOpener>
  );
}

/* ---------- The short form ---------- */

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing[400]}px;
  width: 100%;
  /* #message lands below the fixed header. */
  scroll-margin-top: ${spacing[1500]}px;

  /* Figma's CTA Primary runs the form's full width. */
  > button[type='submit'] {
    width: 100%;
  }
`;

const FieldRow = styled.div`
  display: flex;
  gap: ${spacing[200]}px;

  > * {
    flex: 1 0 0;
  }

  ${media.down('m')} {
    flex-direction: column;
    gap: ${spacing[400]}px;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
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
  }
`;

const ERROR = '#ff6b6b';

const FieldError = styled.p`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  color: ${ERROR};
`;

const Status = styled.p<{ $tone: 'success' | 'error' }>`
  margin: 0;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  text-align: center;
  color: ${(p) => (p.$tone === 'success' ? accents.primary : ERROR)};
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

const Honeypot = styled.div`
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

type FieldName = 'name' | 'email' | 'message';
type Issues = Partial<Record<FieldName, string>>;
type State = 'idle' | 'sending' | 'sent' | 'validation' | 'rate_limited' | 'delivery';

const FIELDS: FieldName[] = ['name', 'email', 'message'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ContactForm() {
  const t = useTranslations('talkPage.form');
  const tShared = useTranslations('contact');
  const locale = useLocale();
  const pathname = usePathname();
  const [state, setState] = useState<State>('idle');
  const [issues, setIssues] = useState<Issues>({});
  const uid = useId().replace(/:/g, '');
  const id = (field: FieldName) => `talk-${field}-${uid}`;
  const statusId = `talk-status-${uid}`;

  const describe = (field: FieldName) =>
    issues[field] ? { 'aria-invalid': true as const, 'aria-describedby': `${id(field)}-error` } : {};

  const fieldError = (field: FieldName) => {
    const issue = issues[field];
    if (!issue) return null;
    const message = issue === 'email' ? tShared('fieldErrors.email') : tShared('fieldErrors.required');
    return <FieldError id={`${id(field)}-error`}>{message}</FieldError>;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    };

    // The same checks the server makes, so a mistake is caught before the round trip.
    const found: Issues = {};
    if (!values.name) found.name = 'required';
    if (!values.email) found.email = 'required';
    else if (!EMAIL.test(values.email)) found.email = 'email';
    if (!values.message) found.message = 'required';
    if (Object.keys(found).length) {
      setIssues(found);
      setState('validation');
      const first = FIELDS.find((field) => found[field]);
      if (first) form.querySelector<HTMLElement>(`#${id(first)}`)?.focus();
      return;
    }

    setState('sending');
    setIssues({});
    let response: Response;
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, topic: 'message', locale, nickname: data.get('nickname') }),
      });
    } catch {
      setState('delivery');
      trackEvent('contact_form_error', { kind: 'delivery' });
      return;
    }

    if (!response.ok) {
      if (response.status === 400) {
        const body = (await response.json().catch(() => null)) as { fields?: Issues } | null;
        const fields = body?.fields ?? {};
        setIssues(fields);
        setState('validation');
        trackEvent('contact_form_error', { kind: 'validation' });
        const first = FIELDS.find((field) => fields[field]);
        if (first) form.querySelector<HTMLElement>(`#${id(first)}`)?.focus();
        return;
      }
      const kind = response.status === 429 ? 'rate_limited' : 'delivery';
      setState(kind);
      trackEvent('contact_form_error', { kind });
      return;
    }

    setState('sent');
    trackEvent('contact_form_submit', { area: 'message', page: pathname });
    form.reset();
  };

  const statusMessage =
    state === 'sent'
      ? t('submitSuccess')
      : state === 'validation'
        ? tShared('errors.validation')
        : state === 'rate_limited'
          ? tShared('errors.rateLimited')
          : state === 'delivery'
            ? tShared('errors.delivery')
            : null;

  return (
    <Form id="message" aria-label={t('label')} onSubmit={onSubmit} noValidate>
      <FieldRow>
        <Field>
          <FieldLabel htmlFor={id('name')}>{t('nameLabel')}</FieldLabel>
          <TextInput
            id={id('name')}
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
          <FieldLabel htmlFor={id('email')}>{t('emailLabel')}</FieldLabel>
          <TextInput
            id={id('email')}
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

      <Field>
        <FieldLabel htmlFor={id('message')}>{t('messageLabel')}</FieldLabel>
        <TextInput
          as="textarea"
          id={id('message')}
          name="message"
          required
          maxLength={4000}
          placeholder={t('messagePlaceholder')}
          {...describe('message')}
        />
        {fieldError('message')}
      </Field>

      <Honeypot aria-hidden>
        <label htmlFor={`talk-nickname-${uid}`}>{tShared('trapLabel')}</label>
        <input id={`talk-nickname-${uid}`} name="nickname" type="text" tabIndex={-1} autoComplete="off" />
      </Honeypot>

      <PrivacyNote>
        {tShared.rich('privacyNote', {
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

      {/* Always in the page, so the announcement is heard when it fills. */}
      <div role="status" aria-live="polite">
        {statusMessage && (
          <Status id={statusId} $tone={state === 'sent' ? 'success' : 'error'}>
            {statusMessage}
          </Status>
        )}
      </div>
    </Form>
  );
}
