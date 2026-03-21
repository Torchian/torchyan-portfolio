'use client';

import styled from 'styled-components';
import { Text } from '@/components/primitives';
import { ProjectMeta } from '@/components/composites/ProjectMeta';
import { ScreenshotGallery } from '@/components/composites/ScreenshotGallery';
import { spacing } from '@/styles/tokens/spacing';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';
import { duration, easing } from '@/styles/tokens/motion';

const Card = styled.article`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing[400]}px;
  padding: ${spacing[400]}px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: ${radius.xl}px;
  transition: border-color ${duration.normal} ${easing.out};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: var(--color-border-secondary);
    }
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing[400]}px;

  ${media.down('m')} {
    flex-direction: column;
  }
`;

const ViewLink = styled.a`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-accent-primary);
  white-space: nowrap;
  cursor: pointer;
  transition: opacity ${duration.fast} ${easing.out};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      opacity: 0.7;
    }
  }
`;

export interface SelectedWorkCardProps {
  company: string;
  description?: string;
  tags?: string[];
  images: { src: string; alt: string }[];
  href?: string;
}

export function SelectedWorkCard({
  company,
  description,
  tags,
  images,
  href,
}: SelectedWorkCardProps) {
  return (
    <Card>
      <MetaRow>
        <ProjectMeta company={company} description={description} tags={tags} />
        {href && <ViewLink href={href}>View Project &rarr;</ViewLink>}
      </MetaRow>
      <ScreenshotGallery images={images} />
    </Card>
  );
}
