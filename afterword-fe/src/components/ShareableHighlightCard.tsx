import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../../constants/theme';
import { getBackgroundById, ShareBackground } from '../constants/shareBackgrounds';

// Adjust this relative path if this file lives somewhere other than src/components
const CRANE_WATERMARK = require('../../assets/crane/crane-default.png');

export interface ShareableHighlightCardProps {
  highlightText: string;
  noteText?: string;
  bookTitle: string;
  author?: string;
  backgroundId?: string;
  format?: 'square' | 'story';
  style?: StyleProp<ViewStyle>;
}

function getFontSizeConfig(textLength: number, format: 'square' | 'story') {
  if (format === 'story') {
    if (textLength <= 100) return { fontSize: 22, lineHeight: 32 };
    if (textLength <= 220) return { fontSize: 17, lineHeight: 26 };
    return { fontSize: 14, lineHeight: 21 };
  } else {
    if (textLength <= 100) return { fontSize: 19, lineHeight: 28 };
    if (textLength <= 220) return { fontSize: 15, lineHeight: 22 };
    return { fontSize: 13, lineHeight: 19 };
  }
}

export const ShareableHighlightCard = forwardRef<ViewShot, ShareableHighlightCardProps>(
  (
    {
      highlightText,
      noteText,
      bookTitle,
      author,
      backgroundId,
      format = 'story',
      style,
    },
    ref
  ) => {
    const bg: ShareBackground = getBackgroundById(backgroundId);
    const isDark = bg.textColor === 'light';

    const fontConfig = getFontSizeConfig(highlightText.length, format);

    const textColor = isDark ? Colors.white : Colors.forest;
    const secondaryTextColor = isDark ? 'rgba(250, 248, 243, 0.8)' : 'rgba(30, 58, 52, 0.8)';
    const mutedTextColor = isDark ? 'rgba(250, 248, 243, 0.6)' : 'rgba(30, 58, 52, 0.6)';
    const accentColor = Colors.gold;

    const gradientColors = isDark
      ? (['rgba(18, 38, 28, 0.25)', 'rgba(18, 38, 28, 0.65)', 'rgba(18, 38, 28, 0.95)'] as const)
      : (['rgba(245, 241, 232, 0.25)', 'rgba(245, 241, 232, 0.75)', 'rgba(245, 241, 232, 0.96)'] as const);

    const aspectRatio = format === 'story' ? 9 / 16 : 1 / 1;

    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1.0 }}
        style={[
          styles.container,
          { aspectRatio },
          style,
        ]}
      >
        {/* Background Image */}
        <Image
          source={bg.source}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={200}
        />

        {/* Gradient Scrim Overlay */}
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Card Main Container */}
        <View style={styles.cardContent}>
          {/* Top Decorative Header: open quote mark */}
          <View style={styles.topHeader}>
            <Text style={[styles.quoteMark, { color: accentColor }]}>“</Text>
          </View>

          {/* Center Body: Quote & Note */}
          <View style={styles.bodySection}>
            <Text
              style={[
                styles.highlightText,
                {
                  fontSize: fontConfig.fontSize,
                  lineHeight: fontConfig.lineHeight,
                  color: textColor,
                },
              ]}
              numberOfLines={format === 'square' ? 7 : 12}
            >
              {highlightText.trim()}
            </Text>

            {noteText && noteText.trim() ? (
              <View
                style={[
                  styles.noteBox,
                  {
                    borderColor: isDark ? 'rgba(200, 155, 60, 0.4)' : Colors.border,
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.4)',
                  },
                ]}
              >
                <Text style={[styles.noteText, { color: secondaryTextColor }]}>
                  {noteText.trim()}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Bottom Attribution & Branding Footer */}
          <View style={styles.bottomFooter}>
            <View style={styles.attributionContainer}>
              <View style={[styles.dividerLine, { backgroundColor: accentColor }]} />
              <Text style={[styles.bookTitle, { color: textColor }]} numberOfLines={2}>
                {bookTitle}
              </Text>
              {author ? (
                <Text style={[styles.authorName, { color: secondaryTextColor }]} numberOfLines={1}>
                  {author}
                </Text>
              ) : null}
            </View>

            {/* AfterWord Crane Watermark */}
            <View style={styles.brandingRow}>
              <Image
                source={CRANE_WATERMARK}
                style={[styles.craneMark, { tintColor: mutedTextColor }]}
                contentFit="contain"
              />
              <Text style={[styles.brandingText, { color: mutedTextColor }]}>AfterWord</Text>
            </View>
          </View>
        </View>
      </ViewShot>
    );
  }
);

ShareableHighlightCard.displayName = 'ShareableHighlightCard';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.forest,
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  quoteMark: {
    fontFamily: Fonts.serifBold,
    fontSize: 48,
    lineHeight: 48,
    opacity: 0.9,
  },
  bodySection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 12,
  },
  highlightText: {
    fontFamily: Fonts.serifBold,
    fontStyle: 'italic',
    letterSpacing: -0.2,
  },
  noteBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  noteText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  attributionContainer: {
    flex: 1,
    marginRight: 16,
  },
  dividerLine: {
    width: 24,
    height: 2,
    borderRadius: 1,
    marginBottom: 6,
  },
  bookTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 15,
    lineHeight: 20,
  },
  authorName: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginTop: 2,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
  },
  craneMark: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  brandingText: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});