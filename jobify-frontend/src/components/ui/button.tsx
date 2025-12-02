'use client';

import { ButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    type = 'button',
    onClick,
    ...props
  }, ref) => {
    const baseClasses = cn(
      // Base styles
      'inline-flex flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',

      // Size variants
      size === 'sm' && 'px-3 py-1.5 text-sm h-9',
      size === 'md' && 'px-4 py-2 text-sm h-10',
      size === 'lg' && 'px-6 py-3 text-base h-12',

      // Color variants
      variant === 'primary' && [
        'bg-blue-600 text-white shadow-sm',
        'hover:bg-blue-700 focus:ring-blue-500',
        'disabled:bg-blue-400',
      ],
      variant === 'secondary' && [
        'bg-gray-100 text-gray-900 shadow-sm border border-gray-300',
        'hover:bg-gray-200 focus:ring-gray-500',
        'disabled:bg-gray-50 disabled:text-gray-400',
      ],
      variant === 'outline' && [
        'bg-transparent text-gray-700 border-2 border-gray-300',
        'hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
        'disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-200',
      ],
      variant === 'ghost' && [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100 focus:ring-gray-500',
        'disabled:bg-transparent disabled:text-gray-400',
      ],
      variant === 'destructive' && [
        'bg-red-600 text-white shadow-sm',
        'hover:bg-red-700 focus:ring-red-500',
        'disabled:bg-red-400',
      ],

      className
    );

    return (
      <button
        className={baseClasses}
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
