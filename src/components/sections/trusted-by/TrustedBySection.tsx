'use client';

/* eslint-disable @next/next/no-img-element -- monochrome SVG logos; next/image adds nothing */
import { useTranslations } from 'next-intl';
import styled, { css } from 'styled-components';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/*
 * Figma: Credibility — Desktop 1920 (2670:10613), 1440 (2670:10970), Tablet 1024 (2670:11664),
 * Mobile 480 (2670:12308).
 *
 *  - Desktop (from 1025px): six rows, each spread edge to edge inside its own side inset.
 *    Logos are 48px tall (Ginosi 42, Picsart 60); most sit in a 68px slot with 10px side padding.
 *  - Tablet and mobile: one centred wrap of 40px / 24px logos; mobile reorders a few to balance the lines.
 */

interface TrustedLogo {
  name: string;
  src: string;
  /** Desktop height in px. */
  height: number;
  /** In a 68px slot with 10px side padding, or straight in the row. */
  boxed: boolean;
  /** Position in the mobile wrap. */
  mobileOrder: number;
}

const logo = (
  name: string,
  file: string,
  mobileOrder: number,
  options: Partial<Pick<TrustedLogo, 'height' | 'boxed'>> = {},
): TrustedLogo => ({ name, src: `/logo/companies/${file}.svg`, height: 48, boxed: true, mobileOrder, ...options });

/** Desktop rows, each with its side inset in px. */
const ROWS: { inset: number; logos: TrustedLogo[] }[] = [
  {
    inset: 20,
    logos: [logo('SoftConstruct', 'SoftConstruct', 0), logo('Volo', 'Volo', 1), logo('Fortinet', 'Fortinet', 2)],
  },
  {
    inset: 120,
    logos: [
      logo('InfinitiRings', 'InfinitiRings', 4),
      logo('Ginosi', 'Ginosi', 3, { height: 42 }),
      logo('by robynblair', 'byRobinblair', 5),
      logo('IT365', 'IT365', 6),
    ],
  },
  {
    inset: 0,
    logos: [
      logo('Smartbet', 'Smartbet', 7),
      logo('Picsart', 'Picsart', 8, { height: 60 }),
      logo('Brainstorm', 'Brainstorm', 9),
    ],
  },
  {
    inset: 60,
    logos: [
      logo('Adrasheg', 'Adrasheg', 15),
      logo('World Education', 'WorldEdu', 10),
      logo('SoulOne', 'SoulOne', 11),
      logo('Armenian Code Academy', 'ArmenianCodeAcademy', 13),
    ],
  },
  {
    inset: 160,
    logos: [logo('Benzeen', 'Benzeen', 12), logo('BrainRocket', 'BrainRocket', 14), logo('Scunci', 'Scunci', 16)],
  },
  {
    inset: 30,
    logos: [
      logo('PlayEngine', 'PlayEngine', 17, { boxed: false }),
      logo('Rostelecom', 'Rostelecom', 18, { boxed: false }),
      logo('Inlogic', 'Inlogic', 19, { boxed: false }),
      logo('2288 Vet', '2288Vet', 20),
      logo('TCO', 'TCO', 21, { boxed: false }),
    ],
  },
];

const TITLE_ID = 'trusted-by-title';

const Section = styled.section`
  position: relative;
  padding: ${spacing[1000]}px 0;

  ${media.down('m')} {
    padding: ${spacing[600]}px 0;
  }
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[1000]}px;
  /* 1440px of content in the 1920 frame; 32px sides in the 1440 frame. */
  max-width: ${grid.maxWidth + 2 * spacing[400]}px;
  margin: 0 auto;
  padding: ${spacing[300]}px ${spacing[400]}px;

  ${media.down('xl')} {
    padding: ${spacing[300]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[600]}px;
    padding: ${spacing[300]}px ${spacing[200]}px;
  }
`;

const HeadingFrame = styled.div`
  width: 100%;
  padding: ${spacing[1000]}px ${spacing[400]}px;

  ${media.down('xl')} {
    padding: 0;
  }
`;

const Logos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  width: 100%;
  opacity: 0.8;

  ${media.down('xl')} {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: ${spacing[600]}px ${spacing[1000]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[400]}px;
  }
`;

const Row = styled.div<{ $inset: number }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  row-gap: ${spacing[600]}px;
  padding-inline: ${(p) => p.$inset}px;
  mix-blend-mode: difference;

  /* Tablet and mobile: the rows dissolve into one wrap. */
  ${media.down('xl')} {
    display: contents;
  }
`;

const Logo = styled.div<{ $height: number; $boxed: boolean; $mobileOrder: number }>`
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
    height: ${(p) => p.$height}px;
  }

  ${media.down('xl')} {
    height: auto;
    padding: 0;

    img {
      height: 40px;
    }
  }

  ${media.down('m')} {
    order: ${(p) => p.$mobileOrder};

    img {
      height: 24px;
    }
  }
`;

export function TrustedBySection() {
  const t = useTranslations('trustedBy');

  return (
    <Section id="trusted-by" aria-labelledby={TITLE_ID}>
      <Inner>
        <HeadingFrame>
          <SectionHeading id={TITLE_ID} title={t('title')} subtitle={t('subtitle')} />
        </HeadingFrame>

        <Logos role="list">
          {ROWS.map((row, i) => (
            <Row key={i} $inset={row.inset}>
              {row.logos.map((item) => (
                <Logo
                  key={item.name}
                  role="listitem"
                  $height={item.height}
                  $boxed={item.boxed}
                  $mobileOrder={item.mobileOrder}
                >
                  <img src={item.src} alt={item.name} loading="lazy" />
                </Logo>
              ))}
            </Row>
          ))}
        </Logos>
      </Inner>
    </Section>
  );
}
