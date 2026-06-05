import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BookCover } from "../shared/BookCover";
import { Colors } from "../../../constants/theme";

interface BookListCardProps {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  coverImageUrl?: string | null;
  highlightsCount?: number;
  onPress: () => void;
}

export const BookListCard: React.FC<BookListCardProps> = ({
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
      className="flex-row items-center bg-white rounded-2xl p-4 mb-4 border border-border"
      style={({ pressed }) => pressed && { opacity: 0.75 }}
    >
      <View className="mr-4 shadow-sm w-[72px]">
        <BookCover 
          title={title} 
          author={author} 
          isbn={isbn} 
          coverImageUrl={coverImageUrl} 
          className="w-full h-[108px]" 
        />
      </View>
      
      <View className="flex-1 justify-center">
        <Text className="font-serif text-lg text-forest mb-1" numberOfLines={2}>
          {title}
        </Text>
        <Text className="font-sans text-sm text-slate mb-2" numberOfLines={1}>
          {author}
        </Text>
        <Text className="font-sans text-xs text-forest opacity-80">
          {highlightsCount} {highlightsCount === 1 ? 'highlight' : 'highlights'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.slate} style={{ marginLeft: 8 }} />
    </Pressable>
  );
};
