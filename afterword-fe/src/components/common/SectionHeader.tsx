import React from 'react';
import { View, Text } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Standardized header for page sections.
 * Uses the Lora serif font for the title.
 */
export const SectionHeader = ({
  title,
  subtitle,
  action,
  className = '',
}: SectionHeaderProps) => {
  return (
    <View className={`flex-row items-center justify-between mb-4 ${className}`}>
      <View className="flex-1">
        <Text className="font-serifBold text-xl text-forest">{title}</Text>
        {subtitle ? (
          <Text className="font-sans text-sm text-slate mt-1">{subtitle}</Text>
        ) : null}
      </View>
      {action && <View className="ml-4">{action}</View>}
    </View>
  );
};
