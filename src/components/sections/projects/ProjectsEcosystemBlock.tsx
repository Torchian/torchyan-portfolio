'use client';

import styled from 'styled-components';
import { Text } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontWeight, fontSize, lineHeight } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { ECOSYSTEM_TAGS } from './projectsPageConfig';

const Block = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[500]}px;
  width: 100%;
`;

const Label = styled(Text)`
  margin: 0;
  text-align: center;
  color: ${neutrals[100]};
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[300]}px;
  max-width: 1040px;
`;

const Tag = styled.span`
  border-radius: ${radius.round}px;
  background: ${neutrals[100]};
  color: ${neutrals[900]};
  padding: ${spacing[100]}px ${spacing[200]}px;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  font-weight: ${fontWeight.semibold};
  text-align: center;
`;

export function ProjectsEcosystemBlock() {
  return (
    <Block>
      <Label as="p">I leverage modern ecosystems daily:</Label>
      <Tags>
        {ECOSYSTEM_TAGS.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Tags>
    </Block>
  );
}
