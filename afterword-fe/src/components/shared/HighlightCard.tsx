import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Clipboard,
  Modal,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { Card } from '../common/Card';
import { HighlightWithBook } from '../../../types';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useToggleFavorite, useUpdateHighlightTags } from '../../../hooks/mutations/highlights';
import { useHighlightTagIds } from '../../../hooks/queries/tags';
import { TagPicker } from '../common/TagPicker';
import { ShareHighlightModal } from '../highlights/ShareHighlightModal';

export interface HighlightCardProps {
  highlight: HighlightWithBook;
  onShare?: () => void;
  className?: string;
  note?: string;
  onDeleteComplete?: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type Sheet = 'none' | 'options' | 'tags';

export const HighlightCard = ({ highlight, onShare, className = '', onDeleteComplete }: HighlightCardProps) => {
  const { width: windowWidth } = useWindowDimensions();

  const [isFavorite, setIsFavorite] = useState(highlight.isFavorite ?? false);
  const [sheet, setSheet] = useState<Sheet>('none');
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Dropdown anchor position (screen coords)
  const [dropY, setDropY] = useState(0);
  const [dropRight, setDropRight] = useState(0);

  const dotsRef = useRef<View>(null);

  const toggleFavoriteMutation = useToggleFavorite();
  const updateTagsMutation = useUpdateHighlightTags();
  const { data: dbTagIds = [], isLoading: loadingTags } = useHighlightTagIds(
    sheet === 'tags' ? highlight.id : ''
  );

  const router = useRouter();

  const locationText = highlight.pageNumber
    ? `Page ${highlight.pageNumber}`
    : highlight.location ? `Loc ${highlight.location}` : '';

  // ── Open dropdown anchored to the three-dots button ───────────────────────
  const handleDotsPress = () => {
    dotsRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setDropRight(windowWidth - px - width);
      setDropY(py + height + 6);
      setSheet('options');
    });
  };

  // ── Favorite toggle ───────────────────────────────────────────────────────
  const handleFavoritePress = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');
      await toggleFavoriteMutation.mutateAsync({
        highlightId: highlight.id,
        isFavorite: next,
        accessToken: session.access_token,
      });
    } catch {
      setIsFavorite(!next);
    }
  };

  // ── Tag sheet ─────────────────────────────────────────────────────────────
  const openTagSheet = () => {
    setPendingTagIds(highlight.tags?.map((t) => t.id) ?? []);
    setSheet('tags');
  };

  const onTagSheetShow = () => {
    if (!highlight.tags || highlight.tags.length === 0) {
      setPendingTagIds(dbTagIds);
    }
  };

  const handleSaveTags = async () => {
    setSavingTags(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');
      await updateTagsMutation.mutateAsync({
        highlightId: highlight.id,
        tagIds: pendingTagIds,
        accessToken: session.access_token,
      });
      setSheet('none');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save tags');
    } finally {
      setSavingTags(false);
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleShare = () => {
    setSheet('none');
    if (onShare) {
      onShare();
      return;
    }
    setIsShareModalVisible(true);
  };

  const handleCopy = () => {
    setSheet('none');
    const text = highlight.highlightText;
    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    Alert.alert('Copied', 'Highlight copied to clipboard.');
  };

  const handleEdit = () => {
    setSheet('none');
    router.push({ pathname: '/highlight/[id]/edit', params: { id: highlight.id } } as any);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User session not found.');
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-highlight`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: 'delete', highlight_id: highlight.id }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete highlight.');
      if (onDeleteComplete) onDeleteComplete();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete highlight.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    setSheet('none');
    setTimeout(() => {
      Alert.alert(
        'Delete Highlight',
        'Are you sure? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: handleDelete },
        ]
      );
    }, 150);
  };

  const notes = highlight.notes;
  const hasNotes = Array.isArray(notes) && notes.length > 0;
  const displayedTags = highlight.tags ?? [];

  return (
    <View>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <Card hasAccent className={className}>
        {/* Header row: opening quote mark + three-dots */}
        <View style={styles.topRow}>
          <Text style={styles.quoteMark}>“</Text>
          <View style={{ flex: 1 }} />
          <View ref={dotsRef} collapsable={false}>
            <Pressable
              onPress={handleDotsPress}
              hitSlop={14}
              style={({ pressed }) => [styles.dotsBtn, pressed && styles.dotsBtnPressed]}
            >
              <Ionicons name="ellipsis-horizontal" size={19} color={Colors.slate} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.quoteText}>{highlight.highlightText}</Text>

        {hasNotes && (
          <View style={styles.notesContainer}>
            {notes!.map((n: any, idx: number) => (
              <View key={n.id || idx} style={idx < notes!.length - 1 ? styles.noteRowSep : styles.noteRow}>
                <View style={styles.noteLabelRow}>
                  <Ionicons name="create-outline" size={11} color={Colors.gold} />
                  <Text style={styles.noteLabel}>Note</Text>
                </View>
                <Text style={styles.noteContent}>{n.content}</Text>
              </View>
            ))}
          </View>
        )}

        {displayedTags.length > 0 && (
          <View style={styles.tagRow}>
            {displayedTags.map((tag) => (
              <Pressable
                key={tag.id}
                onPress={openTagSheet}
                style={({ pressed }) => [styles.tagChip, pressed && styles.tagChipPressed]}
              >
                <Text style={styles.tagChipText}>{tag.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {highlight.book?.title || 'Unknown Book'}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText} numberOfLines={1}>
                {highlight.book?.author || 'Unknown Author'}
              </Text>
              {locationText ? (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.metaText}>{locationText}</Text>
                </>
              ) : null}
              <Text style={styles.dot}>·</Text>
              <Text style={styles.metaText}>{formatDate(highlight.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={10}
              style={({ pressed }) => [
                styles.iconBtn,
                isFavorite && styles.iconBtnActive,
                pressed && styles.iconBtnPressed,
              ]}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite ? Colors.danger : Colors.slate}
              />
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            >
              <Ionicons name="share-outline" size={18} color={Colors.forest} />
            </Pressable>
          </View>
        </View>
      </Card>

      {/* ── Dropdown options menu ───────────────────────────────────────── */}
      <Modal
        visible={sheet === 'options'}
        transparent
        animationType="fade"
        onRequestClose={() => setSheet('none')}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheet('none')} />

        <View style={[styles.dropdown, { top: dropY, right: dropRight }]}>
          <DropItem
            icon="share-outline"
            label="Share Highlight Card"
            onPress={handleShare}
          />
          <DropItem
            icon="pricetag-outline"
            label="Manage Tags"
            onPress={() => { setSheet('none'); setTimeout(openTagSheet, 100); }}
          />
          <DropItem
            icon={isFavorite ? 'heart' : 'heart-outline'}
            label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            iconColor={isFavorite ? Colors.danger : undefined}
            labelColor={isFavorite ? Colors.danger : undefined}
            onPress={() => { setSheet('none'); handleFavoritePress(); }}
          />
          <DropItem icon="copy-outline" label="Copy Highlight" onPress={handleCopy} />
          <DropItem icon="create-outline" label="Edit Highlight" onPress={handleEdit} />
          <View style={styles.dropDivider} />
          <DropItem
            icon="trash-outline"
            label="Delete Highlight"
            destructive
            onPress={confirmDelete}
          />
        </View>
      </Modal>

      {/* ── Share Highlight Modal ──────────────────────────────────────── */}
      <ShareHighlightModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        highlightText={highlight.highlightText}
        noteText={hasNotes ? notes![0].content : undefined}
        bookTitle={highlight.book?.title || 'Unknown Book'}
        author={highlight.book?.author || 'Unknown Author'}
        highlightId={highlight.id}
      />

      {/* ── Tag picker bottom sheet ─────────────────────────────────────── */}
      <Modal
        visible={sheet === 'tags'}
        animationType="slide"
        transparent
        onRequestClose={() => setSheet('none')}
        onShow={onTagSheetShow}
      >
        <View style={styles.sheetBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setSheet('none')} />
          <View style={styles.tagSheet}>
            <View style={styles.handle} />
            <View style={styles.tagSheetHeader}>
              <Text style={styles.tagSheetTitle}>Manage Tags</Text>
              <Pressable onPress={() => setSheet('none')} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={Colors.forest} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {loadingTags && pendingTagIds.length === 0 ? (
                <ActivityIndicator size="small" color={Colors.forest} style={{ marginTop: 24 }} />
              ) : (
                <TagPicker selectedTagIds={pendingTagIds} onChange={setPendingTagIds} />
              )}
              <View style={{ height: 16 }} />
            </ScrollView>

            <Pressable
              onPress={handleSaveTags}
              disabled={savingTags}
              style={({ pressed }) => [
                styles.saveBtn,
                savingTags && { opacity: 0.6 },
                pressed && !savingTags && { opacity: 0.85 },
              ]}
            >
              {savingTags ? (
                <ActivityIndicator size="small" color={Colors.cream} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={17} color={Colors.cream} style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>Save Tags</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── DropItem ───────────────────────────────────────────────────────────────

interface DropItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  iconColor?: string;
  labelColor?: string;
}

const DropItem = ({ icon, label, onPress, destructive = false, iconColor, labelColor }: DropItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.dropItem, pressed && styles.dropItemPressed]}
  >
    <View
      style={[
        styles.dropIconWrap,
        { backgroundColor: destructive ? 'rgba(196,68,68,0.08)' : 'rgba(31,58,47,0.06)' },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={15}
        color={iconColor ?? (destructive ? Colors.danger : Colors.forest)}
      />
    </View>
    <Text style={[styles.dropItemLabel, { color: labelColor ?? (destructive ? Colors.danger : Colors.forest) }]}>
      {label}
    </Text>
  </Pressable>
);

// ── Styles ─────────────────────────────────────────────────────────────────

const DROPDOWN_WIDTH = 216;

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: -6,
  },
  quoteMark: {
    fontFamily: 'Lora_700Bold',
    fontSize: 34,
    lineHeight: 34,
    color: Colors.gold,
    opacity: 0.55,
  },
  dotsBtn: { padding: 6, borderRadius: 14 },
  dotsBtnPressed: { backgroundColor: Colors.mist },
  quoteText: {
    fontFamily: 'Lora_700Bold',
    fontSize: 20,
    lineHeight: 29,
    color: Colors.forest,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  notesContainer: {
    backgroundColor: Colors.mist,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  noteRow: { flexDirection: 'column' },
  noteRowSep: { flexDirection: 'column', marginBottom: 10 },
  noteLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  noteLabel: {
    fontSize: 10,
    color: Colors.slate,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.forest,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  tagChip: {
    backgroundColor: '#EEF5EE',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(31,58,47,0.10)',
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  tagChipPressed: { backgroundColor: '#E2EEE2' },
  tagChipText: { fontFamily: 'Inter_500Medium', fontSize: 11.5, color: Colors.forest },
  divider: {
    height: 1,
    backgroundColor: 'rgba(31,58,47,0.08)',
    marginBottom: 12,
  },
  footer: { flexDirection: 'row', alignItems: 'center' },
  bookTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13.5,
    color: Colors.forest,
    marginBottom: 3,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.slate },
  dot: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.slate, marginHorizontal: 5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: { backgroundColor: 'rgba(196,68,68,0.10)' },
  iconBtnPressed: { opacity: 0.6 },

  // Dropdown
  dropdown: {
    position: 'absolute',
    width: DROPDOWN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dropItemPressed: { backgroundColor: '#F5F3EE' },
  dropIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dropItemLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14.5,
  },
  dropDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginVertical: 4,
    marginHorizontal: 12,
  },

  // Tag bottom sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,24,20,0.45)',
    justifyContent: 'flex-end',
  },
  tagSheet: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#E2DFD2',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
  tagSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  tagSheetTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.forest,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.forest,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: Colors.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  saveBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.cream,
  },
});