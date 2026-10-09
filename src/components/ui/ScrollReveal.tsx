"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  variant?: "section" | "media" | "item";
};

const revealEase = [0.22, 1, 0.36, 1] as const;

const revealInitial = {
  section: { opacity: 0, y: 22 },
  media: { opacity: 0, y: 18, scale: 0.985 },
  item: { opacity: 0, y: 14 },
} as const;

export function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.16,
  variant = "section",
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <motion.div
      className={className}
      initial={shouldAnimate ? revealInitial[variant] : false}
      whileInView={shouldAnimate ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={{ once: true, amount }}
      transition={shouldAnimate ? { duration: variant === "item" ? 0.48 : 0.58, delay, ease: revealEase } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
};

export function StaggerReveal({ children, className, delay = 0, stagger = 0.055 }: StaggerRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  return (
    <motion.div
      className={className}
      initial={shouldAnimate ? "hidden" : false}
      whileInView={shouldAnimate ? "visible" : undefined}
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: revealEase } },
      }}
    >
      {children}
    </motion.div>
  );
}
