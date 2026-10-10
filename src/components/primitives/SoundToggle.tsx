'use client';

import { useTranslations } from 'next-intl';
import { AudioToggle, type AudioToggleProps } from './AudioToggle';

/** Figma: Sound CTA (3690:10694) — all sound, interface and music, on a 6% wash. */
export type SoundToggleProps = Omit<AudioToggleProps, 'label' | 'off' | 'on' | 'offWash' | 'onWash'>;

export function SoundToggle(props: SoundToggleProps) {
  const t = useTranslations('sound');

  return (
    <AudioToggle
      {...props}
      label={t('label')}
      off="/vectors/sound/sound-off.svg"
      on="/vectors/sound/sound-on.svg"
      offWash="rgba(213, 49, 49, 0.24)"
      onWash="rgba(5, 132, 3, 0.24)"
    />
  );
}
