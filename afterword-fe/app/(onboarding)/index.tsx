import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius } from "../../constants/theme";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.s24 }]}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/crane/crane-books.png")}
          style={styles.image}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to AfterWord</Text>
          <Text style={styles.subtitle}>
            Your personal library for the words worth revisiting. Save, organize, and rediscover your favorite highlights.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          onPress={() => router.push("/(onboarding)/personalization")}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 240,
    height: 240,
    marginBottom: Spacing.s40,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 28,
    color: Colors.forest,
    marginBottom: Spacing.s12,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 16,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.s16,
  },
  footer: {
    width: "100%",
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
});
