import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { supabase } from "../../../lib/supabase";

interface SearchResult {
  highlight_text: string;
  note_text: string | null;
  similarity: number;
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
  };
}

const FILTER_TABS = ["Top Results", "By Book"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      setHasSearched(false);
      try {
        const { data, error } = await supabase.functions.invoke("search", {
          body: { query: query.trim(), limit: 10 },
        });
        if (error) {
          console.error("Search error:", error);
        } else if (data && data.results) {
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        setResults([]);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  // ── Group by book for "By Book" tab ──────────────────────────────────────
  const groupedByBook = results.reduce<Record<string, { book: SearchResult["book"]; highlights: SearchResult[] }>>(
    (acc, r) => {
      const key = r.book.id;
      if (!acc[key]) acc[key] = { book: r.book, highlights: [] };
      acc[key].highlights.push(r);
      return acc;
    },
    {}
  );

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
            autoCorrect={false}
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

        {/* ── Body ── */}
        {!query.trim() ? (
          /* Pre-search empty state */
          <View style={styles.emptyWrapper}>
            <EmptyState
              icon="search-outline"
              title="Search your highlights"
              message="Use natural language to find any insight from your books."
            />
          </View>
        ) : loading ? (
          /* Loading spinner while debounce fires */
          <ActivityIndicator
            size="large"
            color={Colors.forest}
            style={{ marginTop: 60 }}
          />
        ) : hasSearched && results.length === 0 ? (
          /* No results */
          <View style={styles.emptyWrapper}>
            <EmptyState
              icon="search-outline"
              title="No results found"
              message={`Nothing matched "${query}". Try a different phrase or broader terms.`}
            />
          </View>
        ) : (
          /* Results */
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {activeTab === 0
                ? /* Top Results — flat ranked list */
                  results.map((r, i) => (
                    <HighlightCard
                      key={i}
                      quote={r.highlight_text}
                      bookTitle={r.book.title}
                      author={r.book.author}
                      score={r.similarity}
                    />
                  ))
                : /* By Book — grouped */
                  Object.values(groupedByBook).map(({ book, highlights }) => (
                    <View key={book.id} style={styles.bookGroup}>
                      <Text style={styles.bookGroupTitle}>{book.title}</Text>
                      <Text style={styles.bookGroupAuthor}>{book.author}</Text>
                      {highlights.map((r, i) => (
                        <HighlightCard
                          key={i}
                          quote={r.highlight_text}
                          bookTitle={r.book.title}
                          author={r.book.author}
                          score={r.similarity}
                        />
                      ))}
                    </View>
                  ))}
            </ScrollView>
          </>
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
    borderRadius: 45,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s16,
    gap: Spacing.s10,
    marginBottom: Spacing.s16,
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
  resultHeader: {
    marginBottom: Spacing.s16,
  },
  resultCount: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  list: {
    gap: Spacing.s16,
    paddingBottom: 120,
  },
  emptyWrapper: {
    marginTop: Spacing.s64,
  },
  bookGroup: {
    marginBottom: Spacing.s24,
    gap: Spacing.s12,
  },
  bookGroupTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 17,
    color: Colors.forest,
  },
  bookGroupAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    marginTop: -8,
    marginBottom: 4,
  },
});