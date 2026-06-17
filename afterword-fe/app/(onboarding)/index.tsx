/**
 * (onboarding)/index.tsx
 *
 * Pure ScrollView-based onboarding — no library dependencies.
 * Works across iOS, Android, and web in an Expo Go monorepo.
 * Add images to assets/onboarding/ and swap the placeholder Views.
 */
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors, Fonts, Spacing } from "../../constants/theme";
import { useOnboarding } from "../../hooks/useOnboarding";

const { width: W } = Dimensions.get("window");

const SLIDES = [
  {
    id: "welcome",
    label: null,
    headline: "AfterWord",
    body: "A home for your best ideas\nfrom every book.",
    image: require("../../assets/onboarding/crane-standing.png"),
    isFirst: true,
  },
  {
    id: "capture",
    label: "1",
    headline: "Capture",
    body: "Save highlights, notes, and reflections from the books that move you.",
    // image: require("../../assets/onboarding/crane-flying.png"),
    image: null,
    isFirst: false,
  },
  {
    id: "revisit",
    label: "2",
    headline: "Revisit",
    body: "Find meaningful ideas whenever you need them most.",
    // image: require("../../assets/onboarding/crane-drinking.png"),
    image: null,
    isFirst: false,
  },
];

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const { completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / W);
    setIndex(page);
  };

  const goNext = () => {
    const next = Math.min(index + 1, SLIDES.length - 1);
    scrollRef.current?.scrollTo({ x: next * W, animated: true });
    setIndex(next);
  };

  const finish = async () => {
    await completeOnboarding();
    router.replace("/(auth)/sign-in");
  };

  const handleCta = () => {
    if (index < SLIDES.length - 1) {
      goNext();
    } else {
      finish();
    }
  };

  const isLast = index === SLIDES.length - 1;
  const ctaLabel = index === 0 ? "Let's begin" : isLast ? "Continue" : "Next";

  return (
    <View style={[s.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* ── Slides ── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={s.slider}
        contentContainerStyle={{ flexGrow: 0 }}
      >
{SLIDES.map((slide) => (
  <View key={slide.id} style={s.slide}>
    {slide.isFirst ? (
      // ── First slide: centered layout with floating logo ──
      <View style={s.firstSlideInner}>
        {/* Image area sits behind/above text, top-right anchored */}
        <View style={s.firstImageWrap}>
          {slide.image && (
            <Image
              source={slide.image}
              style={s.firstImage}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Centered text block */}
        <View style={s.firstTextBlock}>
          <Text style={s.headlineFirst}>{slide.headline}</Text>
          <View style={s.firstDivider} />
          <Text style={s.body}>{slide.body}</Text>
        </View>
      </View>
    ) : (
      // ── Slides 2 & 3: unchanged layout ──
      <>
        {slide.label && (
          <View style={s.labelRow}>
            <Text style={s.labelNum}>{slide.label}</Text>
            <View style={s.labelLine} />
          </View>
        )}
        <Text style={[s.headline]}>{slide.headline}</Text>
        <Text style={s.body}>{slide.body}</Text>
        <View style={s.imageArea}>
          {slide.image ? (
            <Image source={slide.image} style={s.image} resizeMode="contain" />
          ) : (
            <View style={s.imagePlaceholder}>
              <Text style={s.placeholderText}>
                assets/onboarding/{"\n"}{slide.id}.png
              </Text>
            </View>
          )}
        </View>
      </>
    )}
  </View>
))}
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={s.bottom}>
        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === index && s.dotActive]} />
          ))}
        </View>

        {/* Primary CTA */}
        <TouchableOpacity style={s.btn} onPress={handleCta} activeOpacity={0.85}>
          <Text style={s.btnText}>{ctaLabel}</Text>
        </TouchableOpacity>

        {/* Secondary link */}
        <TouchableOpacity onPress={finish} style={s.secondaryBtn}>
          <Text style={s.secondaryText}>
            {index === 0 ? "Already have an account? Log in" : "Create account or log in"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FOREST = Colors.forest ?? "#1E3A34";
const CREAM  = Colors.cream  ?? "#F5F2EC";
const SLATE  = Colors.slate  ?? "#6B7B74";

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },

  // Slider takes all remaining space between top and bottom bar
  slider: {
    flex: 1,
  },

  slide: {
    width: W,
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  // Add to StyleSheet.create({ ... })

firstSlideInner: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},

// Logo floats top-right relative to the centered text block
firstImageWrap: {
  position: "absolute",
  top: -8,         // sits just above the text block's top edge
  right: -8,       // flush to the right of the text block
  width: 72,
  height: 72,
  zIndex: 2,
},
firstImage: {
  width: "100%",
  height: "100%",
},

firstTextBlock: {
  width: "100%",
  paddingHorizontal: 4,
},
firstDivider: {
  width: 32,
  height: 1.5,
  backgroundColor: FOREST + "40",
  marginVertical: 16,
},

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  labelNum: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 13,
    color: SLATE,
  },
  labelLine: {
    flex: 1,
    height: 1,
    backgroundColor: SLATE + "44",
  },

  headline: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 40,
    lineHeight: 50,
    color: FOREST,
    marginBottom: 12,
  },
  headlineFirst: {
    fontSize: 52,
    lineHeight: 62,
  },
  body: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 16,
    lineHeight: 26,
    color: SLATE,
  },

  // Image fills remaining space in the slide naturally
  imageArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "80%",
    aspectRatio: 0.9,
    maxHeight: 280,
    borderRadius: 16,
    backgroundColor: FOREST + "0C",
    borderWidth: 1,
    borderColor: FOREST + "18",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 12,
    color: SLATE + "99",
    textAlign: "center",
    lineHeight: 20,
  },

  // Bottom bar is part of the normal flow — no absolute positioning
  bottom: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: FOREST + "28",
  },
  dotActive: {
    width: 22,
    backgroundColor: FOREST,
  },
  btn: {
    backgroundColor: FOREST,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  btnText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: CREAM,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  secondaryText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 13,
    color: SLATE,
  },
});