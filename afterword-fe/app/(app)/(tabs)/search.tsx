import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("search", {
          body: { query: query.trim(), limit: 10 },
        });
        if (error) {
          console.error("Search error:", error);
        } else if (data && data.results) {
          setResults(data.results);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.s16 }}>
            <Text style={styles.resultCount}>
              {results.length} results for "{query}"
            </Text>
            {loading && <ActivityIndicator size="small" color={Colors.forest} />}
          </View>
          <View style={styles.list}>
            {results.map((r, i) => (
              <HighlightCard 
                key={i} 
                quote={r.highlight_text}
                bookTitle={r.book.title}
                author={r.book.author}
                score={r.similarity}
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