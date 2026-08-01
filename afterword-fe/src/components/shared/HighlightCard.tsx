import React from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform, ActionSheetIOS, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { Card } from '../common/Card';
import { HighlightWithBook } from '../../../types';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export interface HighlightCardProps {
  highlight: HighlightWithBook;
  onShare?: () => void;
  className?: string;
  note?: string; // Legacy support
  onDeleteComplete?: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Card displaying a single highlight with beautiful Lora typography,
 * including associated book context, a share action, and a three-dots edit menu.
 */
export const HighlightCard = ({ highlight, onShare, className = '', onDeleteComplete }: HighlightCardProps) => {
  const router = useRouter();

  const locationText = highlight.pageNumber 
    ? `Page ${highlight.pageNumber}` 
    : (highlight.location ? `Loc ${highlight.location}` : '');

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    
    try {
      const bookTitle = highlight.book?.title || 'Unknown Book';
      const bookAuthor = highlight.book?.author || 'Unknown Author';
      await Share.share({
        message: `"${highlight.highlightText}"\n\n— ${bookTitle}, ${bookAuthor}\n\n(powered by AfterWord)`,
      });
    } catch {}
  };

  const handleCopy = () => {
    const text = highlight.highlightText;
    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    Alert.alert("Success", "Highlight copied to clipboard.");
  };

  const handleEdit = () => {
    router.push({
      pathname: "/highlight/[id]/edit",
      params: { id: highlight.id }
    } as any);
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      "Delete Highlight",
      "Are you sure you want to delete this highlight? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: performDelete,
        },
      ]
    );
  };

  const performDelete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User session not found.");

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/manage-highlight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "delete",
            highlight_id: highlight.id,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete highlight.");
      }

      if (onDeleteComplete) {
        onDeleteComplete();
      } else {
        Alert.alert("Success", "Highlight deleted successfully.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete highlight.");
    }
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Copy Highlight', 'Edit Highlight', 'Delete Highlight'],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          title: 'Highlight Options',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCopy();
          } else if (buttonIndex === 2) {
            handleEdit();
          } else if (buttonIndex === 3) {
            handleDeleteConfirm();
          }
        }
      );
    } else {
      Alert.alert(
        'Highlight Options',
        undefined,
        [
          { text: 'Copy Highlight', onPress: handleCopy },
          { text: 'Edit Highlight', onPress: handleEdit },
          { text: 'Delete Highlight', style: 'destructive', onPress: handleDeleteConfirm },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const notes = highlight.notes;
  const hasNotes = Array.isArray(notes) && notes.length > 0;

  return (
    <Card hasAccent className={className}>
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Three dots menu */}
        <Pressable 
          onPress={showOptions}
          style={{ position: 'absolute', top: -4, right: -4, padding: 8, zIndex: 10 }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.slate} />
        </Pressable>

        <Text className="font-serif italic text-lg text-forest leading-relaxed mb-4 pr-8">
          "{highlight.highlightText}"
        </Text>

        {hasNotes && (
          <View style={styles.notesContainer}>
            {notes!.map((n: any, idx: number) => (
              <View key={n.id || idx} style={idx < notes!.length - 1 ? styles.noteRowSeparated : styles.noteRow}>
                <Text style={styles.noteLabel}>Note</Text>
                <Text style={styles.noteContent}>{n.content}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View className="flex-row justify-between items-end">
          <View className="flex-1 mr-4">
            <Text className="font-sansBold text-sm text-forest mb-1" numberOfLines={1}>
              {highlight.book?.title || 'Unknown Book'}
            </Text>
            <View className="flex-row items-center flex-wrap">
              <Text className="font-sans text-xs text-slate">{highlight.book?.author || 'Unknown Author'}</Text>
              
              {locationText ? (
                <>
                  <Text className="font-sans text-xs text-slate mx-2">•</Text>
                  <Text className="font-sans text-xs text-slate">{locationText}</Text>
                </>
              ) : null}
              
              <Text className="font-sans text-xs text-slate mx-2">•</Text>
              <Text className="font-sans text-xs text-slate">
                {formatDate(highlight.createdAt)}
              </Text>
            </View>
          </View>

          <Pressable 
            onPress={handleShare}
            className="w-10 h-10 rounded-full bg-mist items-center justify-center"
          >
            <Ionicons name="share-outline" size={20} color={Colors.forest} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  notesContainer: {
    backgroundColor: Colors.mist,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
  },
  noteRow: {
    flexDirection: 'column',
  },
  noteRowSeparated: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 10,
    color: Colors.slate,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.forest,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});
