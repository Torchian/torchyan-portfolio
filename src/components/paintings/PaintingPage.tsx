'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { PaintingDetail, PaintingMedium, PaintingStatus, PaintingTheme } from '@/lib/paintings/types';
import { fonts, hung, paper } from './theme';
import type { PaintingCard } from './Landing';
import { ButtonLink, Container, Eyebrow, Lead, SectionTitle } from './ui';

export interface PaintingView {
  slug: string;
  title: string;
  year?: number;
  medium: PaintingMedium;
  theme: PaintingTheme;
  size?: { width: number; height: number };
  status: PaintingStatus;
  image: { src: string; width: number; height: number };
  details: (Omit<PaintingDetail, 'caption'> & { caption: string })[];
  story: string[];
}

interface Props {
  painting: PaintingView;
  previous: PaintingCard;
  next: PaintingCard;
  more: PaintingCard[];
}

/* ---------- Layout ---------- */

const Top = styled(Container)`
  padding-top: clamp(20px, 3vw, 32px);

  a {
    color: ${paper.inkSoft};
    font-size: 14px;
    text-decoration: none;

    &:hover {
      color: ${paper.ink};
    }
  }
`;

const Stage = styled(Container)`
  display: grid;
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
  padding-top: clamp(24px, 4vw, 48px);

  @media (min-width: 1000px) {
    grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.7fr);
  }
`;

const Canvas = styled.button`
  display: block;
  justify-self: center;
  width: 100%;
  max-width: min(100%, calc(78svh * var(--ratio)));
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;

  img {
    display: block;
    width: 100%;
    height: auto;
    ${hung}
  }

  &:focus-visible {
    outline: 2px solid ${paper.accent};
    outline-offset: 8px;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  h1 {
    margin: 0;
    font-family: ${fonts.serif};
    font-weight: 500;
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1;
  }
`;

const Specs = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 24px;
  margin: 0;
  padding: 20px 0;
  border-top: 1px solid ${paper.line};
  border-bottom: 1px solid ${paper.line};
  font-size: 15px;

  dt {
    color: ${paper.inkFaint};
  }

  dd {
    margin: 0;
  }
`;

const Status = styled.span<{ $available: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => (p.$available ? paper.success : paper.inkFaint)};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Hint = styled.p`
  margin: 0;
  color: ${paper.inkFaint};
  font-size: 13px;
`;

/* ---------- Up close ---------- */

const Section = styled.section`
  margin-top: clamp(64px, 9vw, 120px);
`;

const SectionHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: clamp(24px, 3vw, 40px);
`;

const DetailGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(16px, 2.4vw, 32px);
  margin: 0;
  padding: 0;
  list-style: none;
`;

const DetailTile = styled.button`
  display: block;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  background-color: ${paper.wallDeep};
  background-repeat: no-repeat;
  cursor: zoom-in;
  ${hung}

  &:focus-visible {
    outline: 2px solid ${paper.accent};
    outline-offset: 6px;
  }
`;

const DetailCaption = styled.p`
  margin: 12px 0 0;
  color: ${paper.inkFaint};
  font-size: 14px;
`;

/** Where to place the photo, as background-position percentages, so (x, y) sits in the middle of a square tile. */
function detailPosition({ x, y, zoom }: Pick<PaintingDetail, 'x' | 'y' | 'zoom'>, ratio: number) {
  const along = (point: number, scale: number) =>
    scale === 1 ? 50 : Math.min(100, Math.max(0, ((0.5 - point * scale) / (1 - scale)) * 100));
  return `${along(x, zoom)}% ${along(y, zoom / ratio)}%`;
}

/* ---------- Story, neighbours ---------- */

const Story = styled.div`
  display: grid;
  gap: 20px 72px;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  p {
    margin: 0;
    max-width: 64ch;
    color: ${paper.inkSoft};
    font-size: 17px;
    line-height: 1.75;
  }
`;

const Neighbours = styled.nav`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-top: 28px;
  border-top: 1px solid ${paper.line};

  a {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: ${paper.ink};
    text-decoration: none;

    span {
      color: ${paper.inkFaint};
      font-size: 13px;
    }

    strong {
      font-family: ${fonts.serif};
      font-weight: 500;
      font-size: clamp(20px, 2.2vw, 26px);
    }

    &:hover strong {
      color: ${paper.accent};
    }

    &:last-child {
      text-align: right;
    }
  }
`;

const MoreGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 2.4vw, 32px);
  align-items: end;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  a {
    display: block;
    color: ${paper.ink};
    text-decoration: none;
  }

  img {
    display: block;
    width: 100%;
    height: auto;
    ${hung}
  }

  strong {
    display: block;
    margin-top: 12px;
    font-family: ${fonts.serif};
    font-weight: 500;
    font-size: 18px;
  }
`;

/* ---------- Viewer ---------- */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgba(20, 17, 14, 0.96);
`;

const ViewerImage = styled.img<{ $zoomed: boolean }>`
  max-width: 94vw;
  max-height: 90svh;
  object-fit: contain;
  cursor: ${(p) => (p.$zoomed ? 'zoom-out' : 'zoom-in')};
  transform: scale(${(p) => (p.$zoomed ? 2.6 : 1)});
  transition: transform 260ms cubic-bezier(0.2, 0.7, 0.2, 1);
  user-select: none;
  touch-action: none;
`;

const Close = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  background: rgba(20, 17, 14, 0.6);
  color: #fff;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
`;

const ViewerHint = styled.p`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  text-align: center;
  pointer-events: none;
`;

interface ViewerState {
  /** Where to zoom in, 0–1 on the photo; null opens it whole. */
  at: { x: number; y: number } | null;
}

function Viewer({ painting, at, onClose }: { painting: PaintingView; at: ViewerState['at']; onClose: () => void }) {
  const t = useTranslations('paintings.painting');
  const [zoomed, setZoomed] = useState(Boolean(at));
  const [origin, setOrigin] = useState(at ? `${at.x * 100}% ${at.y * 100}%` : '50% 50%');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const follow = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!zoomed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    // The rect is the scaled image; the origin is in its unscaled box, which shares the centre.
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setOrigin(`${Math.min(100, Math.max(0, x * 100))}% ${Math.min(100, Math.max(0, y * 100))}%`);
  };

  return (
    <Overlay role="dialog" aria-modal="true" aria-label={painting.title} onClick={onClose}>
      {/* The original file, not a resized copy: zooming in is the point. */}
      <ViewerImage
        src={painting.image.src}
        alt={painting.title}
        $zoomed={zoomed}
        style={{ transformOrigin: origin }}
        onClick={(event) => {
          event.stopPropagation();
          if (!zoomed) follow(event as unknown as React.PointerEvent<HTMLImageElement>);
          setZoomed((z) => !z);
        }}
        onPointerMove={follow}
        draggable={false}
      />
      <Close ref={closeRef} type="button" onClick={onClose}>
        {t('close')}
      </Close>
      <ViewerHint>{t('zoomHint')}</ViewerHint>
    </Overlay>
  );
}

/* ---------- Page ---------- */

export function PaintingPage({ painting, previous, next, more }: Props) {
  const t = useTranslations('paintings');
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const close = useCallback(() => setViewer(null), []);
  const ratio = painting.image.width / painting.image.height;
  const available = painting.status === 'available';

  return (
    <main id="main-content">
      <Top>
        <Link href="/#gallery">← {t('painting.back')}</Link>
      </Top>

      <Stage>
        <Canvas
          type="button"
          onClick={() => setViewer({ at: null })}
          aria-label={`${t('painting.view')}: ${painting.title}`}
          style={{ '--ratio': ratio } as React.CSSProperties}
        >
          <Image
            src={painting.image.src}
            width={painting.image.width}
            height={painting.image.height}
            alt={painting.title}
            sizes="(max-width: 1000px) 92vw, 800px"
            priority
          />
        </Canvas>

        <Info>
          <Eyebrow>{t(`themes.${painting.theme}`)}</Eyebrow>
          <h1>{painting.title}</h1>
          <Specs>
            {painting.year && (
              <>
                <dt>{t('painting.year')}</dt>
                <dd>{painting.year}</dd>
              </>
            )}
            <dt>{t('painting.medium')}</dt>
            <dd>{t(`media.${painting.medium}`)}</dd>
            {painting.size && (
              <>
                <dt>{t('painting.size')}</dt>
                <dd>{t('painting.sizeValue', painting.size)}</dd>
              </>
            )}
            <dt>{t('painting.status')}</dt>
            <dd>
              <Status $available={available}>{t(`status.${painting.status}`)}</Status>
            </dd>
          </Specs>
          <Actions>
            {available ? (
              <ButtonLink href={{ pathname: '/commissions', query: { painting: painting.slug } }}>
                {t('painting.enquire')}
              </ButtonLink>
            ) : null}
            <ButtonLink href="/commissions" $variant={available ? 'outline' : 'solid'}>
              {t('painting.commissionSimilar')}
            </ButtonLink>
          </Actions>
          <Hint>{t('painting.zoomHint')}</Hint>
        </Info>
      </Stage>

      {painting.details.length > 0 && (
        <Section aria-labelledby="details-title">
          <Container>
            <SectionHead>
              <SectionTitle id="details-title">{t('painting.details')}</SectionTitle>
              <Lead>{t('painting.detailsLead')}</Lead>
            </SectionHead>
            <DetailGrid>
              {painting.details.map((detail, i) => (
                <li key={`${detail.x}-${detail.y}`}>
                  <DetailTile
                    type="button"
                    aria-label={t('painting.detailAlt', { number: i + 1, title: painting.title })}
                    onClick={() => setViewer({ at: { x: detail.x, y: detail.y } })}
                    style={{
                      backgroundImage: `url(${painting.image.src})`,
                      backgroundSize: `${detail.zoom * 100}% auto`,
                      backgroundPosition: detailPosition(detail, ratio),
                    }}
                  />
                  {detail.caption && <DetailCaption>{detail.caption}</DetailCaption>}
                </li>
              ))}
            </DetailGrid>
          </Container>
        </Section>
      )}

      {painting.story.length > 0 && (
        <Section aria-labelledby="story-title">
          <Container>
            <Story>
              <SectionTitle id="story-title">{t('painting.about')}</SectionTitle>
              <div>
                {painting.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Story>
          </Container>
        </Section>
      )}

      <Section>
        <Container>
          <Neighbours aria-label={t('painting.more')}>
            <Link href={`/${previous.slug}`}>
              <span>← {t('painting.previous')}</span>
              <strong>{previous.title}</strong>
            </Link>
            <Link href={`/${next.slug}`}>
              <span>
                {t('painting.next')} →
              </span>
              <strong>{next.title}</strong>
            </Link>
          </Neighbours>
        </Container>
      </Section>

      <Section aria-labelledby="more-title">
        <Container>
          <SectionHead>
            <SectionTitle id="more-title">{t('painting.more')}</SectionTitle>
          </SectionHead>
          <MoreGrid>
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`}>
                  <Image
                    src={p.image.src}
                    width={p.image.width}
                    height={p.image.height}
                    alt={p.title}
                    sizes="(max-width: 900px) 46vw, 300px"
                  />
                  <strong>{p.title}</strong>
                </Link>
              </li>
            ))}
          </MoreGrid>
        </Container>
      </Section>

      {viewer && <Viewer painting={painting} at={viewer.at} onClose={close} />}
    </main>
  );
}
