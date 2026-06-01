import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  FlatList,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { BookCover } from "../../../src/components/BookCover";

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type Book = {
  id: string;
  title: string;
  author: string;
  highlights: number;
  coverColor: string;
};

type SortMode = "title" | "author";
type ViewMode = "grid" | "list";

/**
 * =========================================================
 * MOCK DATA
 * =========================================================
 */

const PLACEHOLDER_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Daily Stoic",
    author: "Ryan Holiday",
    highlights: 45,
    coverColor: "#EBE6D8",
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    highlights: 68,
    coverColor: "#F5F1E8",
  },
  {
    id: "3",
    title: "The Midnight Library",
    author: "Matt Haig",
    highlights: 31,
    coverColor: "#1E3A34",
  },
  {
    id: "4",
    title: "Deep Work",
    author: "Cal Newport",
    highlights: 24,
    coverColor: "#2E2E2E",
  },
  {
    id: "5",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    highlights: 16,
    coverColor: "#EBE6D8",
  },
  {
    id: "6",
    title: "The 5 AM Club",
    author: "Robin Sharma",
    highlights: 19,
    coverColor: "#D64545",
  },
  {
    id: "7",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    highlights: 47,
    coverColor: "#F5F1E8",
  },
  {
    id: "8",
    title: "Man's Search for Meaning",
    author: "Viktor Frankl",
    highlights: 13,
    coverColor: "#2E2E2E",
  },
];

/**
 * =========================================================
 * SCREEN
 * =========================================================
 */

export default function LibraryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [books] = useState<Book[]>(PLACEHOLDER_BOOKS);

  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");

  const [sortMode, setSortMode] =
    useState<SortMode>("title");

  const [showDropdown, setShowDropdown] =
    useState(false);

  /**
   * =========================================================
   * RESPONSIVE WEB GRID
   * =========================================================
   */

  const webColumns =
    width > 1600
      ? 7
      : width > 1300
      ? 6
      : width > 1000
      ? 5
      : width > 700
      ? 4
      : 3;

  const webItemWidth = `${100 / webColumns}%`;

  /**
   * =========================================================
   * FILTER + SORT
   * =========================================================
   */

  const filteredBooks = useMemo(() => {
    const filtered = books.filter((book) => {
      const search = query.toLowerCase();

      return (
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search)
      );
    });

    filtered.sort((a, b) => {
      if (sortMode === "title") {
        return a.title.localeCompare(b.title);
      }

      return a.author.localeCompare(b.author);
    });

    return filtered;
  }, [books, query, sortMode]);

  /**
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const handleOpenBook = useCallback(
    (bookId: string) => {
      router.push(`/book/${bookId}`);
    },
    [router]
  );

  /**
   * =========================================================
   * RENDERERS
   * =========================================================
   */

  const renderGridItem = ({
    item,
  }: {
    item: Book;
  }) => (
    <View style={styles.gridItem}>
      <BookCover
        id={item.id}
        title={item.title}
        author={item.author}
        highlightCount={item.highlights}
        coverColor={item.coverColor}
        fullWidth
      />
    </View>
  );

  const renderListItem = ({
    item,
  }: {
    item: Book;
  }) => (
    <Pressable
      onPress={() => handleOpenBook(item.id)}
      style={({ pressed }) => [
        styles.listCard,
        pressed && styles.pressed,
      ]}
    >
      {/* <View style={styles.listCover}>
        <BookCover
          id={item.id}
          title={item.title}
          author={item.author}
          highlightCount={item.highlights}
          coverColor={item.coverColor}
        />
      </View> */}

      <View style={styles.listMeta}>
        <Text style={styles.listTitle}>
          {item.title}
        </Text>

        <Text style={styles.listAuthor}>
          {item.author}
        </Text>

        <Text style={styles.highlightText}>
          {item.highlights} highlights
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.slate}
      />
    </Pressable>
  );

  /**
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <ScreenContainer>
      <Text style={styles.pageTitle}>Library</Text>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color={Colors.slate}
          />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search books..."
            placeholderTextColor={Colors.slate}
            style={styles.searchInput}
          />
        </View>

        <Pressable style={styles.addButton}>
          <Ionicons
            name="add"
            size={16}
            color={Colors.white}
          />

          <Text style={styles.addButtonText}>
            Add Book
          </Text>
        </Pressable>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <View style={{ position: "relative" }}>
          <Pressable
            style={styles.dropdown}
            onPress={() =>
              setShowDropdown(!showDropdown)
            }
          >
            <Text style={styles.dropdownText}>
              Sort by{" "}
              {sortMode === "title"
                ? "Title"
                : "Author"}
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.forest}
            />
          </Pressable>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <Pressable
                style={styles.dropdownItem}
                onPress={() => {
                  setSortMode("title");
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  Title
                </Text>
              </Pressable>

              <Pressable
                style={styles.dropdownItem}
                onPress={() => {
                  setSortMode("author");
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  Author
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.viewToggles}>
          <Pressable
            onPress={() => setViewMode("grid")}
          >
            <Ionicons
              name="grid"
              size={20}
              color={
                viewMode === "grid"
                  ? Colors.forest
                  : Colors.slate
              }
            />
          </Pressable>

          <Pressable
            onPress={() => setViewMode("list")}
            style={{ marginLeft: 16 }}
          >
            <Ionicons
              name="list"
              size={20}
              color={
                viewMode === "list"
                  ? Colors.forest
                  : Colors.slate
              }
            />
          </Pressable>
        </View>
      </View>

      {/* WEB GRID */}
      {viewMode === "grid" &&
      Platform.OS === "web" ? (
        <View style={styles.webGrid}>
          {filteredBooks.map((item) => (
            <View
              key={item.id}
              style={[
                styles.webGridItem,
                {
                  width: webItemWidth,
                },
              ]}
            >
              <BookCover
                id={item.id}
                title={item.title}
                author={item.author}
                highlightCount={
                  item.highlights
                }
                coverColor={item.coverColor}
                fullWidth
              />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          scrollEnabled={false}
          nestedScrollEnabled
          key={viewMode}
          keyExtractor={(item) => item.id}
          renderItem={
            viewMode === "grid"
              ? renderGridItem
              : renderListItem
          }
          numColumns={
            viewMode === "grid" ? 2 : 1
          }
          columnWrapperStyle={
            viewMode === "grid"
              ? styles.gridRow
              : undefined
          }
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        />
      )}
    </ScreenContainer>
  );
}

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles = StyleSheet.create({
  pageTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.forest,
    marginBottom: Spacing.s24,
  },

  toolbar: {
    flexDirection: "row",
    gap: Spacing.s16,
    marginBottom: Spacing.s24,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s12,
    gap: Spacing.s12,
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.forest,
    paddingHorizontal: Spacing.s16,
    borderRadius: 12,
    gap: Spacing.s8,
  },

  addButtonText: {
    fontFamily: Fonts.sansBold,
    color: Colors.white,
    fontSize: 14,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.s24,
    zIndex: 100,
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  dropdownText: {
    fontFamily: Fonts.sans,
    color: Colors.forest,
    fontSize: 14,
  },

  dropdownMenu: {
    position: "absolute",
    top: 52,
    left: 0,
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    zIndex: 999,
  },

  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  dropdownItemText: {
    fontFamily: Fonts.sans,
    color: Colors.forest,
    fontSize: 14,
  },

  viewToggles: {
    flexDirection: "row",
    alignItems: "center",
  },

  /**
   * MOBILE GRID
   */

  gridRow: {
    justifyContent: "space-between",
  },

  gridItem: {
    width: "48%",
    marginBottom: Spacing.s16,
  },

  /**
   * WEB GRID
   */

  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -10,
  },

  webGridItem: {
    paddingHorizontal: 10,
    marginBottom: 28,
  },

  /**
   * LIST VIEW
   */

  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: Spacing.s16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  pressed: {
    opacity: 0.75,
  },

  listCover: {
    width: 72,
    marginRight: 16,
  },

  listMeta: {
    flex: 1,
  },

  listTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.forest,
    marginBottom: 4,
  },

  listAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.slate,
    marginBottom: 8,
  },

  highlightText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.forest,
  },
});