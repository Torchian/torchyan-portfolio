/**
 * Blocking script injected into <head> to prevent FOUC.
 *
 * This site only has a dark design (the Figma tokens are all `dark/...` —
 * there's no light-mode visual design, and no UI anywhere to switch theme).
 * It used to auto-detect the OS's prefers-color-scheme and switch to the
 * unfinished light theme, which put near-black text on the site's fixed
 * dark backgrounds/imagery and made it unreadable for anyone whose system
 * is in light mode. Always force dark until a real light mode is designed.
 */
export const themeScript = `
(function() {
  document.documentElement.setAttribute('data-theme', 'dark');
})();
`;
