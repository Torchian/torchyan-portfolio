'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading } from '@/components/composites';
import { SelectedWorkCard, type SelectedWorkCardProps } from './SelectedWorkCard';
import { spacing } from '@/styles/tokens/spacing';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;
`;

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  margin-top: ${spacing[800]}px;
`;

const PROJECTS: SelectedWorkCardProps[] = [
  {
    company: 'Company Name',
    description: 'End-to-end product design and frontend development for a fintech platform.',
    tags: ['Design System', 'React', 'TypeScript'],
    images: [],
    href: '#',
  },
  {
    company: 'Company Name',
    description: 'Design engineering for a B2B SaaS analytics dashboard.',
    tags: ['UI/UX', 'Next.js', 'Figma'],
    images: [],
    href: '#',
  },
  {
    company: 'Company Name',
    description: 'Brand identity and marketing site for a real estate platform.',
    tags: ['Branding', 'Web Design', 'Animation'],
    images: [],
    href: '#',
  },
];

export function SelectedWorkSection() {
  return (
    <Section id="work">
      <Container>
        <SectionHeading title="Selected Work" />
        <Cards>
          {PROJECTS.map((project, i) => (
            <SelectedWorkCard key={i} {...project} />
          ))}
        </Cards>
      </Container>
    </Section>
  );
}
