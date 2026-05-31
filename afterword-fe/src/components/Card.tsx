/**
 * Card — generic surface card matching the AfterWord card style.
 */
import React from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { colors, radius, shadows } from "../theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  accent?: boolean; // amber left border highlight
}

export function Card({ children, style, onPress, elevated = false, accent = false }: CardProps) {
  const content = (
    <View style={[
      styles.card,
      elevated && styles.elevated,
      accent && styles.accent,
      style,
    ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ hovered }) => [
          styles.pressable,
          hovered && styles.pressableHovered,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 0, // children manage their own padding
    overflow: "hidden",
  } as ViewStyle,
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  } as ViewStyle,
  accent: {
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
  } as ViewStyle,
  pressable: {
    borderRadius: radius.card,
  },
  pressableHovered: {
    transform: [{ translateY: -1 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
});
