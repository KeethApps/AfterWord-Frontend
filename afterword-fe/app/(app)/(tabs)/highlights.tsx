import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useAuth } from "../../../hooks/useAuth";

import { Colors } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/shared/HighlightCard";
import { SearchBar } from "../../../src/components/shared/SearchBar";
import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { FilterPills } from "../../../src/components/common/FilterPills";
import { supabase } from "../../../lib/supabase";
import {
  HighlightsEmptyState,
  HighlightsFilters,
  HighlightsSort,
} from "../../../src/components/highlights";
import { Pagination } from "@/src/components/shared/Pagination";

import { Note, Tag } from "../../../types";

const PAGE_SIZE = 10;

const HIGHLIGHT_TABS = [
  { label: "All", value: "All" },
  { label: "Notes", value: "Notes" },
  { label: "Favourites", value: "Favourites" },
];

type Highlight = {
  id: string;
  highlightText: string;
  pageNumber: number | null;
  location: string | null;
  createdAt: string;
  isFavorite?: boolean;
  tags?: Tag[];
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

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function HighlightsScreen() {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  // UI State
  const [activeTab, setActiveTab] = useState("All");
  const [activeSort, setActiveSort] = useState<HighlightsSort>("Most Recent");
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // "Favourites" tab maps to favoritesOnly filter
  const favoritesOnly = activeTab === "Favourites";

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
      const hasTagFilter = filterTagIds.length > 0;

      let dbQuery = supabase.from("highlights")
        .select(
          isNotesTab
            ? 'id, notes!inner(id)'
            : hasTagFilter
            ? 'id, highlight_tags!inner(tag_id)'
            : 'id',
          { count: "exact", head: true }
        )
        .eq('user_id', user.id);

      let dataQuery = supabase.from("highlights")
        .select(`
          id,
          highlight_text,
          page_number,
          location,
          created_at,
          is_favorite,
          notes${isNotesTab ? '!inner' : ''} ( id, content, highlight_id, user_id, created_at, updated_at ),
          books (
            id,
            title,
            author,
            cover_image_url,
            isbn
          ),
          highlight_tags${hasTagFilter ? '!inner' : ''} ( tag_id, tags ( id, name, normalized_name, created_at ) )
        `)
        .eq('user_id', user.id)
        .range(from, to);

      if (favoritesOnly) {
        dbQuery = dbQuery.eq('is_favorite', true);
        dataQuery = dataQuery.eq('is_favorite', true);
      }

      dataQuery = dataQuery.order("created_at", { ascending: activeSort === "Oldest" });

      if (query) {
        dbQuery = dbQuery.ilike('highlight_text', `%${query}%`);
        dataQuery = dataQuery.ilike('highlight_text', `%${query}%`);
      }

      if (hasTagFilter) {
        dbQuery = (dbQuery as any).in('highlight_tags.tag_id', filterTagIds);
        dataQuery = (dataQuery as any).in('highlight_tags.tag_id', filterTagIds);
      }

      const [{ count }, { data, error }] = await Promise.all([dbQuery, dataQuery]);

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
          isFavorite: h.is_favorite ?? false,
          notes: (h.notes ?? []).map((n: any) => ({
            id: n.id,
            highlightId: n.highlight_id,
            userId: n.user_id,
            content: n.content,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          })),
          tags: (h.highlight_tags ?? []).map((ht: any) => ht.tags).filter(Boolean).map((t: any) => ({
            id: t.id,
            userId: user.id,
            name: t.name,
            normalizedName: t.normalized_name,
            createdAt: t.created_at,
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
  }, [query, activeTab, activeSort, favoritesOnly, filterTagIds, user]);


  useEffect(() => {
    if (!user) return;
    fetchHighlights(page);
  }, [page, fetchHighlights, user]);

  useEffect(() => {
    setPage(0);
  }, [query, activeTab, activeSort, filterTagIds]);

  function goToPage(p: number) {
    setPage(p);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer padded={false} scrollable={false}>
      <AppHeader title="My Highlights" />

      <View className="px-4 flex-1">
        {/* Search bar — no filter icon */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search your highlights..."
          className="mb-4"
        />

        {/* Tab pills: All | Notes | Favourites */}
        <View className="flex-row items-center mb-4">
          <FilterPills
            options={HIGHLIGHT_TABS}
            activeValue={activeTab}
            onSelect={setActiveTab}
          />
        </View>

        {/* Sort & Filter — collapsible inline section */}
        <HighlightsFilters
          expanded={isFiltersOpen}
          onToggleExpanded={() => setIsFiltersOpen((o) => !o)}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          selectedTagIds={filterTagIds}
          onTagsChange={setFilterTagIds}
        />


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
                    isFavorite: item.isFavorite ?? false,
                    tags: item.tags ?? [],
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
    </ScreenContainer>
  );
}