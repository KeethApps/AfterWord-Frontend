import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { BookCover } from "../shared/BookCover";

interface TopResultCardProps {
  quote: string;
  bookTitle: string;
  author: string;
  page?: string;
  dateHighlighted?: string;
  coverImageUrl?: string | null;
  isbn?: string | null;
}

export const TopResultCard: React.FC<TopResultCardProps> = ({
  quote,
  bookTitle,
  author,
  page,
  dateHighlighted,
  coverImageUrl,
  isbn,
}) => {
  return (
    <View className="bg-white rounded-2xl p-5 border border-border mb-6">
      <Ionicons name="bookmark" size={24} color={Colors.forest} className="mb-2 opacity-60" />
      
      <Text className="font-serifBold text-lg text-forest mb-6 leading-tight">
        "{quote}"
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <Text className="font-sansBold text-sm text-forest mb-1">
            {bookTitle} <Text className="font-sans text-slate text-xs ml-2">{author}</Text>
          </Text>
          <View className="flex-row items-center">
            {page && (
              <Text className="font-sans text-xs text-slate">
                Page {page}
              </Text>
            )}
            {page && dateHighlighted && (
              <Text className="font-sans text-xs text-slate mx-1">•</Text>
            )}
            {dateHighlighted && (
              <Text className="font-sans text-xs text-slate">
                Highlighted {dateHighlighted}
              </Text>
            )}
          </View>
        </View>

        <View className="shadow-sm">
          <BookCover 
            title={bookTitle} 
            author={author} 
            isbn={isbn} 
            coverImageUrl={coverImageUrl} 
            className="w-12 h-18 rounded"
          />
        </View>
      </View>
    </View>
  );
};
