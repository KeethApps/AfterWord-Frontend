import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../../constants/theme";


// ─── Types ────────────────────────────────────────────────────────────────────

export type HighlightSource =
  | "kindle"
  | "kindle_html"
  | "koreader"
  | "libby"
  | "kobo"
  | "readwise"
  | "other";


  
interface Source {
  key: HighlightSource;
  label: string;
  detail: string;
  logo: ImageSourcePropType;
}

interface SourceSelectionProps {
  onSelect: (source: HighlightSource) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SOURCES: Source[] = [
  {
    key: "kindle",
    label: "Kindle (Device)",
    detail: "My Clippings.txt",
    logo: require("../../../assets/source_logos/kindle.png"),
  },
  {
    key: "kindle_html",
    label: "Kindle (App)",
    detail: "HTML notebook export",
    logo: require("../../../assets/source_logos/kindle-app.png"),
  },
  {
    key: "koreader",
    label: "KOReader",
    detail: "My Clippings.txt",
    logo: require("../../../assets/source_logos/koreader.png"),
  },
  {
    key: "libby",
    label: "Libby",
    detail: "Reading Journey CSV export",
    logo: require("../../../assets/source_logos/libby.png"),
  },
  {
    key: "kobo",
    label: "Kobo",
    detail: "My Clippings.txt",
    logo: require("../../../assets/source_logos/kobo.png"),
  },
  {
    key: "readwise",
    label: "Readwise",
    detail: "Exported highlights.md",
    logo: require("../../../assets/source_logos/readwise.png"),
  },
  {
    key: "other",
    label: "Other",
    detail: "Choose a file",
    logo: require("../../../assets/source_logos/other.png"),
  },
];

// ─── Animated source card row ─────────────────────────────────────────────────

function SourceRow({
  source,
  index,
  onPress,
}: {
  source: Source;
  index: number;
  onPress: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 55,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 55,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.rowCard,
          pressed && styles.rowCardPressed,
        ]}
      >
        {/* Grey square icon */}
    <View style={styles.iconWrap}>
      <Image
        source={source.logo}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>

        {/* Label + detail */}
        <View style={styles.sourceInfo}>
          <Text style={styles.sourceLabel}>{source.label}</Text>
          <Text style={styles.sourceDetail}>{source.detail}</Text>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={16} color={Colors.slate} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SourceSelection({ onSelect }: SourceSelectionProps) {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Hero header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <Text style={styles.heroTitle}>Bring your highlights home.</Text>
        <Text style={styles.heroSubtitle}>
          We'll import, organize, and keep them safe.
        </Text>
      </Animated.View>

      {/* Section label — plain text, matches mockup weight */}
      <Text style={styles.sectionLabel}>Where are your highlights from?</Text>

      {/* Individual card per source */}
      <View style={styles.list}>
        {SOURCES.map((source, i) => (
          <SourceRow
            key={source.key}
            source={source}
            index={i}
            onPress={() => onSelect(source.key)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.s28 ?? 28,
  },
  heroTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.forest,
    lineHeight: 34,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.slate,
    lineHeight: 22,
  },
  // Section label matches the mockup: plain body weight, not uppercase
  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.forest,
    fontWeight: "500",
    marginBottom: Spacing.s16,
  },
  list: {
    gap: Spacing.s10 ?? 10,
  },
  // Each source is its own white rounded card
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: Spacing.s16,
    paddingVertical: 16,
    gap: Spacing.s14 ?? 14,
    // Subtle shadow for card depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rowCardPressed: {
    opacity: 0.75,
  },
  // Light grey square icon badge
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: "#F6F4EF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
  width: 26,
  height: 26,
},
  sourceInfo: {
    flex: 1,
    gap: 3,
  },
  sourceLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    color: Colors.forest,
  },
  sourceDetail: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
  },
});

// iconWrap: {
//   width: 44,
//   height: 44,
//   borderRadius: 12,
//   backgroundColor: Colors.white,
//   borderWidth: 1,
//   borderColor: "#ECE7DE",
//   alignItems: "center",
//   justifyContent: "center",
// },