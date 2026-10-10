'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { HEADER_INLINE } from '@/components/layouts/NavBar';
import { ProjectMeta } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { fontSize, lineHeight, fontWeight, fontFamily } from '@/styles/tokens/typography';
import { neutrals } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { useMessages } from 'next-intl';
import type { ProjectConfig } from '@/components/sections/selected-work/projectsConfig';

const Section = styled.section<{ $gradient: string }>`
  position: relative;
  padding: ${spacing[2000]}px 0 ${spacing[1000]}px;
  background: ${(p) => p.$gradient};
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  ${media.down('m')} {
    padding: ${spacing[1000]}px 0 ${spacing[800]}px;
    min-height: 50vh;
  }
`;

/*
 * Text on the left; the brand's own mark on the right, where the band would
 * otherwise stand empty. A tablet and a phone have no room beside the text:
 * the mark sits under the name, small.
 */
const Content = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  align-items: end;
  column-gap: ${spacing[800]}px;
  row-gap: ${spacing[600]}px;

  /* Lined up with the header: its own three steps (32, 24, 16). */
  padding-inline: ${HEADER_INLINE.base}px;

  ${media.down('xl')} {
    padding-inline: ${HEADER_INLINE.tablet}px;
  }

  ${media.down('m')} {
    padding-inline: ${HEADER_INLINE.mobile}px;
  }

  ${media.down('xl')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  min-width: 0;
`;

/**
 * The mark, centred in its column, as large as the column allows (never more
 * than its own pixels need). On a tablet and a phone there's no column to
 * spare beside the text, and a mark on its own above the name read as a stray:
 * it moves under the name instead (UnderName).
 */
const Logo = styled.div`
  align-self: center;

  img {
    display: block;
    width: 100%;
    height: 200px;
    object-fit: contain;
  }

  ${media.down('xl')} {
    display: none;
  }
`;

const UnderName = styled.div`
  display: none;

  ${media.down('xl')} {
    display: block;

    img {
      display: block;
      width: auto;
      max-width: 100%;
      height: 64px;
      object-fit: contain;
      object-position: left center;
    }
  }

  ${media.down('m')} {
    img {
      height: 48px;
    }
  }
`;

const Title = styled.h1`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  color: ${neutrals[100]};
  margin: 0;
  max-width: 800px;

  ${media.down('l')} {
    font-size: ${fontSize.heading.l}px;
    line-height: ${lineHeight.heading.l}px;
  }

  ${media.down('m')} {
    font-size: ${fontSize.heading.m}px;
    line-height: ${lineHeight.heading.m}px;
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${spacing[300]}px;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[100]};
`;

export interface CaseStudyHeroSectionProps {
  project: ProjectConfig;
}

export function CaseStudyHeroSection({ project }: CaseStudyHeroSectionProps) {
  const content = useMessages().projects[project.slug];

  return (
    <Section $gradient={project.gradient}>
      <Content>
        <Text>
          <ProjectMeta
            company={project.company}
            mark={
              project.logo && (
                <UnderName>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.logo} alt="" />
                </UnderName>
              )
            }
            description={content.title}
            tags={content.roles}
          />
          <Title as="p">{content.description}</Title>
          <MetaRow>
            <span>{content.field}</span>
            {project.year && (
              <>
                <span aria-hidden>·</span>
                <span>{project.year}</span>
              </>
            )}
          </MetaRow>
        </Text>
        {project.logo && (
          <Logo>
            {/* A brand's own mark, SVG or a small PNG: next/image adds nothing. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.logo} alt="" />
          </Logo>
        )}
      </Content>
    </Section>
  );
}
