/**
 * Search Screen — semantic search across highlights.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { AppHeader, SectionHeader, HighlightCard, EmptyState } from "../../src/components";
import { colors, spacing, radius, typography } from "../../src/theme";

const SAMPLE_RESULTS = [
  {
    quote: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    bookTitle: "Meditations",
    author: "Marcus Aurelius",
    page: 33,
    score: 0.91,
  },
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
];

const FILTER_TABS = ["Top Results", "By Book"];

export default function SearchScreen() {
  const [query, setQuery] = useState("stoicism and resilience");
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.screen}>
      <AppHeader title="Search" subtitle="Find the right insight" />
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search your highlights…"
          placeholderTextColor={colors.textMuted}
        />
        <Pressable style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⊟</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {FILTER_TABS.map((tab, i) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {query.length > 0 ? (
          <>
            <Text style={styles.resultCount}>{SAMPLE_RESULTS.length * 4} results</Text>
            <View style={styles.list}>
              {SAMPLE_RESULTS.map((r, i) => (
                <HighlightCard
                  key={i}
                  quote={r.quote}
                  bookTitle={r.bookTitle}
                  author={r.author}
                  page={r.page}
                  score={r.score}
                  onPress={() => {}}
                />
              ))}
            </View>
          </>
        ) : (
          <EmptyState
            title="Search your highlights"
            description="Use natural language to find any insight from your books."
            foxVariant="thinking"
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing[8],
    marginTop: spacing[5],
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    outlineStyle: "none" as any,
  },
  filterBtn: {
    padding: spacing[1],
  },
  filterIcon: {
    fontSize: 16,
    color: colors.textMuted,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: spacing[8],
    marginTop: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 0,
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: colors.forest,
  },
  tabText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[8],
    paddingBottom: spacing[16],
    gap: spacing[3],
  },
  resultCount: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing[3],
  },
  list: {
    gap: spacing[3],
  },
});
