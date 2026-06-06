import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { BookCover } from "../shared/BookCover";

interface BookGridCardProps {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  coverImageUrl?: string | null;
  highlightsCount?: number;
  onPress: () => void;
  width?: number | string;
}

export const BookGridCard: React.FC<BookGridCardProps> = ({
  title,
  author,
  isbn,
  coverImageUrl,
  highlightsCount = 0,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="mb-6 w-[31%]"
      style={({ pressed }) => pressed && { opacity: 0.75 }}
    >
      <View className="shadow-sm items-center mb-3 w-full">
        <BookCover 
          title={title} 
          author={author} 
          isbn={isbn} 
          coverImageUrl={coverImageUrl} 
          className="w-full aspect-[2/3]"
        />
      </View>
      
      <Text className="font-serifBold text-sm text-forest mb-1 leading-snug" numberOfLines={2}>
        {title}
      </Text>
      <Text className="font-sans text-xs text-slate mb-1" numberOfLines={1}>
        {author}
      </Text>
      <Text className="font-sans text-[10px] text-forest opacity-80" numberOfLines={1}>
        {highlightsCount} {highlightsCount === 1 ? 'highlight' : 'highlights'}
      </Text>
    </Pressable>
  );
};
