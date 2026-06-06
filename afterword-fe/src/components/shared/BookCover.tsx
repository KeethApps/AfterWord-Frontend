import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

export interface BookCoverProps {
  coverImageUrl?: string | null;
  isbn?: string | null;
  title: string;
  author: string;
  className?: string;
}

/**
 * Renders a book's cover image with standard dimensions (120x180).
 * Falls back to an OpenLibrary cover if isbn is provided but coverImageUrl is missing.
 * Falls back to a solid colored placeholder if neither is available.
 */
export const BookCover = ({ coverImageUrl, isbn, title, author, className = '' }: BookCoverProps) => {
  const imageUrl = coverImageUrl || (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : null);

  if (imageUrl) {
    return (
      <View className={`rounded-md border border-border overflow-hidden ${className || 'w-[120px] h-[180px]'}`}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View className={`rounded-md border border-border bg-mist p-3 justify-between overflow-hidden ${className || 'w-[120px] h-[180px]'}`}>
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
