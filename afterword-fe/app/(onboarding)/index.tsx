/**
 * (onboarding)/index.tsx
 *
 * Two distinct layouts sharing one state machine:
 *
 *  - StackedOnboarding  → native mobile + narrow web. Swipeable, full-bleed
 *    illustration, two stacked buttons (filled + outline), dot indicators
 *    under the image. (Tasktugas reference.)
 *
 *  - SplitOnboarding    → wide web (>= WEB_BREAKPOINT). Two-column layout:
 *    a light control panel (logo, headline, dots, CTA) on one side and a
 *    dark textured hero panel (italic serif pull-quote + floating image
 *    card) on the other. No swipe gesture on desktop — index changes via
 *    buttons/dots, with a crossfade instead of a horizontal scroll.
 *    (Filianta reference.)
 *
 * No new dependencies. Works in Expo Go on iOS, Android, and web.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets, EdgeInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors, Fonts } from "../../constants/theme";
import { useOnboarding } from "../../hooks/useOnboarding";

// Below this window width, web falls back to the stacked mobile layout.
// Without this, a resized/narrow browser window would try to cram two
// columns into a phone-sized viewport and everything would clip.
const WEB_BREAKPOINT = 880;

// ─── Brand colors (with safe fallbacks if the theme file doesn't define them) ─
const FOREST = Colors.forest ?? "#1E3A34";
const FOREST_DARK = Colors.forestDark ?? "#12231F";
const CREAM = Colors.cream ?? "#F5F2EC";
const SLATE = Colors.slate ?? "#6B7B74";
const GOLD = Colors.gold ?? "#C9A227";

// ─── Slide data ────────────────────────────────────────────────────────────
type Slide = {
  id: string;
  label: string | null;
  headline: string;
  body: string;
  image: ImageSourcePropType;
  isFirst: boolean;
};

const SLIDES: Slide[] = [
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

// ─── Root component: owns state, decides which layout to render ──────────────
export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();

  const isSplitLayout = Platform.OS === "web" && width >= WEB_BREAKPOINT;

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  // Drives the crossfade on the split layout when the slide changes.
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const total = SLIDES.length;
  const isLast = index === total - 1;
  const ctaLabel = index === 0 ? "Let's begin" : isLast ? "Get started" : "Next";

  // Single entry point for moving to a slide, used by swipe, buttons, and dots.
  const goToIndex = (next: number) => {
    const clamped = Math.max(0, Math.min(next, total - 1));
    if (clamped === index) return;

    if (isSplitLayout) {
      // Desktop has no scroll surface to swipe, so we fade out, swap the
      // slide, then fade back in rather than relying on a gesture.
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
        setIndex(clamped);
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      });
    } else {
      setIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    if (page !== index) setIndex(page);
  };

  // Onboarding is "done" the moment someone leaves it, whether that's by
  // finishing the slides, skipping, or jumping straight to login — so every
  // exit path marks it complete before navigating.
  const completeAndGoTo = async (route: "sign-in" | "sign-up") => {
    await completeOnboarding();
    router.replace(`/(auth)/${route}`);
  };

  const handleNext = () => (isLast ? completeAndGoTo("sign-up") : goToIndex(index + 1));
  const handleBack = () => goToIndex(index - 1);
  // "I already have an account" only shows on the first slide and should go
  // to sign-in. Everywhere else, the secondary action reads "Skip" and
  // should land where the final CTA would have — sign-up.
  const handleSecondary = () => completeAndGoTo(index === 0 ? "sign-in" : "sign-up");

  // If the browser window is resized mid-flow, keep the active slide in
  // view instead of leaving the ScrollView offset stale at the old width.
  useEffect(() => {
    if (!isSplitLayout) {
      scrollRef.current?.scrollTo({ x: index * width, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, isSplitLayout]);

  if (isSplitLayout) {
    return (
      <SplitOnboarding
        slide={SLIDES[index]}
        index={index}
        total={total}
        fadeAnim={fadeAnim}
        ctaLabel={ctaLabel}
        onNext={handleNext}
        onBack={handleBack}
        onJump={goToIndex}
        onSecondary={handleSecondary}
      />
    );
  }

  return (
    <StackedOnboarding
      width={width}
      height={height}
      insets={insets}
      scrollRef={scrollRef}
      onScroll={onScroll}
      index={index}
      total={total}
      ctaLabel={ctaLabel}
      onNext={handleNext}
      onSecondary={handleSecondary}
    />
  );
}

// ─── Shared dot indicator ──────────────────────────────────────────────────
function PillIndicator({
  total,
  index,
  onJump,
}: {
  total: number;
  index: number;
  onJump?: (i: number) => void;
}) {
  return (
    <View style={pill.row}>
      {Array.from({ length: total }).map((_, i) => (
        <Pressable
          key={i}
          disabled={!onJump}
          onPress={onJump ? () => onJump(i) : undefined}
          style={[pill.dot, i === index && pill.dotActive]}
        />
      ))}
    </View>
  );
}

const pill = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SLATE + "33",
  },
  dotActive: {
    width: 22,
    backgroundColor: GOLD,
  },
});

// ════════════════════════════════════════════════════════════════════════════
// MOBILE / NARROW-WEB — stacked, swipeable (Tasktugas reference)
// ════════════════════════════════════════════════════════════════════════════
function StackedOnboarding({
  width,
  height,
  insets,
  scrollRef,
  onScroll,
  index,
  total,
  ctaLabel,
  onNext,
  onSecondary,
}: {
  width: number;
  height: number;
  insets: EdgeInsets;
  scrollRef: React.RefObject<ScrollView>;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  index: number;
  total: number;
  ctaLabel: string;
  onNext: () => void;
  onSecondary: () => void;
}) {
  const HEADER_H = 56;
  const BOTTOM_H = 188; // taller now: two stacked buttons + dots, not one button + text
  const slideH = height - insets.top - insets.bottom - HEADER_H - BOTTOM_H;
  const secondaryLabel = index === 0 ? "I already have an account" : "Skip";

  return (
    <View style={[stacked.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={stacked.header}>
        <Image
          source={require("../../assets/crane/crane-icon.png")}
          style={stacked.headerLogo}
          resizeMode="contain"
        />
        <Text style={stacked.headerName}>AfterWord</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={stacked.slider}
        contentContainerStyle={{ flexGrow: 0 }}
      >
        {SLIDES.map((sl) => (
          <View key={sl.id} style={[stacked.slide, { width, height: slideH }]}>
            <View style={[stacked.imageArea, !sl.isFirst && stacked.imageCard]}>
              <Image source={sl.image} style={stacked.slideImage} resizeMode="contain" />
            </View>

            <View style={stacked.copyBlock}>
              {sl.isFirst ? (
                <>
                  <Text style={[stacked.headline, stacked.headlineFirst]}>{sl.headline}</Text>
                  <View style={stacked.firstDivider} />
                  <Text style={[stacked.body, stacked.bodyCentered]}>{sl.body}</Text>
                </>
              ) : (
                <>
                  {sl.label && (
                    <View style={stacked.labelRow}>
                      <Text style={stacked.labelNum}>{sl.label.padStart(2, "0")}</Text>
                      <View style={stacked.labelLine} />
                    </View>
                  )}
                  <Text style={stacked.headline}>{sl.headline}</Text>
                  <Text style={stacked.body}>{sl.body}</Text>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={stacked.bottom}>
        <PillIndicator total={total} index={index} />

        <TouchableOpacity style={stacked.btnPrimary} onPress={onNext} activeOpacity={0.85}>
          <Text style={stacked.btnPrimaryText}>{ctaLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={stacked.btnSecondary} onPress={onSecondary} activeOpacity={0.7}>
          <Text style={stacked.btnSecondaryText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stacked = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLogo: { width: 28, height: 28 },
  headerName: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 18,
    color: FOREST,
    letterSpacing: -0.3,
  },

  slider: { flex: 1 },
  slide: { paddingHorizontal: 28, paddingTop: 8 },

  imageArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  // Feature slides (not the welcome screen) sit inside a soft card — this is
  // what gives the illustration a "premium" framed feel instead of floating
  // bare on the cream background.
  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    marginVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: FOREST,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 3 },
      web: { boxShadow: `0 10px 30px ${FOREST}14` },
    }),
  },
  slideImage: {
    width: "78%",
    maxWidth: Platform.OS === "web" ? 360 : 280,
    height: "78%",
    maxHeight: Platform.OS === "web" ? 480 : 340,
  },

  copyBlock: { paddingTop: 16, paddingBottom: 8 },

  headlineFirst: { textAlign: "center", fontSize: 44, lineHeight: 54, letterSpacing: -0.5 },
  firstDivider: {
    width: 32,
    height: 1.5,
    backgroundColor: FOREST + "40",
    alignSelf: "center",
    marginVertical: 14,
  },
  bodyCentered: { textAlign: "center" },

  labelRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  labelNum: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 11,
    letterSpacing: 2.5,
    color: GOLD,
    textTransform: "uppercase",
  },
  labelLine: { flex: 1, height: 1, backgroundColor: GOLD + "44" },
  headline: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 36,
    lineHeight: 46,
    color: FOREST,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  body: { fontFamily: Fonts?.sans ?? "sans-serif", fontSize: 15, lineHeight: 24, color: SLATE },

  bottom: { paddingHorizontal: 28, paddingTop: 16, paddingBottom: 24, gap: 14, alignItems: "center" },
  btnPrimary: {
    width: "100%",
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
  btnPrimaryText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: CREAM,
    letterSpacing: 0.2,
  },
  btnSecondary: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: FOREST + "26",
    paddingVertical: 17,
    alignItems: "center",
  },
  btnSecondaryText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 15,
    fontWeight: "500",
    color: FOREST,
  },
});

// ════════════════════════════════════════════════════════════════════════════
// WIDE WEB — two-column split (Filianta reference)
// ════════════════════════════════════════════════════════════════════════════
function SplitOnboarding({
  slide,
  index,
  total,
  fadeAnim,
  ctaLabel,
  onNext,
  onBack,
  onJump,
  onSecondary,
}: {
  slide: Slide;
  index: number;
  total: number;
  fadeAnim: Animated.Value;
  ctaLabel: string;
  onNext: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
  onSecondary: () => void;
}) {
  const heroTag = slide.label ? `Step ${slide.label} of ${total - 1}` : "Welcome";

  return (
    <View style={split.root}>
      {/* ── Left: light control panel ── */}
      <View style={split.leftPanel}>
        <View style={split.leftHeader}>
          <Image
            source={require("../../assets/crane/crane-icon.png")}
            style={split.headerLogo}
            resizeMode="contain"
          />
          <Text style={split.headerName}>AfterWord</Text>
        </View>

        <Animated.View style={[split.leftBody, { opacity: fadeAnim }]}>
          <Text style={split.stepTag}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </Text>
          <Text style={split.headline}>{slide.headline}</Text>
          <View style={split.divider} />
          <PillIndicator total={total} index={index} onJump={onJump} />
        </Animated.View>

        <View style={split.leftFooter}>
          <View style={split.ctaRow}>
            {index > 0 && (
              <TouchableOpacity
                style={split.backBtn}
                onPress={onBack}
                accessibilityLabel="Go back"
              >
                <Text style={split.backIcon}>←</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={split.nextBtn} onPress={onNext} activeOpacity={0.85}>
              <Text style={split.nextBtnText}>{ctaLabel}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onSecondary} activeOpacity={0.7}>
            <Text style={split.secondaryText}>
              {index === 0 ? "Already have an account? Log in" : "Skip for now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Right: dark hero panel ── */}
      <View style={split.rightPanel}>
        <View pointerEvents="none" style={split.glow} />

        <Text style={split.rightTag}>{heroTag}</Text>

        <Animated.View style={[split.quoteBlock, { opacity: fadeAnim }]}>
          <Text style={split.quote}>{slide.body}</Text>
        </Animated.View>

        <Animated.View style={[split.imageCard, { opacity: fadeAnim }]}>
          <Image source={slide.image} style={split.cardImage} resizeMode="contain" />
        </Animated.View>
      </View>
    </View>
  );
}

const split = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },

  // ── Left panel ──
  leftPanel: {
    flex: 0.46,
    backgroundColor: CREAM,
    paddingHorizontal: 64,
    paddingVertical: 56,
    justifyContent: "space-between",
  },
  leftHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogo: { width: 28, height: 28 },
  headerName: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 18,
    color: FOREST,
    letterSpacing: -0.3,
  },

  leftBody: { maxWidth: 420 },
  stepTag: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 13,
    letterSpacing: 3,
    color: GOLD,
    textTransform: "uppercase",
    marginBottom: 18,
  },
  headline: {
    fontFamily: Fonts?.serifBold ?? "serif",
    fontSize: 48,
    lineHeight: 56,
    color: FOREST,
    letterSpacing: -0.5,
  },
  divider: { width: 48, height: 2, backgroundColor: GOLD, marginVertical: 28 },

  leftFooter: { gap: 16 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: FOREST + "26",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 18, color: FOREST },
  nextBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: FOREST,
    ...Platform.select({
      web: { backgroundImage: `linear-gradient(135deg, ${FOREST} 0%, ${FOREST_DARK} 100%)` },
    }),
  },
  nextBtnText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: CREAM,
    letterSpacing: 0.2,
  },
  secondaryText: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 14,
    color: SLATE,
    textAlign: "center",
  },

  // ── Right panel ──
  rightPanel: {
    flex: 0.54,
    backgroundColor: FOREST,
    ...Platform.select({
      web: { backgroundImage: `linear-gradient(160deg, ${FOREST} 0%, ${FOREST_DARK} 100%)` },
    }),
    paddingHorizontal: 64,
    paddingVertical: 56,
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
  },
  // Soft radial highlight, purely decorative — gives the flat gradient some
  // depth without needing an image asset or expo-linear-gradient.
  glow: {
    position: "absolute",
    top: -140,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: GOLD + "14",
  },
  rightTag: {
    fontFamily: Fonts?.sans ?? "sans-serif",
    fontSize: 13,
    letterSpacing: 3,
    color: CREAM + "80",
    textTransform: "uppercase",
  },
  quoteBlock: { maxWidth: 480 },
  quote: {
    fontFamily: Fonts?.serif ?? Fonts?.serifBold ?? "serif",
    fontStyle: "italic",
    fontSize: 34,
    lineHeight: 46,
    color: CREAM,
    letterSpacing: -0.2,
  },
  imageCard: {
    alignSelf: "flex-end",
    width: 260,
    height: 260,
    borderRadius: 28,
    backgroundColor: CREAM,
    padding: 20,
    transform: [{ rotate: "-3deg" }],
    ...Platform.select({
      web: { boxShadow: `0 24px 48px ${FOREST_DARK}55` },
      default: { elevation: 8 },
    }),
  },
  cardImage: { width: "100%", height: "100%" },
});