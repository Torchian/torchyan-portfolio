'use client';

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent } from 'react';
import styled from 'styled-components';
import { useMessages, useTranslations } from 'next-intl';
import { CarouselDots } from '@/components/primitives';
import { HEADER_INLINE } from '@/components/layouts/NavBar';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import { ProjectShowcase } from './ProjectShowcase';
import {
  SHOWCASE_PROJECTS,
  STACKED_STAGE_MIN_HEIGHT,
  STAGE_QUERY,
  STAGE_SPLIT_QUERY,
  STAGE_STACKED_QUERY,
} from './projectShowcaseConfig';
import { useScrollStepping } from '@/hooks';

/**
 * Figma: Projects (3155:9805 / 3753:11186 / 3753:14707 / 3753:17734). The collage
 * starts on the right and alternates row by row.
 *
 * Where there's room (STAGE_QUERY), the list is a stage: one screen, pinned,
 * that the page scrolls past for as many screens as there are projects. Each
 * screen of scroll brings on the next project, by animation rather than by
 * scroll position:
 *  - the background slides up a screen: the page-long gradient (each project's
 *    band ends on the colour the next begins with) moves as one strip, so the
 *    current colours leave through the top as the next ones rise from below;
 *  - each half of the row leaves towards its own page edge (the text on the
 *    left out to the left, the collage on the right out to the right) while the
 *    next project's halves, which sit the other way round, arrive from those
 *    same edges.
 * Scrolling back up plays it in reverse. Elsewhere (phones, short windows) the
 * rows stack flush against each other, each ending on the colour the next
 * begins with, so the ten read as one gradient down the page. That stacked
 * layout is also what renders without JavaScript: the stage needs JS to choose
 * the row on screen, so it is switched on from here (see STAGED) rather than by
 * the media query alone.
 */

const COUNT = SHOWCASE_PROJECTS.length;

/**
 * The stage is turned on in JS, not by the media query alone: `data-staged` on
 * the section. Which row is on screen can only be worked out from the scroll
 * position, so without JS — and in the server HTML, before hydration — there is
 * no row to show, and a stage would be ten hidden rows in nine blank screens.
 * The attribute keeps the rows stacked in normal flow until JS says otherwise.
 * ProjectShowcase gates its own stage rules the same way.
 */
const STAGED = `[data-staged='true'] &`;

/**
 * Whether the list should run as a stage, at this moment and this size.
 *
 * Read twice: once before the first paint, to write the attribute the CSS keys
 * on, and again whenever the window changes.
 */
function shouldStage() {
  if (!window.matchMedia(STAGE_QUERY).matches) return false;
  // The stacked row has to hold its text, its collage band and its CTA in one
  // screen, so it is measured against the screen it really gets. The
  // side-by-side row puts the two halves next to each other and has never run
  // out of height, so its media query stands on its own.
  if (!window.matchMedia(STAGE_STACKED_QUERY).matches) return true;
  return smallViewportHeight() >= STACKED_STAGE_MIN_HEIGHT;
}

const Section = styled.section`
  /* The Figma frame ends 160px below the last row, on top of the page's section gap. */

  ${media.down('xl')} {
    padding-bottom: ${spacing[1000]}px;
  }
`;

/**
 * The scroll runway: one screen per project.
 *
 * Its height is the one stage rule left on the media query, because it is the
 * one that has to be right in the *first painted frame*. Everything else waits
 * for `data-staged`, which cannot appear before hydration — and hydration lands
 * long after the server HTML is on screen. Reserving this height from CSS is
 * what stops the page growing by three thousand pixels once the stage turns on,
 * which dragged the page glow down with it and measured 0.132 CLS.
 *
 * The cost falls on the rare visitor with no JavaScript at all: the runway is
 * there but the rows stay stacked inside it, so the section ends with a stretch
 * of empty space. Every row is still readable, which is what matters — the
 * alternative, staging from CSS, hid nine of them behind an opacity the browser
 * had no way to lift.
 */
const Track = styled.div`
  @media ${STAGE_QUERY} {
    height: ${COUNT * 100}svh;
  }
`;

const Stage = styled.div`
  display: flex;
  flex-direction: column;

  ${STAGED} {
    position: sticky;
    top: 0;
    display: block;
    height: 100svh;
    overflow: hidden;
  }
`;

/** Every project's band stacked into one strip, a screen each; the stage shows one at a time. */
const Backdrop = styled.div`
  display: none;

  ${STAGED} {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    height: ${COUNT * 100}%;
    transition: transform 900ms cubic-bezier(0.65, 0, 0.35, 1);

    ${media.reducedMotion} {
      transition: none;
    }
  }
`;

const Band = styled.div`
  flex: 1;
`;

/**
 * The project dots, pinned to the stage's right edge in line with the header's
 * Contact Me. Side-by-side stage only: not on phones, where the row stacks. They
 * fade in once the first project is on. Placement is provisional (not in Figma).
 */
const Dots = styled.div`
  display: none;

  ${STAGED} {
    @media ${STAGE_SPLIT_QUERY} {
      position: absolute;
      top: 50%;
      right: ${HEADER_INLINE.base}px;
      z-index: 2;
      display: block;
      transform: translateY(-50%);
      transition:
        opacity 400ms ease-out,
        visibility 400ms ease-out;

      &[data-shown='false'] {
        opacity: 0;
        visibility: hidden;
      }
    }
  }
`;

/**
 * How much of the screen the stage must cover before the first project comes on,
 * so its entrance plays in view rather than half below the fold.
 */
const FIRST_ENTRANCE_COVER = 0.75;
/** …less this much scroll, so it starts a little ahead of that. */
const FIRST_ENTRANCE_EARLY_PX = 450;

/**
 * Which project a scroll position shows (-1: none yet, the stage is still
 * coming up). They change halfway through each screen.
 */
/**
 * `100svh` in pixels: the height the stage is actually laid out in.
 *
 * A media query's `height` is not the same thing on a phone. Mobile Safari
 * reports the toolbar-hidden viewport there and keeps it steady as the toolbar
 * comes and goes, so it can be over 100px taller than the svh the row gets. A
 * row staged on that number has its CTA under the toolbar, which is the very
 * thing STACKED_STAGE_MIN_HEIGHT is there to prevent.
 */
function smallViewportHeight() {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
  document.body.append(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  // 0 means svh didn't take (a browser too old for it): fall back to the window.
  return height || window.innerHeight;
}

function indexAt(scrolled: number, screen: number) {
  if (scrolled < -screen * (1 - FIRST_ENTRANCE_COVER) - FIRST_ENTRANCE_EARLY_PX) return -1;
  return Math.min(COUNT - 1, Math.max(0, Math.round(scrolled / screen)));
}

export function ProjectsListSection() {
  const t = useTranslations('projectsPage');
  const items = useMessages().projectsPage.showcase.items;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [staged, setStaged] = useState(false);
  // None until the stage is mostly on screen; the first project then plays its
  // entrance like every other.
  const [active, setActive] = useState(-1);
  // Collages mount as their row comes near and then stay, so they load one at a time.
  const [seen, setSeen] = useState(() => new Set([0, 1]));

  /**
   * The attribute is written straight to the DOM before the first paint, not
   * rendered from state. State only settles after that paint, so the track
   * would spend a frame at its stacked height and the page would grow by three
   * thousand pixels underneath the reader — measured at 0.132 CLS on this page,
   * from the page glow being dragged down with it.
   */
  useLayoutEffect(() => {
    sectionRef.current?.setAttribute('data-staged', String(shouldStage()));
  }, []);

  useEffect(() => {
    const query = window.matchMedia(STAGE_QUERY);
    const stackedQuery = window.matchMedia(STAGE_STACKED_QUERY);
    const sync = () => {
      const next = shouldStage();
      sectionRef.current?.setAttribute('data-staged', String(next));
      setStaged(next);
    };
    sync();
    query.addEventListener('change', sync);
    stackedQuery.addEventListener('change', sync);
    // svh changes with the window, not with the toolbar, so a resize is the only
    // thing that can change the answer without either query changing.
    window.addEventListener('resize', sync);
    return () => {
      query.removeEventListener('change', sync);
      stackedQuery.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!staged || !track) return;

    const gate = createInViewGate(track);
    let last = -1;
    const unsubscribe = subscribeScroll<number>({
      active: () => gate.current,
      // A step is the track's height over the projects, not innerHeight: the
      // stage is 100svh, and on phones innerHeight grows as the toolbar hides.
      read: (frame) => {
        const rect = frame.rect(track);
        return indexAt(-rect.top, rect.height / COUNT);
      },
      write: (_frame, index) => {
        if (index === last) return;
        last = index;
        setActive(index);
        setSeen((prev) =>
          prev.has(index - 1) && prev.has(index) && prev.has(index + 1)
            ? prev
            : new Set([...prev, index - 1, index, index + 1]),
        );
      },
    });
    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [staged]);

  // One project per gesture; the stage animates the change, so each step is an instant jump.
  useScrollStepping(trackRef, { count: COUNT, enabled: staged });

  /** Brings a project on stage by scrolling to its screen; the stage animates the change. */
  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!staged || !track || index === active) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (index * track.offsetHeight) / COUNT, behavior: 'instant' });
  };

  // Tabbing into a project that's off stage scrolls the page to its screen.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    const row = (e.target as HTMLElement).closest('[data-index]');
    if (row) goTo(Number(row.getAttribute('data-index')));
  };

  return (
    <Section ref={sectionRef} aria-label={t('listLabel')}>
      <Track ref={trackRef}>
        <Stage onFocus={onFocus}>
          <Backdrop
            aria-hidden
            style={{ transform: `translateY(${(-Math.max(active, 0) * 100) / COUNT}%)` }}
          >
            {SHOWCASE_PROJECTS.map((project) => (
              <Band key={project.id} style={{ background: project.background }} />
            ))}
          </Backdrop>
          <Dots data-shown={active >= 0}>
            <CarouselDots
              label={t('dotsLabel')}
              labels={SHOWCASE_PROJECTS.map((project) => items[project.content].title)}
              active={active}
              onSelect={goTo}
            />
          </Dots>
          {SHOWCASE_PROJECTS.map((project, i) => (
            <div key={project.id} data-index={i} style={{ display: 'contents' }}>
              <ProjectShowcase
                project={project}
                mediaSide={i % 2 === 0 ? 'right' : 'left'}
                // Ignored when the rows stack, so the rows the server renders
                // are all "on screen" and none of them is hidden.
                active={!staged || i === active}
                showMedia={!staged || seen.has(i)}
              />
            </div>
          ))}
        </Stage>
      </Track>
    </Section>
  );
}
