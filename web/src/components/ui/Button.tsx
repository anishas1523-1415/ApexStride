'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: 'green' | 'cyan' | 'lime' | 'purple' | 'pink' | 'blue' | 'none';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    glow = 'none',
    isLoading = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantStyles = {
      primary: 'bg-neon-green text-stadium-black hover:shadow-glow-green active:scale-95',
      secondary: 'bg-stadium-surface text-neon-cyan hover:bg-stadium-card',
      outline: 'border-2 border-neon-cyan text-neon-cyan hover:bg-glass-light',
      ghost: 'text-neon-green hover:bg-glass-light',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
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

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${glowStyles[glow]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;