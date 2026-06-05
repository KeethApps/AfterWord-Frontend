import React from 'react';
import { Text, Pressable } from 'react-native';

export interface FilterPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  className?: string;
}

/**
 * Toggleable chip component used for filtering lists (e.g., "All", "Books", "Quotes").
 */
export const FilterPill = ({ label, isActive, onPress, className = '' }: FilterPillProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        isActive 
          ? 'bg-forest border-forest' 
          : 'bg-transparent border-border'
      } ${className}`}
    >
      <Text className={`text-sm ${isActive ? 'font-sansBold text-white' : 'font-sans text-slate'}`}>
        {label}
      </Text>
    </Pressable>
  );
};
