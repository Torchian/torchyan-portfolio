'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Badge, Display } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
`;

const CompanyName = styled(Display)`
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;

  /* A phone is too narrow for a long name at the desktop size: it ran off the edge. */
  ${media.down('m')} {
    font-size: ${fontSize.display.s}px;
    line-height: ${lineHeight.display.s}px;
  }
`;

/** What the project is, in the heading type (as the full case's subtitle, a step down for a left-aligned hero). */
const Subtitle = styled.p`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.m}px;
  line-height: ${lineHeight.heading.m}px;
  letter-spacing: ${letterSpacing.xs}px;
  color: ${neutrals[100]};

  ${media.down('m')} {
    font-size: ${fontSize.body.xl}px;
    line-height: ${lineHeight.body.xl}px;
  }
`;

/** The roles, as the system's badges: Large on desktop, Medium on a tablet, Small on a phone (Figma Badge atom). */
const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[200]}px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.down('xl')} {
    li > * {
      height: 24px;
      padding: ${spacing[50]}px ${spacing[200]}px;
      font-size: ${fontSize.body.l}px;
      line-height: ${lineHeight.body.l}px;
      letter-spacing: ${letterSpacing.m}px;
    }
  }

  ${media.down('m')} {
    gap: ${spacing[100]}px;

    li > * {
      height: 22px;
      padding: ${spacing[50]}px ${spacing[150]}px;
      font-size: ${fontSize.body.m}px;
      line-height: ${lineHeight.body.m}px;
      letter-spacing: ${letterSpacing.s}px;
    }
  }
`;

export interface ProjectMetaProps {
  company: string;
  /** Shown straight under the company's name: a case hero puts the brand's mark here on smaller screens. */
  mark?: ReactNode;
  description?: string;
  tags?: string[];
}

export function ProjectMeta({ company, mark, description, tags }: ProjectMetaProps) {
  return (
    <Wrapper>
      <CompanyName $size="m">{company}</CompanyName>
      {mark}
      {description && <Subtitle>{description}</Subtitle>}
      {tags && tags.length > 0 && (
        <Tags>
          {tags.map((tag) => (
            <li key={tag}>
              <Badge $size="large">{tag}</Badge>
            </li>
          ))}
        </Tags>
      )}
    </Wrapper>
  );
}
