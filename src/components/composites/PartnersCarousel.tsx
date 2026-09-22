'use client';

/* eslint-disable @next/next/no-img-element -- monochrome SVG logos; next/image adds nothing */
import styled, { css, keyframes } from 'styled-components';
import { spacing } from '@/styles/tokens/spacing';
import { transparents } from '@/styles/tokens/colors';
import { media } from '@/styles/media';
import { useTranslations } from 'next-intl';
import { usePauseOffscreen } from '@/hooks';

/*
 * Figma: Partners Carousel LTR (3053:13727), on the Projects page at 1920
 * (3155:9824), 1440 (3753:11197), 1024 (3753:14718) and 480 (3753:17745).
 *
 * A strip of partner logos drifting in an endless loop: 108px tall on desktop
 * with 48px logos 160px apart, and a slimmer band below that — 56px with 24px
 * logos on a tablet, 48px on a phone. The strip is dark with
 * mix-blend-mode: exclusion, so over the page glow only the logos read.
 */

export interface PartnerLogo {
  name: string;
  src: string;
  /** Logo height in px (48 unless the design says otherwise). */
  height?: number;
  /** Most logos sit in a 68px box with 10px side padding; a few sit directly in the row. */
  boxed?: boolean;
}

const logo = (name: string, file: string, options: Omit<PartnerLogo, 'name' | 'src'> = {}): PartnerLogo => ({
  name,
  src: `/logo/companies/${file}.svg`,
  boxed: true,
  ...options,
});

export const PARTNERS: PartnerLogo[] = [
  logo('SoftConstruct', 'SoftConstruct'),
  logo('Volo', 'Volo'),
  logo('Fortinet', 'Fortinet'),
  logo('InfinitiRings', 'InfinitiRings'),
  logo('Ginosi', 'Ginosi', { height: 42 }),
  logo('by robynblair', 'byRobinblair'),
  logo('IT365', 'IT365'),
  logo('Smartbet', 'Smartbet'),
  logo('Picsart', 'Picsart', { height: 60 }),
  logo('Brainstorm', 'Brainstorm'),
  logo('Adrasheg', 'Adrasheg'),
  logo('World Education', 'WorldEdu'),
  logo('SoulOne', 'SoulOne'),
  logo('Armenian Code Academy', 'ArmenianCodeAcademy'),
  logo('Benzeen', 'Benzeen'),
  logo('BrainRocket', 'BrainRocket'),
  logo('Scunci', 'Scunci'),
  logo('Rostelecom', 'Rostelecom', { boxed: false }),
  logo('Inlogic', 'Inlogic', { boxed: false }),
  logo('TCO', 'TCO', { boxed: false }),
];

export type CarouselDirection = 'ltr' | 'rtl';

/** One loop: the track holds the row twice, so moving it by half returns it to the start. */
const drift = keyframes`
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
`;

const LOGO_GAP = spacing[2000];

const Strip = styled.section`
  overflow: hidden;
  padding: ${spacing[250]}px 0;
  background: ${transparents.transparent4};
  mix-blend-mode: exclusion;

  ${media.down('xl')} {
    padding: ${spacing[200]}px 0;
  }

  ${media.down('m')} {
    padding: ${spacing[150]}px 0;
  }
`;

const Track = styled.div<{ $direction: CarouselDirection; $seconds: number }>`
  display: flex;
  width: max-content;
  animation: ${drift} ${(p) => p.$seconds}s linear infinite;

  ${(p) =>
    p.$direction === 'rtl' &&
    css`
      animation-direction: reverse;
    `}
`;

const Row = styled.ul`
  display: flex;
  flex: none;
  align-items: center;
  gap: ${LOGO_GAP}px;
  margin: 0;
  /* The gap after the last logo, so the loop is seamless. */
  padding: 0 ${LOGO_GAP}px 0 0;
  list-style: none;

  ${media.down('xl')} {
    gap: ${spacing[1000]}px;
    padding-right: ${spacing[1000]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[800]}px;
    padding-right: ${spacing[800]}px;
  }
`;

const Item = styled.li<{ $boxed: boolean }>`
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;

  ${(p) =>
    p.$boxed &&
    css`
      height: 68px;
      padding: 0 10px;
    `}

  img {
    display: block;
    width: auto;
    max-width: none;
    /* Set per logo; a breakpoint can override it, which an inline height could not. */
    height: var(--logo-height);
  }

  /* Below desktop every logo is the same 24px tall. The height is set on the
     image, not the custom property, which the per-logo inline value would win. */
  ${media.down('xl')} {
    height: auto;
    padding: 0;

    img {
      height: 24px;
    }
  }
`;

export interface PartnersCarouselProps {
  /** ltr (the design's "Partners Carousel LTR") drifts left to right. */
  direction?: CarouselDirection;
  /** Seconds for one full loop. */
  seconds?: number;
  logos?: PartnerLogo[];
}

export function PartnersCarousel({ direction = 'ltr', seconds = 80, logos = PARTNERS }: PartnersCarouselProps) {
  const t = useTranslations('partners');
  // The strip drifts forever; only while it's in view.
  const ref = usePauseOffscreen<HTMLElement>();
  const row = (copy: boolean) => (
    <Row aria-hidden={copy || undefined}>
      {logos.map((partner) => (
        <Item
          key={partner.name}
          $boxed={partner.boxed !== false}
          style={{ '--logo-height': `${partner.height ?? 48}px` } as React.CSSProperties}
        >
          <img src={partner.src} alt={copy ? '' : partner.name} />
        </Item>
      ))}
    </Row>
  );

  return (
    <Strip ref={ref} aria-label={t('label')}>
      <Track $direction={direction} $seconds={seconds}>
        {row(false)}
        {row(true)}
      </Track>
    </Strip>
  );
}
