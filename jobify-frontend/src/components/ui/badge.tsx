'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const badgeClasses = cn(
      // Base styles
      'inline-flex items-center font-medium rounded-full whitespace-nowrap',

      // Size variants
      size === 'sm' && 'px-2 py-0.5 text-xs',
      size === 'md' && 'px-2.5 py-1 text-xs',
      size === 'lg' && 'px-3 py-1.5 text-sm',

      // Color variants
      variant === 'default' && 'bg-gray-100 text-gray-800',
      variant === 'secondary' && 'bg-gray-50 text-gray-600 border border-gray-200',
      variant === 'success' && 'bg-green-100 text-green-800',
      variant === 'warning' && 'bg-yellow-100 text-yellow-800',
      variant === 'danger' && 'bg-red-100 text-red-800',
      variant === 'info' && 'bg-blue-100 text-blue-800',
      variant === 'outline' && 'bg-transparent text-gray-700 border border-gray-300',

      className
    );

    return (
      <div className={badgeClasses} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
