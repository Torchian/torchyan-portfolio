'use client';

import { useEffect } from 'react';
import { trackEvent } from './track';

/** Reports a case-study view once per mount. Renders nothing. */
export function TrackCaseView({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent('case_view', { slug });
  }, [slug]);
  return null;
}
