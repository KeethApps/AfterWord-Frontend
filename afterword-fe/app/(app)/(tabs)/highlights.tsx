import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";

import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/shared/HighlightCard";
import { SearchBar } from "../../../src/components/shared/SearchBar";
import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { FilterPills } from "../../../src/components/common/FilterPills";
import { supabase } from "../../../lib/supabase";
import {
  HighlightsEmptyState, 
  HighlightsFilterSheet 
} from "../../../src/components/highlights";
import { Pagination } from "@/src/components/shared/Pagination";

import { Note } from "../../../types";

const PAGE_SIZE = 10;

const HIGHLIGHT_TABS = [
  { label: "All", value: "All" },
  { label: "Notes", value: "Notes" },
  { label: "Books", value: "Books" },
];

type Highlight = {
  id: string;
  highlightText: string;
  pageNumber: number | null;
  location: string | null;
  createdAt: string;
  notes?: Note[];
  book: {
    id: string;
    title: string;
    author: string;
    isbn?: string | null;
    coverImageUrl?: string | null;
  };
};


function FadeInItem({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay: index * 40,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        delay: index * 40,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function HighlightsScreen() {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  
  // UI State
  const [activeTab, setActiveTab] = useState("All");
  const [activeSort, setActiveSort] = useState("Most Recent");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchHighlights = useCallback(async (currentPage: number) => {
    if (!user) {
      setHighlights([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const isNotesTab = activeTab === "Notes";

      let dbQuery = supabase.from("highlights")
        .select(isNotesTab ? 'id, notes!inner(id)' : '*', { count: "exact", head: true })
        .eq('user_id', user.id);
      
      let dataQuery = supabase.from("highlights")
        .select(`
          id,
          highlight_text,
          page_number,
          location,
          created_at,
          notes${isNotesTab ? '!inner' : ''} ( id, content, highlight_id, user_id, created_at, updated_at ),
          books (
            id,
            title,
            author,
            cover_image_url,
            isbn
          )
        `)
        .eq('user_id', user.id)
        .range(from, to);




      if (activeSort === "Oldest") {
        dataQuery = dataQuery.order("created_at", { ascending: true });
      } else if (activeSort === "Book (A-Z)") {
        // Fallback to sorting by created_at since foreign table sorting is complex in simple queries,
        // but we'll try to order by books.title if supported.
        dataQuery = dataQuery.order("books(title)", { ascending: true } as any);
      } else if (activeSort === "Book (Z-A)") {
        dataQuery = dataQuery.order("books(title)", { ascending: false } as any);
      } else {
        dataQuery = dataQuery.order("created_at", { ascending: false });
      }

      if (query) {
        dbQuery = dbQuery.ilike('highlight_text', `%${query}%`);
        dataQuery = dataQuery.ilike('highlight_text', `%${query}%`);
      }

      const [{ count }, { data, error }] = await Promise.all([
        dbQuery,
        dataQuery,
      ]);

      if (error) {
        console.error("Highlights fetch error:", error);
      } else {
        setTotalCount(count ?? 0);
        const mapped: Highlight[] = (data ?? []).map((h: any) => ({
          id: h.id,
          highlightText: h.highlight_text,
          pageNumber: h.page_number ?? null,
          location: h.location ?? null,
          createdAt: h.created_at,
          notes: (h.notes ?? []).map((n: any) => ({
            id: n.id,
            highlightId: n.highlight_id,
            userId: n.user_id,
            content: n.content,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          })),
          book: {
            id: h.books?.id ?? "",
            title: h.books?.title ?? "Unknown Book",
            author: h.books?.author ?? "Unknown Author",
            coverImageUrl: h.books?.cover_image_url ?? null,
            isbn: h.books?.isbn ?? null,
          },
        }));

        setHighlights(mapped);
      }
    } catch (err) {
      console.error("Highlights error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, activeTab, activeSort, user]);


  useEffect(() => {
    if (!user) return;
    fetchHighlights(page);
  }, [page, fetchHighlights, user]);


  useEffect(() => {
    setPage(0);
  }, [query, activeTab, activeSort]);

  function goToPage(p: number) {
    setPage(p);
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <ScreenContainer padded={false} scrollable={false}>
      <AppHeader title="Highlights" />

      <View className="px-4 flex-1">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search your highlights..."
          onFilterPress={() => setIsFiltersOpen(true)}
          className="mb-4"
        />

        <View className="flex-row items-center mb-4">
          <FilterPills
            options={HIGHLIGHT_TABS}
            activeValue={activeTab}
            onSelect={setActiveTab}
          />
        </View>

        {!loading && totalCount > 0 && (
          <Text className="font-sans text-sm text-slate mb-4">
            {totalCount.toLocaleString()} highlight{totalCount !== 1 ? "s" : ""}
          </Text>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={Colors.forest} className="mt-12" />
        ) : highlights.length === 0 ? (
          <HighlightsEmptyState
            type={
              query ? "search-empty" : 
              activeTab === "Notes" ? "no-notes" : "empty"
            }
            onActionPress={() => setQuery("")}
          />
        ) : (
          <FlatList
            data={highlights}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
            renderItem={({ item, index }) => (
              <FadeInItem index={index}>
                  <HighlightCard
                    highlight={{
                      ...item,
                      bookId: item.book.id,
                      userId: "",
                      embedding: null,
                      embeddingModel: null,
                      lastSurfacedAt: null,
                      book: {
                        ...item.book,
                        userId: "",
                        description: null,
                        publisher: null,
                        publishDate: null,
                        enrichmentStatus: "pending",
                        createdAt: "",
                        updatedAt: "",
                      }
                    }}
                    className="mb-4"
                  />
              </FadeInItem>
            )}
            ListFooterComponent={
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => goToPage(page - 1)}
                onNext={() => goToPage(page + 1)}
                onPage={goToPage}
              />
            }
          />
        )}
      </View>

      <Modal
        visible={isFiltersOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFiltersOpen(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <Pressable className="flex-1" onPress={() => setIsFiltersOpen(false)} />
          <HighlightsFilterSheet 
            currentSort={activeSort}
            onClearAll={() => {
              setActiveSort("Most Recent");
              setIsFiltersOpen(false);
            }} 
            onApplyFilters={(sort) => {
              setActiveSort(sort);
              setIsFiltersOpen(false);
            }} 
            onClose={() => setIsFiltersOpen(false)}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}