import React from 'react';
import { ScrollView, Pressable, Text, View } from 'react-native';

export interface FilterPillOption<T extends string = string> {
  label: string;
  value: T;
}

interface FilterPillsProps<T extends string = string> {
  options: FilterPillOption<T>[];
  activeValue: T;
  onSelect: (value: T) => void;
  /** Render inside a horizontal ScrollView (true by default) */
  scrollable?: boolean;
  className?: string;
}

/**
 * Horizontal row of selectable pill chips.
 * Active pill: forest background + white text.
 * Inactive pill: white background + forest text + mist border.
 */
export function FilterPills<T extends string>({
  options,
  activeValue,
  onSelect,
  scrollable = true,
  className = '',
}: FilterPillsProps<T>) {
  const pills = (
    <View className={`flex-row gap-2 ${className}`}>
      {options.map((opt) => {
        const isActive = opt.value === activeValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className={`px-4 py-2 rounded-full ${
              isActive ? 'bg-forest' : 'bg-white border border-mist'
            }`}
            style={({ pressed }) => pressed && { opacity: 0.75 }}
          >
            <Text
              className={`font-sans text-sm ${isActive ? 'text-white' : 'text-forest'}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (!scrollable) return pills;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((opt) => {
        const isActive = opt.value === activeValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            className={`px-4 py-2 rounded-full ${
              isActive ? 'bg-forest' : 'bg-white border border-mist'
            }`}
            style={({ pressed }) => pressed && { opacity: 0.75 }}
          >
            <Text
              className={`font-sans text-sm ${isActive ? 'text-white' : 'text-forest'}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
