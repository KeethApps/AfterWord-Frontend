/**
 * ScreenContainer — scrollable content wrapper for each screen.
 * Provides consistent padding and max-width behavior.
 */
import React from "react";
import { ScrollView, View, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing } from "../theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padded?: boolean;
}

export function ScreenContainer({
  children,
  style,
  scrollable = true,
  padded = true,
}: ScreenContainerProps) {
  const inner = (
    <View style={[styles.inner, padded && styles.padded, style]}>
      {children}
    </View>
  );

  if (!scrollable) {
    return <View style={styles.container}>{inner}</View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
  },
  padded: {
    padding: spacing[8],
  },
});
