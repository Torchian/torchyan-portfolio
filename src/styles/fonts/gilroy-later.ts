import localFont from 'next/font/local';

/*
 * The rest of Gilroy, loaded when text first asks for it rather than
 * preloaded. Same family as gilroy-first-paint.ts (see there). Its own
 * fallback face is off: the first-paint file already declares "gilroy
 * Fallback", and a second one would replace it.
 */
const gilroy = localFont({
  src: [
    { path: '../../../public/fonts/gilroy-regular.woff2', weight: '400' },
    { path: '../../../public/fonts/gilroy-medium.woff2', weight: '500' },
    { path: '../../../public/fonts/gilroy-bold.woff2', weight: '700' },
  ],
  variable: '--font-gilroy-later',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export { gilroy as gilroyLater };
