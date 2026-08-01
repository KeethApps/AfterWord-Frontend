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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../../../constants/theme";
import { supabase } from "../../../../lib/supabase";

export default function AddHighlightScreen() {
  const { id: bookId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [highlightText, setHighlightText] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const noteInputRef = useRef<TextInput>(null);

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
            action: "create",
            book_id: bookId,
            highlight_text: highlightText.trim(),
            personal_note: personalNote.trim() || undefined,
            page_number: pageNumber.trim() ? parseInt(pageNumber.trim(), 10) : undefined,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to add highlight.");
      }

      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const isSaveDisabled = !highlightText.trim() || submitting;

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
          Add Highlight
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
