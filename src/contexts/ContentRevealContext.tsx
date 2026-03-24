'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ContentRevealContextValue = {
  contentRevealed: boolean;
  markContentRevealed: () => void;
};

const ContentRevealContext = createContext<ContentRevealContextValue | null>(null);

export function ContentRevealProvider({ children }: { children: ReactNode }) {
  const [contentRevealed, setContentRevealed] = useState(false);

  const markContentRevealed = useCallback(() => {
    setContentRevealed(true);
  }, []);

  const value = useMemo(
    () => ({ contentRevealed, markContentRevealed }),
    [contentRevealed, markContentRevealed],
  );

  return (
    <ContentRevealContext.Provider value={value}>
      {children}
    </ContentRevealContext.Provider>
  );
}

export function useContentReveal() {
  const ctx = useContext(ContentRevealContext);
  if (!ctx) {
    throw new Error('useContentReveal must be used within ContentRevealProvider');
  }
  return ctx;
}
