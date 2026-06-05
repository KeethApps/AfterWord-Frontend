import React, { useState, useRef, useEffect } from "react";
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
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay: index * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        delay: index * 60,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HighlightsScreen() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // ── Fetch all highlights for the current user ──────────────────────────────
  useEffect(() => {
    async function fetchHighlights() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setHighlights([]);
          return;
        }

        const { data, error } = await supabase
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
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Highlights fetch error:", error);
        } else {
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
    }

    fetchHighlights();
  }, []);

  // ── Filter by search query ─────────────────────────────────────────────────
  const filtered = highlights.filter((h) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      h.highlight_text.toLowerCase().includes(q) ||
      h.book.title.toLowerCase().includes(q) ||
      h.book.author.toLowerCase().includes(q)
    );
  });

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
            placeholder="Search your highlights…"
            placeholderTextColor={Colors.slate}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.slate} />
            </Pressable>
          )}
        </View>

        {/* Count row */}
        {!loading && (
          <View style={styles.countRow}>
            <Text style={styles.countText}>
              {query
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`
                : `${highlights.length} highlight${highlights.length !== 1 ? "s" : ""}`}
            </Text>
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
              title={query ? "No results found" : "No highlights yet"}
              message={
                query
                  ? `Nothing matched "${query}". Try different keywords.`
                  : "Your highlights will appear here once you import your Clippings.txt."
              }
            />
          </View>
        ) : (
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
    marginBottom: Spacing.s16,
  },
  countText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  list: {
    gap: Spacing.s12,
  },
  emptyWrapper: {
    marginTop: Spacing.s32,
  },
});