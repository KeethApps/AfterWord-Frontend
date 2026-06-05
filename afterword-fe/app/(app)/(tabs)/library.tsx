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
  LibraryFilters,
  SortOption,
  ViewMode,
} from "../../../src/components/library";
import { useBooks } from "../../../hooks/queries/books";
import { useHighlights } from "../../../hooks/queries/highlights";
import { Colors } from "../../../constants/theme";

type TabType = "all" | "recent" | "highlighted";

export default function LibraryScreen() {
  const router = useRouter();

  // Queries
  const { data: books, isLoading: loadingBooks } = useBooks();
  const { data: highlights, isLoading: loadingHighlights } = useHighlights();
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortMode, setSortMode] = useState<SortOption>("recently_read");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

    // 3. Explicit Sort from Filters Panel (if All Books tab is active, or if Sort overrides tab logic)
    // To match typical UX, active Tab sets the primary sort, but if a user explicitly changes SortMode, we apply it.
    // For simplicity, we just apply SortMode on top.
    if (sortMode === "title_asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === "title_desc") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortMode === "most_highlights") {
      result.sort((a, b) => (highlightsPerBook[b.id] || 0) - (highlightsPerBook[a.id] || 0));
    } else if (sortMode === "recently_read") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [books, searchQuery, activeTab, sortMode, highlightsPerBook]);

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
    
    // E3: Filter yielded no results (if we had complex filters)
    if (displayBooks.length === 0) {
      return <LibraryEmptyState type="no-filter" onClearFilters={() => setActiveTab("all")} />;
    }

    return null;
  };

  const renderTab = (label: string, value: TabType) => {
    const isActive = activeTab === value;
    return (
      <Pressable
        onPress={() => setActiveTab(value)}
        className={`px-4 py-2 rounded-full mr-2 ${
          isActive ? "bg-forest" : "bg-mist"
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
      <AppHeader title="Library" />
      
      <View className="px-4 flex-1">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your library..."
          onFilterPress={() => setIsFiltersOpen(!isFiltersOpen)}
          className="mb-4"
        />

        {isFiltersOpen ? (
          <LibraryFilters
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onClearAll={() => {
              setSortMode("recently_read");
              setActiveTab("all");
            }}
          />
        ) : (
          <>
            {/* Tabs Row */}
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {renderTab("All Books", "all")}
                {renderTab("Recently Read", "recent")}
                {renderTab("Most Highlighted", "highlighted")}
              </ScrollView>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-sans text-sm text-slate">
                {displayBooks.length} books • {totalHighlights} highlights
              </Text>
              <Pressable 
                onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
                className="w-8 h-8 rounded-md border border-mist items-center justify-center bg-white"
              >
                <Ionicons name={viewMode === "list" ? "grid" : "list"} size={16} color={Colors.forest} />
              </Pressable>
            </View>

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
                columnWrapperStyle={viewMode === "grid" ? { justifyContent: "space-between", gap: 16 } : undefined}
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
                        onPress={() => router.push(`/book/${item.id}`)}
                      />
                    );
                  }
                }}
              />
            )}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}