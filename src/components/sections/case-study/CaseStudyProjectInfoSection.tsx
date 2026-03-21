'use client';

import { TimelineSectionLayout } from '@/components/sections/timeline/TimelineSectionLayout';
import { getCaseStudyContent, padGridImages } from '@/components/sections/case-study/caseStudyContent';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';

export interface CaseStudyProjectInfoSectionProps {
  project: ProjectConfig;
}

export function CaseStudyProjectInfoSection({ project }: CaseStudyProjectInfoSectionProps) {
  const content = getCaseStudyContent(project);
  const gridImages = padGridImages(project.images, 16);

  return (
    <TimelineSectionLayout
      id="case-study-project-info"
      title={content.timelineHeading}
      subtitle={content.timelineSubtitle}
      entries={content.timeline}
      gridImages={gridImages}
    />
  );
}
