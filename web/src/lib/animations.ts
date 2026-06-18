import { Variants } from 'framer-motion';

// The "Batsman Swing" Page Transition
// Aggressive wipe modeling a bat/racket swing accelerating across view boundaries.
export const batsmanSwingTransition: Variants = {
  hidden: { x: '-100vw', skewX: 20, opacity: 0 },
  enter: { 
    x: 0, 
    skewX: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 200, damping: 20, mass: 0.8 } 
  },
  exit: { 
    x: '100vw', 
    skewX: -20, 
    opacity: 0, 
    transition: { type: 'spring', stiffness: 200, damping: 20 } 
  }
};

// The "Player Dive" Content Reveal
// Fast entry with decel-cushioned curve.
export const playerDiveReveal: Variants = {
  hidden: { y: 150, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 250, damping: 25, mass: 1 } 
  }
};

// The "Goal Post" Metric Pop
// Scale up with recoil bounce effect.
export const goalPostPop: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 300, damping: 15, mass: 0.5 } 
  }
};

// The "Athlete Sprints" Loading State container variants
export const sprintStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
