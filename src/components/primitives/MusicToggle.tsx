'use client';

import { useTranslations } from 'next-intl';
import { AudioToggle, type AudioToggleProps } from './AudioToggle';

/** Figma: Music CTA (3734:8436) — the background bed, on a 10% wash. */
export type MusicToggleProps = Omit<AudioToggleProps, 'kind' | 'label' | 'off' | 'on' | 'offWash' | 'onWash'>;

export function MusicToggle(props: MusicToggleProps) {
  const t = useTranslations('music');

  return (
    <AudioToggle
      {...props}
      kind="music"
      label={t('label')}
      off="/vectors/sound/music-off.svg"
      on="/vectors/sound/music-on.svg"
      offWash="rgba(213, 49, 49, 0.1)"
      onWash="rgba(5, 132, 3, 0.1)"
    />
  );
}
