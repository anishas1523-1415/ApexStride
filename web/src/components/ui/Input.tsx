'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  glowColor?: 'green' | 'cyan' | 'lime' | 'purple' | 'pink' | 'none';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, glowColor = 'cyan', ...props }, ref) => {
    const glowStyles = {
      green: 'focus:border-neon-green focus:glow-green',
      cyan: 'focus:border-neon-cyan focus:shadow-glow-cyan',
      lime: 'focus:border-neon-lime focus:glow-lime',
      purple: 'focus:border-neon-purple focus:glow-purple',
      pink: 'focus:border-neon-pink focus:glow-pink',
      none: '',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-neon-cyan mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg
            bg-stadium-surface border border-stadium-card
            text-white placeholder-stadium-surface
            transition-all duration-300
            ${glowStyles[glowColor]}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;