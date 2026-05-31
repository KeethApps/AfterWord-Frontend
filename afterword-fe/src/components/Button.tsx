/**
 * Button — primary and secondary variants matching the AfterWord mockup.
 */
import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

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
    borderRadius: radius.btn,
    gap: spacing[2],
  } as ViewStyle,

  // Variants
  primary: {
    backgroundColor: colors.forest,
  } as ViewStyle,
  primary_hovered: {
    backgroundColor: colors.primaryHover,
  } as ViewStyle,
  primary_text: {
    color: colors.textInverse,
    fontWeight: "600",
  } as TextStyle,

  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.border,
  } as ViewStyle,
  secondary_hovered: {
    backgroundColor: colors.mist,
  } as ViewStyle,
  secondary_text: {
    color: colors.textPrimary,
    fontWeight: "500",
  } as TextStyle,

  ghost: {
    backgroundColor: "transparent",
  } as ViewStyle,
  ghost_hovered: {
    backgroundColor: colors.mist,
  } as ViewStyle,
  ghost_text: {
    color: colors.textMuted,
    fontWeight: "400",
  } as TextStyle,

  danger: {
    backgroundColor: colors.crimson,
  } as ViewStyle,
  danger_hovered: {
    backgroundColor: "#c03a3a",
  } as ViewStyle,
  danger_text: {
    color: colors.textInverse,
    fontWeight: "600",
  } as TextStyle,

  // Sizes
  size_sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  } as ViewStyle,
  size_sm_text: {
    fontSize: typography.sizes.sm,
  } as TextStyle,

  size_md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
  } as ViewStyle,
  size_md_text: {
    fontSize: typography.sizes.base,
  } as TextStyle,

  size_lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
  } as ViewStyle,
  size_lg_text: {
    fontSize: typography.sizes.md,
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
    fontFamily: typography.fonts.body,
    letterSpacing: 0.2,
  } as TextStyle,

  icon: {
    fontSize: 15,
  } as TextStyle,
});
