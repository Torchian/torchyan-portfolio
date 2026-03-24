'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.25, 0.1, 0.25, 1] as const;

const variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE } },
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial={false}
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
