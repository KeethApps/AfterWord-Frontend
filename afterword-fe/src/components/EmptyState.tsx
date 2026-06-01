import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants/theme";
import { FolioFox } from "./FolioFox";
import { Ionicons } from "@expo/vector-icons";

type FoxMood = "reading" | "happy" | "thinking" | "waving" | "laptop" | "sad";

interface EmptyStateProps {
  title: string;
  description?: string;
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
  foxVariant?: FoxMood;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title,
  description,
  message,
  ctaLabel,
  onCta,
  foxVariant,
  icon,
}: EmptyStateProps) {
  const bodyText = description || message;
  return (
    <View style={styles.container}>
      {icon ? (
        <Ionicons name={icon} size={64} color={Colors.slate} style={styles.icon} />
      ) : (
        <FolioFox size={120} variant={foxVariant || "reading"} style={styles.fox} />
      )}

      <Text style={styles.title}>{title}</Text>
      {bodyText && <Text style={styles.description}>{bodyText}</Text>}

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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.s32,
    paddingHorizontal: Spacing.s16,
  },
  fox: {
    marginBottom: Spacing.s20,
  },
  icon: {
    marginBottom: Spacing.s20,
    opacity: 0.8,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.forest,
    textAlign: "center",
    marginBottom: Spacing.s8,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: Spacing.s24,
  },
  cta: {
    backgroundColor: Colors.forest,
    paddingVertical: Spacing.s12,
    paddingHorizontal: Spacing.s24,
    borderRadius: 8,
  },
  ctaHovered: {
    backgroundColor: Colors.forest, // can add hover color later
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 0.2,
  },
});
