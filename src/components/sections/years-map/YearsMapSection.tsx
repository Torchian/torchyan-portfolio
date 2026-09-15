'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/primitives';
import { WorldMapSVG, SectionHeading, type MapLocation } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${spacing[1000]}px 0;
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

type LocationId =
  | 'sanFrancisco'
  | 'newYork'
  | 'miami'
  | 'sweden'
  | 'berlin'
  | 'switzerland'
  | 'moscow'
  | 'yerevan'
  | 'cyprus'
  | 'sydney';

/** Place names live in messages/*.json under yearsMap.locations. */
const LOCATIONS: (Omit<MapLocation, 'label'> & { id: LocationId })[] = [
  { id: 'sanFrancisco', year: 2023, x: 9, y: 31 },
  { id: 'newYork', year: 2022, x: 24, y: 23 },
  { id: 'miami', year: 2021, x: 20, y: 37 },
  { id: 'sweden', year: 2024, x: 50, y: 16 },
  { id: 'berlin', year: 2022, x: 48, y: 21 },
  { id: 'switzerland', year: 2021, x: 49, y: 24 },
  { id: 'moscow', year: 2020, x: 58, y: 18 },
  { id: 'yerevan', year: 2019, x: 59, y: 29 },
  { id: 'cyprus', year: 2021, x: 56, y: 33 },
  { id: 'sydney', year: 2023, x: 92, y: 84 },
];

export function YearsMapSection() {
  const t = useTranslations('yearsMap');
  const tLocations = useTranslations('yearsMap.locations');
  const locations = LOCATIONS.map((location) => ({ ...location, label: tLocations(location.id) }));

  return (
    <Section id="years-map">
      <Container>
        <Content>
          <MapWrapper>
            <WorldMapSVG locations={locations} alt={t('mapAlt')} />
          </MapWrapper>
          <StyledSectionHeading title={t('title')} />
        </Content>
      </Container>
    </Section>
  );
}
