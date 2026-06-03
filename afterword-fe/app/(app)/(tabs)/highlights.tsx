import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { AppHeader } from "../../../src/components/AppHeader";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { EmptyState } from "../../../src/components/EmptyState";
import { ScreenContainer } from "../../../src/components/ScreenContainer";

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_HIGHLIGHTS = [
  {
    id: "1",
    quote: "Discipline is the bridge between goals and accomplishment.",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    page: 45,
    isFavorite: true,
  },
  {
    id: "2",
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    page: 27,
    isFavorite: true,
  },
  {
    id: "3",
    quote: "The impediment to action advances action. What stands in the way becomes the way.",
    bookTitle: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    page: 33,
    isFavorite: true,
  },
  {
    id: "4",
    quote: "Resilience is accepting your new reality, even if it's less good than the one you had before.",
    bookTitle: "Daring Greatly",
    author: "Brené Brown",
    page: 67,
    isFavorite: false,
  },
  {
    id: "5",
    quote: "The most important investment you can make is in yourself.",
    bookTitle: "The Snowball",
    author: "Warren Buffett",
    page: 112,
    isFavorite: false,
  },
  {
    id: "6",
    quote: "Do the best you can until you know better. Then when you know better, do better.",
    bookTitle: "Daring Greatly",
    author: "Brené Brown",
    page: 201,
    isFavorite: false,
  },
];

const FILTER_TABS = ["All", "Favourites"];

// ─── Fade-in list item ────────────────────────────────────────────────────────

function FadeInItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
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
  const [highlights, setHighlights] = useState(ALL_HIGHLIGHTS);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  function toggleFavorite(id: string) {
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isFavorite: !h.isFavorite } : h))
    );
  }

  const favorites = highlights.filter((h) => h.isFavorite);

  // Filter recent (non-favorite) highlights by search query
  const recent = highlights
    .filter((h) => !h.isFavorite)
    .filter((h) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        h.quote.toLowerCase().includes(q) ||
        h.bookTitle.toLowerCase().includes(q) ||
        h.author.toLowerCase().includes(q)
      );
    });

  const hasResults = recent.length > 0;

  return (
    <ScreenContainer padded={false}>
      {/* Page title — matches search page */}
      <AppHeader title="Highlights" />

      <View style={{ padding: Spacing.s20, flex: 1 }}>
      {/* Search bar — identical pattern to search.tsx */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.slate} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search your highlights…"
          placeholderTextColor={Colors.slate}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color={Colors.slate} />
          </Pressable>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {FILTER_TABS.map((tab, i) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(i)}
            style={[styles.tab, activeTab === i && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Favourites — horizontal scroll strip ────────────────────────── */}
      {favorites.length > 0 && !query && (
        <View style={styles.favSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Favourites</Text>
            <Text style={styles.sectionCount}>{favorites.length}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favScroll}
          >
            {favorites.map((h, i) => (
              <FadeInItem key={h.id} index={i}>
                <View style={styles.favCard}>
                  {/* Star button */}
                  <Pressable
                    style={styles.favHeartBtn}
                    onPress={() => toggleFavorite(h.id)}
                  >
                    <Ionicons name="heart" size={14} color={Colors.amber} />
                  </Pressable>

                  <Text style={styles.favQuote} numberOfLines={4}>
                    "{h.quote}"
                  </Text>

                  <View style={styles.favMeta}>
                    <Text style={styles.favBook} numberOfLines={1}>
                      {h.bookTitle}
                    </Text>
                    {h.author && (
                      <Text style={styles.favAuthor} numberOfLines={1}>
                        {h.author}
                      </Text>
                    )}
                  </View>
                </View>
              </FadeInItem>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Divider between sections */}
      {favorites.length > 0 && !query && <View style={styles.divider} />}

      {/* ── Recent highlights ────────────────────────────────────────────── */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {query ? `Results for "${query}"` : "Recent Highlights"}
          </Text>
          {!query && (
            <Text style={styles.sectionCount}>{recent.length}</Text>
          )}
        </View>

        {hasResults ? (
          <View style={styles.list}>
            {recent.map((h, i) => (
              <FadeInItem key={h.id} index={i}>
                <HighlightCard
                  quote={h.quote}
                  bookTitle={h.bookTitle}
                  author={h.author}
                  page={h.page}
                  isFavorite={h.isFavorite}
                  onFavorite={() => toggleFavorite(h.id)}
                  onShare={() => {}}
                  onPress={() => {}}
                />
              </FadeInItem>
            ))}
          </View>
        ) : (
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
        )}
      </View>
      </View>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Search bar — identical to search.tsx
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 45,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s4,
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

  // Tabs — identical to search.tsx
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.s24,
  },
  tab: {
    paddingHorizontal: Spacing.s16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: Colors.forest,
  },
  tabText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.slate,
  },
  tabTextActive: {
    fontWeight: "700",
    color: Colors.forest,
  },

  // Section headers
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
    marginBottom: Spacing.s16,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.slate,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionCount: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    backgroundColor: Colors.mist,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: "hidden",
  },

  // Favourites strip
  favSection: {
    marginBottom: Spacing.s24,
  },
  favScroll: {
    gap: Spacing.s12,
    paddingRight: Spacing.s4,
  },
  favCard: {
    width: 220,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.s16,
    gap: Spacing.s10,
    position: "relative",
    // Subtle shadow for floating feel
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  favHeartBtn: {
    position: "absolute",
    top: Spacing.s12,
    right: Spacing.s12,
    padding: 4,
  },
  favQuote: {
    fontFamily: Fonts.serif,
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.forest,
    lineHeight: 21,
    paddingRight: Spacing.s20, // clear the star button
  },
  favMeta: {
    gap: 2,
  },
  favBook: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.slate,
  },
  favAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.slate,
    opacity: 0.7,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.s24,
  },

  // Recent section
  recentSection: {
    flex: 1,
  },
  list: {
    gap: Spacing.s12,
  },
  emptyWrapper: {
    marginTop: Spacing.s32,
  },
});