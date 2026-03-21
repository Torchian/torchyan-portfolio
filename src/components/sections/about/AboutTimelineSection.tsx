'use client';

import { TimelineSectionLayout } from '@/components/sections/timeline/TimelineSectionLayout';
import { TIMELINE_ENTRIES } from './timelineConfig';
import { PROJECTS } from '@/components/sections/selected-work/projectsConfig';

export function AboutTimelineSection() {
  const gridImages = PROJECTS.flatMap((p) => p.images.slice(0, 4)).slice(0, 16);

  return (
    <TimelineSectionLayout
      id="timeline"
      title="Building interface systems since 2016"
      subtitle="I work at the intersection where design decisions meet technical reality. My role is to connect intent, system logic, and execution — without losing quality along the way."
      entries={TIMELINE_ENTRIES}
      gridImages={gridImages}
    />
  );
}
