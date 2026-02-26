'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { SectionHeading, WorldMapSVG, type MapLocation } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';

const Section = styled.section`
  padding: ${spacing[1000]}px 0;
`;

const MapWrapper = styled.div`
  margin-top: ${spacing[800]}px;
`;

const LOCATIONS: MapLocation[] = [
  { label: 'Yerevan, Armenia', year: 2019, x: 57, y: 35 },
  { label: 'Tbilisi, Georgia', year: 2020, x: 56, y: 33 },
  { label: 'Dubai, UAE', year: 2021, x: 58, y: 42 },
  { label: 'Berlin, Germany', year: 2022, x: 50, y: 30 },
  { label: 'San Francisco, USA', year: 2023, x: 15, y: 35 },
  { label: 'London, UK', year: 2024, x: 47, y: 28 },
];

export function YearsMapSection() {
  return (
    <Section id="years-map">
      <Container>
        <SectionHeading title="Years of Work, Mapped" />
        <MapWrapper>
          <WorldMapSVG locations={LOCATIONS} />
        </MapWrapper>
      </Container>
    </Section>
  );
}
