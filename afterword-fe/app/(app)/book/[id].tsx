import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  ActionSheetIOS,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import { BookCover } from "../../../src/components/shared/BookCover";
import { HighlightCard } from "../../../src/components/shared/HighlightCard";
import { HighlightWithBook } from "../../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookDetail = {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  publisher?: string | null;
  publishDate?: string | null;
};

type HighlightRaw = {
  id: string;
  highlightText: string;
  location: string | null;
  pageNumber: number | null;
  createdAt: string;
  notes?: { id: string; content: string; created_at: string }[];
};

const PAGE_SIZE = 15;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [bookError, setBookError] = useState<string | null>(null);

  const [highlights, setHighlights] = useState<HighlightRaw[]>([]);
  const [totalHighlightCount, setTotalHighlightCount] = useState(0);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);

  const [showFullDescription, setShowFullDescription] = useState(false);

  // ─── Match Book State ──────────────────────────────────────────────────────
  const [isMatchModalVisible, setIsMatchModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const openMenu = () => {
    setIsMenuVisible(true);
  };

  const handleSearchOpenLibrary = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const q = encodeURIComponent(searchQuery);
      const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=10`);
      const data = await res.json();
      setSearchResults(data.docs || []);
    } catch (err) {
      Alert.alert("Search Error", "Could not fetch results from Open Library.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleMatchBook = async (doc: any) => {
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/match-book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            book_id: id,
            title: doc.title,
            author: doc.author_name?.[0],
            isbn: doc.isbn?.[0],
            cover_i: doc.cover_i,
            open_library_key: doc.key,
            publisher: doc.publisher?.[0],
            publish_date: doc.first_publish_year?.toString(),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Update failed");
      }

      const { book: updatedBook } = await res.json();
      setBook({
        id: updatedBook.id,
        title: updatedBook.title,
        author: updatedBook.author,
        isbn: updatedBook.isbn,
        coverImageUrl: updatedBook.cover_image_url,
        description: updatedBook.description,
        publisher: updatedBook.publisher,
        publishDate: updatedBook.publish_date,
      });

      setIsMatchModalVisible(false);
      Alert.alert("Success", "Book info updated successfully.");
    } catch (err: any) {
      Alert.alert("Update Error", err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // ─── Fetch Book ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    async function fetchBook() {
      setBookLoading(true);
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id, title, author, isbn, cover_image_url, description, publisher, publish_date")
          .eq("id", id)
          .single();
        if (error || !data) { setBookError("Book not found."); return; }
        setBook({
          id: data.id,
          title: data.title,
          author: data.author,
          isbn: data.isbn,
          coverImageUrl: data.cover_image_url,
          description: data.description,
          publisher: data.publisher,
          publishDate: data.publish_date,
        });
      } catch {
        setBookError("Something went wrong.");
      } finally {
        setBookLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  // ─── Fetch Highlights (paginated) ──────────────────────────────────────────

  const fetchHighlights = useCallback(async (page: number) => {
    if (!id || highlightsLoading) return;
    setHighlightsLoading(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [countRes, dataRes] = await Promise.all([
        supabase
          .from("highlights")
          .select("id", { count: "exact", head: true })
          .eq("book_id", id),
        supabase
          .from("highlights")
          .select("id, highlight_text, location, page_number, created_at, notes(id, content, created_at)")
          .eq("book_id", id)
          .order("created_at", { ascending: false })
          .range(from, to),
      ]);

      if (page === 0 && countRes.count !== null) {
        setTotalHighlightCount(countRes.count);
      }

      const mapped: HighlightRaw[] = (dataRes.data ?? []).map((h: any) => ({
        id: h.id,
        highlightText: h.highlight_text,
        location: h.location ?? null,
        pageNumber: h.page_number ?? null,
        createdAt: h.created_at,
        notes: h.notes ?? [],
      }));

      setHighlights((prev) => (page === 0 ? mapped : [...prev, ...mapped]));
      setHasMore(mapped.length === PAGE_SIZE);
    } catch (err) {
      console.error("Highlights fetch error:", err);
    } finally {
      setHighlightsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    pageRef.current = 0;
    setHighlights([]);
    setHasMore(true);
    fetchHighlights(0);
  }, [id]);

  const loadMore = useCallback(() => {
    if (!hasMore || highlightsLoading) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchHighlights(nextPage);
  }, [hasMore, highlightsLoading, fetchHighlights]);

  // ─── Loading / Error ───────────────────────────────────────────────────────

  if (bookLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.forest} />
      </View>
    );
  }

  if (bookError || !book) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: Colors.cream }}>
        <Pressable onPress={() => router.back()} style={{ position: "absolute", top: insets.top + 12, left: 16, padding: 8 }}>
          <Ionicons name="chevron-back" size={28} color={Colors.forest} />
        </Pressable>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.slate} style={{ marginBottom: 16 }} />
        <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 20, color: Colors.forest, marginBottom: 8, textAlign: "center" }}>
          Something went wrong
        </Text>
        <Text style={{ fontFamily: Fonts!.sans, fontSize: 15, color: Colors.slate, textAlign: "center" }}>
          {bookError ?? "Could not load this book."}
        </Text>
      </View>
    );
  }

  const publishYear = book.publishDate ? new Date(book.publishDate).getFullYear() : null;
  const isLongDescription = (book.description ?? "").length > 180;

  // ─── List Header (hero + stats + about) ───────────────────────────────────

  const ListHeader = (
    <View>
      {/* Top nav */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={28} color={Colors.forest} />
        </Pressable>
        <Pressable style={{ padding: 4 }} onPress={openMenu}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.forest} />
        </Pressable>
      </View>

      {/* Cover + Title */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, marginBottom: 24, gap: 16, alignItems: "flex-start" }}>
        <View style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 }}>
          <BookCover
            title={book.title}
            author={book.author}
            isbn={book.isbn}
            coverImageUrl={book.coverImageUrl}
            className="w-[120px] aspect-[2/3]"
          />
        </View>
        <View style={{ flex: 1, paddingTop: 4 }}>
          <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 22, color: Colors.forest, lineHeight: 30, marginBottom: 8 }}>
            {book.title}
          </Text>
          <Text style={{ fontFamily: Fonts!.sans, fontSize: 15, color: Colors.slate }}>
            {book.author}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={{ marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-around", marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
        <StatItem icon="bookmark-outline" value={String(totalHighlightCount)} label={totalHighlightCount === 1 ? "Highlight" : "Highlights"} />
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <StatItem icon="document-text-outline" value="0" label="Notes" />
        {publishYear && (
          <>
            <View style={{ width: 1, backgroundColor: Colors.border }} />
            <StatItem icon="calendar-outline" value={String(publishYear)} label="Published" />
          </>
        )}
      </View>

      {/* About */}
      {book.description ? (
        <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 18, color: Colors.forest, marginBottom: 10 }}>
            About the book
          </Text>
          <Text
            style={{ fontFamily: Fonts!.sans, fontSize: 15, color: Colors.slate, lineHeight: 24 }}
            numberOfLines={showFullDescription ? undefined : 4}
          >
            {book.description}
          </Text>
          {isLongDescription && (
            <Pressable onPress={() => setShowFullDescription(!showFullDescription)} style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontFamily: Fonts!.sansBold, fontSize: 14, color: Colors.forest }}>
                {showFullDescription ? "Show less" : "Show more"}
              </Text>
              <Ionicons name={showFullDescription ? "chevron-up" : "chevron-down"} size={16} color={Colors.forest} />
            </Pressable>
          )}
        </View>
      ) : null}

      {/* Divider + Section header */}
      <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 20, marginBottom: 20 }} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 18, color: Colors.forest }}>
          Your Highlights
        </Text>
        {totalHighlightCount > 0 && (
          <Text style={{ fontFamily: Fonts!.sans, fontSize: 13, color: Colors.slate }}>
            {totalHighlightCount} total
          </Text>
        )}
      </View>
    </View>
  );

  // ─── Empty state ───────────────────────────────────────────────────────────

  const EmptyHighlights = (
    <View style={{ marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: "center" }}>
      <Ionicons name="bookmark-outline" size={40} color={Colors.mist} style={{ marginBottom: 12 }} />
      <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 17, color: Colors.forest, marginBottom: 6 }}>
        No highlights yet
      </Text>
      <Text style={{ fontFamily: Fonts!.sans, fontSize: 14, color: Colors.slate, textAlign: "center" }}>
        Highlights you import from this book will appear here.
      </Text>
    </View>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      {/* ─── Options Menu Modal ─── */}
      <Modal visible={isMenuVisible} transparent={true} animationType="fade" onRequestClose={() => setIsMenuVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} onPress={() => setIsMenuVisible(false)}>
          <View style={{ position: "absolute", top: insets.top + 50, right: 16, backgroundColor: Colors.white, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, minWidth: 160, overflow: "hidden" }}>
            <Pressable
              style={({ pressed }) => ({ padding: 16, backgroundColor: pressed ? Colors.mist : Colors.white })}
              onPress={() => {
                setIsMenuVisible(false);
                setTimeout(() => setIsMatchModalVisible(true), 100);
              }}
            >
              <Text style={{ fontFamily: Fonts!.sansBold, fontSize: 15, color: Colors.forest }}>Match book info</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ─── Match Book Modal ─── */}
      <Modal visible={isMatchModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsMatchModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.cream, paddingTop: Platform.OS === "ios" ? 20 : 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 18, color: Colors.forest }}>Match Book Info</Text>
            <Pressable onPress={() => setIsMatchModalVisible(false)}>
              <Text style={{ fontFamily: Fonts!.sansBold, color: Colors.forest, fontSize: 16 }}>Cancel</Text>
            </Pressable>
          </View>
          <View style={{ padding: 16, flex: 1 }}>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <TextInput
                style={{ flex: 1, backgroundColor: Colors.white, borderRadius: 8, padding: 12, fontFamily: Fonts!.sans, fontSize: 15, borderWidth: 1, borderColor: Colors.border }}
                placeholder="Search by title, author, or ISBN..."
                placeholderTextColor={Colors.slate}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchOpenLibrary}
                returnKeyType="search"
                autoCapitalize="none"
              />
              <Pressable
                onPress={handleSearchOpenLibrary}
                style={{ backgroundColor: Colors.forest, paddingHorizontal: 16, justifyContent: "center", borderRadius: 8 }}
              >
                <Text style={{ color: Colors.white, fontFamily: Fonts!.sansBold }}>Search</Text>
              </Pressable>
            </View>
            {isSearching ? (
              <ActivityIndicator size="large" color={Colors.forest} style={{ marginTop: 24 }} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => item.key || index.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleMatchBook(item)}
                    style={{ flexDirection: "row", padding: 12, backgroundColor: Colors.white, borderRadius: 8, marginBottom: 12, opacity: isUpdating ? 0.5 : 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}
                    disabled={isUpdating}
                  >
                    {item.cover_i ? (
                      <Image
                        source={{ uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-S.jpg` }}
                        style={{ width: 40, height: 60, borderRadius: 4, backgroundColor: Colors.mist }}
                      />
                    ) : (
                      <View style={{ width: 40, height: 60, borderRadius: 4, backgroundColor: Colors.mist, justifyContent: "center", alignItems: "center" }}>
                        <Ionicons name="book" size={20} color={Colors.slate} />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
                      <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 16, color: Colors.forest }} numberOfLines={2}>{item.title}</Text>
                      <Text style={{ fontFamily: Fonts!.sans, fontSize: 14, color: Colors.slate }}>{item.author_name?.[0] ?? "Unknown Author"}</Text>
                    </View>
                  </Pressable>
                )}
                ListEmptyComponent={
                  searchQuery && !isSearching && searchResults.length === 0 ? (
                    <Text style={{ textAlign: "center", marginTop: 24, fontFamily: Fonts!.sans, color: Colors.slate }}>No results found.</Text>
                  ) : null
                }
              />
            )}
          </View>
          {isUpdating && (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.7)", justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.forest} />
              <Text style={{ marginTop: 12, fontFamily: Fonts!.sansBold, color: Colors.forest }}>Updating book...</Text>
            </View>
          )}
        </View>
      </Modal>

      <FlatList
        data={highlights}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 80) }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={highlightsLoading ? null : EmptyHighlights}
        ListFooterComponent={
          highlightsLoading ? (
            <ActivityIndicator size="small" color={Colors.forest} style={{ marginVertical: 20 }} />
          ) : !hasMore && highlights.length > 0 ? (
            <Text style={{ fontFamily: Fonts!.sans, fontSize: 13, color: Colors.slate, textAlign: "center", marginVertical: 24 }}>
              All {totalHighlightCount} highlights loaded
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const hwb: HighlightWithBook = {
            id: item.id,
            bookId: book.id,
            userId: "",
            highlightText: item.highlightText,
            pageNumber: item.pageNumber,
            location: item.location,
            createdAt: item.createdAt,
            embedding: null,
            embeddingModel: null,
            lastSurfacedAt: null,
            notes: item.notes as any,
            book: {
              id: book.id,
              userId: "",
              title: book.title,
              author: book.author,
              isbn: book.isbn ?? null,
              coverImageUrl: book.coverImageUrl ?? null,
              description: book.description ?? null,
              publisher: book.publisher ?? null,
              publishDate: book.publishDate ?? null,
              enrichmentStatus: "pending",
              createdAt: "",
              updatedAt: "",
            },
          };
          return (
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <HighlightCard highlight={hwb} />
            </View>
          );
        }}
      />
    </View>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────

function StatItem({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Ionicons name={icon} size={22} color={Colors.forest} style={{ marginBottom: 6 }} />
      <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 18, color: Colors.forest, marginBottom: 2 }}>
        {value}
      </Text>
      <Text style={{ fontFamily: Fonts!.sans, fontSize: 12, color: Colors.slate }}>
        {label}
      </Text>
    </View>
  );
}