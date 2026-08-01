import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../../constants/theme";
import { supabase } from "../../../lib/supabase";

export default function AddBookWithHighlightScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Book info
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  // Highlight info
  const [highlightText, setHighlightText] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [pageNumber, setPageNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const authorInputRef = useRef<TextInput>(null);
  const highlightInputRef = useRef<TextInput>(null);
  const noteInputRef = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Book title is required.");
      return;
    }
    if (!author.trim()) {
      Alert.alert("Required", "Author is required.");
      return;
    }
    if (!highlightText.trim()) {
      Alert.alert("Required", "Highlight text is required.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User session not found.");

      // Call manage-highlight function to create both book and highlight
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-highlight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "create",
            title: title.trim(),
            author: author.trim(),
            highlight_text: highlightText.trim(),
            personal_note: personalNote.trim() || undefined,
            page_number: pageNumber.trim() ? parseInt(pageNumber.trim(), 10) : undefined,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save.");
      }

      const createdBookId = result.book_id;

      // Start background metadata enrichment
      runBackgroundEnrichment(createdBookId, title.trim(), author.trim(), session.access_token);

      // Navigate to the newly created book page
      router.replace({ pathname: "/book/[id]", params: { id: createdBookId } });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const runBackgroundEnrichment = async (bookId: string, bookTitle: string, bookAuthor: string, token: string) => {
    try {
      const q = encodeURIComponent(`${bookTitle} ${bookAuthor}`);
      const searchRes = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1`);
      if (!searchRes.ok) return;

      const searchData = await searchRes.json();
      const doc = searchData.docs?.[0];
      if (!doc) return;

      // Call match-book Edge Function to enrich the book info
      await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/match-book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            book_id: bookId,
            title: doc.title,
            author: doc.author_name?.[0] || bookAuthor,
            isbn: doc.isbn?.[0],
            cover_i: doc.cover_i,
            open_library_key: doc.key,
            publisher: doc.publisher?.[0],
            publish_date: doc.first_publish_year?.toString(),
          }),
        }
      );
    } catch (err) {
      console.error("Background enrichment failed:", err);
    }
  };

  const isSaveDisabled = !title.trim() || !author.trim() || !highlightText.trim() || submitting;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Colors.cream }}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor: Colors.cream,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={28} color={Colors.forest} />
        </Pressable>
        <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 18, color: Colors.forest }}>
          New Book & Highlight
        </Text>
        <Pressable onPress={handleSave} disabled={isSaveDisabled} style={{ padding: 4 }}>
          {submitting ? (
            <ActivityIndicator size="small" color={Colors.forest} />
          ) : (
            <Text
              style={{
                fontFamily: Fonts!.sansBold,
                fontSize: 16,
                color: isSaveDisabled ? Colors.slate : Colors.forest,
                opacity: isSaveDisabled ? 0.4 : 1,
              }}
            >
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Book Information Section */}
        <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 18, color: Colors.forest, marginBottom: 16 }}>
          Book Information
        </Text>

        <View style={{ backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderStyle: "solid", borderWidth: 1, borderColor: Colors.border, marginBottom: 24, gap: 14 }}>
          <View>
            <Text style={{ fontFamily: Fonts!.sansBold, fontSize: 12, color: Colors.slate, textTransform: "uppercase", marginBottom: 6 }}>
              Book Title
            </Text>
            <TextInput
              style={{
                fontFamily: Fonts!.sans,
                fontSize: 15,
                color: Colors.forest,
                padding: 0,
              }}
              placeholder="e.g. Kensuke's Kingdom"
              placeholderTextColor={Colors.slate}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              onSubmitEditing={() => authorInputRef.current?.focus()}
            />
          </View>

          <View style={{ height: 1, backgroundColor: Colors.border }} />

          <View>
            <Text style={{ fontFamily: Fonts!.sansBold, fontSize: 12, color: Colors.slate, textTransform: "uppercase", marginBottom: 6 }}>
              Author
            </Text>
            <TextInput
              ref={authorInputRef}
              style={{
                fontFamily: Fonts!.sans,
                fontSize: 15,
                color: Colors.forest,
                padding: 0,
              }}
              placeholder="e.g. Michael Morpurgo"
              placeholderTextColor={Colors.slate}
              value={author}
              onChangeText={setAuthor}
              returnKeyType="next"
              onSubmitEditing={() => highlightInputRef.current?.focus()}
            />
          </View>
        </View>

        {/* Highlight Information Section */}
        <Text style={{ fontFamily: Fonts!.serifBold, fontSize: 18, color: Colors.forest, marginBottom: 16 }}>
          Highlight Information
        </Text>

        <View style={{ backgroundColor: Colors.white, borderRadius: 12, padding: 16, borderStyle: "solid", borderWidth: 1, borderColor: Colors.border, marginBottom: 24 }}>
          <Text style={{ fontFamily: Fonts!.sansBold, fontSize: 12, color: Colors.slate, textTransform: "uppercase", marginBottom: 8 }}>
            Highlight Text
          </Text>
          <TextInput
            ref={highlightInputRef}
            style={{
              fontFamily: Fonts!.serif,
              fontStyle: "italic",
              fontSize: 16,
              color: Colors.forest,
              lineHeight: 24,
              minHeight: 120,
              textAlignVertical: "top",
              padding: 0,
            }}
            placeholder="“Type or paste highlight here...”"
            placeholderTextColor={Colors.slate}
            multiline
            value={highlightText}
            onChangeText={setHighlightText}
            returnKeyType="next"
          />
        </View>

        {/* Page Number & Note Field */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 }}>
          <Text style={{ fontFamily: Fonts!.sansBold, fontSize: 14, color: Colors.forest, width: 90 }}>
            Page Number
          </Text>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: Colors.white,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              paddingVertical: 10,
              paddingHorizontal: 14,
              fontFamily: Fonts!.sans,
              fontSize: 15,
              color: Colors.forest,
            }}
            placeholder="e.g. 13 (optional)"
            placeholderTextColor={Colors.slate}
            keyboardType="number-pad"
            value={pageNumber}
            onChangeText={setPageNumber}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: Fonts!.sansBold, fontSize: 14, color: Colors.forest, marginBottom: 8 }}>
            Personal Note
          </Text>
          <TextInput
            ref={noteInputRef}
            style={{
              backgroundColor: Colors.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 14,
              fontFamily: Fonts!.sans,
              fontSize: 15,
              color: Colors.forest,
              minHeight: 100,
              textAlignVertical: "top",
            }}
            placeholder="Why did this stand out to you? (optional)"
            placeholderTextColor={Colors.slate}
            multiline
            value={personalNote}
            onChangeText={setPersonalNote}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
