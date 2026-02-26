'use client';

import styled from 'styled-components';
import { Text, GreenDot } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing[200]}px;
  padding: ${spacing[200]}px 0;
`;

const DotWrapper = styled.span`
  display: flex;
  align-items: center;
  height: 24px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[50]}px;
`;

export interface CapabilityListItemProps {
  title: string;
  description?: string;
}

export function CapabilityListItem({ title, description }: CapabilityListItemProps) {
  return (
    <Wrapper>
      <DotWrapper>
        <GreenDot $size="sm" />
      </DotWrapper>
      <Content>
        <Text $scale="body" $size="l" $weight="semibold">
          {title}
        </Text>
        {description && (
          <Text $scale="body" $size="m" $color="var(--color-text-secondary)">
            {description}
          </Text>
        )}
      </Content>
    </Wrapper>
  );
}
