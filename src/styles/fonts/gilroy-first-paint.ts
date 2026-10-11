import localFont from 'next/font/local';

/*
 * The Gilroy weights the first screen of a page is set in: 600 (navigation,
 * the hero and every page title on a phone) and 900 (the desktop page
 * titles). These are preloaded. The other three weights are declared in
 * gilroy-later.ts without a preload, so a phone isn't fetching ~75 KB of
 * type it doesn't show above the fold before its hero can paint.
 *
 * next/font/local names the family after the binding, so both files declare
 * `const gilroy` and every @font-face lands in one family, "gilroy". Rename
 * one and the weights split into two families.
 */
export const gilroy = localFont({
  src: [
    { path: '../../../public/fonts/gilroy-semibold.woff2', weight: '600' },
    { path: '../../../public/fonts/gilroy-black.woff2', weight: '900' },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});
