import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing, Radius } from "../../constants/theme";
import { useOnboarding } from "../../hooks/useOnboarding";

export default function FirstUploadScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();

  const handleUpload = async () => {
    // Complete onboarding first
    await completeOnboarding();
    // Navigate directly to the upload tab to complete onboarding smoothly
    router.replace("/(app)/(tabs)/upload");
  };

  const handleSkip = async () => {
    // Complete onboarding first
    await completeOnboarding();
    // Navigate to the main home tab
    router.replace("/(app)/(tabs)/");
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.s24 }]}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/crane/crane-reading.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Your library is waiting</Text>
        <Text style={styles.subtitle}>
          The best way to experience AfterWord is with your own highlights.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.previewCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={16} color={Colors.forest} />
            <Text style={styles.cardSource}>The Daily Stoic</Text>
          </View>
          <Text style={styles.cardHighlight}>
            "You have power over your mind - not outside events. Realize this, and you will find strength."
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Mindset</Text>
            </View>
          </View>
        </View>

        <View style={styles.methodsContainer}>
          <View style={styles.methodRow}>
            <Ionicons name="camera-outline" size={20} color={Colors.slate} />
            <Text style={styles.methodText}>Scan physical books</Text>
          </View>
          <View style={styles.methodRow}>
            <Ionicons name="image-outline" size={20} color={Colors.slate} />
            <Text style={styles.methodText}>Import screenshots</Text>
          </View>
          <View style={styles.methodRow}>
            <Ionicons name="logo-apple" size={20} color={Colors.slate} />
            <Text style={styles.methodText}>Sync Apple Books</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          onPress={handleUpload}
        >
          <Text style={styles.primaryBtnText}>Upload First Highlight</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.secondaryBtnPressed,
          ]}
          onPress={handleSkip}
        >
          <Text style={styles.secondaryBtnText}>I'll do it later</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.s24,
  },
  header: {
    alignItems: "center",
    marginTop: Spacing.s16,
    marginBottom: Spacing.s24,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: Spacing.s16,
  },
  title: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 26,
    color: Colors.forest,
    marginBottom: Spacing.s8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 15,
    color: Colors.slate,
    textAlign: "center",
    paddingHorizontal: Spacing.s16,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.s12,
    padding: Spacing.s20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.s24,
    transform: [{ rotate: "-2deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s6,
    marginBottom: Spacing.s12,
  },
  cardSource: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 13,
    color: Colors.forest,
  },
  cardHighlight: {
    fontFamily: Fonts?.serif ?? "serif",
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
    marginBottom: Spacing.s16,
  },
  cardFooter: {
    flexDirection: "row",
  },
  tag: {
    backgroundColor: Colors.mist,
    paddingHorizontal: Spacing.s10,
    paddingVertical: Spacing.s4,
    borderRadius: Radius.full,
  },
  tagText: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 11,
    color: Colors.slate,
  },
  methodsContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.s12,
    padding: Spacing.s20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.s16,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s12,
  },
  methodText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 15,
    color: Colors.slate,
  },
  footer: {
    width: "100%",
    gap: Spacing.s12,
  },
  primaryBtn: {
    backgroundColor: Colors.forest,
    borderRadius: Radius.s12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryBtnText: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 18,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnPressed: {
    opacity: 0.7,
  },
  secondaryBtnText: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 15,
    color: Colors.slate,
  },
});
