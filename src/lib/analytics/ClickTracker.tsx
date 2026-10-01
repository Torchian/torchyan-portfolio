'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from './track';

/**
 * One document-level click listener instead of an onClick on every CTA.
 *
 * Most CTAs are rendered by server components or shared primitives (Button,
 * CTACards); giving each its own handler would turn them into client
 * components for the sake of one analytics call. Here, any element carrying
 * `data-cta="<location>"` reports a `cta_click`, and any carrying
 * `data-outbound="<channel>"` reports an `outbound_contact`, and any carrying
 * `data-area="<area>"` (a Services link) reports a `service_interest`.
 *
 * The listener is passive and capture-free: it never delays or changes the
 * click it observes, so INP is unaffected.
 */
export function ClickTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const cta = target.closest<HTMLElement>('[data-cta]');
      if (cta) {
        trackEvent('cta_click', {
          location: cta.dataset.cta ?? 'unknown',
          target: cta.getAttribute('href') ?? pathname ?? '',
        });
      }

      const area = target.closest<HTMLElement>('[data-area]');
      if (area?.dataset.area) {
        trackEvent('service_interest', { area: area.dataset.area });
      }

      const outbound = target.closest<HTMLElement>('[data-outbound]');
      if (outbound) {
        trackEvent('outbound_contact', { channel: outbound.dataset.outbound ?? 'unknown' });
      }
    };

    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, [pathname]);

  return null;
}
