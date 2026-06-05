import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/shared/HighlightCard";
import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { SearchBar } from "../../../src/components/shared/SearchBar";
import {
  SearchEmptyState,
  NoResultsState,
  TopResultCard,
  BookResultRow,
  SearchFilterSheet,
} from "../../../src/components/search";
import { supabase } from "../../../lib/supabase";
import { useSearchBooks } from "../../../hooks/queries/books";

const RECENT_SEARCHES_KEY = "@afterword_recent_searches";
const TABS = ["All", "Quotes", "Books", "Authors"];

interface QuoteResult {
  highlight_text: string;
  note_text: string | null;
  similarity: number;
  book: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
    isbn?: string | null;
  };
}

export default function SearchScreen() {
  const router = useRouter();

  // State
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeContentType, setActiveContentType] = useState("All");
  
  // Data State
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [quoteResults, setQuoteResults] = useState<QuoteResult[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load Book Results using our hook (it automatically caches and uses active session)
  const { data: bookResults = [], isLoading: loadingBooks } = useSearchBooks(debouncedQuery);

  const isLoading = loadingQuotes || loadingBooks;
  const isTyping = query.length > 0 && query !== debouncedQuery;

  // Load Recent Searches
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((val) => {
      if (val) setRecentSearches(JSON.parse(val));
    });
  }, []);

  // Save Recent Search
  const saveRecentSearch = async (term: string) => {
    if (!term.trim()) return;
    const newRecent = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
    setRecentSearches(newRecent);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  const removeRecentSearch = async (term: string) => {
    const newRecent = recentSearches.filter((t) => t !== term);
    setRecentSearches(newRecent);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
  };

  // Debounce Query for Vector Search
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      setQuoteResults([]);
      setHasSearched(false);
      return;
    }

    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
      saveRecentSearch(query.trim());
    }, 800);

    return () => clearTimeout(timeout);
  }, [query]);

  // Execute Vector Search when Debounced Query changes
  useEffect(() => {
    if (!debouncedQuery) return;

    const fetchQuotes = async () => {
      setLoadingQuotes(true);
      setHasSearched(false);
      try {
        const { data, error } = await supabase.functions.invoke("search", {
          body: { query: debouncedQuery, limit: 10 },
        });
        if (error) throw error;
        setQuoteResults(data?.results || []);
      } catch (err) {
        console.error("Vector Search error:", err);
        setQuoteResults([]);
      } finally {
        setLoadingQuotes(false);
        setHasSearched(true);
      }
    };

    fetchQuotes();
  }, [debouncedQuery]);

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
  };

  // ── Render Helpers ───────────────────────────────────────────────────────

  const renderTabs = () => (
    <View className="mb-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full mr-2 ${
                isActive ? "bg-forest" : "bg-mist"
              }`}
            >
              <Text className={`font-sans text-sm ${isActive ? "text-white" : "text-forest"}`}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;
    return (
      <View className="mt-4 px-2">
        <Text className="font-sansBold text-sm text-slate mb-4">Recent searches</Text>
        {recentSearches.map((term) => (
          <View key={term} className="flex-row items-center justify-between py-3 border-b border-mist">
            <Pressable 
              className="flex-row items-center flex-1"
              onPress={() => setQuery(term)}
            >
              <Ionicons name="time-outline" size={18} color={Colors.slate} className="mr-3" />
              <Text className="font-sans text-base text-forest">{term}</Text>
            </Pressable>
            <Pressable onPress={() => removeRecentSearch(term)} className="p-2">
              <Ionicons name="close" size={18} color={Colors.slate} />
            </Pressable>
          </View>
        ))}
      </View>
    );
  };

  const renderBody = () => {
    if (isFiltersOpen) {
      return (
        <SearchFilterSheet
          activeContentType={activeContentType}
          onContentTypeChange={setActiveContentType}
          onClearAll={() => setActiveContentType("All")}
          onApplyFilters={() => setIsFiltersOpen(false)}
        />
      );
    }

    if (!query) {
      if (recentSearches.length > 0) {
        return (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mt-4">
            <SearchEmptyState onSuggestionPress={handleSuggestionPress} />
            {renderRecentSearches()}
          </ScrollView>
        );
      }
      return <SearchEmptyState onSuggestionPress={handleSuggestionPress} />;
    }

    if (isTyping || isLoading) {
      return (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {isLoading && <ActivityIndicator size="large" color={Colors.forest} className="mt-12 mb-8" />}
          {renderRecentSearches()}
        </ScrollView>
      );
    }

    const noBooks = bookResults.length === 0;
    const noQuotes = quoteResults.length === 0;

    if (hasSearched && noBooks && noQuotes) {
      return (
        <NoResultsState 
          hasSuggestions 
          onSuggestionPress={handleSuggestionPress} 
          onClearSearch={() => setQuery("")}
        />
      );
    }

    // Results View
    return (
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 60 }}>
        {renderTabs()}

        {(activeTab === "All" || activeTab === "Quotes") && quoteResults.length > 0 && (
          <View className="mb-6 mt-4">
            {activeTab === "All" && <Text className="font-sansBold text-xs text-slate uppercase tracking-wider mb-4">Top result</Text>}
            <TopResultCard
              quote={quoteResults[0].highlight_text}
              bookTitle={quoteResults[0].book.title}
              author={quoteResults[0].book.author}
              coverImageUrl={quoteResults[0].book.cover_image_url}
              isbn={quoteResults[0].book.isbn}
              dateHighlighted="Recently"
            />
          </View>
        )}

        {(activeTab === "All" || activeTab === "Books") && bookResults.length > 0 && (
          <View className="mb-6">
            {activeTab === "All" && <Text className="font-sansBold text-xs text-slate uppercase tracking-wider mb-4">Books ({bookResults.length})</Text>}
            {bookResults.map((book) => (
              <BookResultRow
                key={book.id}
                title={book.title}
                author={book.author}
                coverImageUrl={book.coverImageUrl}
                isbn={book.isbn}
                onPress={() => router.push(`/book/${book.id}`)}
              />
            ))}
          </View>
        )}

        {(activeTab === "All" || activeTab === "Quotes") && quoteResults.length > 1 && (
          <View className="mb-6">
            {activeTab === "All" && <Text className="font-sansBold text-xs text-slate uppercase tracking-wider mb-4">More Quotes</Text>}
            {quoteResults.slice(1).map((r, i) => (
              <View key={i} className="mb-4">
                <HighlightCard
                  highlight={{
                    id: String(i),
                    bookId: r.book.id,
                    userId: "",
                    highlightText: r.highlight_text,
                    location: null,
                    pageNumber: null,
                    embedding: null,
                    embeddingModel: null,
                    lastSurfacedAt: null,
                    createdAt: new Date().toISOString(),
                    book: {
                      id: r.book.id,
                      userId: "",
                      title: r.book.title,
                      author: r.book.author,
                      isbn: r.book.isbn || null,
                      coverImageUrl: r.book.cover_image_url,
                      description: null,
                      publisher: null,
                      publishDate: null,
                      enrichmentStatus: "pending",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                  }}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <ScreenContainer padded={false}>
      <AppHeader title="Search" />
      <View className="px-4 flex-1">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search quotes, books, authors..."
          onFilterPress={() => setIsFiltersOpen(!isFiltersOpen)}
          className="mb-2"
        />
        {renderBody()}
      </View>
    </ScreenContainer>
  );
}