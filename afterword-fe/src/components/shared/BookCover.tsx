import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

export interface BookCoverProps {
  coverImageUrl?: string | null;
  title: string;
  author: string;
  className?: string;
}

/**
 * Renders a book's cover image with standard dimensions (120x180).
 * Falls back to a solid colored placeholder rendering the title and author if no image is provided.
 */
export const BookCover = ({ coverImageUrl, title, author, className = '' }: BookCoverProps) => {
  if (coverImageUrl) {
    return (
      <Image
        source={{ uri: coverImageUrl }}
        className={`w-[120px] h-[180px] rounded-md border border-border ${className}`}
        contentFit="cover"
      />
    );
  }

  return (
    <View className={`w-[120px] h-[180px] rounded-md border border-border bg-mist p-3 justify-between overflow-hidden ${className}`}>
      <Text 
        className="font-serifBold text-forest text-sm leading-snug"
        numberOfLines={4}
      >
        {title}
      </Text>
      <Text 
        className="font-sans text-slate text-xs mt-2"
        numberOfLines={2}
      >
        {author}
      </Text>
    </View>
  );
};
