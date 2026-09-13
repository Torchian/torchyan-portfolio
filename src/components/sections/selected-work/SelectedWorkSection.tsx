'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { ProjectStickyCard } from './ProjectStickyCard';
import { PROJECTS } from './projectsConfig';
import { spacing } from '@/styles/tokens/spacing';
import { useEffect, useRef } from 'react';
import {
  beginProgrammaticScroll,
  createInViewGate,
  endProgrammaticScroll,
  onUserInput,
  subscribeScroll,
} from '@/lib/scroll-driver';

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
 * Snap animation length: proportional to the distance travelled, clamped so a
 * short correction still feels snappy and a full-card move never drags.
 */
const SNAP_MIN_MS = 200;
const SNAP_MAX_MS = 450;
const SNAP_MS_PER_PX = 0.55;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Commits the stack to a card once scrolling has stopped, but ONLY while the
 * scroll position is between the first and last card boundary — never on the
 * way into or out of the section. There is no CSS scroll-snap involved; this is
 * the only thing snapping.
 *
 * Two rules keep it from fighting the user:
 *  - It only commits once the shared scroll driver reports idle: no scroll
 *    events, no wheel/trackpad momentum, no finger or mouse button down.
 *    Committing mid-gesture is what made the page stutter against the user's
 *    own scroll.
 *  - It animates the snap itself, one frame at a time, so a wheel, touch or
 *    scroll key cancels it on the spot. A native smooth scroll can't be
 *    cancelled or observed, and `html { scroll-behavior: smooth }` (kept for
 *    anchor links) would turn every step into its own smooth scroll — hence
 *    `behavior: 'instant'` on each step.
 *
 * It also drives each card's `--card-progress` (its own 0 → 1 traversal) for
 * the organic magnification in ProjectStickyCard, writing only when the value
 * changes, and flags the cards mid-traversal with `data-magnifying`.
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
    const lastProgress = cards.map(() => '');
    const lastMagnifying = cards.map(() => false);
    const gate = createInViewGate(stack);
    let snapRaf = 0;

    const cancelSnap = () => {
      if (!snapRaf) return;
      cancelAnimationFrame(snapRaf);
      snapRaf = 0;
      endProgrammaticScroll();
    };

    const snapTo = (target: number) => {
      const from = window.scrollY;
      const distance = target - from;
      const duration = Math.min(
        SNAP_MAX_MS,
        Math.max(SNAP_MIN_MS, Math.abs(distance) * SNAP_MS_PER_PX),
      );
      const startedAt = performance.now();
      let expectedY = from;

      beginProgrammaticScroll();
      const step = (now: number) => {
        // Something other than this animation moved the page since the last
        // step (a keyboard-activated anchor link, find-in-page, another script)
        // — input onUserInput can't see. Yield to it rather than drag the page
        // back to our target.
        if (Math.abs(window.scrollY - expectedY) > 2) {
          snapRaf = 0;
          endProgrammaticScroll();
          return;
        }
        const t = Math.min(1, Math.max(0, (now - startedAt) / duration));
        expectedY = from + distance * easeOutCubic(t);
        window.scrollTo({ top: expectedY, behavior: 'instant' });
        if (t < 1) {
          snapRaf = requestAnimationFrame(step);
          return;
        }
        snapRaf = 0;
        endProgrammaticScroll();
      };
      snapRaf = requestAnimationFrame(step);
    };

    // The user always wins: any wheel tick, touch, click or scroll key stops a
    // snap dead, and nothing re-commits until they've stopped again.
    const stopListeningForInput = onUserInput(cancelSnap);

    const unsubscribe = subscribeScroll<number>({
      active: () => gate.current,
      // The stack's top in document coordinates.
      read: (frame) => frame.rect(stack).top + frame.y,
      write: (frame, stackTop) => {
        if (reduceMotion) return;
        const progress = (frame.y - stackTop) / frame.vh;
        for (let i = 0; i < cards.length; i++) {
          const p = Math.min(1, Math.max(0, progress - i));
          const value = p.toFixed(3);
          if (value !== lastProgress[i]) {
            cards[i].style.setProperty('--card-progress', value);
            lastProgress[i] = value;
          }
          const magnifying = p > 0 && p < 1;
          if (magnifying !== lastMagnifying[i]) {
            cards[i].toggleAttribute('data-magnifying', magnifying);
            lastMagnifying[i] = magnifying;
          }
        }
      },
      onIdle: (frame) => {
        if (reduceMotion || count < 2 || snapRaf) return;

        const stackTop = frame.rect(stack).top + frame.y;
        const lastSnap = stackTop + (count - 1) * frame.vh;
        if (frame.y < stackTop || frame.y > lastSnap) return;

        // Travelling more than COMMIT_THRESHOLD of a viewport toward the next
        // card commits to it; less than that falls back to the one you came
        // from. frame.direction is the user's last real direction — our own
        // snap animation can't overwrite it.
        const progress = (frame.y - stackTop) / frame.vh;
        const index = frame.direction > 0
          ? Math.ceil(progress - COMMIT_THRESHOLD)
          : Math.floor(progress + COMMIT_THRESHOLD);
        const clamped = Math.min(count - 1, Math.max(0, index));
        const target = Math.round(stackTop + clamped * frame.vh);
        if (Math.abs(target - frame.y) < 2) return; // already settled

        snapTo(target);
      },
    });

    return () => {
      stopListeningForInput();
      cancelSnap();
      unsubscribe();
      gate.disconnect();
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
