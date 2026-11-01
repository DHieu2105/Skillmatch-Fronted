"use client";

import { Transition, Variants } from "framer-motion";

/**
 * Animate-UI inspired Spring Physics presets
 * Provides natural, fluid, and responsive motion physics.
 */
export const springs = {
  // Ultra-fluid standard transition (for tabs, layout shifts, sliders)
  smooth: {
    type: "spring",
    stiffness: 320,
    damping: 30,
    mass: 0.8,
  } as Transition,

  // Snappy transition (for buttons, micro-interactions, toggles)
  snappy: {
    type: "spring",
    stiffness: 450,
    damping: 32,
    mass: 0.6,
  } as Transition,

  // Gentle transition (for modals, larger content blocks, panels)
  gentle: {
    type: "spring",
    stiffness: 240,
    damping: 26,
    mass: 0.9,
  } as Transition,

  // Bouncy micro-interaction (for badges, like/save icons, notifications)
  bouncy: {
    type: "spring",
    stiffness: 400,
    damping: 18,
    mass: 0.7,
  } as Transition,
};

/**
 * Staggered container animations for lists and grids
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

/**
 * Standard item entrance with gentle rise & subtle un-blur
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springs.gentle,
  },
};

/**
 * Quick fade in for alerts, badges and status chips
 */
export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.15 },
  },
};

/**
 * Dropdown / Popover entrance & exit
 */
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transformOrigin: "top right",
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transition: { duration: 0.12, ease: "easeOut" },
  },
};

/**
 * Micro-interaction tap/hover presets for buttons & clickable items
 */
export const buttonMotionProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: springs.snappy,
};

export const cardMotionProps = {
  whileHover: { y: -3, transition: springs.snappy },
  transition: springs.smooth,
};

