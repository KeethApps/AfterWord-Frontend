import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  hasAccent?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Reusable Card component providing a consistent surface.
 * Supports an optional gold accent bar on the left edge.
 */
export const Card = ({
  hasAccent = false,
  className = '',
  contentClassName = '',
  children,
  ...rest
}: CardProps) => {
  return (
    <View 
      className={`bg-surface rounded-xl shadow-sm overflow-hidden flex-row ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1, // Add Android shadow specifically as fallback
      }}
      {...rest}
    >
      {hasAccent && <View className="w-1 bg-gold" />}
      <View className={`flex-1 p-4 ${contentClassName}`}>
        {children}
      </View>
    </View>
  );
};
