/**
 * SectionHeader — label row with optional "View all" action.
 * Used throughout Home and Library screens.
 */
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../theme";

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}

export function SectionHeader({
  title,
  onViewAll,
  viewAllLabel = "View all",
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onViewAll && (
        <Pressable
          onPress={onViewAll}
          style={({ hovered }) => [styles.viewAll, hovered && styles.viewAllHovered]}
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>{viewAllLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[4],
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  viewAll: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: 6,
  },
  viewAllHovered: {
    backgroundColor: colors.mist,
  },
  viewAllText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
