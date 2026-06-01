import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ hovered, pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        hovered && !disabled && styles[`${variant}_hovered` as keyof typeof styles],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      disabled={disabled}
    >
      {icon && <Text style={[styles.icon, styles[`${variant}_text` as keyof typeof styles]]}>{icon}</Text>}
      <Text style={[styles.label, styles[`${variant}_text` as keyof typeof styles], styles[`size_${size}_text` as keyof typeof styles]]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    gap: Spacing.s8,
  } as ViewStyle,

  // Variants
  primary: {
    backgroundColor: Colors.forest,
  } as ViewStyle,
  primary_hovered: {
    backgroundColor: Colors.forest,
  } as ViewStyle,
  primary_text: {
    color: Colors.white,
    fontWeight: "600",
  } as TextStyle,

  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.border,
  } as ViewStyle,
  secondary_hovered: {
    backgroundColor: Colors.mist,
  } as ViewStyle,
  secondary_text: {
    color: Colors.forest,
    fontWeight: "500",
  } as TextStyle,

  ghost: {
    backgroundColor: "transparent",
  } as ViewStyle,
  ghost_hovered: {
    backgroundColor: Colors.mist,
  } as ViewStyle,
  ghost_text: {
    color: Colors.slate,
    fontWeight: "400",
  } as TextStyle,

  danger: {
    backgroundColor: Colors.danger,
  } as ViewStyle,
  danger_hovered: {
    backgroundColor: "#c03a3a",
  } as ViewStyle,
  danger_text: {
    color: Colors.white,
    fontWeight: "600",
  } as TextStyle,

  // Sizes
  size_sm: {
    paddingVertical: Spacing.s8,
    paddingHorizontal: Spacing.s12,
  } as ViewStyle,
  size_sm_text: {
    fontSize: 14,
  } as TextStyle,

  size_md: {
    paddingVertical: Spacing.s12,
    paddingHorizontal: Spacing.s20,
  } as ViewStyle,
  size_md_text: {
    fontSize: 16,
  } as TextStyle,

  size_lg: {
    paddingVertical: Spacing.s16,
    paddingHorizontal: Spacing.s32,
  } as ViewStyle,
  size_lg_text: {
    fontSize: 18,
  } as TextStyle,

  fullWidth: {
    width: "100%" as any,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.4,
  },

  label: {
    fontFamily: Fonts.sans,
    letterSpacing: 0.2,
  } as TextStyle,

  icon: {
    fontSize: 15,
  } as TextStyle,
});
