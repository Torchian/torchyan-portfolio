'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { ProjectStickyCard } from './ProjectStickyCard';
import { PROJECTS } from './projectsConfig';
import { spacing } from '@/styles/tokens/spacing';
import { useEffect, useRef } from 'react';

const Section = styled.section``;

const ProjectsStack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: ${spacing[800]}px;
`;

/**
 * How far into the gap between two cards you need to travel before the scroll
 * commits to the next one, as a fraction of the viewport. It's applied in
 * whichever direction you're scrolling, so going back up commits just as
 * readily as going down (a plain nearest-card rule would be a 50% midpoint,
 * which makes the next card feel reluctant to come in).
 */
const COMMIT_THRESHOLD = 0.2;

/**
 * CSS scroll-snap alone uses "proximity", which deliberately leaves you alone
 * when a scroll ends far from any snap point — fine in general, but for
 * full-screen stacked cards it means you can stop half-on-one/half-on-another
 * and nothing pulls you out of it.
 *
 * This commits to a card once scrolling has fully stopped, but ONLY while the
 * scroll position is between the first and last card boundary. Outside that
 * range it does nothing, so it can never fight you on the way into or out of
 * the section (which is what plain `mandatory` snapping would do). Near-miss
 * cases are still handled natively by CSS before this runs.
 */
function useMagneticStack(
  stackRef: React.RefObject<HTMLDivElement | null>,
  count: number,
) {
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = Array.from(
      stack.querySelectorAll<HTMLElement>('[data-project-card]'),
    );

    let lastY = window.scrollY;
    let goingDown = true;
    let committing = false;
    let releaseTimer: ReturnType<typeof setTimeout>;
    let rafId = 0;

    const frame = () => {
      rafId = 0;
      const vh = window.innerHeight;
      const stackTop = stack.getBoundingClientRect().top + window.scrollY;
      const y = window.scrollY;
      const progress = (y - stackTop) / vh;

      // Drive the organic magnification: each card's own 0→1 traversal.
      for (let i = 0; i < cards.length; i++) {
        const p = Math.min(1, Math.max(0, progress - i));
        cards[i].style.setProperty('--card-progress', p.toFixed(4));
      }

      if (reduceMotion || committing || count < 2) return;

      // Only commit while between the first and last card — never on the
      // approach to the section or on the way out of it.
      const lastSnap = stackTop + (count - 1) * vh;
      if (y < stackTop || y > lastSnap) return;

      // Travelling more than COMMIT_THRESHOLD of a viewport toward the next
      // card commits to it; less than that falls back to the one you came from.
      const index = goingDown
        ? Math.ceil(progress - COMMIT_THRESHOLD)
        : Math.floor(progress + COMMIT_THRESHOLD);
      const clamped = Math.min(count - 1, Math.max(0, index));
      const target = Math.round(stackTop + clamped * vh);
      if (Math.abs(target - y) < 2) return; // already settled

      // Fire the moment the threshold is crossed rather than waiting for the
      // scroll to come to rest — the pull should feel like it's meeting the
      // user, not like a correction applied after the fact. If their remaining
      // momentum overrides this scroll, the re-check on release settles it.
      committing = true;
      window.scrollTo({ top: target, behavior: 'smooth' });
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => {
        committing = false;
        schedule();
      }, 550);
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) goingDown = y > lastY;
      lastY = y;
      schedule();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(rafId);
      clearTimeout(releaseTimer);
    };
  }, [stackRef, count]);
}

export function SelectedWorkSection() {
  const stackRef = useRef<HTMLDivElement>(null);
  useMagneticStack(stackRef, PROJECTS.length);

  return (
    <Section id="work">
      <Container>
        <SectionHeading title="Selected Work" subtitle="Projects that shaped my craft" />
      </Container>
      <ProjectsStack ref={stackRef}>
        {PROJECTS.map((project, i) => (
          <ProjectStickyCard key={i} project={project} />
        ))}
      </ProjectsStack>
    </Section>
  );
}
