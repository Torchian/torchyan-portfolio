'use client';

import { createGlobalStyle } from 'styled-components';
import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';
import { generateCSSVariables } from './css-vars';
import { fontFamily, fontWeight } from './tokens/typography';
import { spacing } from './tokens/spacing';
import { border } from './tokens/border';
import { zIndex } from './tokens/z-index';

export const GlobalStyle = createGlobalStyle`
  [data-theme='dark'] {
    ${generateCSSVariables(darkTheme)}
    color-scheme: dark;
  }

  [data-theme='light'] {
    ${generateCSSVariables(lightTheme)}
    color-scheme: light;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    text-size-adjust: 100%;
    scroll-behavior: smooth;
    scroll-padding-top: ${spacing[1000]}px;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  body {
    font-family: ${fontFamily.body};
    color: var(--color-text-primary);
    background-color: var(--color-bg-primary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }

  input, button, textarea, select {
    font: inherit;
    color: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    background: none;
    border: none;
  }

  ul, ol {
    list-style: none;
  }

  :focus-visible {
    outline: ${border.thick}px solid var(--color-border-focus);
    outline-offset: ${spacing[25]}px;
  }

  ::selection {
    background-color: var(--color-accent-primary);
    color: var(--color-text-inverse);
  }

  #main-content {
    display: flex;
    flex-direction: column;
    gap: ${spacing[2000]}px;
  }

  #skip-to-content {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    z-index: ${zIndex.tooltip};

    &:focus {
      position: fixed;
      top: 0;
      left: 0;
      width: auto;
      height: auto;
      padding: ${spacing[100]}px ${spacing[200]}px;
      background: var(--color-accent-primary);
      color: var(--color-text-inverse);
      font-weight: ${fontWeight.semibold};
    }
  }
`;
