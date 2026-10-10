'use client';

import { Link } from '@/i18n/navigation';
import styled, { css } from 'styled-components';
import { Button } from '@/components/primitives';
import { spacing } from '@/styles/tokens/spacing';
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from '@/styles/tokens/typography';
import { accents, neutrals } from '@/styles/tokens/colors';
import { radius } from '@/styles/tokens/radius';
import { media } from '@/styles/media';

/*
 * The pair of closing cards from Figma's "Positioning / Role Definition" (the
 * Projects page's 3155:9848 and the About page's 2973:16266): a green one that
 * starts a conversation and a pink one that sends you to the work. Side by
 * side, stacked on a phone.
 */

export type CTATone = 'green' | 'pink';

/** Card fills from the design, not tokens. */
const CARD_BACKGROUND: Record<CTATone, string> = { green: '#0d1816', pink: '#1c0b27' };

const Cards = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${spacing[800]}px;
  width: 100%;

  ${media.down('xl')} {
    gap: ${spacing[600]}px;
  }

  ${media.down('m')} {
    flex-direction: column;
  }
`;

const Card = styled.article<{ $tone: CTATone }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing[800]}px;
  min-width: 0;
  padding: ${spacing[400]}px ${spacing[500]}px;
  border-radius: ${radius.xxl}px;
  background: ${(p) => CARD_BACKGROUND[p.$tone]};
`;

const CardText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing[300]}px;
  width: 100%;
  font-family: ${fontFamily.heading};
  letter-spacing: ${letterSpacing.xs}px;
  text-align: center;
`;

/*
 * Same step down on a phone as the other cards on the site: the title from
 * Heading M to Heading S, the body from Body XL to Body L.
 */
const CardTitle = styled.h3<{ $tone: CTATone }>`
  margin: 0;
  font-size: ${fontSize.heading.l}px;
  line-height: ${lineHeight.heading.l}px;
  color: ${(p) => (p.$tone === 'green' ? accents.primary : accents.secondary)};

  ${media.down('m')} {
    font-weight: ${fontWeight.medium};
    font-size: ${fontSize.heading.s}px;
    line-height: ${lineHeight.heading.s}px;
  }
`;

const CardBody = styled.p`
  margin: 0;
  font-size: ${fontSize.heading.s}px;
  line-height: ${lineHeight.heading.s}px;
  color: ${neutrals[500]};

  ${media.down('m')} {
    font-size: ${fontSize.body.l}px;
    line-height: ${lineHeight.body.l}px;
    color: ${neutrals[100]};
  }
`;

/** A row of CTAs, side by side and wrapping; each takes the full width on a phone. */
const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${spacing[200]}px;
  width: 100%;

  ${media.down('m')} {
    flex-direction: column;
    align-items: center;

    && > a {
      width: 100%;
      max-width: 320px;
    }
  }
`;

/** The pink card's CTA is a fixed 250px wide in the design. */
const FixedCta = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  && > a {
    width: 250px;
  }

  ${media.down('m')} {
    && > a {
      width: 100%;
      max-width: 250px;
    }
  }
`;

export interface CTACardLink {
  label: string;
  href: string;
  /** Names the click in analytics (`cta_click` location). */
  ctaId?: string;
}

export interface CTACardContent {
  tone: CTATone;
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Names the click in analytics (`cta_click` location). */
  ctaId?: string;
  /** In place of the one CTA: a row of them (a case's previous and next project). */
  links?: CTACardLink[];
}

export function CTACards({ cards, className }: { cards: CTACardContent[]; className?: string }) {
  return (
    <Cards className={className}>
      {cards.map((card) => {
        const button = (
          <Button
            as={Link}
            href={card.href}
            $variant={card.tone === 'green' ? 'secondary' : 'secondaryPink'}
            data-cta={card.ctaId}
          >
            {card.cta}
          </Button>
        );
        return (
          <Card key={card.title} $tone={card.tone}>
            <CardText>
              <CardTitle $tone={card.tone}>{card.title}</CardTitle>
              <CardBody>{card.body}</CardBody>
            </CardText>
            {card.links ? (
              <CtaRow>
                {card.links.map((link) => (
                  <Button
                    key={link.href}
                    as={Link}
                    href={link.href}
                    $variant={card.tone === 'green' ? 'secondary' : 'secondaryPink'}
                    data-cta={link.ctaId}
                  >
                    {link.label}
                  </Button>
                ))}
              </CtaRow>
            ) : card.tone === 'pink' ? (
              <FixedCta>{button}</FixedCta>
            ) : (
              button
            )}
          </Card>
        );
      })}
    </Cards>
  );
}
