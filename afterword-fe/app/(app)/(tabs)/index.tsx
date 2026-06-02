import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { BookCover } from "../../../src/components/BookCover";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { SectionHeader } from "../../../src/components/SectionHeader";
import { AppHeader } from "../../../src/components/AppHeader";

const PLACEHOLDER_BOOKS = [
  { id: "1", title: "The Daily Stoic", author: "Ryan Holiday", highlights: 45 },
  { id: "2", title: "Atomic Habits", author: "James Clear", highlights: 68 },
  { id: "3", title: "The Midnight Library", author: "Matt Haig", highlights: 31 },
  { id: "4", title: "Deep Work", author: "Cal Newport", highlights: 24 },
];

const PLACEHOLDER_HIGHLIGHTS = [
  {
    quote: "Discipline is the bridge between goals and accomplishment.",
    bookTitle: "Atomic Habits",
    page: 45,
    timeAgo: "2h ago",
  },
  {
    quote:
      "You do not rise to the level of your goals. You fall to the level of your systems.",
    bookTitle: "Atomic Habits",
    page: 27,
    timeAgo: "1d ago",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer padded={false}>
      <AppHeader title="AfterWord" subtitle="For the Words Worth Revisiting." />
      
      <ScrollView contentContainerStyle={styles.contentPadding}>
        {/* Professional Hero Greeting */}
        <View style={styles.heroContainer}>
          <View style={styles.heroTextContent}>
            <Text style={styles.greetingTitle}>Good morning, Sam!</Text>
            <Text style={styles.greetingSub}>Onwards and AfterWords.</Text>
          </View>
          <Image
            source={require("../../../assets/fox/fox-reading.png")}
            style={styles.foxIllustration}
            resizeMode="contain"
          />
        </View>

        {/* Daily Highlight */}
        <View style={styles.section}>
          <HighlightCard
            featured={true}
            quote="The world is a book, and those who do not travel read only one page."
            bookTitle="Saint Augustine"
            onPress={() => {}}
          />
        </View>

        {/* Recent Reads */}
        <View style={styles.section}>
          <SectionHeader title="Recent Reads" onViewAll={() => {router.push("/library")}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bookRow}
          >
            {PLACEHOLDER_BOOKS.map((book) => (
              <View key={book.id} style={styles.bookCardWrapper}>
                <BookCover {...book} highlightCount={book.highlights} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Highlights */}
        <View style={styles.section}>
          <SectionHeader title="Recent Highlights" onViewAll={() => {router.push("/highlights")}} />
          <View style={styles.highlightList}>
            {PLACEHOLDER_HIGHLIGHTS.map((h, i) => (
              <View key={i} style={styles.highlightWrapper}>
                <HighlightCard quote={h.quote} bookTitle={h.bookTitle} page={h.page} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentPadding: {
    padding: Spacing.s20,
    paddingBottom: Spacing.s40,
  },
  heroContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.s32,
    marginTop: Spacing.s12,
  },
  heroTextContent: {
    flex: 1,
  },
  greetingTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.forest,
  },
  greetingSub: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginTop: Spacing.s4,
  },
  foxIllustration: {
    width: 90,
    height: 100,
  },
  section: {
    marginBottom: Spacing.s32,
  },
  bookRow: {
    gap: Spacing.s16,
  },
  bookCardWrapper: {
    marginRight: Spacing.s8,
  },
  highlightList: {
    gap: Spacing.s16,
  },
});