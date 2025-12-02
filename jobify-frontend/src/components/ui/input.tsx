'use client';

import { InputProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    placeholder,
    value,
    onChange,
    onBlur,
    disabled = false,
    required = false,
    ...props
  }, ref) => {
    const inputId = React.useId();

    const inputClasses = cn(
      // Base styles
      'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-gray-500',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',

      // Error state
      error && 'border-red-500 focus:ring-red-500',

      className
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-gray-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        )}

        <input
          id={inputId}
          className={inputClasses}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          ref={ref}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
