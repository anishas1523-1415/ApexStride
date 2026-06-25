'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'minimal';
  glowColor?: 'green' | 'cyan' | 'lime' | 'purple' | 'pink' | 'blue' | 'none';
  hoverEffect?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className = '',
    variant = 'default',
    glowColor = 'none',
    hoverEffect = true,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';

    const variantStyles = {
      default: 'bg-stadium-card border border-stadium-surface',
      glass: 'glass bg-glass-dark border border-neon-cyan/20',
      minimal: 'bg-transparent border border-stadium-surface/50',
    };

    const glowStyles = {
      green: 'glow-green',
      cyan: 'glow-cyan',
      lime: 'glow-lime',
      purple: 'glow-purple',
      pink: 'glow-pink',
      blue: 'shadow-glow-blue',
      none: '',
    };

    const hoverStyles = hoverEffect ? 'hover:shadow-glass hover:scale-105 hover:-translate-y-2' : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${glowStyles[glowColor]}
          ${hoverStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;