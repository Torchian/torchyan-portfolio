/**
 * The document itself (<html lang>, fonts, providers) is rendered by
 * app/[locale]/layout.tsx. This pass-through root only exists so
 * app/not-found.tsx can catch requests outside any locale.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
