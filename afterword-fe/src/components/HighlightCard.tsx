import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { Colors, Fonts, Spacing } from "../../constants/theme";

interface HighlightCardProps {
  quote: string;
  bookTitle: string;
  author?: string;
  page?: number;
  onPress?: () => void;
  isFavorite?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  featured?: boolean;
  score?: number;
}

const afterwordLogo = require("../../assets/logo/afterword-watermark.png");
const foxReading = require("../../assets/fox/fox-reading.png");

export function HighlightCard({
  quote,
  bookTitle,
  author,
  page,
  onPress,
  isFavorite = false,
  onFavorite,
  onShare,
}: HighlightCardProps) {
  const shareCardRef = useRef<any>(null);

  async function handleShare() {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        console.warn("Sharing is unavailable on this platform");
        return;
      }

      const uri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Highlight",
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  }

  return (
    <>
      {/* ── In-app card ── */}
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.bookRow}>
            <Ionicons name="book-outline" size={14} color={Colors.slate} />
            <Text style={styles.bookTitle} numberOfLines={1}>
              {bookTitle} - {author}
            </Text>
          </View>
        </View>

        <Text style={styles.quote}>"{quote}"</Text>

        <View style={styles.footer}>
          <View style={styles.meta}>
            {author && <Text style={styles.author}>{author}</Text>}
            {page && <Text style={styles.page}>Page {page}</Text>}
          </View>
          <View style={styles.actions}>
            <Pressable 
              onPress={() => {
                if (onFavorite) onFavorite();
              }} 
              hitSlop={10}
              style={styles.actionBtn}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={18} 
                color={isFavorite ? Colors.danger : Colors.slate} 
              />
            </Pressable>
            <Pressable 
              onPress={() => {
                if (onShare) {
                  onShare();
                } else {
                  handleShare();
                }
              }} 
              hitSlop={10}
              style={styles.actionBtn}
            >
              <Ionicons name="share-outline" size={18} color={Colors.slate} />
            </Pressable>
          </View>
        </View>
      </Pressable>

      {/* ── Off-screen share card (1080×1350) ── */}
      <View style={styles.hiddenContainer}>
        <ViewShot
          ref={shareCardRef}
          options={{ format: "png", quality: 1 }}
          style={styles.shareCard as any}
          {...{ collapsable: false } as any}
        >
          {/* Top accent bar */}
          <View style={styles.shareTopBar} />

          {/* Branding strip */}
          <View style={styles.shareBrandingRow}>
            <Image
              source={afterwordLogo}
              style={styles.shareLogoTop}
              resizeMode="contain"
            />
          </View>

          {/* Quote zone */}
          <View style={styles.shareQuoteZone}>
            {/* Decorative large opening mark */}
            <Text style={styles.shareDecorativeMark}>"</Text>

            <Text style={styles.shareQuoteText}>{quote}</Text>
            <Text style={styles.shareClosingMark}>"</Text>
          </View>

          {/* Book info panel */}
          <View style={styles.shareInfoPanel}>
            {/* Fox illustration — overlaps upward out of panel */}
            <Image
              source={foxReading}
              style={styles.shareFox}
              resizeMode="contain"
            />

            {/* Text block */}
            <View style={styles.shareInfoText}>
              <Text style={styles.shareBookTitle} numberOfLines={2}>
                {bookTitle}
              </Text>
              {author && (
                <Text style={styles.shareAuthorName}>— {author}</Text>
              )}
              {page && (
                <Text style={styles.sharePageNumber}>p. {page}</Text>
              )}
            </View>
          </View>
        </ViewShot>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // ── In-app card ──────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.s16,
    gap: Spacing.s16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    paddingRight: 12,
  },
  bookTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    fontWeight: "600",
    flexShrink: 1,
  },
  quote: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 30,
    color: Colors.forest,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: { gap: 4 },
  author: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.slate },
  page: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.slate,
    opacity: 0.7,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },

  // ── Share card ───────────────────────────────────────────────
  hiddenContainer: { position: "absolute", left: -9999, top: -9999 },

  shareCard: {
    width: 1080,
    height: 1350,
    backgroundColor: Colors.cream,
    overflow: "hidden",
  },

  // Thin forest-green accent line at very top
  shareTopBar: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.forest,
  },

  // Logo row just below the bar
  shareBrandingRow: {
    paddingHorizontal: 80,
    paddingTop: 48,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  shareLogoTop: {
    width: 220,
    height: 200,
    opacity: 0.75,
  },

  // Large quote area — takes up the middle ~55% of the card
  shareQuoteZone: {
    flex: 1,
    paddingHorizontal: 80,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: "center",
  },
  shareDecorativeMark: {
    fontFamily: Fonts.serif,
    fontSize: 220,
    lineHeight: 180,
    color: Colors.forest,
    opacity: 0.08,
    marginBottom: -60,
    marginLeft: -10,
  },
  shareQuoteText: {
    fontFamily: Fonts.serif,
    fontSize: 62,
    lineHeight: 88,
    color: Colors.forest,
    fontStyle: "italic",
  },
  shareClosingMark: {
    fontFamily: Fonts.serif,
    fontSize: 120,
    lineHeight: 80,
    color: Colors.forest,
    opacity: 0.08,
    textAlign: "right",
    marginTop: 4,
  },

  // Bottom panel — distinct background, ~30% of card height
  shareInfoPanel: {
    height: 100,
    backgroundColor: Colors.forest,
    paddingHorizontal: 80,
    paddingBottom: 72,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  // Fox sits in bottom-right, peeking up above the panel edge
  shareFox: {
    position: "absolute",
    right: 60,
    bottom: 50,
    width: 340,
    height: 420,
  },

  // Text block on the left side of the panel
  shareInfoText: {
    flex: 1,
    paddingRight: 360, // keep text clear of the fox
    gap: 12,
  },
  shareBookTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 42,
    lineHeight: 52,
    color: Colors.cream,
    letterSpacing: 0.3,
  },
  shareAuthorName: {
    fontFamily: Fonts.sans,
    fontSize: 30,
    color: Colors.cream,
    opacity: 0.75,
  },
  sharePageNumber: {
    fontFamily: Fonts.sans,
    fontSize: 22,
    color: Colors.cream,
    opacity: 0.45,
    marginTop: 4,
  },
});