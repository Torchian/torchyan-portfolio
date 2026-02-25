export const soundRegistry = {
  hover: { url: '/sounds/hover.mp3', volume: 0.3 },
  click: { url: '/sounds/click.mp3', volume: 0.4 },
  toggle: { url: '/sounds/toggle.mp3', volume: 0.35 },
  transition: { url: '/sounds/transition.mp3', volume: 0.25 },
} as const;

export type SoundId = keyof typeof soundRegistry;
