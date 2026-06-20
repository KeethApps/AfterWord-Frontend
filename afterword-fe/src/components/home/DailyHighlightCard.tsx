import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Href } from "expo-router";
import { Colors, Fonts, Spacing } from "../../../constants/theme";
import { useDailyHighlight } from "@/hooks/queries/useDailyHighlight";

// ─── Background image ─────────────────────────────────────────────────────────
const CARD_BG = require("../../../assets/images/highlight-bg.avif");

export const DailyHighlightCard: React.FC = () => {
  const router = useRouter();
  const { highlight, loading, error, refresh } = useDailyHighlight();

  if (loading) {
    return (
      <View style={[styles.card, styles.cardCenter]}>
        <ActivityIndicator size="small" color="#C9A84C" />
      </View>
    );
  }

  if (error || !highlight) return null;

  async function handleShare() {
    try {
      await Share.share({
        message: `"${highlight!.highlight_text}"\n\n— ${highlight!.book.title}, ${highlight!.book.author}\n\n(powered by AfterWord)`,
      });
    } catch {}
  }

  const MAX_CHARS = 220;
  const displayText =
    highlight.highlight_text.length > MAX_CHARS
      ? highlight.highlight_text.slice(0, MAX_CHARS).trimEnd() + "…"
      : highlight.highlight_text;

  return (
    <ImageBackground
      source={CARD_BG}
      style={styles.card}
      imageStyle={styles.cardBgImage}
      resizeMode="cover"
    >
      {/* Dark scrim for legibility */}
      <View style={styles.scrim} />

      {/* Gold left accent bar — matches KnowledgeGraph card */}
      <View style={styles.accentBar} />

      {/* Watermark curly open-quote behind the text */}
      <Text style={styles.watermarkQuote} aria-hidden>{"\u201C"}</Text>

      {/* ── Main content ── */}
      <View style={styles.inner}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.eyebrow}>
            <Ionicons name="star-outline" size={11} color="#C9A84C" />
            <Text style={styles.eyebrowText}>TODAY&apos;S HIGHLIGHT</Text>
          </View>
          <Pressable
            onPress={refresh}
            hitSlop={8}
            style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.5 }]}
          >
            <Ionicons name="refresh-outline" size={15} color="rgba(255,255,255,0.45)" />
          </Pressable>
        </View>

        {/* Body: quote left, cover right */}
        <View style={styles.body}>

          {/* Quote text — sits above the watermark via zIndex */}
          <View style={styles.quoteBlock}>
            <Text style={styles.quoteText}>{displayText}</Text>
          </View>

          {/* Book cover — fixed 2:3 aspect ratio, never elongates */}
          <View style={styles.coverWrapper}>
            {highlight.book.cover_image_url ? (
              <Image
                source={{ uri: highlight.book.cover_image_url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverFallback}>
                <Text style={styles.coverFallbackTitle} numberOfLines={4}>
                  {highlight.book.title}
                </Text>
                <View style={styles.coverFallbackDivider} />
                <Text style={styles.coverFallbackAuthor} numberOfLines={2}>
                  {highlight.book.author}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {highlight.book.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {highlight.book.author}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                if (highlight?.book?.id) {
                  router.push(`/book/${highlight.book.id}` as Href);
                }
              }}
              style={({ pressed }) => [styles.viewBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.viewBtnText}>View in Library →</Text>
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.75 }]}
            >
              <Ionicons name="share-outline" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Card shell ──
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: Spacing.s24,
    minHeight: 220,
    backgroundColor: "#1A2E25",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBgImage: {
    borderRadius: 20,
  },
  cardCenter: {
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Scrim ──
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14, 28, 20, 0.75)",
  },

  // ── Gold accent bar — same spec as KnowledgeGraph ──
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#C9A84C",
    zIndex: 10,
  },

  // ── Watermark curly open-quote ──
  // Large, nearly transparent, absolutely placed so it doesn't affect layout.
  // Uses Lora Bold Italic for maximum curliness at this size.
  watermarkQuote: {
    position: "absolute",
    top: 28,
    left: 20,
    fontFamily: "Lora_700Bold_Italic",
    fontSize: 200,
    lineHeight: 200,
    color: "#C9A84C",
    opacity: 0.09,
    zIndex: 1,
    pointerEvents: "none" as any,
  },

  // ── Inner layout ──
  inner: {
    flex: 1,
    paddingVertical: Spacing.s20,
    paddingRight: Spacing.s20,
    paddingLeft: 28, // extra left padding to clear the accent bar
    gap: Spacing.s16,
    zIndex: 2, // above watermark
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  eyebrowText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "600",
    color: "#C9A84C",
    letterSpacing: 1.2,
  },
  refreshBtn: {
    padding: 2,
  },

  // ── Body ──
  body: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s16,
    flex: 1,
  },

  // ── Quote ──
  quoteBlock: {
    flex: 1,
    // paddingTop gives the text some breathing room below the watermark's
    // visual "top" so the first line lands inside the open curves
    paddingTop: 8,
  },
  quoteText: {
    // Lora Italic — AfterWord's official font, curly serifs complement the watermark
    fontFamily: Fonts.serifBold,
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.92)",
    lineHeight: 27,
  },

  // ── Book cover ──
  // aspectRatio locks the shape to a standard paperback (2:3).
  // StyleSheet.absoluteFill on the Image fills the wrapper without overflow.
  coverWrapper: {
    width: 88,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "flex-start",
    backgroundColor: "#2E5A44",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  coverFallback: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  coverFallbackTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 11,
    color: "#fff",
    textAlign: "center",
    lineHeight: 15,
  },
  coverFallbackDivider: {
    width: 20,
    height: 1,
    backgroundColor: "#C9A84C",
    opacity: 0.7,
  },
  coverFallbackAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  bookInfo: {
    flex: 1,
    gap: 2,
  },
  bookTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: "#fff",
  },
  bookAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  viewBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});