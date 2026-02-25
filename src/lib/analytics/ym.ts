export const YM_COUNTER_ID = process.env.NEXT_PUBLIC_YM_COUNTER_ID ?? '';

declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: unknown[]) => void;
  }
}

export function ymPageview(url: string) {
  if (!YM_COUNTER_ID || typeof window.ym !== 'function') return;
  window.ym(Number(YM_COUNTER_ID), 'hit', url);
}

export function ymReachGoal(target: string, params?: Record<string, unknown>) {
  if (!YM_COUNTER_ID || typeof window.ym !== 'function') return;
  window.ym(Number(YM_COUNTER_ID), 'reachGoal', target, params);
}

export const ymGoals = {
  projectView: (slug: string) => ymReachGoal('project_view', { slug }),
  ctaClick: (label: string) => ymReachGoal('cta_click', { label }),
  contactFormSubmit: () => ymReachGoal('contact_form_submit'),
} as const;
