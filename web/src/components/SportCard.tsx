'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from './ui/Card';

interface SportCardProps {
  sport: {
    id: string;
    name: string;
    description: string;
    icon: string;
    glowColor: string;
    gradient: string;
  };
  onSelect: (sportId: string) => void;
  animationDelay: number;
}

const SportCard: React.FC<SportCardProps> = ({
  sport,
  onSelect,
  animationDelay,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const sportAnimations: Record<string, any> = {
    cricket: {
      animate: { x: [0, 50, 0], rotate: [0, 360, 0] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    football: {
      animate: { y: [-50, 0], x: [100, 0] },
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    weightlifting: {
      animate: { y: [-100, 0], scale: [0.5, 1] },
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    badminton: {
      animate: { x: [-50, 50, 0], y: [-30, 0] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    running: {
      animate: { x: [0, 30, 0], y: [-20, 0] },
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
  };

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onSelect(sport.id);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer h-full"
    >
      <Card
        variant="glass"
        glowColor={sport.glowColor as any}
        className={`h-full flex flex-col justify-between overflow-hidden relative`}
      >
        {/* Background gradient accent */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-br ${sport.gradient}`} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            className="text-6xl mb-4"
            animate={isAnimating ? sportAnimations[sport.id].animate : {}}
            transition={isAnimating ? sportAnimations[sport.id].transition : {}}
          >
            {sport.icon}
          </motion.div>

          <h3 className="text-2xl font-bold text-neon-green mb-2">
            {sport.name}
          </h3>
          <p className="text-neon-cyan/80 text-sm">
            {sport.description}
          </p>
        </div>

        {/* Footer action hint */}
        <div className="relative z-10 mt-4 pt-4 border-t border-neon-cyan/20">
          <p className="text-xs text-neon-cyan/60 hover:text-neon-cyan transition-colors">
            Click to analyze →
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default SportCard;