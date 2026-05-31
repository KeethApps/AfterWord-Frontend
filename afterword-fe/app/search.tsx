/**
 * Search Screen — semantic search across highlights.
 * Restyled to match LibraryScreen conventions.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants/theme";

const SAMPLE_RESULTS = [
  {
    quote:
      "You have power over your mind — not outside events. Realize this, and you will find strength.",
    bookTitle: "Meditations",
    author: "Marcus Aurelius",
    page: 33,
    score: 0.91,
  },
  {
    quote:
      "The impediment to action advances action. What stands in the way becomes the way.",
    bookTitle: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    page: 33,
    score: 0.87,
  },
  {
    quote:
      "Resilience is accepting your new reality, even if it's less good than the one you had before.",
    bookTitle: "Daring Greatly",
    author: "Brené Brown",
    page: 67,
    score: 0.84,
  },
];

const FILTER_TABS = ["Top Results", "By Book"];

function ScoreBadge({ score }: { score: number }) {
  return (
    <View style={styles.scoreBadge}>
      <Text style={styles.scoreBadgeText}>{Math.round(score * 100)}% match</Text>
    </View>
  );
}

function HighlightResultCard({
  quote,
  bookTitle,
  author,
  page,
  score,
}: (typeof SAMPLE_RESULTS)[0]) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardMeta}>
          <Text style={styles.cardBook} numberOfLines={1}>
            {bookTitle}
          </Text>
          <Text style={styles.cardDot}>·</Text>
          <Text style={styles.cardAuthor} numberOfLines={1}>
            {author}
          </Text>
        </View>
        <ScoreBadge score={score} />
      </View>
      <Text style={styles.cardQuote}>"{quote}"</Text>
      <View style={styles.cardFooter}>
        <Ionicons name="bookmark-outline" size={14} color={Colors.slate} />
        <Text style={styles.cardPage}>p. {page}</Text>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState("stoicism and resilience");
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Search</Text>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.slate} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search your highlights…"
            placeholderTextColor={Colors.slate}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.slate} />
            </Pressable>
          )}
        </View>

        {/* Filter tabs */}
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

        {/* Results or empty state */}
        {query.length > 0 ? (
          <>
            <Text style={styles.resultCount}>
              {SAMPLE_RESULTS.length * 4} results for "{query}"
            </Text>
            <View style={styles.list}>
              {SAMPLE_RESULTS.map((r, i) => (
                <HighlightResultCard key={i} {...r} />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={Colors.slate} />
            <Text style={styles.emptyTitle}>Search your highlights</Text>
            <Text style={styles.emptyBody}>
              Use natural language to find any insight from your books.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Platform.OS === "web" ? 40 : 20,
    paddingTop: Platform.OS === "web" ? 40 : 60,
    paddingBottom: 40,
    maxWidth: 1000,
    marginHorizontal: Platform.OS === "web" ? "auto" : 0,
    width: "100%",
  },

  // Title — matches LibraryScreen pageTitle
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: 24,
  },

  // Search bar — matches LibraryScreen searchContainer
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
    outlineStyle: "none" as any,
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 24,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: Colors.forest,
  },
  tabText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.slate,
  },
  tabTextActive: {
    fontWeight: "700",
    color: Colors.forest,
  },

  // Result count
  resultCount: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    marginBottom: 16,
  },

  // Result list
  list: {
    gap: 12,
  },

  // Highlight card
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    flexShrink: 1,
  },
  cardBook: {
    fontFamily: Fonts.sans,
    fontWeight: "600",
    fontSize: 13,
    color: Colors.forest,
    flexShrink: 1,
  },
  cardDot: {
    color: Colors.slate,
    fontSize: 13,
  },
  cardAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    flexShrink: 1,
  },
  scoreBadge: {
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  scoreBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.forest,
  },
  cardQuote: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    color: Colors.forest,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardPage: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 64,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.forest,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});