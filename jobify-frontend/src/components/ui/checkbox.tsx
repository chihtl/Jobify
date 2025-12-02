'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    className,
    label,
    description,
    error,
    indeterminate = false,
    disabled = false,
    checked,
    ...props
  }, ref) => {
    const checkboxId = React.useId();

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            checked={checked}
            disabled={disabled}
            className="sr-only"
            {...props}
          />

          <div
            className={cn(
              'flex items-center justify-center w-5 h-5 border-2 rounded transition-all duration-200',
              'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1',
              checked || indeterminate
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-300 hover:border-gray-400',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-500',
              className
            )}
          >
            {checked && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}

            {indeterminate && !checked && (
              <div className="w-2 h-0.5 bg-white rounded" />
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'block text-sm font-medium text-gray-900 cursor-pointer',
                  disabled && 'text-gray-400 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}

            {description && (
              <p className={cn(
                'text-sm text-gray-600 mt-1',
                disabled && 'text-gray-400'
              )}>
                {description}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
