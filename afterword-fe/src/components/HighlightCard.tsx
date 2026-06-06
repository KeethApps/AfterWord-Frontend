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
  note?: string;
  onPress?: () => void;
  isFavorite?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  featured?: boolean;
  score?: number;
}

const afterwordLogo = require("../../assets/fox/fox-icon.png");
const foxReading = require("../../assets/crane/crane-reading.png");

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
    {/* Background decorative blobs */}
    <View style={styles.shareBlobOne} />
    <View style={styles.shareBlobTwo} />

    {/* Top branding */}
    <View style={styles.shareHeader}>
      <View style={styles.shareBrandRow}>
        <Image
          source={afterwordLogo}
          style={styles.shareLogoTop}
          resizeMode="contain"
        />

        <View>
          <Text style={styles.shareBrandTitle}>AfterWord</Text>
          <Text style={styles.shareBrandTagline}>
            For the Words Worth Revisiting.
          </Text>
        </View>
      </View>
    </View>

    {/* Quote area */}
    <View style={styles.shareQuoteZone}>
      <Text style={styles.shareOpeningQuote}>“</Text>

      <Text style={styles.shareQuoteText}>{quote}</Text>

      <Text style={styles.shareClosingQuote}>”</Text>
    </View>

    {/* Footer card */}
    <View style={styles.shareFooter}>
      {/* Fox illustration */}
      <Image
        source={foxReading}
        style={styles.shareFox}
        resizeMode="contain"
      />

      <View style={styles.shareFooterContent}>
        <Text style={styles.shareBookTitle} numberOfLines={2}>
          {bookTitle}
        </Text>

        {author && (
          <Text style={styles.shareAuthorName}>
            by {author}
          </Text>
        )}

        {page && (
          <Text style={styles.sharePageNumber}>
            Page {page}
          </Text>
        )}

        <View style={styles.shareDivider} />

        <Text style={styles.shareFooterCaption}>
          Captured in AfterWord
        </Text>
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
  shareCard: {
  width: 1080,
  height: 1350,
  backgroundColor: "#F8F4EC",
  paddingHorizontal: 80,
  paddingTop: 80,
  paddingBottom: 70,
  justifyContent: "space-between",
  overflow: "hidden",
  position: "relative",
},

shareHeader: {
  zIndex: 2,
},

shareBrandRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 18,
},

shareLogoTop: {
  width: 150,
  height: 150,
},

shareBrandTitle: {
  fontFamily: "Lora",
  fontSize: 42,
  color: Colors.forest,
},

shareBrandTagline: {
  fontFamily: Fonts.sans,
  fontSize: 18,
  color: Colors.slate,
  marginTop: 2,
},

shareQuoteZone: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 40,
  position: "relative",
  zIndex: 2,
},

shareOpeningQuote: {
  position: "absolute",
  top: -20,
  left: 0,
  fontSize: 180,
  fontFamily: "Lora-Regular",
  color: "rgba(44, 62, 45, 0.08)",
},

shareClosingQuote: {
  position: "absolute",
  bottom: -120,
  right: 10,
  fontSize: 180,
  fontFamily: "Lora-Regular",
  color: "rgba(44, 62, 45, 0.08)",
},

shareQuoteText: {
  fontFamily: "Lora",
  fontSize: 58,
  lineHeight: 92,
  textAlign: "left",
  color: Colors.forest,
  letterSpacing: 0.3,
  maxWidth: 820,
},

shareFooter: {
  backgroundColor: "rgba(255,255,255,0.72)",
  borderWidth: 1,
  borderColor: "rgba(44,62,45,0.08)",
  borderRadius: 40,
  padding: 42,
  flexDirection: "row",
  alignItems: "center",
  gap: 28,
  backdropFilter: "blur(20px)" as any,
  zIndex: 2,
},

shareFox: {
  width: 180,
  height: 180,
},

shareFooterContent: {
  flex: 1,
},

shareBookTitle: {
  fontFamily: "Lora-Bold",
  fontSize: 36,
  lineHeight: 46,
  color: Colors.forest,
  marginBottom: 10,
},

shareAuthorName: {
  fontFamily: Fonts.sans,
  fontSize: 22,
  color: Colors.slate,
  marginBottom: 8,
},

sharePageNumber: {
  fontFamily: Fonts.sansBold,
  fontSize: 18,
  color: Colors.forest,
  opacity: 0.75,
},

shareDivider: {
  width: 80,
  height: 2,
  backgroundColor: "rgba(44,62,45,0.12)",
  marginTop: 24,
  marginBottom: 18,
  borderRadius: 999,
},

shareFooterCaption: {
  fontFamily: Fonts.sans,
  fontSize: 18,
  color: Colors.slate,
},

shareBlobOne: {
  position: "absolute",
  width: 420,
  height: 420,
  borderRadius: 999,
  backgroundColor: "rgba(214, 176, 107, 0.14)",
  top: -120,
  right: -80,
},

shareBlobTwo: {
  position: "absolute",
  width: 320,
  height: 320,
  borderRadius: 999,
  backgroundColor: "rgba(44, 62, 45, 0.05)",
  bottom: -80,
  left: -60,
},

hiddenContainer: {
  position: "absolute",
  left: -9999,
  top: -9999,
},
});