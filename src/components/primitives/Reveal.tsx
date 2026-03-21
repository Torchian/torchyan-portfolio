'use client';

import React, { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const DURATION = 0.6;
const EASE = [0.25, 0.1, 0.25, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION, ease: EASE } },
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION, ease: EASE } },
};

const VARIANT_MAP = {
  'fade-up': fadeUp,
  'fade-in': fadeIn,
  'scale-up': scaleUp,
} as const;

export interface RevealProps {
  children: ReactNode;
  variant?: keyof typeof VARIANT_MAP;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  threshold?: number;
}

export function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className,
  as: As = 'div',
  threshold = 0.15,
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const variants = VARIANT_MAP[variant];

  if (prefersReduced) {
    return React.createElement(As, { className }, children);
  }

  const MotionComponent = motion.create(As);

  return (
    <MotionComponent
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      transition={{ delay }}
    >
      {children}
    </MotionComponent>
  );
}
