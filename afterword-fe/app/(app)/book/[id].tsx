import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Book = {
  id: string;
  title: string;
  author: string;
};

type Highlight = {
  id: string;
  highlight_text: string;
  location: string | null;
  page_number: number | null;
  note: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function colorFromTitle(title: string): string {
  const palette = [
    Colors.forest, "#1A3D6F", "#6B2D2D", "#4A3D6B", "#2D5A3D",
    Colors.amber,  "#2D4A6B", "#5A2D6B", "#3D6B2D", "#6B5A2D",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash += title.charCodeAt(i);
  return palette[hash % palette.length];
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [book, setBook] = useState<Book | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchBook() {
      setLoading(true);
      setError(null);

      try {
        // ── 1. Fetch book ───────────────────────────────────────────────────
        const { data: bookData, error: bookError } = await supabase
          .from("books")
          .select("id, title, author")
          .eq("id", id)
          .single();

        if (bookError || !bookData) {
          setError("Book not found.");
          return;
        }

        setBook(bookData);

        // ── 2. Fetch highlights with their notes (left join via foreign key) ─
        const { data: highlightData, error: highlightError } = await supabase
          .from("highlights")
          .select(`
            id,
            highlight_text,
            location,
            page_number,
            notes (
              content
            )
          `)
          .eq("book_id", id)
          .order("page_number", { ascending: true, nullsFirst: false });

        if (highlightError) {
          console.error("Highlights fetch error:", highlightError);
          setError("Failed to load highlights.");
          return;
        }

        const mapped: Highlight[] = (highlightData ?? []).map((h: any) => ({
          id: h.id,
          highlight_text: h.highlight_text,
          location: h.location ?? null,
          page_number: h.page_number ?? null,
          note: h.notes?.[0]?.content ?? null,
        }));

        setHighlights(mapped);
      } catch (err) {
        console.error("BookDetails error:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  const bgColor = book ? colorFromTitle(book.title) : Colors.forest;

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.forest} />
      </View>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (error || !book) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: Spacing.s24 }]}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: Spacing.s24 }}>
          <Ionicons name="chevron-back" size={28} color={Colors.forest} />
        </Pressable>
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong"
          message={error ?? "Could not load this book."}
        />
      </View>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
      >
        {/* ── Top colored hero ── */}
        <View style={[styles.topBackground, { paddingTop: Math.max(insets.top, 20) }]}>
          <ImageBackground
            source={require("../../../assets/fox/fox-bg.png")}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          >
            <View style={styles.imageOverlay} />
          </ImageBackground>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={28} color={Colors.white} />
            </Pressable>
          </View>

          {/* Book Cover */}
          <View style={styles.coverWrapper}>
            <View style={[styles.cover, { backgroundColor: bgColor }]}>
              <View style={styles.spine} />
              <Text style={styles.coverTitle} numberOfLines={4}>{book.title}</Text>
              <Text style={styles.coverAuthor} numberOfLines={2}>{book.author}</Text>
            </View>
          </View>
        </View>

        {/* ── Bottom white sheet ── */}
        <View style={styles.bottomSheet}>
          <View style={styles.contentContainer}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>By {book.author}</Text>

            <Text style={styles.highlightCount}>
              {highlights.length} highlight{highlights.length !== 1 ? "s" : ""}
            </Text>

            {/* ── Highlights ── */}
            <View style={styles.highlightsSection}>
              <Text style={styles.sectionTitle}>Your Highlights</Text>

              {highlights.length === 0 ? (
                <EmptyState
                  icon="bookmark-outline"
                  title="No highlights yet"
                  message="Highlights you import from this book will appear here."
                />
              ) : (
                <View style={styles.highlightsList}>
                  {highlights.map((h) => (
                    <HighlightCard
                      key={h.id}
                      quote={h.highlight_text}
                      bookTitle={book.title}
                      author={book.author}
                      page={h.page_number ?? undefined}
                      note={h.note ?? undefined}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  topBackground: {
    alignItems: "center",
    paddingBottom: 80,
    overflow: "hidden",
    backgroundColor: Colors.forest,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.s16,
    marginBottom: Spacing.s20,
    zIndex: 10,
  },
  iconButton: {
    padding: Spacing.s8,
  },
  coverWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 5,
    marginBottom: -100,
  },
  cover: {
    width: 180,
    aspectRatio: 2 / 3,
    borderRadius: 12,
    justifyContent: "flex-end",
    padding: Spacing.s16,
    overflow: "hidden",
  },
  spine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  coverTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 18,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 24,
    marginBottom: 6,
  },
  coverAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 120,
    paddingHorizontal: Spacing.s24,
    flex: 1,
  },
  contentContainer: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  bookTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: Spacing.s8,
  },
  bookAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.slate,
    marginBottom: Spacing.s8,
  },
  highlightCount: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    marginBottom: Spacing.s24,
    opacity: 0.7,
  },
  highlightsSection: {
    marginTop: Spacing.s8,
  },
  sectionTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 20,
    color: Colors.forest,
    marginBottom: Spacing.s16,
  },
  highlightsList: {
    gap: Spacing.s16,
  },
});