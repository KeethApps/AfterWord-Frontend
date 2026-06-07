import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { FilterPills } from "../../../src/components/common/FilterPills";
import { AppHeader } from "../../../src/components/AppHeader";
import { SearchBar } from "../../../src/components/shared/SearchBar";
import {
  LibraryEmptyState,
  BookListCard,
  BookGridCard,
  ViewMode,
} from "../../../src/components/library";
import { Pagination } from "../../../src/components/shared/Pagination";
import { useBooks } from "../../../hooks/queries/books";
import { useHighlights } from "../../../hooks/queries/highlights";
import { Colors } from "../../../constants/theme";

type TabType = "all" | "recent" | "highlighted" | "genres";

const PAGE_SIZE = 10;

export default function LibraryScreen() {
  const router = useRouter();

  // Queries
  const { data: books, isLoading: loadingBooks } = useBooks();
  const { data: highlights, isLoading: loadingHighlights } = useHighlights();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [page, setPage] = useState(0);

  const isLoading = loadingBooks || loadingHighlights;

  // Aggregate stats
  const totalBooks = books?.length || 0;
  const totalHighlights = highlights?.length || 0;

  // Compute highlights per book
  const highlightsPerBook = useMemo(() => {
    const counts: Record<string, number> = {};
    highlights?.forEach((h) => {
      counts[h.bookId] = (counts[h.bookId] || 0) + 1;
    });
    return counts;
  }, [highlights]);

  // All filtered + sorted books (before pagination)
  const filteredBooks = useMemo(() => {
    let result = [...(books || [])];

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(lowerQ) ||
          b.author.toLowerCase().includes(lowerQ)
      );
    }

    if (activeTab === "recent") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === "highlighted") {
      result.sort((a, b) => (highlightsPerBook[b.id] || 0) - (highlightsPerBook[a.id] || 0));
    }

    return result;
  }, [books, searchQuery, activeTab, highlightsPerBook]);

  // Paginated slice
  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const displayBooks = useMemo(() => {
    const from = page * PAGE_SIZE;
    return filteredBooks.slice(from, from + PAGE_SIZE);
  }, [filteredBooks, page]);

  // Reset to page 0 whenever filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, activeTab]);

  const renderEmptyState = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.forest} style={{ marginTop: 40 }} />;
    }
    if (!books || books.length === 0) {
      return <LibraryEmptyState type="empty" />;
    }
    if (searchQuery && filteredBooks.length === 0) {
      return <LibraryEmptyState type="no-search" onClearSearch={() => setSearchQuery("")} />;
    }
    return null;
  };


  const LIBRARY_TABS = [
    { label: "All Books", value: "all" as TabType },
    { label: "Recently Read", value: "recent" as TabType },
    { label: "Most Highlighted", value: "highlighted" as TabType },
  ];

  const isEmpty = displayBooks.length === 0 || isLoading;

  return (
    <ScreenContainer padded={false} scrollable={false}>
      <AppHeader title="My Library" />

      <View className="px-4 flex-1">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your library..."
          className="mb-4"
        />

        {/* Tabs Row & View Toggle */}
        <View className="mb-4 flex-row items-center gap-2">
          <View className="flex-1">
            <FilterPills
              options={LIBRARY_TABS}
              activeValue={activeTab}
              onSelect={setActiveTab}
            />
          </View>
          <Pressable
            onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="w-10 h-10 rounded-full bg-white border border-mist items-center justify-center"
          >
            <Ionicons
              name={viewMode === "list" ? "grid-outline" : "list-outline"}
              size={20}
              color={Colors.forest}
            />
          </Pressable>
        </View>

        {!isLoading && filteredBooks.length > 0 && (
          <Text className="font-sans text-sm text-slate mb-4">
            {totalBooks} book{totalBooks !== 1 ? "s" : ""} • {totalHighlights} highlight{totalHighlights !== 1 ? "s" : ""}
          </Text>
        )}

        {/* Content or Empty State */}
        {isEmpty ? (
          <View className="flex-1 justify-center items-center">
            {renderEmptyState()}
          </View>
        ) : (
          <FlatList
            data={displayBooks}
            key={viewMode}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === "grid" ? 3 : 1}
            columnWrapperStyle={
              viewMode === "grid" ? { justifyContent: "flex-start", gap: 12 } : undefined
            }
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
            ListFooterComponent={
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => p - 1)}
                onNext={() => setPage((p) => p + 1)}
                onPage={setPage}
              />
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}