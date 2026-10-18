'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import styled from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import { fonts, hung, paper } from './theme';
import { Button, Container, Eyebrow, Lead, SectionTitle } from './ui';

/* ---------- Page ---------- */

const Hero = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: clamp(40px, 7vw, 96px);

  h1 {
    margin: 0;
    max-width: 14ch;
    font-family: ${fonts.serif};
    font-weight: 500;
    font-size: clamp(48px, 7.4vw, 104px);
    line-height: 0.98;
    letter-spacing: -0.015em;
  }
`;

const Section = styled.section`
  margin-top: clamp(56px, 8vw, 112px);
`;

const Head = styled.div`
  margin-bottom: clamp(24px, 3vw, 40px);
`;

const Kinds = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: clamp(16px, 2.4vw, 28px);
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 28px 24px;
    background: ${paper.card};
    ${hung}
  }

  h3 {
    margin: 0;
    font-family: ${fonts.serif};
    font-weight: 500;
    font-size: 28px;
    line-height: 1.1;
  }

  p {
    margin: 0;
    color: ${paper.inkSoft};
    font-size: 15px;
    line-height: 1.6;
  }
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 28px clamp(20px, 3vw, 40px);
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;

  li {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 18px;
    border-top: 1px solid ${paper.lineStrong};
    counter-increment: step;

    &::before {
      content: counter(step, decimal-leading-zero);
      color: ${paper.accent};
      font-family: ${fonts.serif};
      font-size: 22px;
    }
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: ${paper.inkSoft};
    font-size: 15px;
    line-height: 1.6;
  }
`;

const Terms = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0 0 0 18px;
  color: ${paper.inkSoft};
  font-size: 16px;
  line-height: 1.6;
`;

const FormSection = styled.section`
  scroll-margin-top: 80px;
  margin-top: clamp(56px, 8vw, 112px);
  padding: clamp(48px, 7vw, 96px) 0;
  background: ${paper.wallDeep};
`;

const FormGrid = styled(Container)`
  display: grid;
  gap: clamp(28px, 4vw, 64px);

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  }

  > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

/* ---------- Form ---------- */

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px 20px;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Field = styled.div<{ $wide?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${(p) => (p.$wide ? '1 / -1' : 'auto')};

  label,
  legend {
    color: ${paper.inkSoft};
    font-size: 14px;
  }

  input,
  textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid ${paper.lineStrong};
    border-radius: 8px;
    background: ${paper.card};
    color: ${paper.ink};
    font: inherit;
    font-size: 16px;

    &:focus {
      outline: 2px solid ${paper.accent};
      outline-offset: 1px;
      border-color: transparent;
    }

    &[aria-invalid='true'] {
      border-color: ${paper.error};
    }
  }

  textarea {
    min-height: 150px;
    resize: vertical;
  }
`;

const Options = styled.fieldset`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  grid-column: 1 / -1;
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    width: 100%;
    margin-bottom: 8px;
    color: ${paper.inkSoft};
    font-size: 14px;
  }

  label {
    position: relative;
  }

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  span {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 16px;
    border: 1px solid ${paper.lineStrong};
    border-radius: 999px;
    background: ${paper.card};
    font-size: 15px;
    cursor: pointer;
  }

  input:checked + span {
    border-color: ${paper.ink};
    background: ${paper.ink};
    color: ${paper.wall};
  }

  input:focus-visible + span {
    outline: 2px solid ${paper.accent};
    outline-offset: 2px;
  }
`;

const About = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px 14px;
  border-left: 2px solid ${paper.accent};
  background: ${paper.card};
  font-size: 15px;

  strong {
    font-family: ${fonts.serif};
    font-size: 19px;
    font-weight: 500;
  }
`;

const FieldError = styled.span`
  color: ${paper.error};
  font-size: 13px;
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  grid-column: 1 / -1;

  small {
    color: ${paper.inkFaint};
    font-size: 13px;
  }
`;

const Result = styled.p<{ $ok: boolean }>`
  grid-column: 1 / -1;
  margin: 0;
  padding: 14px 16px;
  border-radius: 8px;
  background: ${(p) => (p.$ok ? 'rgba(47, 107, 58, 0.1)' : 'rgba(163, 38, 26, 0.08)')};
  color: ${(p) => (p.$ok ? paper.success : paper.error)};
  font-size: 15px;
`;

/** Hidden from people; bots fill it in. */
const Trap = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = 'hello@torchyan.design';

type Fields = 'name' | 'email' | 'message';

const noSubscription = () => () => {};
type State = 'idle' | 'sending' | 'sent' | 'failed';

function CommissionForm({ titles }: { titles: Record<string, string> }) {
  const t = useTranslations('paintings.commissions');
  const locale = useLocale();
  const id = useId();
  const kinds = t.raw('form.kindOptions') as string[];
  const [state, setState] = useState<State>('idle');
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  // "Ask about this painting" links here with ?painting=<slug>. The page is
  // static and the server never sees the query, so it's read in the browser
  // (null while hydrating, then the slug).
  const painting = useSyncExternalStore(
    noSubscription,
    () => {
      const slug = new URLSearchParams(window.location.search).get('painting');
      return slug && titles[slug] ? slug : null;
    },
    () => null,
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? '').trim();

    const found: Partial<Record<Fields, string>> = {};
    if (!value('name')) found.name = t('form.required');
    if (!value('email')) found.email = t('form.required');
    else if (!EMAIL.test(value('email'))) found.email = t('form.invalidEmail');
    if (!value('message')) found.message = t('form.required');
    setErrors(found);
    if (Object.keys(found).length) return;

    setState('sending');
    try {
      const response = await fetch('/api/commission', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: value('name'),
          email: value('email'),
          phone: value('phone'),
          kind: data.get('kind') === null ? null : Number(data.get('kind')),
          size: value('size'),
          deadline: value('deadline'),
          message: value('message'),
          painting,
          nickname: value('nickname'),
          locale,
        }),
      });
      setState(response.ok ? 'sent' : 'failed');
    } catch {
      setState('failed');
    }
  };

  const field = (name: Fields) => ({
    id: `${id}-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
  });

  if (state === 'sent') return <Result $ok>{t('form.success')}</Result>;

  return (
    <Form noValidate onSubmit={onSubmit}>
      {painting && (
        <About>
          {t('form.about')}: <strong>{titles[painting]}</strong>
        </About>
      )}
      <Field>
        <label htmlFor={`${id}-name`}>{t('form.name')}</label>
        <input {...field('name')} autoComplete="name" />
        {errors.name && <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>}
      </Field>
      <Field>
        <label htmlFor={`${id}-email`}>{t('form.email')}</label>
        <input {...field('email')} type="email" autoComplete="email" />
        {errors.email && <FieldError id={`${id}-email-error`}>{errors.email}</FieldError>}
      </Field>
      <Field $wide>
        <label htmlFor={`${id}-phone`}>{t('form.phone')}</label>
        <input id={`${id}-phone`} name="phone" autoComplete="tel" />
      </Field>
      <Options>
        <legend>{t('form.kind')}</legend>
        {kinds.map((label, index) => (
          <label key={label}>
            <input type="radio" name="kind" value={index} />
            <span>{label}</span>
          </label>
        ))}
      </Options>
      <Field>
        <label htmlFor={`${id}-size`}>{t('form.size')}</label>
        <input id={`${id}-size`} name="size" placeholder={t('form.sizePlaceholder')} />
      </Field>
      <Field>
        <label htmlFor={`${id}-deadline`}>{t('form.deadline')}</label>
        <input id={`${id}-deadline`} name="deadline" placeholder={t('form.deadlinePlaceholder')} />
      </Field>
      <Field $wide>
        <label htmlFor={`${id}-message`}>{t('form.message')}</label>
        <textarea {...field('message')} placeholder={t('form.messagePlaceholder')} />
        {errors.message && <FieldError id={`${id}-message-error`}>{errors.message}</FieldError>}
      </Field>
      <Trap aria-hidden>
        <input name="nickname" tabIndex={-1} autoComplete="off" />
      </Trap>
      {state === 'failed' && <Result $ok={false}>{t('form.error', { email: CONTACT_EMAIL })}</Result>}
      <Footer>
        <Button type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? t('form.sending') : t('form.submit')}
        </Button>
        <small>{t('form.privacy')}</small>
      </Footer>
    </Form>
  );
}

export function CommissionsPage({ titles }: { titles: Record<string, string> }) {
  const t = useTranslations('paintings.commissions');
  const kinds = t.raw('kinds') as { title: string; text: string }[];
  const steps = t.raw('steps') as { title: string; text: string }[];
  const terms = t.raw('terms') as string[];

  return (
    <main id="main-content">
      <Hero>
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1>{t('title')}</h1>
        <Lead>{t('lead')}</Lead>
      </Hero>

      <Section aria-labelledby="kinds-title">
        <Container>
          <Head>
            <SectionTitle id="kinds-title">{t('kindsTitle')}</SectionTitle>
          </Head>
          <Kinds>
            {kinds.map((kind) => (
              <li key={kind.title}>
                <h3>{kind.title}</h3>
                <p>{kind.text}</p>
              </li>
            ))}
          </Kinds>
        </Container>
      </Section>

      <Section aria-labelledby="process-title">
        <Container>
          <Head>
            <SectionTitle id="process-title">{t('processTitle')}</SectionTitle>
          </Head>
          <Steps>
            {steps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </Steps>
        </Container>
      </Section>

      <Section aria-labelledby="terms-title">
        <Container>
          <Head>
            <SectionTitle id="terms-title">{t('termsTitle')}</SectionTitle>
          </Head>
          <Terms>
            {terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </Terms>
        </Container>
      </Section>

      <FormSection id="start" aria-labelledby="form-title">
        <FormGrid>
          <div>
            <SectionTitle id="form-title">{t('form.title')}</SectionTitle>
            <Lead>{t('form.lead')}</Lead>
          </div>
          <CommissionForm titles={titles} />
        </FormGrid>
      </FormSection>
    </main>
  );
}
