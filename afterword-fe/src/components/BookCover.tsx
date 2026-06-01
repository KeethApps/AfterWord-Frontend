import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Colors, Fonts, Spacing } from "../../constants/theme";
import { useRouter } from "expo-router";

interface BookCoverProps {
  id?: string;
  title: string;
  author: string;
  highlightCount: number;
  coverColor?: string;
  onPress?: () => void;
  fullWidth?: boolean;
}

function colorFromTitle(title: string): string {
  const palette = [
    Colors.forest, "#1A3D6F", "#6B2D2D", "#4A3D6B", "#2D5A3D",
    Colors.amber, "#2D4A6B", "#5A2D6B", "#3D6B2D", "#6B5A2D",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash += title.charCodeAt(i);
  return palette[hash % palette.length];
}

export function BookCover({
  id,
  title,
  author,
  highlightCount,
  coverColor,
  onPress,
  fullWidth = false,
}: BookCoverProps) {
  const router = useRouter();
  const bgColor = coverColor ?? colorFromTitle(title);

  const handlePress = () => {
    if (onPress) onPress();
    else if (id) router.push(`/book/${id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, fullWidth && styles.containerFull]}
    >
      <View style={[styles.cover, { backgroundColor: bgColor }]}>
        <BlurView intensity={30} tint="light" style={styles.blurLayer}>
          <Text style={styles.coverTitle} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.coverAuthor} numberOfLines={1}>
            {author}
          </Text>
        </BlurView>
      </View>

      <Text style={styles.highlights}>{highlightCount} highlights</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
  },
  containerFull: {
    width: "100%",
  },
  cover: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 12,
    overflow: "hidden",
  },
  blurLayer: {
    flex: 1,
    padding: Spacing.s8, // Reduced padding
    justifyContent: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)", // Light overlay for glass effect
  },
  coverTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 12,
    color: "#FFFFFF",
    lineHeight: 14,
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coverAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
  },
  highlights: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.slate,
    opacity: 0.7,
    marginTop: Spacing.s4, // Tighter margin
  },
});