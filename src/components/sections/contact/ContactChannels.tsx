'use client';

/* eslint-disable @next/next/no-img-element -- small decorative SVGs; next/image adds nothing here */
import { useEffect, useMemo, useRef, useState, type FocusEvent } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useTranslations } from 'next-intl';
import { VisuallyHidden } from '@/components/primitives';
import { usePauseOffscreen } from '@/hooks';
import { Character } from '@/components/composites/character/Character';
import { useLookAtPointer } from '@/components/composites/character/useLookAtPointer';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { spacing } from '@/styles/tokens/spacing';
import { accents, neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

/*
 * Figma: Contacts (4183:14298) — State=Default (4183:13142) and State2
 * (4183:14607). A ring of five contact channels around the lead, open at the
 * bottom where the lead stands. Pointing at a channel, or tabbing to it:
 *  - the ring lights up in a 60° arc in front of it, in the channel's brand
 *    colour (Instagram's gradient running along the arc; email keeps the
 *    site's green);
 *  - the middle swaps "Ways to reach me" for the channel's name, a QR code to
 *    open it on a phone, and a short link to open it here;
 *  - the lead steps back a little (320 → 260), out of the QR's way.
 *
 * The arc is the Services specialists' ring (ServicesSpecialists): a conic
 * mask whose angle and width are registered custom properties, so the browser
 * tweens them as numbers. From rest the arc opens in place; between channels
 * it swings the short way round (the angle accumulates, never wraps).
 *
 * Every channel is a real link. Hover and keyboard focus show the same thing;
 * the links' own names carry the handle, so the picture in the middle is extra,
 * not the only way to read it. Reduced motion keeps every state, without the
 * movement.
 *
 * Placed in the 820 design frame and scaled with it.
 */

const FRAME = 820;
/** The ring: 410 out, 287 in; open from 150° to 210° (clockwise from the top). */
const HOLE = 287 / 410;
const GAP = { from: 150, to: 210 } as const;
/** The lit arc, centred on the chosen channel. */
const ARC = 60;
/** Where the icons sit, from the centre. */
const ORBIT = 350;
const DISC = 420;
const LEAD = { rest: 320, on: 260 } as const;

const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const DURATION = 600;

type ChannelId = 'instagram' | 'linkedin' | 'telegram' | 'whatsapp' | 'email';

interface Channel {
  id: ChannelId;
  /** Clockwise from the top. */
  angle: number;
  href: string;
  /** As shown under the QR code. */
  handle: string;
  /** The icon's box in design px. */
  icon: { width: number; height: number };
  external: boolean;
  /** The lit arc's colours, along it clockwise: start, middle, end. One colour for a solid brand. */
  tint: readonly [string, string, string];
}

/*
 * Brand colours, from each brand's own guidelines: LinkedIn Blue #0A66C2,
 * WhatsApp's #25D366, Telegram's #26A5E4, and the core of Instagram's gradient
 * (orange #FA7E1E, pink #D62976, purple #962FBF).
 */
const solid = (color: string) => [color, color, color] as const;

/** In reading order round the ring: top, then clockwise. */
const CHANNELS: Channel[] = [
  {
    id: 'instagram',
    angle: 0,
    href: 'https://www.instagram.com/torchyan.design',
    handle: '@torchyan.design',
    icon: { width: 48, height: 48 },
    external: true,
    tint: ['#FA7E1E', '#D62976', '#962FBF'],
  },
  {
    id: 'linkedin',
    angle: 60,
    href: 'https://www.linkedin.com/in/torchian/',
    handle: 'in/torchian',
    icon: { width: 48, height: 48 },
    external: true,
    tint: solid('#0A66C2'),
  },
  {
    id: 'telegram',
    angle: 120,
    href: 'https://t.me/stepan93t',
    handle: '@stepan93t',
    icon: { width: 48, height: 40 },
    external: true,
    tint: solid('#26A5E4'),
  },
  {
    id: 'whatsapp',
    angle: 240,
    href: 'https://wa.me/37495334719',
    handle: '+374 95 334719',
    icon: { width: 48, height: 48 },
    external: true,
    tint: solid('#25D366'),
  },
  {
    id: 'email',
    angle: 300,
    href: 'mailto:hello@torchyan.design',
    handle: 'hello@torchyan.design',
    icon: { width: 48, height: 47 },
    external: false,
    tint: solid(accents.primary),
  },
];

/** Registered, so the arc's angle and width transition as numbers. */
const ArcProperties = createGlobalStyle`
  @property --arc-at {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  @property --arc-width {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }
  @property --arc-c1 {
    syntax: '<color>';
    inherits: false;
    initial-value: ${accents.primary};
  }
  @property --arc-c2 {
    syntax: '<color>';
    inherits: false;
    initial-value: ${accents.primary};
  }
  @property --arc-c3 {
    syntax: '<color>';
    inherits: false;
    initial-value: ${accents.primary};
  }
`;

/** Anything that can point: the lead follows it. */
const POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/*
 * The stage: the circle's box, with the signal rippling out behind it. The
 * circle itself is clipped to its round shape, so the ripples live out here.
 */
const Stage = styled.div`
  position: relative;
  width: min(100%, ${FRAME}px);
  aspect-ratio: 1;
`;

const WAVES = 5;
/** One ripple's whole life, and the gap between one ripple and the next. */
const WAVE_PERIOD = 10;
const WAVE_GAP = WAVE_PERIOD / WAVES;

/** A ripple leaves the circle's edge, thins and slows as it spreads, and is gone by the time it reaches the glow's rim. */
const ripple = keyframes`
  0% {
    opacity: 0;
    transform: scale(var(--from));
  }
  12% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
`;

/** The glow under it breathes once per ripple. */
const breathe = keyframes`
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
`;

/**
 * Box is the circle plus 30% all round; --from is the circle's own edge within
 * it. The colours go round the brands (Instagram, LinkedIn, Telegram, WhatsApp,
 * the site's green); pointing at a channel turns every ripple that channel's
 * colour. Under reduced motion they stand still as faint rings.
 */
const Waves = styled.div`
  --from: ${1 / 1.6};
  position: absolute;
  inset: -30%;
  pointer-events: none;
  /* Whole near the circle, gone before the box's edge. */
  mask-image: radial-gradient(closest-side, #000 45%, transparent 100%);

  &::before {
    content: '';
    position: absolute;
    inset: 22%;
    border-radius: 50%;
    background: radial-gradient(
      closest-side,
      color-mix(in srgb, var(--wave-tint, ${accents.primary}) 22%, transparent),
      transparent 70%
    );
    animation: ${breathe} ${WAVE_GAP * 2}s ease-in-out infinite;
    transition: background 0.6s ease;
  }

  span {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid var(--wave-tint, var(--ring));
    box-shadow:
      0 0 32px color-mix(in srgb, var(--wave-tint, var(--ring)) 50%, transparent),
      inset 0 0 32px color-mix(in srgb, var(--wave-tint, var(--ring)) 26%, transparent);
    opacity: 0;
    transform: scale(var(--from));
    animation: ${ripple} ${WAVE_PERIOD}s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
    transition: border-color 0.6s ease;
    will-change: transform, opacity;
  }

  ${media.reducedMotion} {
    &::before {
      animation: none;
    }

    span {
      animation: none;
      opacity: 0.22;
      transform: scale(calc(var(--from) + (1 - var(--from)) * var(--rest)));
      will-change: auto;
    }
  }
`;

const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  clip-path: circle(50%);
  container-type: inline-size;
  /* One design pixel. */
  --u: calc(100cqw / ${FRAME});
`;

const ringShape = `
  radial-gradient(closest-side, transparent calc(${HOLE * 100}% - 0.3%), #000 ${HOLE * 100}%),
  conic-gradient(#000 0 ${GAP.from}deg, transparent ${GAP.from}deg ${GAP.to}deg, #000 ${GAP.to}deg)
`;

const Ring = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(to bottom, ${neutrals[900]}, ${neutrals[800]});
  mask-image: ${ringShape};
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
`;

/**
 * The lit arc: the ring's own shape, cut down to ARC degrees round the chosen
 * channel, painted in its colours. The paint is a conic gradient laid along the
 * arc's full width, so a gradient brand runs from one end of it to the other
 * and the colours cross-fade as the arc swings to the next channel.
 */
const Arc = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  --arc-at: 0deg;
  --arc-width: 0deg;
  background: conic-gradient(
    from calc(var(--arc-at) - ${ARC / 2}deg),
    var(--arc-c1),
    var(--arc-c2) ${ARC / 2}deg,
    var(--arc-c3) ${ARC}deg
  );
  mask-image:
    ${ringShape},
    conic-gradient(
      from calc(var(--arc-at) - var(--arc-width) / 2),
      #000 0 var(--arc-width),
      transparent var(--arc-width)
    );
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
  /* At rest the arc is closed, so its angle jumps: it opens where it's needed. */
  transition: --arc-width ${DURATION}ms ${EASE};

  &[data-on='true'] {
    --arc-width: ${ARC}deg;
    transition:
      --arc-at ${DURATION}ms ${EASE},
      --arc-width ${DURATION}ms ${EASE},
      --arc-c1 ${DURATION}ms ${EASE},
      --arc-c2 ${DURATION}ms ${EASE},
      --arc-c3 ${DURATION}ms ${EASE};
  }

  ${media.reducedMotion} {
    transition: none;

    &[data-on='true'] {
      transition: none;
    }
  }
`;

const Disc = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(${DISC} * var(--u));
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(to bottom, ${neutrals[900]}, ${neutrals[800]});
  transform: translate(-50%, -50%);
`;

/** The middle: "Ways to reach me" at rest, the chosen channel otherwise; all in one cell. */
const Middle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  width: calc(${DISC} * var(--u));
  aspect-ratio: 1;
  padding: calc(48 * var(--u));
  transform: translate(-50%, -50%);
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  color: ${neutrals[100]};
  text-align: center;
  pointer-events: none;

  > * {
    grid-area: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    opacity: 0;
    transform: translateY(calc(8 * var(--u)));
    transition:
      opacity ${DURATION / 2}ms ease-out,
      transform ${DURATION / 2}ms ease-out;
  }

  > [data-shown='true'] {
    opacity: 1;
    transform: none;
    transition:
      opacity ${DURATION / 2}ms ease-in ${DURATION / 4}ms,
      transform ${DURATION / 2}ms ${EASE} ${DURATION / 4}ms;
  }

  ${media.reducedMotion} {
    > *,
    > [data-shown='true'] {
      transform: none;
      transition: none;
    }
  }
`;

const Title = styled.p`
  margin: 0;
  font-size: max(16px, calc(${fontSize.heading.l} * var(--u)));
  line-height: 1.33;
  letter-spacing: ${letterSpacing.xs}px;
`;

const Rest = styled.div`
  gap: calc(16 * var(--u));
`;

const Body = styled.p`
  margin: 0;
  font-size: calc(${fontSize.body.xl} * var(--u));
  line-height: 1.33;
  letter-spacing: ${letterSpacing.s}px;

  /* Too small to read on a small circle: the links still name each channel. */
  @container (width < 560px) {
    display: none;
  }
`;

const Detail = styled.div`
  gap: max(6px, calc(24 * var(--u)));
`;

const Qr = styled.img`
  width: calc(110 * var(--u));
  height: calc(110 * var(--u));

  /* About 30px on the narrowest phones: too small to scan, and it crowds the button out of the circle. */
  @container (width < 320px) {
    display: none;
  }
`;

/**
 * The chosen channel's own link, in the middle. On a touch screen the icons
 * have no hover, so the first tap on one shows it here instead of leaving the
 * page; this is what opens it. Only the shown one takes the pointer.
 */
const Open = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: ${spacing[50]}px ${spacing[150]}px;
  border-radius: 999px;
  background: ${accents.primary};
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};
  text-decoration: none;
  /* Never wider than the middle: a longer label (Russian "Написать письмо")
     wraps rather than runs out of the circle. */
  max-width: 100%;
  text-align: center;
  text-wrap: balance;
  pointer-events: none;

  [data-shown='true'] > & {
    pointer-events: auto;
  }

  /* On a phone the middle is about 160px across: a smaller button, two short
     lines at most, keeps every corner of it inside the circle. */
  @container (width < 420px) {
    min-height: 26px;
    padding: 2px 10px;
    font-size: 12px;
    line-height: 14px;
    letter-spacing: 0;
  }

  @container (width >= 560px) {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
  }
`;

/** The lead, standing in the ring's open bottom; steps back for the QR code. */
const Lead = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(${LEAD.rest} * var(--u));
  transform: translateX(-50%) scale(1);
  transform-origin: 50% 100%;
  transition: transform ${DURATION}ms ${EASE};
  pointer-events: none;

  &[data-on='true'] {
    transform: translateX(-50%) scale(${LEAD.on / LEAD.rest});
  }

  ${media.reducedMotion} {
    transition: none;
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

/** A channel's link: a round hit area round its icon, centred on its place in the ring. */
const ChannelLink = styled.a`
  position: absolute;
  display: grid;
  place-items: center;
  width: calc(80 * var(--u));
  min-width: 44px;
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: transform ${DURATION / 2}ms ${EASE};

  img {
    width: calc(var(--icon-w) * var(--u));
    height: auto;
    transition: opacity ${DURATION / 2}ms ease-out;
  }

  &[data-on='true'] {
    transform: translate(-50%, -50%) scale(1.12);
  }

  /* While one channel is chosen, the others step back. */
  [data-active='true'] &:not([data-on='true']) img {
    opacity: 0.55;
  }

  &:focus-visible {
    outline: 2px solid ${neutrals[100]};
    outline-offset: 2px;
  }

  ${media.reducedMotion} {
    transition: none;

    img {
      transition: none;
    }
  }
`;

/** The short way round from one angle to the next, as a running total. */
function towards(from: number, to: number) {
  const delta = ((((to - from) % 360) + 540) % 360) - 180;
  return from + delta;
}

const place = (angle: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    left: `${((FRAME / 2 + Math.sin(rad) * ORBIT) / FRAME) * 100}%`,
    top: `${((FRAME / 2 - Math.cos(rad) * ORBIT) / FRAME) * 100}%`,
  };
};

interface ContactChannelsProps {
  /** The (visually hidden) heading's level: h3 where the section has a visible h2 of its own. */
  titleAs?: 'h2' | 'h3';
}

export function ContactChannels({ titleAs = 'h2' }: ContactChannelsProps) {
  const t = useTranslations('talkPage.channels');
  const [active, setActive] = useState<ChannelId | null>(null);
  const [live, setLive] = useState(false);
  const arcRef = useRef<HTMLDivElement>(null);
  const atRef = useRef(0);
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

  const choose = (id: ChannelId | null) => {
    const arc = arcRef.current;
    const channel = CHANNELS.find((c) => c.id === id);
    if (arc && channel) {
      const next = towards(atRef.current, channel.angle);
      atRef.current = next;
      arc.style.setProperty('--arc-at', `${next}deg`);
      channel.tint.forEach((color, i) => arc.style.setProperty(`--arc-c${i + 1}`, color));
      // From rest the arc has no transition on its angle or colours: let the
      // jump land before the arc opens, so it opens in place, already in colour.
      if (!active) getComputedStyle(arc).getPropertyValue('--arc-at');
    }
    setActive(id);
  };

  // Focus moving on to the middle's link keeps the channel: that's where it's going.
  const frameRef = useRef<HTMLDivElement>(null);
  const onBlur = (event: FocusEvent<HTMLUListElement>) => {
    if (!frameRef.current?.contains(event.relatedTarget as Node | null)) choose(null);
  };

  /*
   * A tap is not a hover. With a mouse, pointing at an icon shows the channel
   * and a click opens it; on a touch screen the first tap on an icon does what
   * pointing does — lights it and shows it in the middle, with its link — and
   * only a second tap on the same icon opens it. Whether it was already shown
   * is read when the finger comes down, before the focus that the tap also
   * brings has had a chance to show it.
   */
  const tapRef = useRef<{ touch: boolean; shown: boolean } | null>(null);
  const onIconDown = (id: ChannelId) => (e: React.PointerEvent) => {
    tapRef.current = { touch: e.pointerType !== 'mouse', shown: active === id };
  };
  const onIconClick = (id: ChannelId) => (e: React.MouseEvent) => {
    const tap = tapRef.current;
    tapRef.current = null;
    if (!tap?.touch || tap.shown) return;
    e.preventDefault();
    choose(id);
  };

  // A tap anywhere off the icons and the middle's link puts the circle back to rest.
  useEffect(() => {
    if (!active) return;
    const away = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const target = e.target as Element | null;
      if (target?.closest('[data-outbound], [data-channel-open]')) return;
      choose(null);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  });

  const stageRef = usePauseOffscreen<HTMLDivElement>();
  const lit = CHANNELS.find((c) => c.id === active);

  return (
    <Stage ref={stageRef} style={lit ? ({ '--wave-tint': lit.tint[1] } as React.CSSProperties) : undefined}>
      <Waves aria-hidden>
        {CHANNELS.map((c, i) => (
          <span
            key={c.id}
            style={
              {
                '--ring': c.tint[1],
                '--rest': (i + 1) / WAVES,
                animationDelay: `${-i * WAVE_GAP}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </Waves>
      <Frame
        ref={frameRef}
        data-active={active !== null}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse' && !e.currentTarget.contains(document.activeElement)) choose(null);
        }}
      >
        <ArcProperties />
        <Ring aria-hidden />
        <Arc ref={arcRef} data-on={active !== null} aria-hidden />
        <Disc aria-hidden />

        <Middle aria-hidden>
          <Rest data-shown={active === null}>
            <Title>{t('label')}</Title>
            <Body>{t('body')}</Body>
          </Rest>
          {CHANNELS.map((c) => (
            <Detail key={c.id} data-shown={active === c.id}>
              <Title>{t(`items.${c.id}`)}</Title>
              <Qr src={`/contact/qr-${c.id}.svg`} alt="" width={110} height={110} loading="lazy" />
              {/* The icons are the accessible links; this one is for the pointer. */}
              <Open
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                tabIndex={-1}
                data-channel-open={c.id}
              >
                {t(`actions.${c.id}`)}
              </Open>
            </Detail>
          ))}
        </Middle>

        <Lead ref={leadRef} data-on={active !== null} aria-hidden>
          <Character clothes="default" glasses="matrix" cap={false} width={LEAD.rest} motion={live} />
        </Lead>

        {/* The heading and the description, for everyone: the picture in the middle is aria-hidden. */}
        <VisuallyHidden as={titleAs} id="contact-channels-title">
          {t('label')}
        </VisuallyHidden>
        <VisuallyHidden as="p">{t('body')}</VisuallyHidden>

        <List aria-labelledby="contact-channels-title" onBlur={onBlur}>
          {CHANNELS.map((c) => {
            const name = t(`items.${c.id}`);
            return (
              <li key={c.id}>
                <ChannelLink
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  aria-label={`${name}: ${c.handle}${c.external ? ` (${t('opensInNewTab')})` : ''}`}
                  data-outbound={c.id}
                  data-on={active === c.id}
                  style={{ ...place(c.angle), '--icon-w': c.icon.width } as React.CSSProperties}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && choose(c.id)}
                  onPointerDown={onIconDown(c.id)}
                  onClick={onIconClick(c.id)}
                  onFocus={() => choose(c.id)}
                >
                  <img src={`/contact/${c.id}.svg`} alt="" width={c.icon.width} height={c.icon.height} />
                </ChannelLink>
              </li>
            );
          })}
        </List>
      </Frame>
    </Stage>
  );
}
