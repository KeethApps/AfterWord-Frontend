/**
 * EmptyState — displayed when a section has no content yet.
 * Features FolioFox, a descriptive message, and an optional CTA.
 */
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../theme";
import { FolioFox } from "./FolioFox";

type FoxMood = "reading" | "happy" | "thinking" | "waving" | "laptop" | "sad";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  foxVariant?: FoxMood;
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  onCta,
  foxVariant = "reading",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <FolioFox size={120} variant={foxVariant} style={styles.fox} />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {ctaLabel && onCta && (
        <Pressable
          onPress={onCta}
          style={({ hovered, pressed }) => [
            styles.cta,
            hovered && styles.ctaHovered,
            pressed && styles.ctaPressed,
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[8],
  },
  fox: {
    marginBottom: spacing[5],
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing[2],
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: spacing[6],
  },
  cta: {
    backgroundColor: colors.forest,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: radius.btn,
  },
  ctaHovered: {
    backgroundColor: colors.primaryHover,
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    fontWeight: "600",
    color: colors.textInverse,
    letterSpacing: 0.2,
  },
});
