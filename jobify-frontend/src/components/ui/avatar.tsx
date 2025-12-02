'use client';

import { cn, getInitials } from '@/lib/utils';
import { User } from 'lucide-react';
import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  fallbackColor?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({
    className,
    src,
    alt,
    name,
    size = 'md',
    shape = 'circle',
    fallbackColor,
    ...props
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
      '2xl': 'w-20 h-20 text-xl',
    };

    const avatarClasses = cn(
      'relative inline-flex items-center justify-center overflow-hidden bg-gray-100',
      sizeClasses[size],
      shape === 'circle' ? 'rounded-full' : 'rounded-lg',
      className
    );

    const initials = name ? getInitials(name) : '';

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    return (
      <div className={avatarClasses} ref={ref} {...props}>
        {src && !imageError && (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className={cn(
              'w-full h-full object-contain transition-opacity duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {(!src || imageError || !imageLoaded) && (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center text-gray-600 font-medium',
              fallbackColor && `bg-[${fallbackColor}]`
            )}
            style={fallbackColor ? { backgroundColor: fallbackColor } : undefined}
          >
            {initials ? (
              <span className="select-none">{initials}</span>
            ) : (
              <User className={cn(
                'text-gray-400',
                size === 'sm' && 'w-4 h-4',
                size === 'md' && 'w-5 h-5',
                size === 'lg' && 'w-6 h-6',
                size === 'xl' && 'w-8 h-8',
                size === '2xl' && 'w-10 h-10'
              )} />
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  spacing?: 'tight' | 'normal' | 'loose';
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({
    className,
    children,
    max = 5,
    size = 'md',
    spacing = 'normal',
    ...props
  }, ref) => {
    const avatars = React.Children.toArray(children);
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    const spacingClasses = {
      tight: '-space-x-1',
      normal: '-space-x-2',
      loose: '-space-x-3',
    };

    const groupClasses = cn(
      'flex items-center',
      spacingClasses[spacing],
      className
    );

    return (
      <div className={groupClasses} ref={ref} {...props}>
        {visibleAvatars.map((avatar, index) => (
          <div key={index} className="relative border-2 border-white rounded-full">
            {avatar}
          </div>
        ))}

        {remainingCount > 0 && (
          <Avatar
            size={size}
            className="border-2 border-white bg-gray-200 text-gray-600"
          >
            +{remainingCount}
          </Avatar>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
