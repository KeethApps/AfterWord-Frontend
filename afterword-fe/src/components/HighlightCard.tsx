/**
 * HighlightCard — displays a single book highlight quote with metadata.
 * Matches the quote card style from the AfterWord mockup.
 */
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, radius, typography } from "../theme";

interface HighlightCardProps {
  quote: string;
  bookTitle: string;
  author?: string;
  page?: number | string;
  score?: number;     // relevance score 0–1
  note?: string;
  onPress?: () => void;
  featured?: boolean; // "Daily Highlight" style
}

export function HighlightCard({
  quote,
  bookTitle,
  author,
  page,
  score,
  note,
  onPress,
  featured = false,
}: HighlightCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [
        styles.card,
        featured && styles.featuredCard,
        hovered && styles.cardHovered,
      ]}
    >
      {/* Score badge */}
      {score !== undefined && (
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score.toFixed(2)}</Text>
        </View>
      )}

      {featured && (
        <View style={styles.featuredLabel}>
          <Text style={styles.featuredStar}>★</Text>
          <Text style={styles.featuredText}>Daily Highlight</Text>
          <Text style={styles.featuredStar}>☀</Text>
        </View>
      )}

      {/* Quote */}
      <Text style={[styles.quote, featured && styles.quoteFeatured]} numberOfLines={featured ? 4 : 3}>
        "{quote}"
      </Text>

      {/* Attribution */}
      <View style={styles.meta}>
        <Text style={styles.bookTitle}>{bookTitle}</Text>
        {author && <Text style={styles.metaSep}> · </Text>}
        {author && <Text style={styles.author}>{author}</Text>}
      </View>

      {page && (
        <Text style={styles.page}>Page {page}</Text>
      )}

      {note && (
        <View style={styles.noteArea}>
          <Text style={styles.noteLabel}>Your Note</Text>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    position: "relative",
  },
  featuredCard: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  cardHovered: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    transform: [{ translateY: -1 }],
  },
  scoreBadge: {
    position: "absolute",
    top: spacing[3],
    right: spacing[3],
    backgroundColor: colors.mist,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  scoreText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: "600",
    fontFamily: typography.fonts.body,
  },
  featuredLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  featuredStar: {
    color: colors.amber,
    fontSize: 14,
  },
  featuredText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.amber,
    letterSpacing: 0.3,
  },
  quote: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.base,
    fontStyle: "italic",
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing[3],
  },
  quoteFeatured: {
    color: colors.textInverse,
    fontSize: typography.sizes.md,
    lineHeight: 28,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bookTitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.textMuted,
  },
  metaSep: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  author: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  page: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    opacity: 0.7,
    marginTop: 2,
  },
  noteArea: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noteText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: "italic",
  },
});
