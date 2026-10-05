'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import styled, { css } from 'styled-components';
import { useTranslations } from 'next-intl';
import { Badge, VisuallyHidden } from '@/components/primitives';
import { Character } from '@/components/composites/character/Character';
import { useLookAtPointer } from '@/components/composites/character/useLookAtPointer';
import { media } from '@/styles/media';

/*
 * Figma: Team (4064:14658) — State=Default (4064:14657) and one hover state per
 * teammate (State2–5). The lead stands in the middle, live: the same
 * Character as the About hero, turning towards the mouse. Four teammates stand
 * around it in black and white; pointing at one scales it up from its feet,
 * brings back its colour and fades its role in above its head, while everyone
 * else goes grey, the lead included (all but the lead's glasses, which keep
 * their colour). With nobody pointed at, the lead is the one in colour.
 *
 * On a touch screen there's nothing to point with, so everybody is in colour
 * with their role showing.
 *
 * Every box is placed in the component's own 1277 × 411 design frame, as a
 * share of it, so the whole group scales with the width it gets.
 */

const FRAME = { width: 1277, height: 411.228 } as const;

type MemberId = 'member1' | 'member2' | 'aiAssistant' | 'member3';
type ActiveId = MemberId | 'lead';

interface Member {
  id: MemberId;
  src: string;
  /** Centre of the box, design px from the frame's left edge. */
  x: number;
  width: number;
  height: number;
  /** Figma's hover size over its default size. */
  scale: number;
  /** The badge's centre and its top edge once shown, design px. */
  badge: { x: number; top: number };
  /** Paint order: Figma's layer order, the lead on top of all. */
  z: number;
}

/** Figma measures; the badge drops 10 design px into place as it fades in. */
const MEMBERS: Member[] = [
  {
    id: 'member1',
    src: '/services/team/member-1.webp',
    x: 158.95,
    width: 317.89,
    height: 277.61,
    scale: 344 / 317.89,
    badge: { x: 158.5, top: 72 },
    z: 4,
  },
  {
    id: 'member2',
    src: '/services/team/member-2.webp',
    x: 383.5,
    width: 339.61,
    height: 339.61,
    scale: 365 / 339.61,
    badge: { x: 384, top: 10 },
    z: 3,
  },
  {
    id: 'aiAssistant',
    src: '/services/team/ai-assistant.webp',
    x: 902.71,
    width: 335.43,
    height: 326.46,
    scale: 362 / 335.43,
    badge: { x: 902.5, top: 16 },
    z: 2,
  },
  {
    id: 'member3',
    src: '/services/team/member-3.webp',
    x: 1117.38,
    width: 319.25,
    height: 264.17,
    scale: 355 / 319.25,
    badge: { x: 1116.5, top: 74 },
    z: 1,
  },
];

const LEAD = { x: 658.43, size: 411.228 } as const;
const BADGE_DROP = 10;

/** Only part of each box is a person; the rest is transparent and overlaps a neighbour. */
const HIT_WIDTH = 0.6;

const TRANSITION = '400ms cubic-bezier(0.22, 1, 0.36, 1)';

/** Anything that can point: hover is the interaction. */
const POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const TOUCH = '@media (hover: none), (pointer: coarse)';

const pctX = (v: number) => `${(v / FRAME.width) * 100}%`;
const pctY = (v: number) => `${(v / FRAME.height) * 100}%`;

const Frame = styled.div`
  position: relative;
  width: 100%;
  max-width: ${FRAME.width}px;
  aspect-ratio: ${FRAME.width} / ${FRAME.height};
  container-type: inline-size;
  /* One design pixel, for the badge's drop. */
  --u: calc(100cqw / ${FRAME.width});
`;

const colourTransition = css`
  transition:
    filter ${TRANSITION},
    transform ${TRANSITION};

  ${media.reducedMotion} {
    transition: none;
  }
`;

/** One teammate: stands on the frame's bottom edge, its image cropped from the top. */
const Person = styled.div`
  position: absolute;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  transform: translateX(-50%) scale(1);
  transform-origin: 50% 100%;
  filter: grayscale(1);
  ${colourTransition}

  &[data-active='true'] {
    transform: translateX(-50%) scale(var(--hover-scale));
    filter: grayscale(0);
  }

  ${TOUCH} {
    filter: grayscale(0);
  }

  img {
    object-fit: cover;
    object-position: top center;
  }
`;

const Lead = styled.div`
  position: absolute;
  bottom: 0;
  left: ${pctX(LEAD.x)};
  width: ${pctX(LEAD.size)};
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;

  /* Greyed part by part rather than as a whole, so the glasses keep their colour. */
  /* Filter only: the layers' transform follows the pointer and mustn't ease. */
  [data-layer] {
    filter: grayscale(0);
    transition: filter ${TRANSITION};

    ${media.reducedMotion} {
      transition: none;
    }
  }

  &[data-dimmed='true'] [data-layer]:not([data-layer='glasses']) {
    filter: grayscale(1);
  }

  ${TOUCH} {
    &[data-dimmed='true'] [data-layer] {
      filter: grayscale(0);
    }
  }
`;

/** Places a role badge: centred on its x, fading and dropping into place. */
const BadgeSlot = styled.div`
  position: absolute;
  top: var(--top);
  z-index: 6;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, calc(${-BADGE_DROP} * var(--u)));
  transition:
    opacity ${TRANSITION},
    transform ${TRANSITION};

  &[data-active='true'] {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  ${TOUCH} {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  ${media.reducedMotion} {
    transition: none;
  }

  /* The frame is a third of its design size here: the badges keep a readable
     size, which is too wide to sit side by side at the design's heights, so the
     outer two drop onto their wearer's hairline. */
  ${media.down('m')} {
    > span {
      height: 20px;
      padding: 2px 8px;
      font-size: 11px;
      line-height: 16px;
      letter-spacing: 0.2px;
    }

    &[data-outer='true'] {
      top: 24%;
    }
  }
`;

/** Where the pointer counts as being on a person: the middle of their box. */
const Hit = styled.div`
  position: absolute;
  bottom: 0;
  z-index: 7;
  transform: translateX(-50%);

  ${TOUCH} {
    display: none;
  }
`;

export function ServicesTeam() {
  const t = useTranslations('servicesPage.hero');
  const [active, setActive] = useState<ActiveId>('lead');
  const [live, setLive] = useState(false);
  const leadRef = useRef<HTMLDivElement>(null);
  const targets = useMemo(() => [leadRef], []);

  useEffect(() => {
    const pointer = window.matchMedia(POINTER_QUERY);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setLive(pointer.matches && !motion.matches);
    sync();
    pointer.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    return () => {
      pointer.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  useLookAtPointer(targets, live);

  const point = (id: ActiveId) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setActive(id);
  };

  return (
    <>
      <Frame aria-hidden onPointerLeave={() => setActive('lead')}>
        {MEMBERS.map((m) => (
          <Person
            key={m.id}
            data-active={active === m.id}
            style={
              {
                left: pctX(m.x),
                width: pctX(m.width),
                height: pctY(m.height),
                zIndex: m.z,
                '--hover-scale': m.scale,
              } as CSSProperties
            }
          >
            <Image src={m.src} alt="" fill priority sizes="(max-width: 1277px) 28vw, 365px" />
          </Person>
        ))}

        <Lead ref={leadRef} data-dimmed={active !== 'lead'}>
          <Character clothes="default" glasses="matrix" cap={false} width={LEAD.size} priority motion={live} />
        </Lead>

        {MEMBERS.map((m) => (
          <BadgeSlot
            key={m.id}
            data-active={active === m.id}
            data-outer={m.id === 'member1' || m.id === 'member3'}
            style={{ left: pctX(m.badge.x), '--top': pctY(m.badge.top) } as CSSProperties}
          >
            <Badge $size="medium" $variant="light">
              {t(`team.${m.id}`)}
            </Badge>
          </BadgeSlot>
        ))}

        <Hit
          onPointerEnter={point('lead')}
          style={{ left: pctX(LEAD.x), width: pctX(LEAD.size * HIT_WIDTH), height: '100%' }}
        />
        {MEMBERS.map((m) => (
          <Hit
            key={m.id}
            onPointerEnter={point(m.id)}
            style={{ left: pctX(m.x), width: pctX(m.width * HIT_WIDTH), height: pctY(m.height) }}
          />
        ))}
      </Frame>
      <VisuallyHidden as="ul" aria-label={t('team.label')}>
        <li>{t('team.lead')}</li>
        {MEMBERS.map((m) => (
          <li key={m.id}>{t(`team.${m.id}`)}</li>
        ))}
      </VisuallyHidden>
    </>
  );
}
