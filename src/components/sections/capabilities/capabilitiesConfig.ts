export interface CapabilityList {
  lead: string;
  items: string[];
}

export interface Capability {
  title: string;
  /** Main copy — a paragraph, or a lead line with a bulleted list. */
  text: string | CapabilityList;
  footnote: string;
  /** Shown inside the centre circle while the card is hovered (desktop), and as a row under the copy (tablet / mobile). */
  skills: string[];
}

/*
 * The four capabilities themselves live in messages/*.json under capabilities.items.
 * Order matters: top-left, top-right, bottom-left, bottom-right on desktop.
 */
