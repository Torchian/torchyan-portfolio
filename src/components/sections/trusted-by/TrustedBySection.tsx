'use client';

/* eslint-disable @next/next/no-img-element -- monochrome SVG logos; next/image adds nothing */
import { useTranslations } from 'next-intl';
import styled, { css } from 'styled-components';
import { SectionHeading } from '@/components/composites';
import { spacing } from '@/styles/tokens/spacing';
import { accents, neutrals } from '@/styles/tokens/colors';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from '@/styles/tokens/typography';
import { duration, easing } from '@/styles/tokens/motion';
import { grid } from '@/styles/tokens/grid';
import { media } from '@/styles/media';

/*
 * Figma: Credibility — Desktop 1920 (2670:10613), 1440 (2670:10970), Tablet 1024 (2670:11664),
 * Mobile 480 (2670:12308).
 *
 * The logos are grouped by relationship, each group under a visible label —
 * direct clients, employers, projects through partner companies, own
 * products, and teaching — so no logo implies more than the relationship it
 * had. Product and teaching were one group until the founder asked for them
 * split, since a product and a place taught at are not the same relationship.
 * Which logos appear, and in which group, is the founder's register in
 * facts/2026-09-30-founder-facts.md (F5). Logos don't link out: they are
 * evidence, not navigation, and several of the sites have changed since.
 *
 * Logos are 48px tall on desktop (Ginosi 42, Picsart 60), most in a 68px slot
 * with 10px side padding; 40px on tablet, 24px on a phone. Each rests at 90%
 * and grows to full size under the pointer.
 */

interface TrustedLogo {
  name: string;
  src: string;
  /** Desktop height in px. */
  height: number;
  /** In a 68px slot with 10px side padding, or straight in the row. */
  boxed: boolean;
}

const logo = (
  name: string,
  file: string,
  options: Partial<Pick<TrustedLogo, 'height' | 'boxed'>> & { ext?: 'svg' | 'png' } = {},
): TrustedLogo => {
  const { ext = 'svg', ...rest } = options;
  return {
    name,
    src: `/logo/companies/${file}.${ext}`,
    height: 48,
    boxed: true,
    ...rest,
  };
};

export type RelationshipGroup = 'clients' | 'employers' | 'partners' | 'product' | 'teaching';

/** The credibility set, by relationship. Shared with the Partners carousel on /projects. */
export const TRUSTED_GROUPS: { id: RelationshipGroup; logos: TrustedLogo[] }[] = [
  {
    id: 'clients',
    logos: [
      logo('Ginosi', 'Ginosi', { height: 42 }),
      logo('World Education', 'WorldEdu'),
      logo('Brainstorm', 'Brainstorm'),
      logo('Infinity Rings', 'InfinitiRings'),
      logo('IT365', 'IT365'),
      logo('Rostelecom', 'Rostelecom'),
      logo('Adrasheg', 'Adrasheg'),
    ],
  },
  {
    id: 'employers',
    logos: [
      logo('Picsart', 'Picsart', { height: 60 }),
      logo('Smartbet', 'Smartbet'),
      logo('Volo', 'Volo'),
      logo('TCO', 'TCO', { boxed: false }),
      logo('BrainRocket', 'BrainRocket'),
      logo('SoftConstruct', 'SoftConstruct', { boxed: false }),
    ],
  },
  {
    id: 'partners',
    logos: [
      logo('Benzeen Auto Parts', 'Benzeen'),
      logo('By Robyn Blair', 'byRobinblair'),
      logo('Scunci', 'Scunci'),
      logo('Gemmed', 'Gemmed', { ext: 'png' }),
      logo('Off My Case', 'OffMyCase'),
      logo('myZcapital', 'myZcapital', { ext: 'png', height: 40 }),
      logo('Fortinet', 'Fortinet'),
    ],
  },
  {
    id: 'product',
    logos: [logo('SoulOne', 'SoulOne'), logo('Solomoon', 'Solomoon', { ext: 'png' }), logo('Panika', 'Panika', { ext: 'png' })],
  },
  {
    id: 'teaching',
    // TCO is also an employer, above — both relationships are genuine, so it
    // appears in both rather than picking one and understating the other.
    logos: [logo('TCO', 'TCO', { boxed: false }), logo('Armenian Code Academy', 'ArmenianCodeAcademy')],
  },
];

const TITLE_ID = 'trusted-by-title';

const Section = styled.section`
  position: relative;
  padding: ${spacing[1000]}px 0;

  /* One screen on desktop: the rows below give up height before the heading does. */
  ${media.up('xl')} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100svh;
    padding: ${spacing[1000]}px 0 ${spacing[1250]}px;
  }

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

  /* The Inner's own gap already separates it from the rows. */
  ${media.up('xl')} {
    padding: 0 ${spacing[400]}px;
  }

  ${media.down('xl')} {
    padding: 0;
  }
`;

const Groups = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing[600]}px;
  width: 100%;

  /* Four groups share one screen with the heading on desktop. */
  ${media.up('xl')} {
    gap: clamp(${spacing[200]}px, 4svh, ${spacing[600]}px);
  }

  ${media.down('m')} {
    gap: ${spacing[500]}px;
  }
`;

/** One relationship: its label, then its logos. */
const Group = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[100]}px;
`;

const GroupLabel = styled.h3`
  margin: 0;
  font-family: ${fontFamily.heading};
  font-weight: ${fontWeight.semibold};
  font-size: ${fontSize.body.m}px;
  line-height: ${lineHeight.body.m}px;
  letter-spacing: ${letterSpacing.xxl}px;
  text-transform: uppercase;
  color: ${accents.primary};
`;

/*
 * A plain list of marks: each logo is an image whose alt text is the company,
 * inside a group named by its visible label.
 */
const LogoRow = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${spacing[300]}px ${spacing[800]}px;
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: 0.8;
  mix-blend-mode: difference;

  ${media.down('xl')} {
    gap: ${spacing[400]}px ${spacing[600]}px;
  }

  ${media.down('m')} {
    gap: ${spacing[300]}px ${spacing[400]}px;
  }
`;

/** One company mark. */
const Logo = styled.li<{ $height: number; $boxed: boolean }>`
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;

  ${(p) =>
    p.$boxed &&
    css`
      height: 68px;
      padding: 0 10px;

      ${media.up('xl')} {
        height: clamp(40px, 6svh, 68px);
      }
    `}

  img {
    display: block;
    width: auto;
    max-width: none;
    height: ${(p) => p.$height}px;

    ${media.up('xl')} {
      /* Each logo keeps its own proportion of the 48px frame height. */
      height: clamp(
        ${(p) => (p.$height * 28) / 48}px,
        ${(p) => (p.$height * 4.2) / 48}svh,
        ${(p) => p.$height}px
      );
    }
    /* Resting a touch small, so the pointer brings the mark up to full size. */
    transform: scale(0.9);
    transition: transform ${duration.normal} ${easing.out};
  }

  ${media.hover} {
    &:hover img {
      transform: none;
    }
  }

  ${media.reducedMotion} {
    img {
      transition: none;
    }
  }

  ${media.down('xl')} {
    height: auto;
    padding: 0;

    img {
      height: 40px;
    }
  }

  ${media.down('m')} {
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

        <Groups>
          {TRUSTED_GROUPS.map((group) => {
            const labelId = `trusted-by-${group.id}`;
            return (
              <Group key={group.id} role="group" aria-labelledby={labelId}>
                <GroupLabel id={labelId}>{t(`groups.${group.id}`)}</GroupLabel>
                <LogoRow>
                  {group.logos.map((item) => (
                    <Logo key={item.name} $height={item.height} $boxed={item.boxed}>
                      {/* Not lazy: an unsized SVG lays out 0px wide until it loads, and a
                          0-wide lazy image is never seen to enter the viewport, so it never
                          loads. Fifteen small SVGs, all below the fold. */}
                      <img src={item.src} alt={item.name} decoding="async" />
                    </Logo>
                  ))}
                </LogoRow>
              </Group>
            );
          })}
        </Groups>
      </Inner>
    </Section>
  );
}
