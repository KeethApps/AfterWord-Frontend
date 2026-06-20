import React from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { Card } from '../common/Card';
import { HighlightWithBook } from '../../../types';

export interface HighlightCardProps {
  highlight: HighlightWithBook;
  onShare?: () => void;
  className?: string;
  note?: string; // Legacy support
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Card displaying a single highlight with beautiful Lora typography,
 * including associated book context and a share action.
 */
export const HighlightCard = ({ highlight, onShare, className = '' }: HighlightCardProps) => {
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

  const notes = highlight.notes;
  const hasNotes = Array.isArray(notes) && notes.length > 0;

  return (
    <Card hasAccent className={className}>
      <Text className="font-serif italic text-lg text-forest leading-relaxed mb-4">
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
