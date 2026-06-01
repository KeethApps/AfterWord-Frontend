import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants/theme";

interface Props {
  quote: string;
  bookTitle: string;
  author?: string;
}

export function ShareHighlightCard({
  quote,
  bookTitle,
  author,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Watermark / Brand */}
      <View style={styles.brandRow}>
        <Text style={styles.brand}>afterword</Text>
      </View>

      {/* Quote */}
      <Text style={styles.quote}>
        “{quote}”
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.book}>{bookTitle}</Text>

        {author && (
          <Text style={styles.author}>
            {author}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 1080,
    height: 1350,
    backgroundColor: "#F7F3EA",
    padding: 80,
    justifyContent: "space-between",
  },

  brandRow: {
    alignItems: "flex-start",
  },

  brand: {
    fontFamily: Fonts.sansBold,
    fontSize: 28,
    color: Colors.slate,
    letterSpacing: 2,
    textTransform: "uppercase",
    opacity: 0.7,
  },

  quote: {
    fontFamily: Fonts.serif,
    fontSize: 64,
    lineHeight: 92,
    color: Colors.forest,
  },

  footer: {
    gap: 12,
  },

  book: {
    fontFamily: Fonts.sansBold,
    fontSize: 34,
    color: Colors.forest,
  },

  author: {
    fontFamily: Fonts.sans,
    fontSize: 28,
    color: Colors.slate,
  },
});