import { track as vercelTrack } from '@vercel/analytics';

/**
 * The site's commercially useful events, sent to Vercel Web Analytics.
 *
 * Vercel Web Analytics sets no cookies and keeps no visitor identifier past 24
 * hours, which is why it is the only tracker the site loads (GA4 and Yandex
 * Metrica stay off until consent handling exists — see src/lib/analytics/
 * provider.tsx). Even so, nothing personal goes into an event: no names, no
 * email addresses, no message text. Every property is a label from a fixed set.
 *
 * Calls are fire-and-forget. If the script is blocked or not loaded (local
 * development, an ad blocker), `track` queues or drops the event and nothing
 * on the page depends on it.
 */
export type AnalyticsEvent =
  /** A primary or secondary call to action. `location` is the data-cta value. */
  | { name: 'cta_click'; props: { location: string; target: string } }
  /** Interest in one of the four areas, on /services or in the form. */
  | { name: 'service_interest'; props: { area: string } }
  /** First interaction with a contact form on this page view. */
  | { name: 'contact_form_start'; props: { page: string } }
  /** The server accepted the message (2xx). Never fired on failure. */
  | { name: 'contact_form_submit'; props: { area: string; page: string } }
  /** Why a submission did not go through. */
  | { name: 'contact_form_error'; props: { kind: 'validation' | 'rate_limited' | 'delivery' } }
  /** A case-study page was opened. */
  | { name: 'case_view'; props: { slug: string } }
  /** A click on email, phone or a social profile. */
  | { name: 'outbound_contact'; props: { channel: string } };

export function trackEvent<E extends AnalyticsEvent>(name: E['name'], props: E['props']) {
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics must never break the page.
  }
}
