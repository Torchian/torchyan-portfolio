import Image from 'next/image';
import styled from 'styled-components';
import { Button, Container, Text } from '@/components/primitives';
import { CompanyLogoMarquee } from '@/components/composites';
import { PROJECTS } from '@/components/sections/selected-work/projectsConfig';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals, glass } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { border } from '@/styles/tokens/border';
import { media } from '@/styles/media';

export const metadata = {
  title: 'Projects',
  description: 'Selected work and projects by Stepan Torchyan.',
  openGraph: {
    title: 'Projects | Stepan Torchyan',
    description: 'Selected work and projects by Stepan Torchyan.',
  },
};

const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2000]}px;
  background: ${neutrals[900]};
`;

const HeroSection = styled.section`
  padding-top: ${spacing[1000]}px;
`;

const HeroContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.xl}px;
  line-height: ${lineHeight.display.xl}px;
  letter-spacing: ${letterSpacing.xxs}px;
  text-transform: uppercase;
  text-align: center;
  color: ${accents.secondary};

  ${media.down('l')} {
    font-size: ${fontSize.display.m}px;
    line-height: ${lineHeight.display.m}px;
  }
`;

const HeroDescription = styled(Text)`
  margin: 0;
  max-width: 820px;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  text-align: center;
  color: ${neutrals[500]};
`;

const HeroFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[300]}px;
`;

const HeroFooterItem = styled(Text)`
  margin: 0;
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  letter-spacing: ${letterSpacing.m}px;
  color: ${neutrals[500]};
`;

const ProjectsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing[500]}px;
`;

const ProjectCard = styled.article<{ $reverse?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 640px;

  ${(p) => p.$reverse && 'direction: rtl;'}

  ${media.down('l')} {
    grid-template-columns: 1fr;
    min-height: auto;
    direction: ltr;
  }
`;

const ProjectInfo = styled.div`
  padding: ${spacing[500]}px ${spacing[800]}px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: ${spacing[500]}px;
  background: ${neutrals[900]};
`;

const ProjectTitle = styled.h2`
  margin: 0;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  color: ${neutrals[100]};
`;

const Roles = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${spacing[150]}px;
`;

const Role = styled.span`
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${accents.primary};
`;

const ProjectDesc = styled(Text)`
  margin: 0;
  max-width: 820px;
  color: ${neutrals[500]};
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[300]}px;
`;

const Badge = styled.span`
  border-radius: ${radius.round}px;
  border: ${border.medium}px solid ${neutrals[100]};
  background: transparent;
  color: ${neutrals[100]};
  padding: ${spacing[50]}px ${spacing[150]}px;
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  font-weight: ${fontWeight.semibold};
`;

const ProjectMedia = styled.div`
  position: relative;
  min-height: 640px;
  border-radius: ${radius.xxl}px;
  overflow: hidden;

  ${media.down('l')} {
    min-height: 420px;
  }
`;

const LogosStrip = styled.section`
  padding: ${spacing[500]}px 0;
  background: ${neutrals[800]};
`;

const SwitchSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SwitchContent = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
`;

const SwitchIntro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[300]}px;
  text-align: center;
  max-width: 900px;
`;

const SwitchHeading = styled.h2`
  margin: 0;
  text-align: center;
  color: ${neutrals[100]};
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.black};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.xxs}px;
`;

const SwitchSubtitle = styled(Text)`
  margin: 0;
  text-align: center;
  color: ${neutrals[100]};
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.regular};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
`;

const SwitchCards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing[600]}px;
  align-items: stretch;

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const SwitchCard = styled.div`
  border-radius: ${radius.xxl}px;
  padding: ${spacing[500]}px;
  background: ${glass.borderSubtle};
  box-shadow: 0 ${spacing[50]}px ${spacing[100]}px ${glass.shadow};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SwitchCardTitle = styled.h3<{ $accent: 'green' | 'pink' }>`
  margin: 0 0 ${spacing[200]}px;
  color: ${(p) => (p.$accent === 'pink' ? accents.secondary : accents.primary)};
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  text-align: center;
`;

const SwitchCardBody = styled(Text)`
  margin: 0;
  flex: 1;
  color: ${neutrals[100]};
  font-family: ${fontFamily.body};
  font-size: ${fontSize.body.l}px;
  line-height: ${lineHeight.body.l}px;
  text-align: center;
`;

const EcosystemBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[500]}px;
  width: 100%;
`;

const EcosystemLabel = styled(Text)`
  margin: 0;
  text-align: center;
  color: ${neutrals[100]};
  font-family: ${fontFamily.body};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.xl}px;
  line-height: ${lineHeight.body.xl}px;
`;

const EcosystemTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[300]}px;
  max-width: 1040px;
`;

const EcosystemTag = styled.span`
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

const BuildSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[800]}px;
  padding-bottom: ${spacing[2000]}px;
`;

const BuildTitle = styled.h2`
  margin: 0;
  color: ${neutrals[100]};
  text-align: center;
  font-family: ${fontFamily.display};
  font-weight: ${fontWeight.heading};
  font-size: ${fontSize.display.s}px;
  line-height: ${lineHeight.display.s}px;
`;

const BuildSubtitle = styled(Text)`
  margin: 0;
  color: ${neutrals[500]};
  max-width: 980px;
  text-align: center;
  font-family: ${fontFamily.heading};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
`;

const BuildCards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing[800]}px;

  ${media.down('m')} {
    grid-template-columns: 1fr;
  }
`;

const BuildCard = styled.div<{ $bg: string }>`
  background: ${(p) => p.$bg};
  border-radius: ${radius.xxl}px;
  padding: ${spacing[500]}px;
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
`;

const BuildCardHeading = styled.h3<{ $color: string }>`
  margin: 0;
  color: ${(p) => p.$color};
  text-align: center;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
`;

const BuildCardBody = styled(Text)`
  margin: 0;
  color: ${neutrals[500]};
  text-align: center;
  font-family: ${fontFamily.heading};
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
`;

const BuildCardFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const HERO_ITEMS = [
  'Deconstructing ambiguity into structure',
  'Translating business goals into user flows',
  'Architecting component ecosystems',
  'Aligning visual language with engineering reality',
  'Optimizing for accessibility, performance, and long-term maintainability',
] as const;

const LOGOS = [
  { src: '/logo/companies/SoftConstruct.svg', alt: 'SoftConstruct', width: 240, height: 48 },
  { src: '/logo/companies/Volo.svg', alt: 'Volo', width: 120, height: 48 },
  { src: '/logo/companies/Fortinet.svg', alt: 'Fortinet', width: 220, height: 48 },
  { src: '/logo/companies/Ginosi.svg', alt: 'Ginosi', width: 160, height: 42 },
  { src: '/logo/companies/byRobinblair.svg', alt: 'by robynblair', width: 180, height: 48 },
  { src: '/logo/companies/Smartbet.svg', alt: 'Smartbet', width: 180, height: 48 },
  { src: '/logo/companies/Picsart.svg', alt: 'Picsart', width: 160, height: 48 },
] as const;

const STACK_BADGES = ['React', 'JSS', 'Styled Components', 'Localization', 'WCAG Compliance'] as const;

const PROJECT_ORDER = ['picsart', 'soulone', 'smartbet', 'picsart', 'smartbet', 'soulone'] as const;

const SWITCH_MODE_CARDS = [
  {
    accent: 'green' as const,
    title: 'Design Mode',
    body:
      'Focus on system clarity, visual hierarchy, interaction patterns, and design governance.',
  },
  {
    accent: 'pink' as const,
    title: 'Engineering Mode',
    body:
      'Focus on component abstraction, state management, rendering optimization, and scalability planning.',
  },
  {
    accent: 'green' as const,
    title: 'Full-System Mode',
    body:
      'Understand how design and engineering converge into a cohesive product architecture.',
  },
] as const;

const ECOSYSTEM_TAGS = [
  'Figma variable systems',
  'Token-driven design architectures',
  'React-based component libraries',
  'CSS-in-JS systems',
  'Performance auditing frameworks',
  'Accessibility validation tools',
  'AI-assisted research and prototyping workflows',
] as const;

export default function ProjectsPage() {
  const ordered = PROJECT_ORDER.map((slug) => PROJECTS.find((p) => p.slug === slug)).filter(Boolean);

  return (
    <Page id="main-content">
      <HeroSection>
        <HeroContainer>
          <HeroTitle>Projects As Structured Systems</HeroTitle>
          <HeroDescription as="p">
            I don&apos;t treat projects as isolated deliverables. Each one is a layered
            product architecture—where research, interaction logic, visual systems, and
            engineering constraints are resolved into a scalable interface.
          </HeroDescription>
          <HeroFooter>
            {HERO_ITEMS.map((item, index) => (
              <span key={item} style={{ display: 'contents' }}>
                <HeroFooterItem as="span">{item}</HeroFooterItem>
                {index < HERO_ITEMS.length - 1 && <HeroFooterItem as="span">×</HeroFooterItem>}
              </span>
            ))}
          </HeroFooter>
        </HeroContainer>
      </HeroSection>

      <ProjectsSection>
        {ordered.map((project, index) =>
          project ? (
            <ProjectCard key={`${project.slug}-${index}`} $reverse={index % 2 === 1}>
              <ProjectInfo>
                <ProjectTitle>{project.company === 'Picsart' ? 'Picsart Marketplace' : project.company}</ProjectTitle>
                <Roles>
                  {project.roles.slice(0, 2).map((r, i) => (
                    <span key={r}>
                      <Role>{r}</Role>
                      {i === 0 && <Role aria-hidden> × </Role>}
                    </span>
                  ))}
                </Roles>
                <ProjectDesc as="p">{project.description}</ProjectDesc>
                <BadgeRow>
                  {STACK_BADGES.map((badge) => (
                    <Badge key={badge}>{badge}</Badge>
                  ))}
                </BadgeRow>
                <Button as="a" href={`/projects/${project.slug}`} $variant="secondaryPink">
                  View Case Story
                </Button>
              </ProjectInfo>
              <ProjectMedia>
                <Image
                  src={project.images[0]?.src ?? '/selected-work/picsart/Screenshot 2026-01-26 at 19.53.17.png'}
                  alt={project.images[0]?.alt ?? project.company}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </ProjectMedia>
            </ProjectCard>
          ) : null
        )}
      </ProjectsSection>

      <LogosStrip>
        <CompanyLogoMarquee logos={[...LOGOS, ...LOGOS]} rows={1} speed={55} />
      </LogosStrip>

      <SwitchSection>
        <SwitchContent>
          <SwitchIntro>
            <SwitchHeading>Switch Perspective</SwitchHeading>
            <SwitchSubtitle as="p">
              Each project can be explored through multiple lenses:
            </SwitchSubtitle>
          </SwitchIntro>
          <SwitchCards>
            {SWITCH_MODE_CARDS.map((card) => (
              <SwitchCard key={card.title}>
                <SwitchCardTitle $accent={card.accent}>{card.title}</SwitchCardTitle>
                <SwitchCardBody as="p">{card.body}</SwitchCardBody>
              </SwitchCard>
            ))}
          </SwitchCards>
          <EcosystemBlock>
            <EcosystemLabel as="p">I leverage modern ecosystems daily:</EcosystemLabel>
            <EcosystemTags>
              {ECOSYSTEM_TAGS.map((tag) => (
                <EcosystemTag key={tag}>{tag}</EcosystemTag>
              ))}
            </EcosystemTags>
          </EcosystemBlock>
        </SwitchContent>
      </SwitchSection>

      <BuildSection>
        <Container>
          <BuildTitle>Build With Structural Intent</BuildTitle>
          <BuildSubtitle as="p">
            If your product demands clarity between design vision and engineering execution,
            the next step should be deliberate—not improvised.
          </BuildSubtitle>
          <BuildCards>
            <BuildCard $bg="#0D1816">
              <BuildCardHeading $color={accents.primary}>
                Initiate a System-Level Collaboration
              </BuildCardHeading>
              <BuildCardBody as="p">
                For products requiring scalable UI governance, architectural consistency,
                and measurable performance improvements—let&apos;s define the foundation first.
              </BuildCardBody>
              <BuildCardFooter>
                <Button as="a" href="/#contact" $variant="secondary">
                  Start a Project Discussion
                </Button>
              </BuildCardFooter>
            </BuildCard>
            <BuildCard $bg="#1C0B27">
              <BuildCardHeading $color={accents.secondary}>
                Analyze Case Studies
              </BuildCardHeading>
              <BuildCardBody as="p">
                Explore projects where interface systems, frontend architecture,
                accessibility integration, and performance refinement were developed under
                real production constraints.
              </BuildCardBody>
              <BuildCardFooter>
                <Button as="a" href="/projects/picsart" $variant="secondaryPink">
                  View Random Case
                </Button>
              </BuildCardFooter>
            </BuildCard>
          </BuildCards>
        </Container>
      </BuildSection>
    </Page>
  );
}
