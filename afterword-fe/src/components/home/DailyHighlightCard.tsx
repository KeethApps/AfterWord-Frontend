import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { useHighlights } from "../../../hooks/queries/highlights";

export const DailyHighlightCard: React.FC = () => {
  const { data: highlights, isLoading } = useHighlights();

  if (isLoading) return null;

  const latest = highlights?.[0] || {
    id: "mock-1",
    bookId: "mock-book-1",
    userId: "mock-user-1",
    highlightText:
      "He'd left home only a week ago, but he felt like he'd aged years, and could present himself now as a young man and not a boy.",
    createdAt: new Date().toISOString(),
    book: {
      id: "mock-book-1",
      userId: "mock-user-1",
      title: "Babel",
      author: "R. F. Kuang",
      enrichmentStatus: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  if (!latest) return null;

  async function handleShare() {
    try {
      await Share.share({
        message: `"${latest.highlightText}"\n\n— ${latest.book?.title}, ${latest.book?.author}`,
      });
    } catch {}
  }

  return (
    <View style={styles.card}>
      {/* Left accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="book" size={14} color={Colors.forest} />
          <Text style={styles.headerLabel}>Today's Highlight</Text>
        </View>

        {/* Quote */}
        <View style={styles.quoteRow}>
          <Text style={styles.openQuote}>"</Text>
          <Text style={styles.quoteText}>
            {latest.highlightText}
            <Text style={styles.closeQuote}> "</Text>
          </Text>
        </View>

        {/* Footer: book info + share button */}
        <View style={styles.footer}>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{latest.book?.title}</Text>
            <Text style={styles.bookAuthor}>{latest.book?.author}</Text>
          </View>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareButton,
              pressed && styles.shareButtonPressed,
            ]}
          >
            <Ionicons name="share-outline" size={18} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#F2F0EA",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.s24,
    elevation: 2,
  },
  // The dark green left border accent
  accentBar: {
    width: 5,
    backgroundColor: Colors.forest,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  inner: {
    flex: 1,
    padding: Spacing.s20,
    gap: Spacing.s12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.forest,
    fontWeight: "500",
  },
  quoteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  openQuote: {
    fontFamily: Fonts.serifBold,
    fontSize: 36,
    color: Colors.forest,
    lineHeight: 36,
    marginTop: -4,
    opacity: 0.85,
  },
  quoteText: {
    flex: 1,
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.forest,
    lineHeight: 28,
    fontStyle: "italic",
  },
  closeQuote: {
    fontFamily: Fonts.serifBold,
    fontSize: 22,
    color: Colors.forest,
    opacity: 0.85,
    // inline so it sits at the end of the last line
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: Spacing.s4,
  },
  bookInfo: {
    gap: 2,
  },
  bookTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
  },
  bookAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonPressed: {
    opacity: 0.75,
  },
});