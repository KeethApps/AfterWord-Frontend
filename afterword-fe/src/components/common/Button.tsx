import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export interface ButtonProps extends PressableProps {
  title?: string;
  label?: string; // Legacy support
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost'; // Ghost maps to tertiary
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  fullWidth?: boolean; // Legacy support
}

/**
 * Reusable Button component matching the AfterWord design system.
 * Supports primary, secondary, and tertiary styles, plus loading and disabled states.
 */
export const Button = ({
  title,
  label,
  variant = 'primary',
  loading = false,
  icon,
  disabled = false,
  className = '',
  fullWidth = false,
  ...rest
}: ButtonProps) => {
  const displayTitle = title || label;
  let baseClasses = "flex-row items-center justify-center rounded-full ";
  let textClasses = "font-sansBold text-base ";

  if (variant === 'primary') {
    baseClasses += "bg-forest px-6 py-3 ";
    textClasses += "text-white";
  } else if (variant === 'secondary') {
    baseClasses += "bg-transparent border-2 border-forest px-6 py-3 ";
    textClasses += "text-forest";
  } else if (variant === 'tertiary' || variant === 'ghost') {
    baseClasses += "bg-transparent px-4 py-2 ";
    textClasses += "text-slate";
  }

  if (fullWidth) {
    baseClasses += "w-full ";
  }

  if (disabled || loading) {
    baseClasses += "opacity-50 ";
  }

  const iconColor = variant === 'primary' ? Colors.white : (variant === 'secondary' ? Colors.forest : Colors.slate);
  const spinnerColor = variant === 'primary' ? Colors.white : Colors.forest;

  return (
    <Pressable
      disabled={disabled || loading}
      className={`${baseClasses} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={iconColor}
              style={{ marginRight: displayTitle ? 8 : 0 }}
            />
          )}
          {displayTitle ? <Text className={textClasses}>{displayTitle}</Text> : null}
        </>
      )}
    </Pressable>
  );
};
