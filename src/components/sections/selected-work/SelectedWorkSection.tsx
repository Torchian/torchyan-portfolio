'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { AllProjectsStickyCard, ProjectStickyCard } from './ProjectStickyCard';
import { FEATURED_PROJECTS } from './projectsConfig';
import { spacing } from '@/styles/tokens/spacing';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
import { mediaQueries } from '@/styles/media';
import { useScrollStepping } from '@/hooks';

const Section = styled.section``;

const ProjectsStack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: ${spacing[800]}px;
`;

/** The scroll from one card to the next: long enough to read each card's magnification. */
const STEP_MS = 600;

/**
 * Where the stack steps card by card instead of scrolling freely: desktop only.
 *
 * Stepping has to take the gesture away from the browser — a non-passive
 * `touchmove` that cancels the page's own scroll — and on a touch screen that
 * is the wrong trade. A wheel notch is a discrete thing to turn into a step; a
 * swipe is not. The finger stops moving the page, the momentum it expects never
 * arrives, and one flick that should have carried through three cards instead
 * lands on one. Pointing devices keep the stepping, which is what it was
 * designed around; touch gets the plain sticky stack, which reads the same and
 * follows the finger.
 *
 * The pointer is the condition, not the width: a large tablet in landscape is
 * wider than the desktop breakpoint and still has only a finger. The width is
 * kept alongside it because the card's own layout switches there.
 */
const STEP_QUERY = `${mediaQueries.up('xl')} and (hover: hover) and (pointer: fine)`;

/**
 * Drives each card's `--card-progress` (its own 0 → 1 traversal) for the
 * organic magnification in ProjectStickyCard, writing only when the value
 * changes, and flags the cards mid-traversal with `data-magnifying`. The
 * stepping from card to card is useScrollStepping's.
 */
function useCardProgress(stackRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = Array.from(stack.querySelectorAll<HTMLElement>('[data-project-card]'));
    const lastProgress = cards.map(() => '');
    const lastMagnifying = cards.map(() => false);
    const gate = createInViewGate(stack);

    const unsubscribe = subscribeScroll<{ top: number; card: number }>({
      active: () => gate.current,
      // The stack's top in document coordinates, and how tall one card is.
      // A card's height is the stack's over the cards in it — not
      // `innerHeight`, which on a phone is the shorter, toolbar-shown viewport
      // while the cards are laid out in `vh`. Dividing by that number made a
      // card reach `--card-progress: 1` before it had been scrolled through.
      read: (frame) => {
        const rect = frame.rect(stack);
        return { top: rect.top + frame.y, card: rect.height / cards.length };
      },
      write: (frame, { top: stackTop, card }) => {
        const progress = (frame.y - stackTop) / card;
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
    });

    return () => {
      unsubscribe();
      gate.disconnect();
    };
  }, [stackRef]);
}

export function SelectedWorkSection() {
  const t = useTranslations('selectedWork');
  const stackRef = useRef<HTMLDivElement>(null);
  const [stepping, setStepping] = useState(false);
  useCardProgress(stackRef);

  // Off until measured, so a touch screen never gets the listeners even briefly.
  useEffect(() => {
    const query = window.matchMedia(STEP_QUERY);
    const sync = () => setStepping(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // One card per scroll gesture, however big: the case studies, then the all-projects card.
  useScrollStepping(stackRef, { count: FEATURED_PROJECTS.length + 1, enabled: stepping, stepMs: STEP_MS });

  return (
    <Section id="work">
      <Container>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
      </Container>
      <ProjectsStack ref={stackRef}>
        {FEATURED_PROJECTS.map((project) => (
          <ProjectStickyCard key={project.slug} project={project} />
        ))}
        <AllProjectsStickyCard />
      </ProjectsStack>
    </Section>
  );
}
