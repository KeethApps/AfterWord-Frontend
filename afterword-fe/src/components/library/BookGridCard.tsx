import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { BookCover } from "../shared/BookCover";

interface BookGridCardProps {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  coverImageUrl?: string | null;
  onPress: () => void;
  width?: number | string;
}

export const BookGridCard: React.FC<BookGridCardProps> = ({
  title,
  author,
  isbn,
  coverImageUrl,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="mb-6 flex-1"
      style={({ pressed }) => [pressed && { opacity: 0.75 }, { maxWidth: '30%' }]}
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
      
      <Text className="font-serifBold text-base text-forest mb-1 leading-snug" numberOfLines={2}>
        {title}
      </Text>
      <Text className="font-sans text-xs text-slate" numberOfLines={1}>
        {author}
      </Text>
    </Pressable>
  );
};
