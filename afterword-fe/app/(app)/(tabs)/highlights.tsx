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
  TextInput,
  Alert,
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
  HighlightsFilters,
  HighlightsSort,
} from "../../../src/components/highlights";
import { Pagination } from "@/src/components/shared/Pagination";
import { useTags } from "../../../hooks/queries/tags";
import { useQueryClient } from "@tanstack/react-query";

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

// ── Inline Tags Manager ─────────────────────────────────────────────────────

function TagsManager() {
  const { data: tags = [], isLoading } = useTags();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [expanded, setExpanded] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not signed in");
      const normalizedName = name.toLowerCase();
      const { error } = await supabase.from("tags").upsert(
        { user_id: authUser.id, name, normalized_name: normalizedName },
        { onConflict: "user_id,normalized_name", ignoreDuplicates: false }
      );
      if (error) throw error;
      setNewTagName("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    setDeletingId(tag.id);
    try {
      const { error } = await supabase.from("tags").delete().eq("id", tag.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.tagsManager}>
      {/* Header row — always visible */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={styles.tagsManagerHeader}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="pricetags-outline" size={16} color={Colors.forest} />
          <Text style={styles.tagsManagerTitle}>Manage Tags</Text>
          {tags.length > 0 && (
            <View style={styles.tagCountBadge}>
              <Text style={styles.tagCountText}>{tags.length}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.slate}
        />
      </Pressable>

      {/* Expanded body */}
      {expanded && (
        <View style={styles.tagsManagerBody}>
          {/* Create row */}
          <View style={styles.createRow}>
            <TextInput
              style={styles.tagInput}
              placeholder="New tag name..."
              placeholderTextColor={Colors.slate}
              value={newTagName}
              onChangeText={setNewTagName}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              autoCapitalize="none"
            />
            <Pressable
              onPress={handleCreate}
              disabled={creating || !newTagName.trim()}
              style={[styles.createBtn, (!newTagName.trim() || creating) && { opacity: 0.4 }]}
            >
              {creating ? (
                <ActivityIndicator size="small" color={Colors.cream} />
              ) : (
                <Ionicons name="add" size={18} color={Colors.cream} />
              )}
            </Pressable>
          </View>

          {/* Existing tags */}
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.forest} style={{ marginTop: 8 }} />
          ) : tags.length === 0 ? (
            <Text style={styles.emptyTagsText}>No tags yet. Add one above.</Text>
          ) : (
            <View style={styles.tagsList}>
              {tags.map((tag: Tag) => (
                <View key={tag.id} style={styles.tagRow}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{tag.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleDelete(tag)}
                    disabled={deletingId === tag.id}
                    hitSlop={8}
                    style={{ opacity: deletingId === tag.id ? 0.4 : 1 }}
                  >
                    {deletingId === tag.id ? (
                      <ActivityIndicator size="small" color={Colors.slate} />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color={Colors.slate} />
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
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
          is_favorite,
          notes${isNotesTab ? '!inner' : ''} ( id, content, highlight_id, user_id, created_at, updated_at ),
          books (
            id,
            title,
            author,
            cover_image_url,
            isbn
          ),
          highlight_tags ( tag_id, tags ( id, name, normalized_name, created_at ) )
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

      if (filterTagIds.length > 0) {
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
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search your highlights..."
          onFilterPress={() => setIsFiltersOpen((o) => !o)}
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

        {/* Sort & Filter — collapsible inline section, mirrors Manage Tags below */}
        <HighlightsFilters
          expanded={isFiltersOpen}
          onToggleExpanded={() => setIsFiltersOpen((o) => !o)}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          selectedTagIds={filterTagIds}
          onTagsChange={setFilterTagIds}
        />

        {/* Tags manager — collapsible inline section */}
        <TagsManager />

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

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tagsManager: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: "hidden",
  },
  tagsManagerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tagsManagerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.forest,
  },
  tagCountBadge: {
    backgroundColor: Colors.mist,
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagCountText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.forest,
  },
  tagsManagerBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 14,
  },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.mist,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.forest,
  },
  createBtn: {
    backgroundColor: Colors.forest,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsList: {
    gap: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagPill: {
    backgroundColor: "#EEF5EE",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagPillText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.forest,
  },
  emptyTagsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.slate,
    textAlign: "center",
    paddingVertical: 8,
  },
});