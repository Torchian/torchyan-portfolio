'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/primitives';
import { WorldMapSVG, SectionHeading, type MapLocation } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing[1000]}px 0;

  ${media.up('xl')} {
    min-height: 100svh;
    padding: ${spacing[1000]}px 0 ${spacing[600]}px;
  }


  ${media.down('xl')} {
    padding: ${spacing[300]}px 0;
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

/**
 * Desktop keeps the Figma arrangement: the title lies across the map, which is
 * wide enough there for the words and the places to keep out of each other's
 * way. Below that the map is a few hundred pixels across, the title covers its
 * middle and the dots beat through the letters, so the title takes its own line
 * above the map instead. It comes first in the DOM either way, which is also
 * the order it should be read in.
 */
const StyledSectionHeading = styled(SectionHeading)`
  width: 100%;

  ${media.up('xl')} {
    position: absolute;
    bottom: 30%;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const MapWrapper = styled.div`
  width: 100%;
  max-width: 1200px;

  /* The map is what gives on a short screen; it keeps its own ratio. */
  ${media.up('xl')} {
    max-width: min(1200px, 158svh);
  }
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
          <StyledSectionHeading title={t('title')} />
          <MapWrapper>
            <WorldMapSVG locations={locations} alt={t('mapAlt')} />
          </MapWrapper>
        </Content>
      </Container>
    </Section>
  );
}
