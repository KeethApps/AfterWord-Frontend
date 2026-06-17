import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing, Radius } from "../../constants/theme";

const { width } = Dimensions.get("window");

const TOUR_STEPS = [
  {
    title: "Your Knowledge Hub",
    description: "All your saved highlights, notes, and quotes live in one central, beautiful place.",
    icon: "library-outline",
  },
  {
    title: "Lightning Fast Search",
    description: "Find that one quote you read months ago instantly using powerful semantic search.",
    icon: "search-outline",
  },
  {
    title: "Meaningful Revisits",
    description: "We'll resurface relevant highlights just when you need them, keeping them fresh.",
    icon: "sync-outline",
  },
];

export default function TourScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/(onboarding)/first-upload");
    }
  };

  const currentStep = TOUR_STEPS[step];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.s24 }]}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/crane/crane-laptop.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={currentStep.icon as any} size={32} color={Colors.forest} />
        </View>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>

        <View style={styles.pagination}>
          {TOUR_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === step && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.primaryBtnText}>
            {step === TOUR_STEPS.length - 1 ? "Let's Go" : "Next"}
          </Text>
        </Pressable>
        {step < TOUR_STEPS.length - 1 && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.secondaryBtnPressed,
            ]}
            onPress={() => router.push("/(onboarding)/first-upload")}
          >
            <Text style={styles.secondaryBtnText}>Skip tour</Text>
          </Pressable>
        )}
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 220,
    height: 220,
  },
  content: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.s16,
    padding: Spacing.s24,
    marginBottom: Spacing.s32,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 220,
    justifyContent: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.mist,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.s16,
  },
  title: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 22,
    color: Colors.forest,
    marginBottom: Spacing.s12,
    textAlign: "center",
  },
  description: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 15,
    color: Colors.slate,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.s24,
  },
  pagination: {
    flexDirection: "row",
    gap: Spacing.s8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.mist,
  },
  dotActive: {
    backgroundColor: Colors.forest,
    width: 24,
  },
  footer: {
    width: "100%",
    gap: Spacing.s12,
    minHeight: 112,
    justifyContent: "flex-end",
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
