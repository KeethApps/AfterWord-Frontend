import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { BookCover } from "../../../src/components/BookCover";

const PLACEHOLDER_BOOKS = [
  { id: "1", title: "The Daily Stoic", author: "Ryan Holiday", highlights: 45, color: '#EBE6D8' },
  { id: "2", title: "Atomic Habits", author: "James Clear", highlights: 68, color: '#F5F1E8' },
  { id: "3", title: "The Midnight Library", author: "Matt Haig", highlights: 31, color: '#1E3A34' },
  { id: "4", title: "Deep Work", author: "Cal Newport", highlights: 24, color: '#2E2E2E' },
  { id: "5", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", highlights: 16, color: '#EBE6D8' },
  { id: "6", title: "The 5 AM Club", author: "Robin Sharma", highlights: 19, color: '#D64545' },
  { id: "7", title: "Sapiens", author: "Yuval Noah Harari", highlights: 47, color: '#F5F1E8' },
  { id: "8", title: "Man's Search for Meaning", author: "Viktor Frankl", highlights: 13, color: '#2E2E2E' },
];

export default function LibraryScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.pageTitle}>Library</Text>
      
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.slate} />
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
          <View key={book.title} style={styles.gridItem}>
            <BookCover 
              id={book.id}
              title={book.title}
              author={book.author}
              highlightCount={book.highlights}
              coverColor={book.color}
              fullWidth={true}
            />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: Spacing.s24,
  },
  toolbar: {
    flexDirection: 'row',
    gap: Spacing.s16,
    marginBottom: Spacing.s24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forest,
    paddingHorizontal: Spacing.s16,
    borderRadius: 8,
    gap: Spacing.s8,
  },
  addButtonText: {
    fontFamily: Fonts.sansBold,
    color: Colors.white,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s24,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s8,
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
  gridItem: {
    width: Platform.OS === 'web' ? '25%' : '50%',
    padding: 8,
    marginBottom: Spacing.s16,
  },
});
