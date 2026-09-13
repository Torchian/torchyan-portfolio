/** Which corner of the card the centre circle bites into. */
export type NotchCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface NotchedCardShapeInput {
  width: number;
  height: number;
  /** Horizontal / vertical gap between this card and its neighbours. */
  gapX: number;
  gapY: number;
  /** Radius of the cut-out: the centre circle's radius plus the ring of space around it. */
  notchRadius: number;
  notch: NotchCorner;
  cornerRadius?: number;
  /** Rounds the two points where the card's edges meet the cut-out. */
  filletRadius?: number;
}

export interface NotchedCardShape {
  /** SVG path in the card's own pixel space (viewBox `0 0 width height`). */
  d: string;
  /** How far the cut-out reaches along the card's edge, measured from the notched corner. */
  span: number;
}

const fmt = (n: number) => Number(n.toFixed(2));

/**
 * A rounded card with a circular bite taken out of one corner, centred on the
 * point where all four cards' gaps cross — the Figma `capability_background`
 * shape, rebuilt for any size. The exported SVG only matches at 708×467;
 * stretched to other sizes, its arc turns into an ellipse.
 *
 * The geometry is worked out for a bottom-right notch and mirrored for the
 * other corners. Each fillet is a circle of `filletRadius` that touches the
 * card's edge and sits against the outside of the cut-out, so edge, fillet and
 * arc join without kinks.
 */
export function notchedCardShape({
  width: w,
  height: h,
  gapX,
  gapY,
  notchRadius: R,
  notch,
  cornerRadius: c = 24,
  filletRadius: r = 24,
}: NotchedCardShapeInput): NotchedCardShape {
  const cx = w + gapX / 2;
  const cy = h + gapY / 2;
  const reach = R + r;

  // Fillet on the right edge: centre at (w - r, y1).
  const y1 = cy - Math.sqrt(Math.max(0, reach ** 2 - (gapX / 2 + r) ** 2));
  // Fillet on the bottom edge: centre at (x2, h - r).
  const x2 = cx - Math.sqrt(Math.max(0, reach ** 2 - (gapY / 2 + r) ** 2));

  // Where each fillet meets the cut-out: on the line from the notch centre to the fillet centre.
  const k = R / reach;
  const t1 = { x: cx + (w - r - cx) * k, y: cy + (y1 - cy) * k };
  const t2 = { x: cx + (x2 - cx) * k, y: cy + (h - r - cy) * k };

  const flipX = notch.endsWith('left');
  const flipY = notch.startsWith('top');
  const X = (x: number) => fmt(flipX ? w - x : x);
  const Y = (y: number) => fmt(flipY ? h - y : y);
  // Mirroring on exactly one axis reverses the drawing direction.
  const sweep = (s: 0 | 1) => (flipX !== flipY ? 1 - s : s);

  const d = [
    `M ${X(c)} ${Y(0)}`,
    `L ${X(w - c)} ${Y(0)}`,
    `A ${c} ${c} 0 0 ${sweep(1)} ${X(w)} ${Y(c)}`,
    `L ${X(w)} ${Y(y1)}`,
    `A ${r} ${r} 0 0 ${sweep(1)} ${X(t1.x)} ${Y(t1.y)}`,
    `A ${fmt(R)} ${fmt(R)} 0 0 ${sweep(0)} ${X(t2.x)} ${Y(t2.y)}`,
    `A ${r} ${r} 0 0 ${sweep(1)} ${X(x2)} ${Y(h)}`,
    `L ${X(c)} ${Y(h)}`,
    `A ${c} ${c} 0 0 ${sweep(1)} ${X(0)} ${Y(h - c)}`,
    `L ${X(0)} ${Y(c)}`,
    `A ${c} ${c} 0 0 ${sweep(1)} ${X(c)} ${Y(0)}`,
    'Z',
  ].join(' ');

  return { d, span: fmt(w - x2) };
}
