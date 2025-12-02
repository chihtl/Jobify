'use client';

import { SelectProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({
    label,
    error,
    placeholder = 'Chọn...',
    value,
    onChange,
    options = [],
    disabled = false,
    required = false,
    className,
    ...props
  }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const selectId = React.useId();

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const isClickInsideSelect = selectRef.current && selectRef.current.contains(target);
        const isClickInsideDropdown = optionsRef.current && optionsRef.current.contains(target);
        
        if (!isClickInsideSelect && !isClickInsideDropdown) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex(prev =>
              prev < options.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex(prev =>
              prev > 0 ? prev - 1 : options.length - 1
            );
            break;
          case 'Enter':
            event.preventDefault();
            if (highlightedIndex >= 0) {
              handleSelect(options[highlightedIndex].value);
            }
            break;
          case 'Escape':
            setIsOpen(false);
            setHighlightedIndex(-1);
            break;
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, options]);

    // Update position on scroll/resize
    useEffect(() => {
      if (!isOpen) return;

      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }, [isOpen]);

  const updateDropdownPosition = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
    setHighlightedIndex(-1);
  };

  const handleSelect = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

    const selectedOption = options.find(option => option.value === value);

    const triggerClasses = cn(
      'flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
      'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
      error && 'border-red-500 focus:ring-red-500',
      className
    );

    return (
      <div className="space-y-1" ref={ref} {...props}>
        {label && (
          <label
            htmlFor={selectId}
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

        <div className="relative select-container" ref={selectRef} style={{ zIndex: 50 }}>
          <div
            id={selectId}
            className={triggerClasses}
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className={cn(
              'block truncate',
              !selectedOption && 'text-gray-500'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>

        </div>

        {/* Dropdown Portal */}
        {isOpen && typeof window !== 'undefined' && createPortal(
          <div
            ref={optionsRef}
            className="fixed bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto select-dropdown"
            style={{ 
              zIndex: 100000,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            role="listbox"
          >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Không có tùy chọn nào
                </div>
              ) : (
                options.map((option, index) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm cursor-pointer',
                      'hover:bg-gray-100',
                      highlightedIndex === index && 'bg-gray-100',
                      value === option.value && 'bg-blue-50 text-blue-600'
                    )}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <span className="block truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ))
              )}
            </div>,
          document.body
        )}

        {error && (
          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
