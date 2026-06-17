import React from 'react';
import { View, TextInput, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export interface SearchBarProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  className?: string;
}

/**
 * Universal search input with integrated search icon, clear button,
 * and an optional filter action button.
 */
export const SearchBar = ({
  value,
  onChangeText,
  onClear,
  onFilterPress,
  rightIcon,
  onRightIconPress,
  className = '',
  placeholder = 'Search...',
  ...rest
}: SearchBarProps) => {
  return (
    <View className={`flex-row items-center gap-x-2 mt-2 ${className}`}>
      <View className="flex-1 h-12 flex-row items-center bg-white rounded-xl px-4 border border-border">
        <Ionicons name="search" size={18} color={Colors.slate} />
        
        <TextInput
          className="flex-1 font-sans text-base text-forest ml-2 h-full py-0"
          placeholder={placeholder}
          placeholderTextColor={Colors.slate}
          value={value}
          onChangeText={onChangeText}
          {...rest}
        />

        {value.length > 0 && (
          <Pressable onPress={() => {
            onChangeText('');
            onClear?.();
          }} className="ml-2 p-1">
            <Ionicons name="close-circle" size={20} color={Colors.slate} />
          </Pressable>
        )}

        {rightIcon && value.length === 0 && (
          <Pressable onPress={onRightIconPress} className="ml-2 p-1">
            <Ionicons name={rightIcon} size={25} color={Colors.slate} />
          </Pressable>
        )}
      </View>

      {onFilterPress && (
        <Pressable 
          onPress={onFilterPress}
          className="w-12 h-12 bg-white border border-border rounded-xl items-center justify-center"
        >
          <Ionicons name="options-outline" size={24} color={Colors.forest} />
        </Pressable>
      )}
    </View>
  );
};
