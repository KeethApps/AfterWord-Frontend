import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useBooks } from "../../../hooks/queries/books";
import { BookCover } from "../../components/shared/BookCover";
import { SectionHeader } from "../../components/common/SectionHeader";

export const RecentlyUploadedRow: React.FC = () => {
  const router = useRouter();
  const { data: books, isLoading } = useBooks();

  const recent = books && books.length > 0 ? books.slice(0, 10) : [
    { id: "mock-1", title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", userId: "mock", enrichmentStatus: "completed" as any, coverImageUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "mock-2", title: "The Daily Stoic", author: "Ryan Holiday", isbn: "9780735211735", userId: "mock", enrichmentStatus: "completed" as any, coverImageUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "mock-3", title: "Deep Work", author: "Cal Newport", isbn: "9781455586691", userId: "mock", enrichmentStatus: "completed" as any, coverImageUrl: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];

  return (
    <View className="mb-8">
      <SectionHeader 
        title="Recently Read" 
        action={<Text className="font-sans text-sm text-forest" onPress={() => router.push("/library")}>View all</Text>} 
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        className="mt-4"
      >
        {recent.map((book) => (
          <Pressable
            key={book.id}
            onPress={() => router.push(`/book/${book.id}`)}
            className="mr-4"
          >
            <BookCover
              coverImageUrl={book.coverImageUrl}
              isbn={book.isbn}
              title={book.title}
              author={book.author}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
