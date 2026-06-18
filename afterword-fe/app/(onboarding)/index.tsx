/**
 * (onboarding)/index.tsx
 *
 * Redesigned onboarding — logo fixed at top, large image area fills the
 * middle, copy + CTA anchored to the bottom. Matches the Tasktugas-style
 * layout. No library dependencies; works on iOS, Android, and web in Expo Go.
 */
import React, { useRef, useState } from "react";
import {
  Animated,
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

const { width: W, height: H } = Dimensions.get("window");

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "welcome",
    label: null,
    headline: "AfterWord",
    body: "A home for your best ideas\nfrom every book.",
    image: require("../../assets/crane/crane-icon.png"),
    isFirst: true,
  },
  {
    id: "capture",
    label: "1",
    headline: "Capture",
    body: "Save highlights, notes, and reflections from the books that move you.",
    image: require("../../assets/onboarding/capture.png"),
    isFirst: false,
  },
  {
    id: "revisit",
    label: "2",
    headline: "Revisit",
    body: "Find meaningful ideas whenever you need them most.",
    image: require("../../assets/onboarding/revisit.png"),
    isFirst: false,
  },
  {
    id: "grow",
    label: "3",
    headline: "Grow",
    body: "Connect ideas across books and watch your knowledge map expand.",
    image: require("../../assets/onboarding/grow.png"),
    isFirst: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const scrollRef    = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();

  const advanceProgress = (toIndex: number) => {
    Animated.spring(progressAnim, {
      toValue: toIndex / (SLIDES.length - 1),
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / W);
    if (page !== index) {
      setIndex(page);
      advanceProgress(page);
    }
  };

  const goNext = () => {
    const next = Math.min(index + 1, SLIDES.length - 1);
    scrollRef.current?.scrollTo({ x: next * W, animated: true });
    setIndex(next);
    advanceProgress(next);
  };

  const finish = async () => {
    await completeOnboarding();
    router.replace("/(auth)/sign-in");
  };

  const handleCta = () => {
    if (index < SLIDES.length - 1) goNext();
    else finish();
  };

  const isLast   = index === SLIDES.length - 1;
  const ctaLabel = index === 0 ? "Let's begin" : isLast ? "Continue" : "Next";

  const progressWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Explicit slide height so children can size correctly inside a horizontal ScrollView.
  // Header ~52px + bottom bar ~130px + gaps consumed by insets.
  const HEADER_H = 52;
  const BOTTOM_H = 130;
  const slideH = H - insets.top - insets.bottom - HEADER_H - BOTTOM_H;

  return (
    <View style={[s.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* ── Persistent logo header ── */}
      <View style={s.header}>
        <Image
          source={require("../../assets/crane/crane-icon.png")}
          style={s.headerLogo}
          resizeMode="contain"
        />
        <Text style={s.headerName}>AfterWord</Text>
      </View>

      {/* ── Skip link (slides 2-4) ── */}
      {index > 0 && (
        <TouchableOpacity
          style={s.skipBtn}
          onPress={finish}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

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
        {SLIDES.map((sl) => (
          <View key={sl.id} style={[s.slide, { height: slideH }]}>
            {/* ── Large image area ── */}
            <View style={s.imageArea}>
              <Image
                source={sl.image}
                style={s.slideImage}
                resizeMode="contain"
              />
            </View>

            {/* ── Copy block ── */}
            <View style={s.copyBlock}>
              {sl.isFirst ? (
                // Welcome slide: centred large headline + divider
                <>
                  <Text style={[s.headline, s.headlineFirst]}>{sl.headline}</Text>
                  <View style={s.firstDivider} />
                  <Text style={[s.body, s.bodyCentered]}>{sl.body}</Text>
                </>
              ) : (
                // Feature slides: numbered label row + left-aligned copy
                <>
                  {sl.label && (
                    <View style={s.labelRow}>
                      <Text style={s.labelNum}>{sl.label}</Text>
                      <View style={s.labelLine} />
                    </View>
                  )}
                  <Text style={s.headline}>{sl.headline}</Text>
                  <Text style={s.body}>{sl.body}</Text>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View style={s.bottom}>
        {/* Animated progress bar */}
        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: progressWidth }]} />
        </View>

        <TouchableOpacity style={s.btn} onPress={handleCta} activeOpacity={0.85}>
          <Text style={s.btnText}>{ctaLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={finish} style={s.secondaryBtn}>
          <Text style={s.secondaryText}>
            {index === 0 ? "Already have an account? Log in" : "Create account or log in"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const FOREST = Colors.forest ?? "#1E3A34";
const CREAM  = Colors.cream  ?? "#F5F2EC";
const SLATE  = Colors.slate  ?? "#6B7B74";
const GOLD   = Colors.gold   ?? "#C9A227";

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },

  // ── Persistent logo header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerName: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 18,
    color: FOREST,
    letterSpacing: -0.3,
  },

  // ── Skip ──
  skipBtn: {
    position: "absolute",
    top: 16,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 14,
    color: SLATE,
    letterSpacing: 0.1,
  },

  // ── Slider ──
  slider: {
    flex: 1,
  },
  slide: {
    width: W,
    // height is set inline via slideH — no flex:1 here, it doesn't work
    // inside a horizontal ScrollView
    paddingHorizontal: 28,
    paddingTop: 8,
  },

  // ── Image area: fills most of the slide ──
  imageArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slideImage: {
    width: "100%",
    maxWidth: Platform.OS === "web" ? 420 : 320,
    height: "100%",
    maxHeight: Platform.OS === "web" ? 560 : 400,
  },

  // ── Copy block: just below the image ──
  copyBlock: {
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Slide 1 extras
  headlineFirst: {
    textAlign: "center",
    fontSize: 44,
    lineHeight: 54,
    letterSpacing: -0.5,
  },
  firstDivider: {
    width: 32,
    height: 1.5,
    backgroundColor: FOREST + "40",
    alignSelf: "center",
    marginVertical: 14,
  },
  bodyCentered: {
    textAlign: "center",
  },

  // Feature slides
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  labelNum: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 11,
    letterSpacing: 2.5,
    color: GOLD,
    textTransform: "uppercase",
  },
  labelLine: {
    flex: 1,
    height: 1,
    backgroundColor: GOLD + "44",
  },
  headline: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 36,
    lineHeight: 46,
    color: FOREST,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 15,
    lineHeight: 24,
    color: SLATE,
  },

  // ── Bottom bar ──
  bottom: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
  },
  progressTrack: {
    height: 2,
    backgroundColor: FOREST + "18",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  btn: {
    backgroundColor: FOREST,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: FOREST,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: `0 6px 16px ${FOREST}22` },
    }),
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