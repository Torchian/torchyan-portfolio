'use client';

import styled, { css } from 'styled-components';
import { useSoundEnabled } from '@/lib/sound';
import { useTranslations } from 'next-intl';
import { duration, easing } from '@/styles/tokens/motion';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { spacing } from '@/styles/tokens/spacing';
import { glassCircle } from '@/styles/mixins';

/*
 * Figma: Sound CTA (3690:10694). A 48px glass circle holding six 3px bars,
 * 2px apart: Off, every bar is a 5px grey dash; On, they rise into a green
 * waveform.
 */

/** Bar heights when sound is on, in px, left to right. */
const ON_HEIGHTS = [4, 12, 8, 16, 24, 10];
const OFF_HEIGHT = 3;
const BAR_WIDTH = 3;
const TRANSITION = `${duration.slowest} ${easing.inOut}`;

const Toggle = styled.button<{ $on: boolean }>`
  ${glassCircle}
  gap: ${spacing[25]}px;

  span {
    width: ${BAR_WIDTH}px;
    height: ${OFF_HEIGHT}px;
    border-radius: ${radius.round}px;
    background: ${(p) => (p.$on ? accents.primary : neutrals[700])};
    /* Height, not a scale: a scaled bar would squash its rounded ends. Six 3px bars are cheap to lay out. */
    transition:
      height ${TRANSITION},
      background-color ${TRANSITION};
  }

  ${(p) =>
    p.$on &&
    ON_HEIGHTS.map(
      (height, i) => css`
        span:nth-child(${i + 1}) {
          height: ${height}px;
        }
      `,
    )}

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
  }
`;

export type SoundToggleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick' | 'aria-pressed' | 'children'
>;

export function SoundToggle(props: SoundToggleProps) {
  const [enabled, setEnabled] = useSoundEnabled();
  const t = useTranslations('sound');

  return (
    <Toggle
      type="button"
      aria-label={t('label')}
      {...props}
      $on={enabled}
      aria-pressed={enabled}
      onClick={() => setEnabled(!enabled)}
    >
      {ON_HEIGHTS.map((_, i) => (
        <span key={i} />
      ))}
    </Toggle>
  );
}
