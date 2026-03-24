'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const EASE = [0.25, 0.1, 0.25, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  stagger?: number;
}

export function StaggerReveal({
  children,
  className,
  threshold = 0.1,
  stagger = 0.08,
}: StaggerRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
    >
      {children}
    </motion.div>
  );
}

export { item as staggerItemVariants };
