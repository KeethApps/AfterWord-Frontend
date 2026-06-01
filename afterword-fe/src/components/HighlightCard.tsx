import React from "react";
import { View, Text, StyleSheet, Pressable, Image, ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Spacing } from "../../constants/theme";

interface HighlightCardProps {
  quote: string;
  bookTitle: string;
  author?: string;
  page?: number | string;
  score?: number;
  note?: string;
  onPress?: () => void;
  featured?: boolean;
  foxAsset?: ImageSourcePropType;
  // New props for interaction
  isFavorite?: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
}

export function HighlightCard({
  quote,
  bookTitle,
  author,
  page,
  score,
  note,
  onPress,
  featured = false,
  foxAsset,
  isFavorite = false,
  onFavorite,
  onShare,
}: HighlightCardProps) {
  if (featured) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}>
        <View style={styles.bgCircleTopRight} />
        <View style={styles.bgCircleBottomLeft} />
        
        <View style={styles.featuredLabel}>
          <Text style={styles.featuredStar}>★</Text>
          <Text style={styles.featuredLabelText}>Daily Highlight</Text>
        </View>

        <View style={styles.featuredBody}>
          <View style={styles.featuredTextBlock}>
            <Text style={styles.featuredQuote} numberOfLines={5}>
              "{quote}"
            </Text>

            <View style={styles.featuredAttr}>
              <Text style={styles.featuredBookTitle}>{bookTitle}</Text>
              {author && (
                <>
                  <Text style={styles.featuredDot}> · </Text>
                  <Text style={styles.featuredAuthor}>{author}</Text>
                </>
              )}
            </View>

            <View style={styles.featuredFooter}>
              {page && (
                <View style={styles.pagePill}>
                  <Text style={styles.pagePillText}>Page {page}</Text>
                </View>
              )}
              
              <View style={styles.actionButtons}>
                <Pressable onPress={onShare} style={styles.actionBtnFeatured}>
                  <Ionicons name="share-outline" size={20} color={Colors.cream} />
                </Pressable>
                <Pressable onPress={onFavorite} style={styles.actionBtnFeatured}>
                  <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? Colors.amber : Colors.cream} />
                </Pressable>
              </View>
            </View>
          </View>

          {foxAsset && (
            <Image
              source={foxAsset}
              style={styles.foxImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: any) => [
        styles.card,
        hovered && styles.cardHovered,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.leftBar} />

      {score !== undefined && (
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score.toFixed(2)}</Text>
        </View>
      )}

      <Text style={styles.quote} numberOfLines={4}>
        "{quote}"
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.bookTitle}>{bookTitle}</Text>
        {author && (
          <>
            <Text style={styles.metaSep}> · </Text>
            <Text style={styles.author}>{author}</Text>
          </>
        )}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.pageContainer}>
          {page && <Text style={styles.page}>Page {page}</Text>}
        </View>
        <View style={styles.actionButtons}>
          <Pressable onPress={onShare} style={styles.actionBtn}>
            <Ionicons name="share-outline" size={18} color={Colors.slate} />
          </Pressable>
          <Pressable onPress={onFavorite} style={styles.actionBtn}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={18} color={isFavorite ? Colors.danger : Colors.slate} />
          </Pressable>
        </View>
      </View>

      {note && (
        <View style={styles.noteArea}>
          <Text style={styles.noteLabel}>Your Note</Text>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    backgroundColor: Colors.forest,
    borderRadius: 20,
    padding: Spacing.s24,
    overflow: "hidden",
    position: "relative",
  },
  bgCircleTopRight: {
    position: "absolute",
    top: -48,
    right: -48,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.amber,
    opacity: 0.08,
  },
  bgCircleBottomLeft: {
    position: "absolute",
    bottom: -36,
    left: -24,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.white,
    opacity: 0.03,
  },
  featuredLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s6,
    marginBottom: Spacing.s16,
  },
  featuredStar: {
    color: Colors.cream,
    fontSize: 15,
    marginBottom: 4,
  },
  featuredLabelText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(244,239,230,0.5)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  featuredBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.s16,
  },
  featuredTextBlock: {
    flex: 1,
  },
  featuredQuote: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    fontStyle: "italic",
    color: Colors.cream,
    lineHeight: 30,
    marginBottom: Spacing.s16,
  },
  featuredAttr: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: Spacing.s8,
  },
  featuredBookTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: "rgba(244,239,230,0.7)",
  },
  featuredDot: {
    fontSize: 13,
    color: "rgba(244,239,230,0.3)",
  },
  featuredAuthor: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontStyle: "italic",
    color: "rgba(244,239,230,0.5)",
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.s8,
  },
  pagePill: {
    backgroundColor: "rgba(233,196,106,0.15)",
    borderWidth: 0.5,
    borderColor: "rgba(233,196,106,0.25)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pagePillText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "500",
    color: Colors.amber,
    letterSpacing: 0.3,
  },
  foxImage: {
    width: 152,
    height: 152,
    flexShrink: 0,
    marginTop: -1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.s20,
    paddingLeft: Spacing.s20 + 6,
    overflow: "hidden",
    position: "relative",
  },
  cardHovered: {
    borderColor: Colors.slate,
    transform: [{ translateY: -1 }],
  },
  pressed: {
    opacity: 0.85,
  },
  leftBar: {
    position: "absolute",
    left: 0,
    top: 20,
    bottom: 20,
    width: 3,
    backgroundColor: Colors.amber,
    borderRadius: 2,
    opacity: 0.6,
  },
  scoreBadge: {
    position: "absolute",
    top: Spacing.s12,
    right: Spacing.s12,
    backgroundColor: Colors.mist,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.s8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  scoreText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.slate,
    fontVariant: ["tabular-nums"],
  },
  quote: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    fontStyle: "italic",
    color: Colors.forest,
    lineHeight: 24,
    marginBottom: Spacing.s12,
    paddingRight: Spacing.s40,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  bookTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.slate,
  },
  metaSep: {
    fontSize: 13,
    color: Colors.slate,
    opacity: 0.4,
  },
  author: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.slate,
    opacity: 0.7,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  pageContainer: {
    flex: 1,
  },
  page: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.slate,
    opacity: 0.5,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.s8,
  },
  actionBtn: {
    padding: Spacing.s4,
  },
  actionBtnFeatured: {
    padding: Spacing.s4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
  },
  noteArea: {
    marginTop: Spacing.s12,
    paddingTop: Spacing.s12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  noteLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    color: Colors.slate,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noteText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.forest,
    lineHeight: 20,
    fontStyle: "italic",
  },
});