'use client';

import { css } from 'styled-components';

/*
 * The crosshair drawing from Figma's Cursor (3945:15184): a dashed ring with
 * four inward ticks, a plus in the middle, over a round glass backing.
 */

/** The drawing's box in Figma units: the 38px ring plus room for its soft edge (inset -4.55%). */
export const CROSSHAIR_BOX = 41.4545;
export const CROSSHAIR_VIEWBOX = `0 0 ${CROSSHAIR_BOX} ${CROSSHAIR_BOX}`;

/** The dashed ring and its ticks. */
export function CrosshairRing() {
  return (
    <>
      <path d="M22.4545 35.307C23.6197 35.1702 24.7433 34.8981 25.8087 34.505L27.3867 37.6011C25.325 38.4154 23.0785 38.8636 20.7273 38.8636C18.376 38.8636 16.1296 38.4154 14.0678 37.6011L15.645 34.505C16.7107 34.8982 17.8345 35.1711 19 35.3079V31.0909H22.4545V35.307Z" />
      <path d="M8.51913 28.8854C9.59054 30.4855 10.9682 31.863 12.5683 32.9346L10.9911 36.0307C8.75351 34.6041 6.85034 32.7003 5.42387 30.4626L8.51913 28.8854Z" />
      <path d="M36.0307 30.4626C34.6042 32.7003 32.7003 34.6033 30.4626 36.0298L28.8854 32.9346C30.4856 31.8631 31.8631 30.4856 32.9346 28.8854L36.0307 30.4626Z" />
      <path d="M6.94873 15.6441C6.55539 16.71 6.28316 17.8342 6.14666 19H10.3636V22.4545H6.14666C6.28326 23.6198 6.55568 24.7433 6.94873 25.8087L3.85263 27.3859C3.03852 25.3244 2.59091 23.0781 2.59091 20.7273C2.59091 18.3759 3.03816 16.1289 3.85263 14.067L6.94873 15.6441Z" />
      <path d="M37.6011 14.067C38.4156 16.1289 38.8636 18.3757 38.8636 20.7273C38.8636 23.078 38.4151 25.3237 37.6011 27.385L34.5058 25.8079C34.8987 24.7427 35.1712 23.6195 35.3079 22.4545H31.0909V19H35.3079C35.1711 17.8345 34.8982 16.7107 34.505 15.645L37.6011 14.067Z" />
      <path d="M30.4634 5.42387C32.7008 6.8503 34.6042 8.75371 36.0307 10.9911L32.9346 12.5683C31.863 10.9682 30.4855 9.59054 28.8854 8.51913L30.4634 5.42387Z" />
      <path d="M12.5683 8.51913C10.9686 9.59035 9.59132 10.9678 8.51998 12.5674L5.42387 10.9903C6.85026 8.75313 8.75391 6.85018 10.9911 5.42387L12.5683 8.51913Z" />
      <path d="M20.7273 2.59091C23.0784 2.59091 25.325 3.03834 27.3867 3.85263L25.8087 6.94873C24.7433 6.55568 23.6198 6.28326 22.4545 6.14666V10.3636H19V6.14666C17.8345 6.28321 16.7106 6.55553 15.645 6.94873L14.0678 3.85263C16.1295 3.03834 18.3761 2.59091 20.7273 2.59091Z" />
    </>
  );
}

/** The plus in the middle. */
export function CrosshairMark() {
  return (
    <path d="M22.4545 19H25.9091V22.4545H22.4545V25.9091H19V22.4545H15.5455V19H19V15.5455H22.4545V19Z" />
  );
}

/**
 * Figma's Glass effect (blur 3, light from the top left) doesn't exist in CSS:
 * a tint with a thin rim lit on the top-left and bottom-right edges. No
 * backdrop blur: on something that moves with the pointer it re-blurs the page
 * under it on every frame, and under a 72% tint at this size it doesn't show.
 */
export const crosshairGlass = css`
  border-radius: 50%;
  background: rgba(56, 56, 56, 0.72);
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.3),
    inset -1px -1px 0 rgba(255, 255, 255, 0.45);
`;
