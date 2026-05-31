import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../../constants/theme";

const PLACEHOLDER_BOOKS = [
  { title: "The Daily Stoic", author: "Ryan Holiday", highlights: 45 },
  { title: "Atomic Habits", author: "James Clear", highlights: 68 },
  { title: "The Midnight Library", author: "Matt Haig", highlights: 31 },
  { title: "Deep Work", author: "Cal Newport", highlights: 24 },
];

const PLACEHOLDER_HIGHLIGHTS = [
  {
    quote: '"Discipline is the bridge between goals and accomplishment."',
    bookTitle: "Atomic Habits",
    page: 45,
    timeAgo: "2h ago",
  },
  {
    quote:
      '"You do not rise to the level of your goals. You fall to the level of your systems."',
    bookTitle: "Atomic Habits",
    page: 27,
    timeAgo: "1d ago",
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header section */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.slate} />
            <Text style={styles.searchText}>
              Search your library, highlights, or tags...
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.forest}
            />

            <Image
              source={require("../../../assets/fox/fox-icon.png")}
              style={styles.avatarImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Good morning, Sam</Text>
          <Text style={styles.greetingSub}>
            Let's continue your reading journey.
          </Text>
        </View>

        {/* Daily Highlight */}
        <View style={styles.dailyHighlight}>
          <View style={styles.dailyHeader}>
            <Ionicons name="star" size={16} color={Colors.gold} />
            <Text style={styles.dailyTitle}>Daily Highlight</Text>
          </View>
          <Text style={styles.dailyQuote}>
            "The world is a book, and those who do not travel read only one
            page."
          </Text>
          <Text style={styles.dailyAuthor}>— Saint Augustine</Text>
          {/* Placeholder for fox illustration */}
          <Image
            source={require("../../../assets/fox/fox-reading.png")}
            style={styles.foxIllustration}
            resizeMode="contain"
          />
        </View>

        {/* Recent Reads */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reads</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bookRow}
          >
            {PLACEHOLDER_BOOKS.map((book) => (
              <View key={book.title} style={styles.bookCard}>
                <View style={styles.bookCover}>
                  <Text style={styles.coverTitle}>
                    {book.title.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Highlights</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
          <View style={styles.highlightList}>
            {PLACEHOLDER_HIGHLIGHTS.map((h, i) => (
              <View key={i} style={styles.highlightRow}>
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightQuote}>{h.quote}</Text>
                  <Text style={styles.highlightMeta}>
                    {h.bookTitle} • Page {h.page}
                  </Text>
                </View>
                <Text style={styles.highlightTime}>{h.timeAgo}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Platform.OS === "web" ? 40 : 20,
    paddingTop: Platform.OS === "web" ? 32 : 60, // accommodate safe area roughly
    paddingBottom: 40,
    maxWidth: 800,
    marginHorizontal: Platform.OS === "web" ? "auto" : 0,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    gap: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchText: {
    fontFamily: Fonts.sans,
    color: Colors.slate,
    fontSize: 14,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    marginBottom: 32,
  },
  greetingTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: 8,
  },
  greetingSub: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.slate,
  },
  dailyHighlight: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
    overflow: "hidden",
  },
  dailyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dailyTitle: {
    fontFamily: Fonts.sans,
    fontWeight: "600",
    fontSize: 14,
    color: Colors.forest,
  },
  dailyQuote: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.forest,
    lineHeight: 30,
    marginBottom: 16,
    maxWidth: "80%",
  },
  dailyAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
  },
foxIllustration: {
  width: 100,
  height: 100,
  alignSelf: "flex-end",
  marginRight: 16,
  marginBottom: 24,
},
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontWeight: "600",
    fontSize: 16,
    color: Colors.forest,
  },
  viewAll: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
  },
  bookRow: {
    gap: 16,
    paddingRight: 20,
  },
  bookCard: {
    width: 100,
    marginRight: 16,
  },
  bookCover: {
    width: 100,
    height: 140,
    backgroundColor: "#EBE6D8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
  },
  coverTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 12,
    color: Colors.forest,
    textAlign: "center",
    lineHeight: 16,
  },
  bookTitle: {
    fontFamily: Fonts.sans,
    fontWeight: "600",
    fontSize: 13,
    color: Colors.forest,
    marginBottom: 2,
  },
  bookAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.slate,
  },
  highlightList: {
    gap: 1, // acts as divider if wrapper has bg
  },
  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  highlightContent: {
    flex: 1,
    paddingRight: 16,
  },
  highlightQuote: {
    fontFamily: Fonts.sans,
    fontWeight: "500",
    fontSize: 15,
    color: Colors.forest,
    lineHeight: 22,
    marginBottom: 8,
  },
  highlightMeta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
  highlightTime: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
  },
  avatarImage: {
    width: 36,
    height: 36,
    marginLeft: 12,
  },
});
