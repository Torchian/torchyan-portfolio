export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: url });
}

export function event({ action, category, label, value }: GTagEvent) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export const gaEvents = {
  projectView: (slug: string) =>
    event({ action: 'project_view', category: 'engagement', label: slug }),
  ctaClick: (label: string) =>
    event({ action: 'cta_click', category: 'engagement', label }),
  themeSwitch: (theme: string) =>
    event({ action: 'theme_switch', category: 'preferences', label: theme }),
  soundToggle: (enabled: boolean) =>
    event({ action: 'sound_toggle', category: 'preferences', label: String(enabled) }),
  contactFormSubmit: () =>
    event({ action: 'contact_form_submit', category: 'conversion' }),
} as const;
