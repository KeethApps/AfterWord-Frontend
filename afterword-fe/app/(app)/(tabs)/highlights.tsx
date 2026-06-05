import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { supabase } from "../../../lib/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type Highlight = {
  id: string;
  highlight_text: string;
  page_number: number | null;
  location: string | null;
  book: {
    id: string;
    title: string;
    author: string;
  };
};

// ─── Fade-in list item ────────────────────────────────────────────────────────

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

// ─── Pagination controls ──────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page number buttons — show up to 5 around current page
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (page > 3) pages.push("...");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 4) pages.push("...");
    pages.push(totalPages - 1);
  }

  return (
    <View style={paginationStyles.row}>
      {/* Prev */}
      <Pressable
        style={[paginationStyles.navBtn, page === 0 && paginationStyles.disabled]}
        onPress={onPrev}
        disabled={page === 0}
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color={page === 0 ? Colors.slate : Colors.forest}
        />
      </Pressable>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <Text key={`ellipsis-${i}`} style={paginationStyles.ellipsis}>…</Text>
        ) : (
          <Pressable
            key={p}
            style={[paginationStyles.pageBtn, p === page && paginationStyles.pageBtnActive]}
            onPress={() => onPage(p as number)}
          >
            <Text
              style={[
                paginationStyles.pageText,
                p === page && paginationStyles.pageTextActive,
              ]}
            >
              {(p as number) + 1}
            </Text>
          </Pressable>
        )
      )}

      {/* Next */}
      <Pressable
        style={[paginationStyles.navBtn, page === totalPages - 1 && paginationStyles.disabled]}
        onPress={onNext}
        disabled={page === totalPages - 1}
      >
        <Ionicons
          name="chevron-forward"
          size={16}
          color={page === totalPages - 1 ? Colors.slate : Colors.forest}
        />
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HighlightsScreen() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Fetch page of highlights ───────────────────────────────────────────────
  const fetchHighlights = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHighlights([]);
        setTotalCount(0);
        return;
      }

      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [{ count }, { data, error }] = await Promise.all([
        // Cheap count-only query
        supabase
          .from("highlights")
          .select("*", { count: "exact", head: true }),
        // Paginated data query
        supabase
          .from("highlights")
          .select(`
            id,
            highlight_text,
            page_number,
            location,
            books (
              id,
              title,
              author
            )
          `)
          .order("created_at", { ascending: false })
          .range(from, to),
      ]);

      if (error) {
        console.error("Highlights fetch error:", error);
      } else {
        setTotalCount(count ?? 0);
        const mapped: Highlight[] = (data ?? []).map((h: any) => ({
          id: h.id,
          highlight_text: h.highlight_text,
          page_number: h.page_number ?? null,
          location: h.location ?? null,
          book: {
            id: h.books?.id ?? "",
            title: h.books?.title ?? "Unknown Book",
            author: h.books?.author ?? "Unknown Author",
          },
        }));
        setHighlights(mapped);
      }
    } catch (err) {
      console.error("Highlights error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and page change
  useEffect(() => {
    fetchHighlights(page);
  }, [page, fetchHighlights]);

  // Reset to page 0 when search query changes
  useEffect(() => {
    setPage(0);
  }, [query]);

  // ── Client-side filter for search query ───────────────────────────────────
  // NOTE: filters within the current page only. For full-text search across
  // all highlights, use the dedicated Search tab.
  const filtered = highlights.filter((h) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      h.highlight_text.toLowerCase().includes(q) ||
      h.book.title.toLowerCase().includes(q) ||
      h.book.author.toLowerCase().includes(q)
    );
  });

  function goToPage(p: number) {
    setPage(p);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <ScreenContainer padded={false}>
      <AppHeader title="Highlights" />

      <View style={{ padding: Spacing.s20, flex: 1 }}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.slate} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Filter this page…"
            placeholderTextColor={Colors.slate}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.slate} />
            </Pressable>
          )}
        </View>

        {/* Count + page info row */}
        {!loading && (
          <View style={styles.countRow}>
            <Text style={styles.countText}>
              {totalCount} highlight{totalCount !== 1 ? "s" : ""}
            </Text>
            {totalPages > 1 && (
              <Text style={styles.pageInfo}>
                Page {page + 1} of {totalPages}
              </Text>
            )}
          </View>
        )}

        {/* Body */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.forest}
            style={{ marginTop: 60 }}
          />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyState
              icon={query ? "search-outline" : "bookmark-outline"}
              title={query ? "No matches on this page" : "No highlights yet"}
              message={
                query
                  ? `Nothing on this page matched "${query}". Try the Search tab for full-library search.`
                  : "Your highlights will appear here once you import your Clippings.txt."
              }
            />
          </View>
        ) : (
          <>
            <View style={styles.list}>
              {filtered.map((h, i) => (
                <FadeInItem key={h.id} index={i}>
                  <HighlightCard
                    quote={h.highlight_text}
                    bookTitle={h.book.title}
                    author={h.book.author}
                    page={h.page_number ?? undefined}
                  />
                </FadeInItem>
              ))}
            </View>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => goToPage(page - 1)}
              onNext={() => goToPage(page + 1)}
              onPage={goToPage}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.s16,
  },
  countText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  pageInfo: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  list: {
    gap: Spacing.s12,
    marginBottom: Spacing.s24,
  },
  emptyWrapper: {
    marginTop: Spacing.s32,
  },
});

const paginationStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.s8,
    paddingVertical: Spacing.s16,
    paddingBottom: Spacing.s32,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.35,
  },
  pageBtn: {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.s8,
  },
  pageBtnActive: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  pageText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
  },
  pageTextActive: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
  },
  ellipsis: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    paddingHorizontal: 4,
  },
});