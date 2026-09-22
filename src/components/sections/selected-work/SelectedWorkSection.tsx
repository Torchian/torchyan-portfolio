'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { AllProjectsStickyCard, ProjectStickyCard } from './ProjectStickyCard';
import { PROJECTS } from './projectsConfig';
import { spacing } from '@/styles/tokens/spacing';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { createInViewGate, subscribeScroll } from '@/lib/scroll-driver';
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

    const unsubscribe = subscribeScroll<number>({
      active: () => gate.current,
      // The stack's top in document coordinates.
      read: (frame) => frame.rect(stack).top + frame.y,
      write: (frame, stackTop) => {
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
  useCardProgress(stackRef);
  // One card per scroll gesture, however big: the case studies, then the all-projects card.
  useScrollStepping(stackRef, { count: PROJECTS.length + 1, screen: 'viewport', stepMs: STEP_MS });

  return (
    <Section id="work">
      <Container>
        <SectionHeading title={t('title')} subtitle={t('subtitle')} />
      </Container>
      <ProjectsStack ref={stackRef}>
        {PROJECTS.map((project) => (
          <ProjectStickyCard key={project.slug} project={project} />
        ))}
        <AllProjectsStickyCard />
      </ProjectsStack>
    </Section>
  );
}
