import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { ScreenContainer } from "../../../src/components/ScreenContainer";

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
    <ScreenContainer padded={false}>
      <AppHeader title="Search" />
      <View style={{ padding: Spacing.s20, flex: 1 }}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.slate} />
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
              <HighlightCard 
                key={i} 
                quote={r.quote}
                bookTitle={r.bookTitle}
                author={r.author}
                page={r.page}
                score={r.score}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="search-outline"
            title="Search your highlights"
            message="Use natural language to find any insight from your books."
          />
        </View>
      )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s12,
    gap: Spacing.s12,
    marginBottom: Spacing.s24,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
    outlineStyle: "none" as any,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.s24,
  },
  tab: {
    paddingHorizontal: Spacing.s16,
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
  resultCount: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    marginBottom: Spacing.s16,
  },
  list: {
    gap: Spacing.s16,
  },
  emptyWrapper: {
    marginTop: Spacing.s64,
  },
});