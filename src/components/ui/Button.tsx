import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emergency' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'emergency-lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      fullWidth = false,
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-btn transition-colors duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

    const variantStyles = {
      primary: 'bg-moss-700 text-white hover:bg-moss-800 active:bg-moss-800 border border-transparent shadow-subtle',
      secondary: 'bg-sand-100 text-ink-900 hover:bg-sand-200 active:bg-sand-200 border border-sand-200',
      outline: 'bg-surface text-ink-900 border border-ink-400 hover:bg-sand-100 active:bg-sand-200',
      ghost: 'bg-transparent text-ink-700 hover:bg-sand-100 hover:text-ink-900 active:bg-sand-200 border border-transparent',
      emergency: 'bg-alert-700 text-white hover:bg-[#9E211A] active:bg-[#8A1D17] border border-transparent font-semibold shadow-subtle',
      accent: 'bg-saffron-500 text-ink-900 hover:bg-[#E59C2E] active:bg-[#D99125] border border-transparent font-semibold',
    };

    const sizeStyles = {
      sm: 'text-sm py-1.5 px-3 min-h-[36px] gap-1.5',
      md: 'text-base py-2.5 px-4 min-h-[44px] gap-2',
      lg: 'text-base font-semibold py-3 px-6 min-h-[48px] gap-2.5',
      'emergency-lg': 'text-lg font-semibold py-3.5 px-6 min-h-[56px] gap-3',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={twMerge(
          clsx(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            fullWidth && 'w-full',
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
