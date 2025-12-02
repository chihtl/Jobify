'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-gray-200 rounded',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Pre-built skeleton components for common use cases
const SkeletonText = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-4 w-full', className)} {...props} />
);

const SkeletonTitle = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-6 w-3/4', className)} {...props} />
);

const SkeletonAvatar = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-10 w-10 rounded-full', className)} {...props} />
);

const SkeletonButton = ({ className, ...props }: SkeletonProps) => (
  <Skeleton className={cn('h-10 w-24 rounded-lg', className)} {...props} />
);

const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-6 border border-gray-200 rounded-lg bg-white', className)} {...props}>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <SkeletonAvatar />
        <div className="space-y-2 flex-1">
          <SkeletonTitle />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText className="w-5/6" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonButton className="w-20" />
      </div>
    </div>
  </div>
);

const SkeletonJobCard = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('p-6 border border-gray-200 rounded-lg bg-white', className)} {...props}>
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <SkeletonTitle className="w-3/4" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <SkeletonText className="w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <SkeletonText className="w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

const SkeletonList = ({
  count = 6,
  className,
  itemClassName,
  ...props
}: SkeletonProps & {
  count?: number;
  itemClassName?: string;
}) => (
  <div className={cn('space-y-4', className)} {...props}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonJobCard key={i} className={itemClassName} />
    ))}
  </div>
);

const SkeletonTable = ({
  rows = 5,
  cols = 4,
  className,
  ...props
}: SkeletonProps & {
  rows?: number;
  cols?: number;
}) => (
  <div className={cn('space-y-3', className)} {...props}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

const SkeletonChart = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('space-y-4', className)} {...props}>
    <div className="flex justify-between items-end h-32">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-8 rounded-t"
          style={{ height: `${Math.random() * 80 + 20}%` }}
        />
      ))}
    </div>
    <div className="flex justify-between">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-8" />
      ))}
    </div>
  </div>
);

export {
  Skeleton, SkeletonAvatar,
  SkeletonButton,
  SkeletonCard, SkeletonChart, SkeletonJobCard,
  SkeletonList,
  SkeletonTable, SkeletonText,
  SkeletonTitle
};
