// Shared animation variants for landing page sections
import { Variants } from "motion/react";

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 }
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const hoverLift = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.3, ease: "easeOut" }
};

export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.3, ease: "easeOut" }
};

export const tapScale = {
  scale: 0.98,
};

// Premium card hover effect
export const hoverPremiumLift = {
  y: -8,
  scale: 1.01,
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

// Glow pulse animation
export const glowPulse = {
  boxShadow: [
    "0 0 20px rgba(212, 165, 116, 0.3)",
    "0 0 40px rgba(212, 165, 116, 0.5)",
    "0 0 20px rgba(212, 165, 116, 0.3)"
  ],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
};

// Float animation for decorative elements
export const floatAnimation = {
  y: [0, -20, 0],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const }
};

// Counter animation helper
export const counterVariants: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
};
