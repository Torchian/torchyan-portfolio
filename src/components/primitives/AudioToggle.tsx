'use client';

import styled from 'styled-components';
import { useSoundEnabled } from '@/lib/sound';
import { duration, easing } from '@/styles/tokens/motion';
import { glassCircle } from '@/styles/mixins';
import { accents } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

/*
 * Figma: Sound CTA (3690:10694). One control for everything audible, the
 * interface sounds and the background music together. A 48px glass circle
 * holding SOUND and OFF in red or ON in green, on a wash of the same colour;
 * hovering drops the wash and leaves the glass.
 *
 * The words are Figma's own artwork: two type sizes and their own kerning.
 */

/** The badge artwork's size, from the design. */
const BADGE = { width: 30, height: 22.376 } as const;
const TRANSITION = `${duration.normal} ${easing.out}`;

const Toggle = styled.button<{ $on: boolean; $offWash: string; $onWash: string }>`
  ${glassCircle}
  position: relative;
  background-color: ${(p) => (p.$on ? p.$onWash : p.$offWash)};
  transition: transform ${TRANSITION}, background-color ${TRANSITION};

  ${media.hover} {
    &:hover {
      transform: scale(0.95);
    }
  }

  &:focus-visible {
    outline: 2px solid ${accents.primary};
    outline-offset: 2px;
  }
`;

/** Both words are always there; the state cross-fades between them. */
const Badge = styled.img<{ $visible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${BADGE.width}px;
  height: ${BADGE.height}px;
  transform: translate(-50%, -50%);
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity ${TRANSITION};
  filter: brightness(5);
`;

export interface AudioToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick' | 'aria-pressed' | 'children'> {
  label: string;
  /** The badge artwork for each state. */
  off: string;
  on: string;
  offWash: string;
  onWash: string;
}

export function AudioToggle({ label, off, on, offWash, onWash, ...props }: AudioToggleProps) {
  const [enabled, setEnabled] = useSoundEnabled();

  return (
    <Toggle
      type="button"
      aria-label={label}
      {...props}
      $on={enabled}
      $offWash={offWash}
      $onWash={onWash}
      aria-pressed={enabled}
      onClick={() => setEnabled(!enabled)}
    >
      <Badge src={off} alt="" aria-hidden $visible={!enabled} {...BADGE} />
      <Badge src={on} alt="" aria-hidden $visible={enabled} {...BADGE} />
    </Toggle>
  );
}
