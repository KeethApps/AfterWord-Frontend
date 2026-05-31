/**
 * BookCover — displays a book thumbnail with title, author, and highlight count.
 * Used in the Library and Home "Recently Read" section.
 */
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, radius, typography } from "../theme";

interface BookCoverProps {
  title: string;
  author: string;
  highlightCount: number;
  coverColor?: string; // placeholder color
  onPress?: () => void;
}

// Deterministic placeholder color from title string
function colorFromTitle(title: string): string {
  const palette = [
    "#2A6049", "#1A3D6F", "#6B2D2D", "#4A3D6B", "#2D5A3D",
    "#6B4A2D", "#2D4A6B", "#5A2D6B", "#3D6B2D", "#6B5A2D",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash += title.charCodeAt(i);
  return palette[hash % palette.length];
}

export function BookCover({ title, author, highlightCount, coverColor, onPress }: BookCoverProps) {
  const bgColor = coverColor ?? colorFromTitle(title);

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [styles.container, hovered && styles.containerHovered]}
    >
      {/* Book cover */}
      <View style={[styles.cover, { backgroundColor: bgColor }]}>
        {/* Spine effect */}
        <View style={[styles.spine, { backgroundColor: "rgba(0,0,0,0.2)" }]} />
        {/* Title on cover */}
        <Text style={styles.coverTitle} numberOfLines={3}>{title}</Text>
        <Text style={styles.coverAuthor} numberOfLines={1}>{author}</Text>
      </View>

      {/* Metadata */}
      <Text style={styles.bookTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>{author}</Text>
      <Text style={styles.highlights}>{highlightCount} highlights</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    alignItems: "flex-start",
  },
  containerHovered: {
    transform: [{ translateY: -2 }],
  },
  cover: {
    width: 110,
    height: 150,
    borderRadius: 8,
    marginBottom: spacing[2],
    justifyContent: "flex-end",
    padding: spacing[2],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  spine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  coverTitle: {
    fontFamily: typography.fonts.display,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    lineHeight: 15,
    marginBottom: 4,
  },
  coverAuthor: {
    fontFamily: typography.fonts.body,
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
  },
  bookTitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    color: colors.textPrimary,
    width: 110,
  },
  bookAuthor: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
    width: 110,
  },
  highlights: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.slate,
    marginTop: 3,
  },
});
