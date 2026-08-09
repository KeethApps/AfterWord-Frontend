import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";

import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/shared/HighlightCard";
import { SearchBar } from "../../../src/components/shared/SearchBar";
import { ScreenContainer } from "../../../src/components/common/ScreenContainer";
import { Pagination } from "@/src/components/shared/Pagination";
import { supabase } from "../../../lib/supabase";
import { useTags } from "../../../hooks/queries/tags";
import { ManageTagsSheet } from "../../../src/components/highlights";
import { Note, Tag } from "../../../types";

const PAGE_SIZE = 10;

type HighlightItem = {
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

type CollectionSelection = {
  type: "favorites" | "notes" | "tag";
  tagId?: string;
  title: string;
  description?: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

function FadeInItem({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(8)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        delay: Math.min(index * 35, 300),
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 240,
        delay: Math.min(index * 35, 300),
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

export default function CollectionsScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const { data: tags = [], isLoading: loadingTags } = useTags();

  // Selected collection state
  const [selectedCollection, setSelectedCollection] = useState<CollectionSelection | null>(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  // Overall counts for Favourites & Notes
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Detail view search & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Fetch Collection Summary Counts ────────────────────────────────────────

  const fetchSummaryCounts = useCallback(async () => {
    if (!user) return;
    setLoadingCounts(true);
    try {
      // 1. Favorites count
      const favRes = await supabase
        .from("highlights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_favorite", true);

      // 2. Notes count (highlights having at least 1 note)
      const noteRes = await supabase
        .from("highlights")
        .select("id, notes!inner(id)", { count: "exact", head: true })
        .eq("user_id", user.id);

      // 3. Tag counts
      const tagRes = await supabase
        .from("highlight_tags")
        .select("tag_id")
        .eq("user_id", user.id);

      setFavoritesCount(favRes.count ?? 0);
      setNotesCount(noteRes.count ?? 0);

      const counts: Record<string, number> = {};
      (tagRes.data ?? []).forEach((row: { tag_id: string }) => {
        counts[row.tag_id] = (counts[row.tag_id] || 0) + 1;
      });
      setTagCounts(counts);
    } catch (err) {
      console.error("Error fetching collection counts:", err);
    } finally {
      setLoadingCounts(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSummaryCounts();
    }
  }, [user, fetchSummaryCounts]);

  // ── Fetch Highlights for Selected Collection ───────────────────────────────

  const fetchCollectionHighlights = useCallback(
    async (currentPage: number) => {
      if (!user || !selectedCollection) return;
      setLoadingHighlights(true);
      try {
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const isTagSelect = selectedCollection.type === "tag" && Boolean(selectedCollection.tagId);

        let dbQuery = supabase
          .from("highlights")
          .select(
            selectedCollection.type === "notes"
              ? "id, notes!inner(id)"
              : isTagSelect
              ? "id, highlight_tags!inner(tag_id)"
              : "id",
            {
              count: "exact",
              head: true,
            }
          )
          .eq("user_id", user.id);

        let dataQuery = supabase
          .from("highlights")
          .select(`
            id,
            highlight_text,
            page_number,
            location,
            created_at,
            is_favorite,
            notes${selectedCollection.type === "notes" ? "!inner" : ""} ( id, content, highlight_id, user_id, created_at, updated_at ),
            books (
              id,
              title,
              author,
              cover_image_url,
              isbn
            ),
            highlight_tags${isTagSelect ? "!inner" : ""} ( tag_id, tags ( id, name, normalized_name, created_at ) )
          `)
          .eq("user_id", user.id)
          .range(from, to)
          .order("created_at", { ascending: false });

        if (selectedCollection.type === "favorites") {
          dbQuery = dbQuery.eq("is_favorite", true);
          dataQuery = dataQuery.eq("is_favorite", true);
        } else if (isTagSelect && selectedCollection.tagId) {
          dbQuery = dbQuery.eq("highlight_tags.tag_id", selectedCollection.tagId);
          dataQuery = dataQuery.eq("highlight_tags.tag_id", selectedCollection.tagId);
        }

        const [{ count }, { data, error }] = await Promise.all([dbQuery, dataQuery]);

        if (error) throw error;

        setTotalCount(count ?? 0);
        const mapped: HighlightItem[] = (data ?? []).map((h: any) => ({
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
          tags: (h.highlight_tags ?? [])
            .map((ht: any) => ht.tags)
            .filter(Boolean)
            .map((t: any) => ({
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
      } catch (err) {
        console.error("Collection highlights fetch error:", err);
      } finally {
        setLoadingHighlights(false);
      }
    },
    [user, selectedCollection]
  );

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionHighlights(page);
    }
  }, [selectedCollection, page, fetchCollectionHighlights]);

  useEffect(() => {
    setPage(0);
  }, [selectedCollection]);

  // Filtered tags for search query on overview
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const q = searchQuery.toLowerCase().trim();
    return tags.filter((t: Tag) => t.name.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  // ── Render Collection Detail View ──────────────────────────────────────────

  if (selectedCollection) {
    return (
      <ScreenContainer padded={false} scrollable={false}>
        <AppHeader title="Collections" />

        <View style={styles.container}>
          {/* Header Action Bar */}
          <Pressable
            onPress={() => setSelectedCollection(null)}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={18} color={Colors.forest} />
            <Text style={styles.backText}>All Collections</Text>
          </Pressable>

          {/* Collection Title & Subtitle */}
          <View style={styles.detailTitleRow}>
            <View style={styles.titleWithIcon}>
              <View style={styles.detailIconCircle}>
                <Ionicons
                  name={selectedCollection.iconName}
                  size={20}
                  color={Colors.forest}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailTitle}>{selectedCollection.title}</Text>
                <Text style={styles.detailCount}>
                  {totalCount} highlight{totalCount !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>

          {loadingHighlights ? (
            <ActivityIndicator size="large" color={Colors.forest} style={{ marginTop: 32 }} />
          ) : highlights.length === 0 ? (
            <View style={styles.emptyDetailContainer}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.slate} />
              <Text style={styles.emptyDetailTitle}>No highlights found</Text>
              <Text style={styles.emptyDetailText}>
                This collection doesn't have any highlights yet.
              </Text>
            </View>
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
                      },
                    }}
                    className="mb-4"
                  />
                </FadeInItem>
              )}
              ListFooterComponent={
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPrev={() => setPage(page - 1)}
                  onNext={() => setPage(page + 1)}
                  onPage={(p) => setPage(p)}
                />
              }
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  // ── Render Collections Overview Grid ───────────────────────────────────────

  return (
    <ScreenContainer padded={false} scrollable={false}>
      <AppHeader title="Collections" />

      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Filter collections..."
          className="mb-4"
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Featured Collections Section */}
          <Text style={styles.sectionHeader}>Featured Collections</Text>

          <View style={isWide ? styles.featuredRow : styles.featuredColumn}>
            {/* Favourites Card */}
            <Pressable
              onPress={() =>
                setSelectedCollection({
                  type: "favorites",
                  title: "Favorites",
                  description: "Starred quotes & key takeaways",
                  iconName: "heart",
                })
              }
              style={[styles.featuredCard, styles.favCard]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(212, 175, 55, 0.18)" }]}>
                  <Ionicons name="heart" size={20} color={Colors.gold} />
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{favoritesCount}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: Colors.white }]}>Favorites</Text>
              <Text style={[styles.cardSubtitle, { color: Colors.mist }]}>
                Your starred quotes & key takeaways
              </Text>
            </Pressable>

            {/* Notes Card */}
            <Pressable
              onPress={() =>
                setSelectedCollection({
                  type: "notes",
                  title: "Notes & Annotations",
                  description: "Highlights with personal notes attached",
                  iconName: "create-outline",
                })
              }
              style={[styles.featuredCard, styles.notesCard]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.mist }]}>
                  <Ionicons name="create-outline" size={20} color={Colors.forest} />
                </View>
                <View style={[styles.countBadge, { backgroundColor: Colors.mist }]}>
                  <Text style={[styles.countBadgeText, { color: Colors.forest }]}>{notesCount}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: Colors.forest }]}>Notes & Annotations</Text>
              <Text style={[styles.cardSubtitle, { color: Colors.slate }]}>
                Highlights with personal notes
              </Text>
            </Pressable>
          </View>



          {/* Tag Collections Section */}
          <View style={styles.tagSectionHeaderRow}>
            <Text style={styles.sectionHeader}>Tag Collections</Text>
            {tags.length > 0 && (
              <Text style={styles.tagSectionCount}>{tags.length} tags</Text>
            )}
          </View>
                    {/* Manage Tags Section */}
          <ManageTagsSheet
            expanded={isTagsOpen}
            onToggle={() => setIsTagsOpen((o) => !o)}
          />

          {loadingTags || loadingCounts ? (
            <ActivityIndicator size="small" color={Colors.forest} style={{ marginTop: 24 }} />
          ) : filteredTags.length === 0 ? (
            <View style={styles.emptyTagsCard}>
              <Ionicons name="pricetags-outline" size={32} color={Colors.slate} />
              <Text style={styles.emptyTagsTitle}>
                {searchQuery ? "No matching tags" : "No tags yet"}
              </Text>
              <Text style={styles.emptyTagsText}>
                {searchQuery
                  ? "Try a different search term."
                  : "Organize your highlights by creating tags on the Highlights tab!"}
              </Text>
            </View>
          ) : (
            <View style={styles.tagsGrid}>
              {filteredTags.map((tag: Tag) => {
                const count = tagCounts[tag.id] || 0;
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() =>
                      setSelectedCollection({
                        type: "tag",
                        tagId: tag.id,
                        title: `# ${tag.name}`,
                        iconName: "pricetag-outline",
                      })
                    }
                    style={styles.tagCollectionCard}
                  >
                    <View style={styles.tagCardRow}>
                      <View style={styles.tagCardLeft}>
                        <Ionicons name="pricetag-outline" size={16} color={Colors.forest} />
                        <Text style={styles.tagCardTitle} numberOfLines={1}>
                          {tag.name}
                        </Text>
                      </View>
                      <View style={styles.tagCountPill}>
                        <Text style={styles.tagCountText}>{count}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
  sectionHeader: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 8,
  },
  featuredColumn: {
    gap: 12,
    marginBottom: 24,
  },
  featuredRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  featuredCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    justifyContent: "space-between",
    minHeight: 120,
  },
  favCard: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  notesCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countBadgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.black,
  },
  cardTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 17,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  tagSectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  tagSectionCount: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
  },
  tagsGrid: {
    gap: 10,
  },
  tagCollectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tagCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  tagCardTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
    flex: 1,
  },
  tagCountPill: {
    backgroundColor: "#EEF5EE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagCountText: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.forest,
  },
  emptyTagsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTagsTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyTagsText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    textAlign: "center",
  },

  // Detail View Styles
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
  },
  detailTitleRow: {
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  detailTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 22,
    color: Colors.forest,
  },
  detailCount: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    marginTop: 2,
  },
  emptyDetailContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyDetailTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.forest,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDetailText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
