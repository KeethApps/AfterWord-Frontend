import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants/theme";

import { useRouter } from "expo-router";

interface BookCoverProps {
  id?: string;
  title: string;
  author: string;
  highlightCount: number;
  coverColor?: string; // placeholder color
  onPress?: () => void;
  fullWidth?: boolean; // whether to fill the flex container instead of hardcoded width
}

// Deterministic placeholder color from title string
function colorFromTitle(title: string): string {
  const palette = [
    Colors.forest, "#1A3D6F", "#6B2D2D", "#4A3D6B", "#2D5A3D",
    Colors.amber, "#2D4A6B", "#5A2D6B", "#3D6B2D", "#6B5A2D",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash += title.charCodeAt(i);
  return palette[hash % palette.length];
}

export function BookCover({ id, title, author, highlightCount, coverColor, onPress, fullWidth = false }: BookCoverProps) {
  const router = useRouter();
  const bgColor = coverColor ?? colorFromTitle(title);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (id) {
      router.push(`/book/${id}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ hovered }) => [
        styles.container,
        fullWidth && { width: '100%' },
        hovered && styles.containerHovered
      ]}
    >
      {/* Book cover */}
      <View style={[styles.cover, { backgroundColor: bgColor, width: fullWidth ? '100%' : 110 }]}>
        {/* Spine effect */}
        <View style={[styles.spine, { backgroundColor: "rgba(0,0,0,0.2)" }]} />
        {/* Title on cover */}
        <Text style={styles.coverTitle} numberOfLines={3}>{title}</Text>
        <Text style={styles.coverAuthor} numberOfLines={1}>{author}</Text>
      </View>

      {/* Metadata */}
      <Text style={[styles.bookTitle, fullWidth && { width: '100%' }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.bookAuthor, fullWidth && { width: '100%' }]} numberOfLines={1}>{author}</Text>
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
    aspectRatio: 2/3,
    borderRadius: 8,
    marginBottom: Spacing.s8,
    justifyContent: "flex-end",
    padding: Spacing.s8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
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
    fontFamily: Fonts.serifBold,
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 16,
    marginBottom: 4,
  },
  coverAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
  },
  bookTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
    width: 110,
  },
  bookAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    marginTop: 1,
    width: 110,
  },
  highlights: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    marginTop: 3,
  },
});
