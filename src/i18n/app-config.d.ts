import type messages from '../../messages/en.json';
import type { routing } from './routing';

/*
 * Types every message key against the English file, so a missing or misspelled
 * key fails the type check. scripts/check-messages.ts keeps ru and hy in step
 * with it.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
