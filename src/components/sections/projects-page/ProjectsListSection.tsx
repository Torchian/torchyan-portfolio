'use client';

import { useEffect, useRef, useState, type FocusEvent } from 'react';
import styled from 'styled-components';
import { useMessages, useTranslations } from 'next-intl';
import { CarouselDots } from '@/components/primitives';
import { HEADER_INLINE } from '@/components/layouts/NavBar';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import { ProjectShowcase } from './ProjectShowcase';
import { SHOWCASE_PROJECTS, STAGE_QUERY, STAGE_SPLIT_QUERY } from './projectShowcaseConfig';
import { useStageStepping } from './useStageStepping';

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
 * begins with, so the ten read as one gradient down the page.
 */

const COUNT = SHOWCASE_PROJECTS.length;
const stage = `@media ${STAGE_QUERY}`;

const Section = styled.section`
  /* The Figma frame ends 160px below the last row, on top of the page's section gap. */

  ${media.down('xl')} {
    padding-bottom: ${spacing[1000]}px;
  }
`;

/** The scroll runway: one screen per project. */
const Track = styled.div`
  ${stage} {
    height: ${COUNT * 100}svh;
  }
`;

const Stage = styled.div`
  display: flex;
  flex-direction: column;

  ${stage} {
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

  ${stage} {
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
`;

/**
 * How much of the screen the stage must cover before the first project comes on,
 * so its entrance plays in view rather than half below the fold.
 */
const FIRST_ENTRANCE_COVER = 0.75;
/** …less this much scroll, so it starts a little ahead of that. */
const FIRST_ENTRANCE_EARLY_PX = 200;

/**
 * Which project a scroll position shows (-1: none yet, the stage is still
 * coming up). They change halfway through each screen.
 */
function indexAt(scrolled: number, screen: number) {
  if (scrolled < -screen * (1 - FIRST_ENTRANCE_COVER) - FIRST_ENTRANCE_EARLY_PX) return -1;
  return Math.min(COUNT - 1, Math.max(0, Math.round(scrolled / screen)));
}

export function ProjectsListSection() {
  const t = useTranslations('projectsPage');
  const items = useMessages().projectsPage.showcase.items;
  const trackRef = useRef<HTMLDivElement>(null);
  const [staged, setStaged] = useState(false);
  // None until the stage is mostly on screen; the first project then plays its
  // entrance like every other.
  const [active, setActive] = useState(-1);
  // Collages mount as their row comes near and then stay, so they load one at a time.
  const [seen, setSeen] = useState(() => new Set([0, 1]));

  useEffect(() => {
    const query = window.matchMedia(STAGE_QUERY);
    const sync = () => setStaged(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
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

  useStageStepping(trackRef, COUNT, staged);

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
    <Section aria-label={t('listLabel')}>
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
                // Only read on the stage (the CSS ignores it otherwise), so the
                // server HTML already stages correctly before hydration.
                stage={i < active ? 'past' : i === active ? 'active' : 'upcoming'}
                showMedia={!staged || seen.has(i)}
              />
            </div>
          ))}
        </Stage>
      </Track>
    </Section>
  );
}
