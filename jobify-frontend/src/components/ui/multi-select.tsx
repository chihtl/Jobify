'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  maxDisplayed?: number;
  searchable?: boolean;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({
    options,
    value = [],
    onChange,
    placeholder = 'Chọn...',
    label,
    error,
    disabled = false,
    maxDisplayed = 3,
    searchable = true,
    className,
    ...props
  }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectId = React.useId();

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const isClickInsideContainer = containerRef.current && containerRef.current.contains(target);
        // Check if click is inside the portal dropdown
        const dropdownElement = document.querySelector('.multi-select-dropdown');
        const isClickInsideDropdown = dropdownElement && dropdownElement.contains(target);
        
        if (!isClickInsideContainer && !isClickInsideDropdown) {
          setIsOpen(false);
          setSearchQuery('');
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

        const filteredOptions = getFilteredOptions();

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex(prev =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex(prev =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
            break;
          case 'Enter':
            event.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
              toggleOption(filteredOptions[highlightedIndex].value);
            }
            break;
          case 'Escape':
            setIsOpen(false);
            setSearchQuery('');
            setHighlightedIndex(-1);
            break;
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

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

    const getFilteredOptions = () => {
      if (!searchQuery) return options;
      return options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    };

    const getSelectedOptions = () => {
      return options.filter(option => value.includes(option.value));
    };

    const toggleOption = (optionValue: string) => {
      if (disabled) return;

      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];

      onChange(newValue);
    };

    const removeOption = (optionValue: string) => {
      const newValue = value.filter(v => v !== optionValue);
      onChange(newValue);
    };

    const clearAll = () => {
      onChange([]);
    };

    const updateDropdownPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
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
    };

    const selectedOptions = getSelectedOptions();
    const filteredOptions = getFilteredOptions();
    const displayedOptions = selectedOptions.slice(0, maxDisplayed);
    const remainingCount = selectedOptions.length - maxDisplayed;

    return (
      <div className={cn('space-y-1', className)} ref={ref} {...props}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block text-sm font-medium text-gray-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative multi-select-container" ref={containerRef} style={{ zIndex: 99998 }}>
          {/* Trigger */}
          <div
            id={selectId}
            className={cn(
              'flex items-center justify-between min-h-[2.5rem] w-full px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
              error && 'border-red-500 focus:ring-red-500',
              isOpen && 'ring-2 ring-blue-500 border-transparent'
            )}
            onClick={handleToggle}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <div className="flex-1 flex flex-wrap gap-1">
              {selectedOptions.length === 0 ? (
                <span className="text-gray-500 text-sm">{placeholder}</span>
              ) : (
                <>
                  {displayedOptions.map((option) => (
                    <span
                      key={option.value}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {option.label}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOption(option.value);
                        }}
                        className="hover:bg-blue-200 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {remainingCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{remainingCount} more
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedOptions.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform duration-200',
                  isOpen && 'transform rotate-180'
                )}
              />
            </div>
          </div>

        </div>

        {/* Dropdown Portal */}
        {isOpen && typeof window !== 'undefined' && createPortal(
          <div 
            className="fixed bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden multi-select-dropdown"
            style={{ 
              zIndex: 100001,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Không tìm thấy kết quả
                  </div>
                ) : (
                  filteredOptions.map((option, index) => {
                    const isSelected = value.includes(option.value);
                    const isHighlighted = highlightedIndex === index;

                    return (
                      <div
                        key={option.value}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-sm cursor-pointer',
                          'hover:bg-gray-100',
                          isHighlighted && 'bg-gray-100',
                          isSelected && 'bg-blue-50 text-blue-600',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => !option.disabled && toggleOption(option.value)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="flex-1 truncate">{option.label}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
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

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
