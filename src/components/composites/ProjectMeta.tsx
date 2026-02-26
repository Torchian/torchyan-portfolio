'use client';

import styled from 'styled-components';
import { Display, Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { radius } from '@/styles/tokens/radius';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
`;

const CompanyName = styled(Display)`
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[100]}px;
`;

const Tag = styled.span`
  font-size: ${fontSize.body.s}px;
  line-height: ${lineHeight.body.s}px;
  padding: ${spacing[25]}px ${spacing[100]}px;
  border-radius: ${radius.s}px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
`;

export interface ProjectMetaProps {
  company: string;
  description?: string;
  tags?: string[];
}

export function ProjectMeta({ company, description, tags }: ProjectMetaProps) {
  return (
    <Wrapper>
      <CompanyName $size="l">{company}</CompanyName>
      {description && (
        <Text $scale="body" $size="l" $color="var(--color-text-secondary)">
          {description}
        </Text>
      )}
      {tags && tags.length > 0 && (
        <Tags>
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Tags>
      )}
    </Wrapper>
  );
}
