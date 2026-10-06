'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Container, VisuallyHidden } from '@/components/primitives';
import { WorldMapSVG, SectionHeading, type MapLocation } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { media } from '@/styles/media';

const Section = styled.section`
  /* Home's orbit scene runs off the page's sides on a phone, cut there. */
  overflow-x: clip;
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
 * The title sits above the map at every size. Figma laid it across the map on
 * desktop, which worked for a short title; the reach title is two lines, and
 * across the map it covered the US and Armenian points the section exists to
 * show. Title first, map second, in the DOM and on screen.
 */
const StyledSectionHeading = styled(SectionHeading)`
  width: 100%;
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
  | 'yerevan'
  | 'sanFrancisco'
  | 'newYork'
  | 'losAngeles'
  | 'australia'
  | 'moscow'
  | 'cyprus';

/**
 * Places of past work — where a client, employer or partner company was —
 * not offices. Every point is in the founder's register
 * (facts/2026-09-30-founder-facts.md, F-MAP); a point without a confirmed year
 * shows none rather than a guessed one. Place names live in messages/*.json
 * under yearsMap.locations.
 */
const LOCATIONS: (Omit<MapLocation, 'label'> & { id: LocationId })[] = [
  { id: 'yerevan', x: 59, y: 29 },
  // Picsart, employer, Oct 2021 – Feb 2024.
  { id: 'sanFrancisco', year: '2021–2024', x: 9, y: 31 },
  // Brainstorm, direct client, 2018.
  { id: 'newYork', year: 2018, x: 24, y: 23 },
  // Benzeen Auto Parts, through TCO, 2019.
  { id: 'losAngeles', year: 2019, x: 11, y: 35 },
  // Infinity Rings, direct client; no city on record, so the label is the country.
  { id: 'australia', x: 92, y: 84 },
  // Rostelecom, client.
  { id: 'moscow', x: 58, y: 18 },
  // BrainRocket, employer.
  { id: 'cyprus', x: 56, y: 33 },
];

export interface YearsMapSectionProps {
  /** Unique per page; the homepage and /contact both show the map. */
  id?: string;
}

export function YearsMapSection({ id = 'years-map' }: YearsMapSectionProps) {
  const t = useTranslations('yearsMap');
  const tLocations = useTranslations('yearsMap.locations');
  const locations = LOCATIONS.map((location) => ({ ...location, label: tLocations(location.id) }));
  const titleId = `${id}-title`;

  return (
    <Section id={id} aria-labelledby={titleId}>
      <Container>
        <Content>
          <StyledSectionHeading id={titleId} title={t('title')} subtitle={t('subtitle')} />
          <MapWrapper>
            <WorldMapSVG locations={locations} alt={t('mapAlt')} hub="yerevan" />
          </MapWrapper>
          {/* The dots are hover-only; this is the same information for everyone else. */}
          <VisuallyHidden as="ul" aria-label={t('listLabel')}>
            {locations.map((location) => (
              <li key={location.id}>
                {location.label}
                {location.year ? ` (${location.year})` : ''}
              </li>
            ))}
          </VisuallyHidden>
        </Content>
      </Container>
    </Section>
  );
}
