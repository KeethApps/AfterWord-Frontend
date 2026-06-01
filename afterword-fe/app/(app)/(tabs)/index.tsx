import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image, Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { BookCover } from "../../../src/components/BookCover";
import { HighlightCard } from "../../../src/components/HighlightCard";
import { SectionHeader } from "../../../src/components/SectionHeader";

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
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    bookTitle: "Atomic Habits",
    page: 27,
    timeAgo: "1d ago",
  },
];



export default function HomeScreen() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <ScreenContainer>
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.slate} />
          <Text style={styles.searchText}>
            Search your library...
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Image
              source={require("../../../assets/fox/fox-icon.png")}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </Pressable>
          {isDropdownOpen && (
            <View style={styles.dropdown}>
              <Pressable 
                style={styles.dropdownItem} 
                onPress={() => {
                  setIsDropdownOpen(false);
                  router.push("/profile");
                }}
              >
                <Ionicons name="person-outline" size={18} color={Colors.forest} />
                <Text style={styles.dropdownText}>Profile</Text>
              </Pressable>
              <Pressable 
                style={styles.dropdownItem} 
                onPress={() => {
                  setIsDropdownOpen(false);
                  router.push("/settings");
                }}
              >
                <Ionicons name="settings-outline" size={18} color={Colors.forest} />
                <Text style={styles.dropdownText}>Settings</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <View style={styles.greeting}>
      <Image
          source={require("../../../assets/fox/fox-reading.png")}
          style={styles.foxIllustration}
          resizeMode="contain"
        />
        <Text style={styles.greetingTitle}>Good morning, Sam</Text>
        <Text style={styles.greetingSub}>
          Let's continue your reading journey.
        </Text>
                {/* Decorative Fox */}

      </View>

      {/* Daily Highlight */}
      <View style={styles.dailyHighlightContainer}>
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
            <View key={book.title} style={styles.bookCardWrapper}>
              <BookCover
                id={book.id}
                title={book.title}
                author={book.author}
                highlightCount={book.highlights}
              />
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
              <HighlightCard
                quote={h.quote}
                bookTitle={h.bookTitle}
                page={h.page}
              />
              <Text style={styles.highlightTime}>{h.timeAgo}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.s40,
    gap: Spacing.s16,
    zIndex: 50,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s12,
    gap: Spacing.s12,
  },
  searchText: {
    fontFamily: Fonts.sans,
    color: Colors.slate,
    fontSize: 14,
  },
  headerIcons: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 2,
  },
  dropdown: {
    position: "absolute",
    top: 72,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 160,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
  },
  greeting: {
    marginBottom: Spacing.s32,
  },
  greetingTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: Spacing.s8,
  },
  greetingSub: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.slate,
  },
  dailyHighlightContainer: {
    marginBottom: Spacing.s40,
    position: "relative",
    zIndex: 1,
  },
  foxIllustration: {
    position: "absolute",
    right: 0,
    width: 100,
    height: 100,
  },
  section: {
    marginBottom: Spacing.s40,
  },
  bookRow: {
    gap: Spacing.s16,
    paddingRight: Spacing.s20,
  },
  bookCardWrapper: {
    marginRight: Spacing.s16,
  },
  highlightList: {
    gap: Spacing.s16,
  },
  highlightWrapper: {
    position: 'relative',
  },
  highlightTime: {
    position: 'absolute',
    top: Spacing.s20,
    right: Spacing.s20,
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
  },
});
