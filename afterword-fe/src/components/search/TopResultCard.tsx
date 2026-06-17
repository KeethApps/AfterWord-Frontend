import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { BookCover } from "../shared/BookCover";

interface TopResultCardProps {
  quote: string;
  bookTitle: string;
  author: string;
  page?: string;
  dateHighlighted?: string;
  coverImageUrl?: string | null;
  isbn?: string | null;
}

// Standard book cover aspect ratio is 2:3.
// 56×84 is compact enough to sit in the card footer without dominating.
const COVER_W = 56;
const COVER_H = 84;

export const TopResultCard: React.FC<TopResultCardProps> = ({
  quote,
  bookTitle,
  author,
  page,
  dateHighlighted,
  coverImageUrl,
  isbn,
}) => {
  return (
    <View className="bg-white rounded-2xl p-5 border border-border mb-6">
      {/* Top bookmark icon */}
      <Ionicons
        name="bookmark"
        size={20}
        color={Colors.forest}
        style={{ marginBottom: 10, opacity: 0.6 }}
      />

      {/* Quote */}
      <Text className="font-serifBold text-lg text-forest mb-6 leading-tight">
        "{quote}"
      </Text>

      {/* Footer row: meta left, cover right */}
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Text className="font-sansBold text-sm text-forest mb-1" numberOfLines={2}>
            {bookTitle}
          </Text>
          <Text className="font-sans text-xs text-slate mb-2" numberOfLines={1}>
            {author}
          </Text>
          <View style={styles.pills}>
            {page && (
              <Text className="font-sans text-xs text-slate">
                Page {page}
              </Text>
            )}
            {page && dateHighlighted && (
              <Text className="font-sans text-xs text-slate">·</Text>
            )}
            {dateHighlighted && (
              <Text className="font-sans text-xs text-slate">
                {dateHighlighted}
              </Text>
            )}
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",   // align cover bottom with text baseline
    justifyContent: "space-between",
    gap: 12,
  },
  meta: {
    flex: 1,
  },
  pills: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coverWrapper: {
    // Shadow lives here so it doesn't clip the rounded cover
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 4,
  },
  cover: {
    width: COVER_W,
    height: COVER_H,
    borderRadius: 4,
  },
});