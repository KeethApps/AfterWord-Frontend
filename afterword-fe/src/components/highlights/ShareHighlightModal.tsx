import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import { Colors, Fonts } from '../../../constants/theme';
import {
  SHARE_BACKGROUNDS,
  getBackgroundForHighlight,
} from '../../constants/shareBackgrounds';
import { ShareableHighlightCard } from '../ShareableHighlightCard';
import { useShareHighlightCard } from '../../hooks/useShareHighlightCard';

export interface ShareHighlightModalProps {
  visible: boolean;
  onClose: () => void;
  highlightText: string;
  noteText?: string;
  bookTitle: string;
  author?: string;
  highlightId?: string;
}

export const ShareHighlightModal: React.FC<ShareHighlightModalProps> = ({
  visible,
  onClose,
  highlightText,
  noteText,
  bookTitle,
  author,
  highlightId = '',
}) => {
  const [backgroundId, setBackgroundId] = useState<string>('bg-1');
  const [format, setFormat] = useState<'story' | 'square'>('story');

  const cardRef = useRef<ViewShot>(null);
  const { isCapturing, isSaving, shareCard, saveToPhotos } =
    useShareHighlightCard(cardRef);

  useEffect(() => {
    if (visible && highlightId) {
      const defaultBg = getBackgroundForHighlight(highlightId);
      setBackgroundId(defaultBg.id);
    }
  }, [visible, highlightId]);

  const cycleBackground = () => {
    const currentIndex = SHARE_BACKGROUNDS.findIndex(
      (bg) => bg.id === backgroundId
    );
    const nextIndex = (currentIndex + 1) % SHARE_BACKGROUNDS.length;
    setBackgroundId(SHARE_BACKGROUNDS[nextIndex].id);
  };

  const currentBg =
    SHARE_BACKGROUNDS.find((bg) => bg.id === backgroundId) ||
    SHARE_BACKGROUNDS[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Highlight</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={24} color={Colors.forest} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Live Preview Card */}
          <View style={styles.previewWrapper}>
            <View style={styles.cardPreviewContainer}>
              <ShareableHighlightCard
                ref={cardRef}
                highlightText={highlightText}
                noteText={noteText}
                bookTitle={bookTitle}
                author={author}
                backgroundId={backgroundId}
                format={format}
              />
            </View>
          </View>

          {/* Customization Controls */}
          <View style={styles.controlsSection}>
            {/* Format Toggle */}
            <Text style={styles.sectionLabel}>Card Format</Text>
            <View style={styles.formatToggleRow}>
              <Pressable
                onPress={() => setFormat('story')}
                style={[
                  styles.toggleBtn,
                  format === 'story' && styles.toggleBtnActive,
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={16}
                  color={format === 'story' ? Colors.cream : Colors.forest}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    format === 'story' && styles.toggleBtnTextActive,
                  ]}
                >
                  Story (9:16)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFormat('square')}
                style={[
                  styles.toggleBtn,
                  format === 'square' && styles.toggleBtnActive,
                ]}
              >
                <Ionicons
                  name="square-outline"
                  size={16}
                  color={format === 'square' ? Colors.cream : Colors.forest}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    format === 'square' && styles.toggleBtnTextActive,
                  ]}
                >
                  Square (1:1)
                </Text>
              </Pressable>
            </View>

            {/* Background Selector */}
            <View style={styles.bgHeaderRow}>
              <Text style={styles.sectionLabel}>Background Theme</Text>
              <Text style={styles.bgNameLabel}>{currentBg.name}</Text>
            </View>

            <Pressable onPress={cycleBackground} style={styles.shuffleBtn}>
              <Ionicons name="color-palette-outline" size={18} color={Colors.forest} />
              <Text style={styles.shuffleBtnText}>Next Background</Text>
            </Pressable>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <Pressable
                onPress={shareCard}
                disabled={isCapturing || isSaving}
                style={[
                  styles.sharePrimaryBtn,
                  (isCapturing || isSaving) && { opacity: 0.6 },
                ]}
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color={Colors.cream} />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={20} color={Colors.cream} />
                    <Text style={styles.sharePrimaryText}>Share Card</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={saveToPhotos}
                disabled={isCapturing || isSaving}
                style={[
                  styles.saveSecondaryBtn,
                  (isCapturing || isSaving) && { opacity: 0.6 },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.forest} />
                ) : (
                  <>
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={Colors.forest}
                    />
                    <Text style={styles.saveSecondaryText}>Save to Photos</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingTop: Platform.OS === 'ios' ? 16 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 18,
    color: Colors.forest,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  previewWrapper: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardPreviewContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlsSection: {
    width: '100%',
    maxWidth: 340,
  },
  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  formatToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  toggleBtnText: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.forest,
  },
  toggleBtnTextActive: {
    color: Colors.cream,
  },
  bgHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bgNameLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.forest,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 24,
  },
  shuffleBtnText: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.forest,
  },
  actionButtonsRow: {
    gap: 12,
  },
  sharePrimaryBtn: {
    backgroundColor: Colors.forest,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sharePrimaryText: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.cream,
  },
  saveSecondaryBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveSecondaryText: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    color: Colors.forest,
  },
});
