'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives';
import { WorldMapSVG, SectionHeading, type MapLocation } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[1000]}px 0;
  }
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  width: 100%;
`;

const StyledSectionHeading = styled(SectionHeading)`
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
`;

const MapWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const LOCATIONS: MapLocation[] = [
  { label: 'San Francisco, USA', year: 2023, x: 9, y: 31 },
  { label: 'New York, USA', year: 2022, x: 24, y: 23 },
  { label: 'Miami, USA', year: 2021, x: 20, y: 37 },
  { label: 'Sweden', year: 2024, x: 50, y: 16 },
  { label: 'Berlin, Germany', year: 2022, x: 48, y: 21 },
  { label: 'Switzerland', year: 2021, x: 49, y: 24 },
  { label: 'Moscow, Russia', year: 2020, x: 58, y: 18 },
  { label: 'Yerevan, Armenia', year: 2019, x: 59, y: 29 },
  { label: 'Cyprus', year: 2021, x: 56, y: 33 },
  { label: 'Sydney, Australia', year: 2023, x: 92, y: 84 },
];

export function YearsMapSection() {
  return (
    <Section id="years-map">
      <Container>
        <Content>
          <MapWrapper>
            <WorldMapSVG locations={LOCATIONS} />
          </MapWrapper>
          <StyledSectionHeading title="Years of Work, Mapped" />
        </Content>
      </Container>
    </Section>
  );
}
