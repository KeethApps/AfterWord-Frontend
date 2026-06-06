import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { AppHeader } from "../../../src/components/AppHeader";
import { SearchBar } from "../../../src/components/shared/SearchBar";
import {
  LibraryEmptyState,
  BookListCard,
  BookGridCard,
  ViewMode,
} from "../../../src/components/library";
import { useBooks } from "../../../hooks/queries/books";
import { useHighlights } from "../../../hooks/queries/highlights";
import { Colors } from "../../../constants/theme";

type TabType = "all" | "recent" | "highlighted" | "genres";

export default function LibraryScreen() {
  const router = useRouter();

  // Queries
  const { data: books, isLoading: loadingBooks } = useBooks();
  const { data: highlights, isLoading: loadingHighlights } = useHighlights();
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const isLoading = loadingBooks || loadingHighlights;
  
  // Aggregate stats
  const totalBooks = books?.length || 0;
  const totalHighlights = highlights?.length || 0;

  // Compute highlights per book for efficient rendering
  const highlightsPerBook = useMemo(() => {
    const counts: Record<string, number> = {};
    highlights?.forEach(h => {
      counts[h.bookId] = (counts[h.bookId] || 0) + 1;
    });
    return counts;
  }, [highlights]);

  // Derived state: Filtered & Sorted books
  const displayBooks = useMemo(() => {
    let result = [...(books || [])];

    // 1. Search Filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(lowerQ) ||
          b.author.toLowerCase().includes(lowerQ)
      );
    }

    // 2. Tab Filter / Sort
    if (activeTab === "recent") {
      // Assuming created_at is recent upload order
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === "highlighted") {
      result.sort((a, b) => (highlightsPerBook[b.id] || 0) - (highlightsPerBook[a.id] || 0));
    }
    // "genres" could be sorted differently later

    return result;
  }, [books, searchQuery, activeTab, highlightsPerBook]);

  // Handle various Empty States
  const renderEmptyState = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.forest} style={{ marginTop: 40 }} />;
    }
    
    // E1: Completely empty library (no books at all)
    if (!books || books.length === 0) {
      return <LibraryEmptyState type="empty" />;
    }
    
    // E2: Search yielded no results
    if (searchQuery && displayBooks.length === 0) {
      return <LibraryEmptyState type="no-search" onClearSearch={() => setSearchQuery("")} />;
    }

    return null;
  };

  const renderTab = (label: string, value: TabType) => {
    const isActive = activeTab === value;
    return (
      <Pressable
        onPress={() => setActiveTab(value)}
        className={`px-4 py-2 rounded-full mr-2 ${
          isActive ? "bg-forest" : "bg-white border border-mist"
        }`}
      >
        <Text className={`font-sans text-sm ${isActive ? "text-white" : "text-forest"}`}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenContainer padded={false}>
      <AppHeader title="My Library" />
      
      <View className="px-4 flex-1">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your library..."
          className="mb-4"
        />

        {/* Tabs Row & View Toggle */}
        <View className="mb-4 flex-row items-center">
          <View className="flex-1 mr-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderTab("All Books", "all")}
              {renderTab("Recently Read", "recent")}
              {renderTab("Most Highlighted", "highlighted")}
              {renderTab("Genres", "genres")}
            </ScrollView>
          </View>
          <Pressable 
            onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="w-10 h-10 rounded-full bg-white border border-mist items-center justify-center"
          >
            <Ionicons name={viewMode === "list" ? "grid-outline" : "list-outline"} size={20} color={Colors.forest} />
          </Pressable>
        </View>

        <Text className="font-sans text-sm text-slate mb-4">
          {totalBooks} books • {totalHighlights} highlights
        </Text>

        {/* Content or Empty State */}
        {displayBooks.length === 0 || isLoading ? (
          <View className="flex-1 justify-center items-center">
            {renderEmptyState()}
          </View>
        ) : (
          <FlatList
            data={displayBooks}
            key={viewMode} // Force re-render on layout change
            keyExtractor={(item) => item.id}
            numColumns={viewMode === "grid" ? 3 : 1}
            columnWrapperStyle={viewMode === "grid" ? { justifyContent: "flex-start", gap: 12 } : undefined}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const hc = highlightsPerBook[item.id] || 0;
              if (viewMode === "list") {
                return (
                  <BookListCard
                    id={item.id}
                    title={item.title}
                    author={item.author}
                    isbn={item.isbn}
                    coverImageUrl={item.coverImageUrl}
                    highlightsCount={hc}
                    onPress={() => router.push(`/book/${item.id}`)}
                  />
                );
              } else {
                return (
                  <BookGridCard
                    id={item.id}
                    title={item.title}
                    author={item.author}
                    isbn={item.isbn}
                    coverImageUrl={item.coverImageUrl}
                    highlightsCount={hc}
                    onPress={() => router.push(`/book/${item.id}`)}
                  />
                );
              }
            }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}