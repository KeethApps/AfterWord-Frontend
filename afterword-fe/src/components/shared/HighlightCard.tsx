import React from 'react';
import { View, Text, Pressable } from 'react-native';
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

  return (
    <Card hasAccent className={className}>
      <Text className="font-serif italic text-lg text-forest leading-relaxed mb-4">
        "{highlight.highlightText}"
      </Text>
      
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
          onPress={onShare}
          className="w-10 h-10 rounded-full bg-mist items-center justify-center"
        >
          <Ionicons name="share-outline" size={20} color={Colors.forest} />
        </Pressable>
      </View>
    </Card>
  );
};
