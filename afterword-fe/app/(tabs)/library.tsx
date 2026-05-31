import React from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from "../../constants/theme";

const PLACEHOLDER_BOOKS = [
  { title: "The Daily Stoic", author: "Ryan Holiday", highlights: 45, color: '#EBE6D8' },
  { title: "Atomic Habits", author: "James Clear", highlights: 68, color: '#F5F1E8' },
  { title: "The Midnight Library", author: "Matt Haig", highlights: 31, color: '#1E3A34', text: '#fff' },
  { title: "Deep Work", author: "Cal Newport", highlights: 24, color: '#2E2E2E', text: '#fff' },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", highlights: 16, color: '#EBE6D8' },
  { title: "The 5 AM Club", author: "Robin Sharma", highlights: 19, color: '#D64545', text: '#fff' },
  { title: "Sapiens", author: "Yuval Noah Harari", highlights: 47, color: '#F5F1E8' },
  { title: "Man's Search for Meaning", author: "Viktor Frankl", highlights: 13, color: '#2E2E2E', text: '#fff' },
];

export default function LibraryScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Library</Text>
        
        <View style={styles.toolbar}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.slate} />
            <Text style={styles.searchText}>Search books...</Text>
          </View>
          <View style={styles.addButton}>
            <Ionicons name="add" size={16} color={Colors.white} />
            <Text style={styles.addButtonText}>Add Book</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>All Books</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.forest} />
          </View>
          <View style={styles.viewToggles}>
            <Ionicons name="grid" size={20} color={Colors.forest} />
            <Ionicons name="list" size={20} color={Colors.slate} style={{ marginLeft: 16 }} />
          </View>
        </View>

        <View style={styles.grid}>
          {PLACEHOLDER_BOOKS.map((book) => (
            <View key={book.title} style={styles.bookCard}>
              <View style={[styles.bookCover, { backgroundColor: book.color }]}>
                <Text style={[styles.coverTitle, book.text ? { color: book.text } : null]}>
                  {book.title.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
              <Text style={styles.bookMeta}>{book.highlights} highlights</Text>
            </View>
          ))}
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
    padding: Platform.OS === 'web' ? 40 : 20,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 40,
    maxWidth: 1000,
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    width: '100%',
  },
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: 24,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forest,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    color: Colors.white,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: {
    fontFamily: Fonts.sans,
    fontWeight: '500',
    color: Colors.forest,
    fontSize: 14,
  },
  viewToggles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, // compensate for card padding
  },
  bookCard: {
    width: Platform.OS === 'web' ? '25%' : '50%',
    padding: 8,
    marginBottom: 16,
  },
  bookCover: {
    aspectRatio: 2/3,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  coverTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 16,
    color: Colors.forest,
    textAlign: 'center',
    lineHeight: 22,
  },
  bookTitle: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    fontSize: 14,
    color: Colors.forest,
    marginBottom: 4,
  },
  bookAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    marginBottom: 4,
  },
  bookMeta: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
  },
});
