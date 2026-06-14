import React, { useState } from "react";
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, Spacing, Radius } from "../../constants/theme";

const CONTENT_TYPES = ["Books", "Articles", "Podcasts", "Newsletters", "Tweets", "Notes"];
const GOALS = ["Learn new things", "Organize thoughts", "Share with others", "Remember better"];

export default function PersonalizationScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.s24 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/crane/crane-question.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>What do you save?</Text>
          <Text style={styles.subtitle}>Help us personalize your AfterWord experience.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I mostly save highlights from...</Text>
          <View style={styles.chipContainer}>
            {CONTENT_TYPES.map(type => {
              const isSelected = selectedTypes.includes(type);
              return (
                <Pressable
                  key={type}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleType(type)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My main goal is to...</Text>
          <View style={styles.chipContainer}>
            {GOALS.map(goal => {
              const isSelected = selectedGoal === goal;
              return (
                <Pressable
                  key={goal}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedGoal(goal)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {goal}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          onPress={() => router.push("/(onboarding)/tour")}
        >
          <Text style={styles.primaryBtnText}>Continue</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.secondaryBtnPressed,
          ]}
          onPress={() => router.push("/(onboarding)/tour")}
        >
          <Text style={styles.secondaryBtnText}>Skip for now</Text>
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
  scroll: {
    flexGrow: 1,
    paddingTop: Spacing.s12,
    paddingBottom: Spacing.s32,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.s32,
  },
  image: {
    width: 140,
    height: 140,
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
  },
  section: {
    marginBottom: Spacing.s32,
  },
  sectionTitle: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 16,
    color: Colors.black,
    marginBottom: Spacing.s16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.s10,
  },
  chip: {
    paddingHorizontal: Spacing.s16,
    paddingVertical: Spacing.s10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipSelected: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  chipText: {
    fontFamily: Fonts?.sansBold ?? "sans-serif",
    fontSize: 14,
    color: Colors.slate,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  footer: {
    paddingTop: Spacing.s16,
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
