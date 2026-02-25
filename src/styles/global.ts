'use client';

import { createGlobalStyle } from 'styled-components';
import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';
import { generateCSSVariables } from './css-vars';
import { fontFamily } from './tokens/typography';

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
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  ::selection {
    background-color: var(--color-accent-primary);
    color: var(--color-text-inverse);
  }

  #skip-to-content {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    z-index: 9999;

    &:focus {
      position: fixed;
      top: 0;
      left: 0;
      width: auto;
      height: auto;
      padding: 8px 16px;
      background: var(--color-accent-primary);
      color: var(--color-text-inverse);
      font-weight: 600;
    }
  }
`;
