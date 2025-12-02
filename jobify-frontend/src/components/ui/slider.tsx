'use client';

import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  disabled?: boolean;
  className?: string;
  formatLabel?: (value: number) => string;
  label?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue = [min, max],
    onChange,
    disabled = false,
    className,
    formatLabel,
    label,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState<[number, number]>(
      value || defaultValue
    );

    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

    // Sync internal value with external value
    useEffect(() => {
      if (value) {
        setInternalValue(value);
      }
    }, [value]);

    const getPercentage = useCallback((val: number) => {
      return ((val - min) / (max - min)) * 100;
    }, [min, max]);

    const getValue = useCallback((percentage: number) => {
      const value = min + (percentage / 100) * (max - min);
      return Math.round(value / step) * step;
    }, [min, max, step]);

    const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(type);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging || !sliderRef.current || disabled) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
      const newValue = getValue(percentage);

      setInternalValue(prev => {
        let newInternalValue: [number, number];

        if (isDragging === 'min') {
          newInternalValue = [Math.min(newValue, prev[1]), prev[1]];
        } else {
          newInternalValue = [prev[0], Math.max(newValue, prev[0])];
        }

        if (onChange) {
          onChange(newInternalValue);
        }

        return newInternalValue;
      });
    }, [isDragging, getValue, onChange, disabled]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(null);
    }, []);

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const minPercentage = getPercentage(internalValue[0]);
    const maxPercentage = getPercentage(internalValue[1]);

    return (
      <div className={cn('space-y-3', className)} ref={ref} {...props}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Track */}
          <div
            ref={sliderRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
          >
            {/* Active range */}
            <div
              className="absolute h-2 bg-blue-600 rounded-full"
              style={{
                left: `${minPercentage}%`,
                width: `${maxPercentage - minPercentage}%`,
              }}
            />

            {/* Min thumb */}
            <div
              className={cn(
                'absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-sm',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                disabled && 'opacity-50 cursor-not-allowed',
                isDragging === 'min' && 'scale-110 shadow-md'
              )}
              style={{ left: `${minPercentage}%` }}
              onMouseDown={handleMouseDown('min')}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={internalValue[1]}
              aria-valuenow={internalValue[0]}
            />

            {/* Max thumb */}
            <div
              className={cn(
                'absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-sm',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                disabled && 'opacity-50 cursor-not-allowed',
                isDragging === 'max' && 'scale-110 shadow-md'
              )}
              style={{ left: `${maxPercentage}%` }}
              onMouseDown={handleMouseDown('max')}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={internalValue[0]}
              aria-valuemax={max}
              aria-valuenow={internalValue[1]}
            />
          </div>
        </div>

        {/* Value display */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {formatLabel ? formatLabel(internalValue[0]) : internalValue[0].toLocaleString()}
          </span>
          <span>
            {formatLabel ? formatLabel(internalValue[1]) : internalValue[1].toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
