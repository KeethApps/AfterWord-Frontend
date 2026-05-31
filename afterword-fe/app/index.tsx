/**
 * Home Screen — AfterWord
 * Shows daily highlight, recently read, and recent highlights.
 */
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
  AppHeader,
  ScreenContainer,
  SectionHeader,
  HighlightCard,
  BookCover,
  Button,
} from "../src/components";
import { colors, spacing, typography, radius } from "../src/theme";

const PLACEHOLDER_BOOKS = [
  { title: "Atomic Habits", author: "James Clear", highlights: 35 },
  { title: "The Midnight Library", author: "Matt Haig", highlights: 24 },
  { title: "Deep Work", author: "Cal Newport", highlights: 18 },
  { title: "Meditations", author: "Marcus Aurelius", highlights: 42 },
];

const PLACEHOLDER_HIGHLIGHTS = [
  {
    quote: "The impediment to action advances action. What stands in the way becomes the way.",
    bookTitle: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    page: 33,
    score: 0.87,
  },
  {
    quote: "Resilience is accepting your new reality, even if it's less good than the one you had before.",
    bookTitle: "Daring Greatly",
    author: "Brené Brown",
    page: 67,
    score: 0.84,
  },
  {
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    page: 27,
    score: 0.82,
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <AppHeader
        title="AfterWord"
        subtitle="Remember what you read"
        showNotification
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Highlight */}
        <View style={styles.section}>
          <HighlightCard
            featured
            quote="The world is a book, and those who do not travel read only one page."
            bookTitle="Meditations"
            author="Marcus Aurelius"
            page={23}
          />
        </View>

        {/* Recently Read */}
        <View style={styles.section}>
          <SectionHeader title="Recently Read" onViewAll={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bookRow}
          >
            {PLACEHOLDER_BOOKS.map((book) => (
              <BookCover
                key={book.title}
                title={book.title}
                author={book.author}
                highlightCount={book.highlights}
                onPress={() => {}}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recent Highlights */}
        <View style={styles.section}>
          <SectionHeader title="Recent Highlights" onViewAll={() => {}} />
          <View style={styles.highlightList}>
            {PLACEHOLDER_HIGHLIGHTS.map((h, i) => (
              <HighlightCard
                key={i}
                quote={h.quote}
                bookTitle={h.bookTitle}
                author={h.author}
                page={h.page}
                score={h.score}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>

        {/* Import CTA */}
        <View style={styles.importCta}>
          <Text style={styles.importTitle}>Your library is empty</Text>
          <Text style={styles.importDesc}>
            Upload your Kindle Clippings.txt file to get started.
          </Text>
          <Button label="Import My Clippings.txt" onPress={() => {}} size="md" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[8],
    gap: spacing[8],
    paddingBottom: spacing[16],
  },
  section: {
    gap: 0,
  },
  bookRow: {
    gap: spacing[5],
    paddingVertical: spacing[2],
    paddingHorizontal: 2,
  },
  highlightList: {
    gap: spacing[3],
  },
  importCta: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed" as any,
    padding: spacing[8],
    alignItems: "center",
    gap: spacing[3],
  },
  importTitle: {
    fontFamily: typography.Fontsdisplay,
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  importDesc: {
    fontFamily: typography.Fontsbody,
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 320,
  },
});
