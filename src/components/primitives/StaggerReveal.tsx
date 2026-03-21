'use client';

import React, { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const EASE = [0.25, 0.1, 0.25, 1] as const;

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

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
  as?: keyof React.JSX.IntrinsicElements;
  threshold?: number;
  stagger?: number;
}

export function StaggerReveal({
  children,
  className,
  as: As = 'div',
  threshold = 0.1,
  stagger = 0.08,
}: StaggerRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return React.createElement(As, { className }, children);
  }

  const MotionContainer = motion.create(As);

  const customContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <MotionContainer
      className={className}
      variants={customContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
    >
      {children}
    </MotionContainer>
  );
}

export { item as staggerItemVariants };
