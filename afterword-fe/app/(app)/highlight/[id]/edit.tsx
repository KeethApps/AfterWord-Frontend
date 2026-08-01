import React, { useState, useEffect, useRef } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../../../constants/theme";
import { supabase } from "../../../../lib/supabase";

export default function EditHighlightScreen() {
  const { id: highlightId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [highlightText, setHighlightText] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [bookId, setBookId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const noteInputRef = useRef<TextInput>(null);

  // Load highlight data
  useEffect(() => {
    async function loadHighlight() {
      if (!highlightId) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("highlights")
          .select("id, highlight_text, page_number, book_id, notes(id, content)")
          .eq("id", highlightId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          Alert.alert("Error", "Highlight not found.");
          router.back();
          return;
        }

        setHighlightText(data.highlight_text);
        setBookId(data.book_id);
        if (data.page_number) {
          setPageNumber(String(data.page_number));
        }

        const noteObj = data.notes?.[0];
        if (noteObj) {
          setPersonalNote(noteObj.content);
        }
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to load highlight.");
        router.back();
      } finally {
        setLoading(false);
      }
    }

    loadHighlight();
  }, [highlightId]);

  const handleSave = async () => {
    if (!highlightText.trim()) {
      Alert.alert("Required", "Highlight text is required.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User session not found.");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-highlight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "update",
            highlight_id: highlightId,
            highlight_text: highlightText.trim(),
            personal_note: personalNote.trim() || undefined,
            page_number: pageNumber.trim() ? parseInt(pageNumber.trim(), 10) : undefined,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update highlight.");
      }

      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Highlight",
      "Are you sure you want to delete this highlight? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: performDelete,
        },
      ]
    );
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User session not found.");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-highlight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "delete",
            highlight_id: highlightId,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete highlight.");
      }

      if (bookId) {
        router.replace({ pathname: "/book/[id]", params: { id: bookId } });
      } else {
        router.back();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete highlight.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.forest} />
      </View>
    );
  }

  const isSaveDisabled = !highlightText.trim() || submitting || deleting;

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
          Edit Highlight
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
        {/* Highlight Text Area */}
        <TextInput
          style={{
            fontFamily: Fonts!.serif,
            fontStyle: "italic",
            fontSize: 20,
            color: Colors.forest,
            lineHeight: 28,
            minHeight: 180,
            textAlignVertical: "top",
            marginBottom: 24,
            padding: 0,
          }}
          placeholder="“Type or paste highlight here...”"
          placeholderTextColor={Colors.slate}
          multiline
          value={highlightText}
          onChangeText={setHighlightText}
          autoFocus
          onSubmitEditing={() => noteInputRef.current?.focus()}
        />

        <View style={{ height: 1, backgroundColor: Colors.border, marginBottom: 24 }} />

        {/* Page Number Field */}
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
            placeholder="e.g. 42 (optional)"
            placeholderTextColor={Colors.slate}
            keyboardType="number-pad"
            value={pageNumber}
            onChangeText={setPageNumber}
          />
        </View>

        {/* Note Field */}
        <View style={{ marginBottom: 32 }}>
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

        {/* Destructive Delete Button */}
        <Pressable
          onPress={handleDelete}
          disabled={deleting || submitting}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#fee2e2" : "transparent",
            borderWidth: 1,
            borderColor: Colors.danger || "#D9383A",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            marginTop: "auto",
            opacity: deleting || submitting ? 0.5 : 1,
          })}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={Colors.danger || "#D9383A"} />
          ) : (
            <Text
              style={{
                fontFamily: Fonts!.sansBold,
                fontSize: 15,
                color: Colors.danger || "#D9383A",
              }}
            >
              Delete Highlight
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
