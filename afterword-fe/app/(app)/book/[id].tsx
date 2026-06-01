import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Deterministic placeholder color from title string (copied from BookCover)
function colorFromTitle(title: string): string {
  const palette = [
    Colors.forest, "#1A3D6F", "#6B2D2D", "#4A3D6B", "#2D5A3D",
    Colors.amber, "#2D4A6B", "#5A2D6B", "#3D6B2D", "#6B5A2D",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash += title.charCodeAt(i);
  return palette[hash % palette.length];
}

// Dummy data
const BOOK_DB: Record<string, any> = {
  "1": { title: "The Daily Stoic", author: "Ryan Holiday", highlights: 45, rating: 4.8, reviews: 120, tags: ["Philosophy", "Self-Help", "Daily"] },
  "2": { title: "Atomic Habits", author: "James Clear", highlights: 68, rating: 4.9, reviews: 3400, tags: ["Habits", "Productivity", "Psychology"] },
  "3": { title: "The Midnight Library", author: "Matt Haig", highlights: 31, rating: 4.5, reviews: 890, tags: ["Fiction", "Fantasy", "Mental Health"] },
  "4": { title: "Deep Work", author: "Cal Newport", highlights: 24, rating: 4.7, reviews: 560, tags: ["Productivity", "Career", "Focus"] },
  "5": { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", highlights: 16, rating: 4.6, reviews: 1100, tags: ["Psychology", "Science", "Decision Making"] },
  "6": { title: "The 5 AM Club", author: "Robin Sharma", highlights: 19, rating: 4.4, reviews: 420, tags: ["Self-Help", "Morning Routine"] },
  "7": { title: "Sapiens", author: "Yuval Noah Harari", highlights: 47, rating: 4.8, reviews: 2500, tags: ["History", "Anthropology", "Science"] },
  "8": { title: "Man's Search for Meaning", author: "Viktor Frankl", highlights: 13, rating: 4.9, reviews: 1800, tags: ["Philosophy", "Psychology", "History"] },
};

const DUMMY_HIGHLIGHTS = [
  { id: '1', quote: "Discipline is the bridge between goals and accomplishment.", page: 45, isFavorite: true },
  { id: '2', quote: "You do not rise to the level of your goals. You fall to the level of your systems.", page: 27, isFavorite: false },
  { id: '3', quote: "Some things are in our control and others not.", page: 12, isFavorite: false },
];

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const book = BOOK_DB[id] || { 
    title: "Unknown Book", 
    author: "Unknown Author", 
    highlights: 0, 
    rating: 0, 
    reviews: 0, 
    tags: [] 
  };
  
  const bgColor = colorFromTitle(book.title);

  const [highlights, setHighlights] = useState(DUMMY_HIGHLIGHTS);

  const toggleFavorite = (highlightId: string) => {
    setHighlights(prev => prev.map(h => h.id === highlightId ? { ...h, isFavorite: !h.isFavorite } : h));
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        bounces={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 40) }}
      >
        {/* Top Colored Background Area */}
        <View style={[styles.topBackground, { backgroundColor: bgColor, paddingTop: Math.max(insets.top, 20) }]}>
          {/* Header Navigation */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={28} color={Colors.white} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="bookmark-outline" size={24} color={Colors.white} />
            </Pressable>
          </View>

          {/* Book Cover */}
          <View style={styles.coverWrapper}>
            <View style={[styles.cover, { backgroundColor: bgColor }]}>
              <View style={[styles.spine, { backgroundColor: "rgba(0,0,0,0.2)" }]} />
              <Text style={styles.coverTitle} numberOfLines={4}>{book.title}</Text>
              <Text style={styles.coverAuthor} numberOfLines={2}>{book.author}</Text>
            </View>
          </View>
        </View>

        {/* Bottom White Sheet */}
        <View style={styles.bottomSheet}>
          <View style={styles.contentContainer}>
            {/* Title & Author */}
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>By {book.author}</Text>

            {/* Rating Row */}
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons 
                    key={star} 
                    name={star <= Math.round(book.rating) ? "star" : "star-outline"} 
                    size={16} 
                    color={Colors.amber} 
                  />
                ))}
                <Text style={styles.ratingText}>{book.rating.toFixed(2)}</Text>
              </View>
              <View style={styles.reviews}>
                <Ionicons name="chatbubble-outline" size={16} color={Colors.slate} style={{ opacity: 0.5 }} />
                <Text style={styles.reviewsText}>{book.highlights} Highlights</Text>
              </View>
            </View>

            {/* Description Placeholder */}
            <Text style={styles.description}>
              This is a beautifully written book that will change the way you think about life. 
              It provides profound insights into human nature and offers practical advice on how to improve your daily habits and mindset. 
              Perfect for anyone looking to grow and learn.
            </Text>

            {/* Tags Row */}
            {book.tags && book.tags.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
                {book.tags.map((tag: string) => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Read Highlights</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Add Highlight</Text>
              </Pressable>
            </View>

            {/* Highlights List */}
            <View style={styles.highlightsSection}>
              <Text style={styles.sectionTitle}>Your Highlights</Text>
              <View style={styles.highlightsList}>
                {highlights.map((h) => (
                  <HighlightCard
                    key={h.id}
                    quote={h.quote}
                    bookTitle={book.title}
                    author={book.author}
                    page={h.page}
                    isFavorite={h.isFavorite}
                    onFavorite={() => toggleFavorite(h.id)}
                    onShare={() => {}}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  topBackground: {
    alignItems: 'center',
    paddingBottom: 80, // Extra padding so cover can overlap
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: -100, // Overlap the bottom sheet
  },
  cover: {
    width: 180,
    aspectRatio: 2/3,
    borderRadius: 12,
    justifyContent: "flex-end",
    padding: Spacing.s16,
    position: "relative",
    overflow: "hidden",
  },
  spine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 14,
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
    paddingTop: 120, // Make room for overlapping cover
    paddingHorizontal: Spacing.s24,
    flex: 1,
  },
  contentContainer: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
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
    marginBottom: Spacing.s16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.s24,
    gap: Spacing.s16,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
    marginLeft: Spacing.s8,
  },
  reviews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s6,
  },
  reviewsText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: Spacing.s24,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.s32,
  },
  tagPill: {
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s8,
    borderRadius: 20,
    marginRight: Spacing.s8,
  },
  tagText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.forest,
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.s16,
    marginBottom: Spacing.s40,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#73C6C6', // A teal color similar to mockup
    paddingVertical: Spacing.s16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: "#73C6C6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: Fonts.sansBold,
    color: Colors.white,
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.s16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontFamily: Fonts.sansBold,
    color: Colors.forest,
    fontSize: 16,
  },
  highlightsSection: {
    marginTop: Spacing.s16,
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
