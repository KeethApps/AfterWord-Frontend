/**
 * AppHeader — top bar shown in the main content area.
 * Displays page title, optional subtitle, and action slot.
 */
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, typography } from "../theme";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  showNotification?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  rightSlot,
  showNotification = false,
}: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.actions}>
        {rightSlot}
        {/* Notification bell */}
        <Pressable
          style={({ hovered }) => [styles.iconBtn, hovered && styles.iconBtnHovered]}
          accessibilityLabel="Notifications"
        >
          <Text style={styles.iconBtnText}>🔔</Text>
          {showNotification && <View style={styles.notificationDot} />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: spacing.headerHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[8],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  titleArea: {
    flexDirection: "column",
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  iconBtnHovered: {
    backgroundColor: colors.mist,
  },
  iconBtnText: {
    fontSize: 16,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.crimson,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
