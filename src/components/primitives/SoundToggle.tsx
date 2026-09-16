'use client';

import { useTranslations } from 'next-intl';
import { AudioToggle, type AudioToggleProps } from './AudioToggle';

/** Figma: Sound CTA (3690:10694) — the interface sounds, on a 6% wash. */
export type SoundToggleProps = Omit<AudioToggleProps, 'kind' | 'label' | 'off' | 'on' | 'offWash' | 'onWash'>;

export function SoundToggle(props: SoundToggleProps) {
  const t = useTranslations('sound');

  return (
    <AudioToggle
      {...props}
      kind="effects"
      label={t('label')}
      off="/vectors/sound/sound-off.svg"
      on="/vectors/sound/sound-on.svg"
      offWash="rgba(213, 49, 49, 0.06)"
      onWash="rgba(5, 132, 3, 0.06)"
    />
  );
}
