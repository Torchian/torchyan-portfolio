'use client';

import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';
import { radius } from '@/styles/tokens/radius';
import { fontSize, lineHeight, fontWeight, letterSpacing, fontFamily } from '@/styles/tokens/typography';
import { fluidFontSize, fluidLineHeight } from '@/styles/fluid';
import { spacing } from '@/styles/tokens/spacing';
import { neutrals, glass, transparents } from '@/styles/tokens/colors';
import { grid } from '@/styles/tokens/grid';
import { breakpoints } from '@/styles/tokens/breakpoints';
import { duration, easing } from '@/styles/tokens/motion';
import { media } from '@/styles/media';
import type { ProjectConfig } from './projectsConfig';

const CardWrapper = styled.article`
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  isolation: isolate;
`;

const ProjectBackground = styled.div<{ $gradient: string }>`
  position: absolute;
  inset: 0;
  background: ${(p) => p.$gradient};
  z-index: 0;
`;

const ProjectContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing[300]}px;
  width: 100%;
  max-width: ${grid.maxWidth}px;
  margin: 0 auto;
  padding: 0 ${spacing[400]}px;

  ${media.down('m')} {
    gap: ${spacing[400]}px;
    padding: 0 ${spacing[300]}px;
  }
`;

const ProjectHeader = styled(ProjectContainer)`
  padding-top: ${spacing[2000]}px;
  padding-bottom: ${spacing[300]}px;
`;

const ProjectFooter = styled(ProjectContainer)`
  padding-top: ${spacing[300]}px;
  padding-bottom: ${spacing[1000]}px;
`;

const ProjectHeading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[600]}px;
  width: 100%;

  ${media.down('m')} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ProjectCompany = styled.h2`
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fluidFontSize.display.m};
  line-height: ${fluidLineHeight.display.m};
  color: ${neutrals[100]};
  margin: 0;

  ${media.down('l')} {
    font-size: ${fluidFontSize.display.s};
    line-height: ${fluidLineHeight.display.s};
  }

  ${media.down('m')} {
    font-size: ${fluidFontSize.heading.l};
    line-height: ${fluidLineHeight.heading.l};
  }
`;

const ProjectRoles = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${spacing[300]}px;
  flex-shrink: 0;
`;

const ProjectRole = styled.span`
  font-family: var(--font-gilroy), sans-serif;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  letter-spacing: ${letterSpacing.s}px;
  color: ${neutrals[100]};
`;

const ProjectVisuals = styled.div`
  position: relative;
  width: 100%;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProjectCard = styled.div`
  position: relative;
  width: calc(100% - 2 * ${spacing[400]}px);
  max-width: 100%;
  margin: 0 auto;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: ${radius.xl}px;
  background: transparent;
`;

const GridWrapper = styled.div<{ $rotation: number }>`
  transform: rotate(${(p) => p.$rotation}deg) scale(1.2);
  transform-origin: center center;
  width: 100%;
`;

const MasonryColumn = styled.div`
  flex: 1;
  overflow: hidden;
  min-width: 0;
`;

const MasonryColumnTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[300]}px;
  transform: translateY(0);
  transition: transform ${duration.slowest} ${easing.inOut};
`;

const MasonryGrid = styled.div`
  display: flex;
  gap: ${spacing[300]}px;
  width: 100%;
  overflow: hidden;

  &:hover ${MasonryColumn}:nth-child(odd) ${MasonryColumnTrack} {
    transform: translateY(-8%);
  }
  &:hover ${MasonryColumn}:nth-child(even) ${MasonryColumnTrack} {
    transform: translateY(12%);
  }
`;

const MasonryItem = styled.div`
  overflow: hidden;
  border-radius: ${radius.m}px;
  flex-shrink: 0;
  transition: transform ${duration.slower} ${easing.spring};

  img {
    width: 100%;
    height: auto;
    display: block;
    vertical-align: bottom;
  }
`;

const IsometricGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[400]}px;
  transform: perspective(${breakpoints.xl}px) rotateX(8deg) rotateY(-5deg);
  transform-style: preserve-3d;

  ${media.down('m')} {
    transform: perspective(${breakpoints.l}px) rotateX(5deg);
    gap: ${spacing[300]}px;
  }
`;

const IsometricRow = styled.div`
  display: flex;
  gap: ${spacing[400]}px;
  justify-content: center;
  flex-wrap: wrap;
`;

const IsometricCard = styled.div`
  width: ${spacing[2000] + spacing[500]}px;
  height: ${spacing[1000] + spacing[600] + spacing[150]}px;
  border-radius: ${radius.l}px;
  overflow: hidden;
  background: ${glass.shadow};
  box-shadow: 0 ${spacing[250]}px ${spacing[500]}px ${glass.shadow};
  transition: transform ${duration.normal} ease;

  ${media.up('m')} {
    width: ${spacing[2000] + spacing[1000] + spacing[500]}px;
    height: ${spacing[1000] + spacing[800] + spacing[600] + spacing[50]}px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderCTA = styled(Link)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing[300]}px ${spacing[500]}px;
  background: ${glass.shadow};
  border-radius: ${radius.round}px;
  font-family: var(--font-gilroy), sans-serif;
  font-weight: ${fontWeight.semibold};
  font-size: ${fluidFontSize.heading.s};
  line-height: ${fluidLineHeight.heading.s};
  color: ${neutrals[100]};
  text-decoration: none;
  z-index: 2;
  transition: background ${duration.fast} ease;

  &:hover {
    background: ${glass.bgMedium};
  }
`;

const ProjectBody = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  gap: ${spacing[300]}px;
  width: 100%;

  ${media.down('m')} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[200]}px;
`;

const ProjectTitle = styled.h3`
  font-family: var(--font-gilroy), sans-serif;
  font-weight: ${fontWeight.medium};
  font-size: ${fluidFontSize.heading.m};
  line-height: ${fluidLineHeight.heading.m};
  color: ${neutrals[100]};
  margin: 0;
`;

const ProjectDescription = styled.p`
  font-family: var(--font-gilroy), sans-serif;
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  color: ${neutrals[100]};
  margin: 0;
  max-width: ${grid.maxWidth / 2 + grid.margin}px;
`;

const ProjectField = styled.span`
  font-family: var(--font-gilroy), sans-serif;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[100]};
`;

const CaseStudyLink = styled(Link)`
  font-family: var(--font-gilroy), sans-serif;
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
  color: ${neutrals[100]};
  text-decoration: none;
  margin-top: ${spacing[200]}px;
  display: inline-flex;
  align-items: center;
  transition: opacity ${duration.normal} ${easing.inOut};

  &:hover {
    opacity: 0.85;
  }
`;

const PlaceholderCard = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${transparents.transparent25} 0%, ${transparents.transparent4} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${fontSize.body.s}px;
  color: ${neutrals[500]};
`;

export interface ProjectStickyCardProps {
  project: ProjectConfig;
}

export function ProjectStickyCard({ project }: ProjectStickyCardProps) {
  const hasImages = project.images.length > 0;
  const images = project.images.length > 0
    ? project.images
    : Array.from({ length: 6 }, (_, i) => ({ src: '', alt: `Preview ${i + 1}` }));

  return (
    <CardWrapper>
      <ProjectBackground $gradient={project.gradient} />
      <ProjectHeader as="header">
        <ProjectHeading>
          <ProjectCompany>{project.company}</ProjectCompany>
          <ProjectRoles>
            {project.roles.flatMap((role, i) =>
              i === 0
                ? [<ProjectRole key={i}>{role}</ProjectRole>]
                : [<span key={`sep-${i}`}> × </span>, <ProjectRole key={i}>{role}</ProjectRole>]
            )}
          </ProjectRoles>
        </ProjectHeading>
      </ProjectHeader>

      {hasImages ? (
        <ProjectCard>
          <GridWrapper $rotation={project.masonryRotation ?? 45}>
            <MasonryGrid>
              {(project.masonryColumnImages ?? (() => {
                const cols = project.masonryColumns ?? 4;
                const order = project.masonryColumnOrder ?? Array.from({ length: cols }, (_, i) => i);
                return Array.from({ length: cols }, (_, displayIndex) => {
                  const colIndex = order[displayIndex] ?? displayIndex;
                  return project.images.filter((_, i) => i % cols === colIndex);
                });
              })()).map((columnImages, displayIndex) => {
                const cols = project.masonryColumns ?? 4;
                const imgWidth = cols >= 5 ? 1600 : 1200;
                return (
                  <MasonryColumn key={displayIndex}>
                    <MasonryColumnTrack>
                      {[...columnImages, ...columnImages].map((img, i) => (
                        <MasonryItem key={i}>
                          <Image
                            src={img.src}
                            alt={img.alt}
                            width={imgWidth}
                            height={Math.round(imgWidth * 0.75)}
                            quality={95}
                            sizes={`(max-width: 768px) 100vw, ${100 / cols}vw`}
                            loading="lazy"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                          />
                        </MasonryItem>
                      ))}
                    </MasonryColumnTrack>
                  </MasonryColumn>
                );
              })}
            </MasonryGrid>
          </GridWrapper>
        </ProjectCard>
      ) : (
        <ProjectVisuals>
          <IsometricGrid>
            <IsometricRow>
              {images.slice(0, 3).map((img, i) => (
                <IsometricCard key={i}>
                  {img.src ? (
                    <Image src={img.src} alt={img.alt} width={280} height={196} />
                  ) : (
                    <PlaceholderCard>Preview</PlaceholderCard>
                  )}
                </IsometricCard>
              ))}
            </IsometricRow>
            <IsometricRow>
              {images.slice(3, 6).map((img, i) => (
                <IsometricCard key={i}>
                  {img.src ? (
                    <Image src={img.src} alt={img.alt} width={280} height={196} />
                  ) : (
                    <PlaceholderCard>Preview</PlaceholderCard>
                  )}
                </IsometricCard>
              ))}
            </IsometricRow>
          </IsometricGrid>
          {project.href && (
            <PlaceholderCTA href={`/projects/${project.slug}`}>View Case</PlaceholderCTA>
          )}
        </ProjectVisuals>
      )}

      <ProjectFooter as="footer">
        <ProjectBody>
          <ProjectInfo>
            <ProjectTitle>{project.title}</ProjectTitle>
            <ProjectDescription>{project.description}</ProjectDescription>
          </ProjectInfo>
          <ProjectField>{project.field} · {project.year}</ProjectField>
          <CaseStudyLink href={`/projects/${project.slug}`}>
            View case study →
          </CaseStudyLink>
        </ProjectBody>
      </ProjectFooter>
    </CardWrapper>
  );
}
