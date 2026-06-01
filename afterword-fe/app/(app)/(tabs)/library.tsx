import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  FlatList,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Fonts, Spacing } from "../../../constants/theme";

import { ScreenContainer } from "../../../src/components/ScreenContainer";
import { AppHeader } from "../../../src/components/AppHeader";
import { BookCover } from "../../../src/components/BookCover";
import { supabase } from "../../../lib/supabase";

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
 * SCREEN
 * =========================================================
 */

export default function LibraryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibrary() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id, title, author, cover_image_url, highlights:highlights(count)");

        if (error) {
          console.error("Library fetch error:", error);
        } else if (data) {
          const mapped = data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author || "Unknown",
            highlights: b.highlights?.[0]?.count || 0,
            coverColor: b.cover_image_url || "#EBE6D8",
          }));
          setBooks(mapped);
        }
      } catch (err) {
        console.error("Library error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, []);

  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("title");
  const [showDropdown, setShowDropdown] = useState(false);

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
    <ScreenContainer padded={false}>
      <AppHeader title="Library" />
      
      <View style={{ padding: Spacing.s20, flex: 1 }}>
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
                    width: webItemWidth as any,
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
      </View>
    </ScreenContainer>
  );
}

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles = StyleSheet.create({

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