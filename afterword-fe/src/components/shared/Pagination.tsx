import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, onPrev, onNext, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (page > 3) pages.push("...");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 4) pages.push("...");
    pages.push(totalPages - 1);
  }

  return (
    <View className="flex-row items-center justify-center py-6 gap-2">
      <Pressable
        className={`w-9 h-9 rounded-xl border border-border bg-white items-center justify-center ${page === 0 ? "opacity-35" : ""}`}
        onPress={onPrev}
        disabled={page === 0}
      >
        <Ionicons name="chevron-back" size={16} color={page === 0 ? Colors.slate : Colors.forest} />
      </Pressable>

      {pages.map((p, i) =>
        p === "..." ? (
          <Text key={`ellipsis-${i}`} className="font-sans text-sm text-slate px-1">…</Text>
        ) : (
          <Pressable
            key={p}
            className={`min-w-[36px] h-9 rounded-xl border items-center justify-center px-2 ${
              p === page ? "bg-forest border-forest" : "bg-white border-border"
            }`}
            onPress={() => onPage(p as number)}
          >
            <Text className={`font-sans text-sm ${p === page ? "text-white font-sansBold" : "text-forest"}`}>
              {(p as number) + 1}
            </Text>
          </Pressable>
        )
      )}

      <Pressable
        className={`w-9 h-9 rounded-xl border border-border bg-white items-center justify-center ${page === totalPages - 1 ? "opacity-35" : ""}`}
        onPress={onNext}
        disabled={page === totalPages - 1}
      >
        <Ionicons name="chevron-forward" size={16} color={page === totalPages - 1 ? Colors.slate : Colors.forest} />
      </Pressable>
    </View>
  );
}