import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";

export function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-2">
      <Text className="font-serifBold text-2xl text-forest">{title}</Text>
      {subtitle && <Text className="font-sans text-sm text-slate mt-1">{subtitle}</Text>}
    </View>
  );
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileCard({ name, size, isUploaded }: { name: string; size: number; isUploaded?: boolean }) {
  return (
    <View className="bg-white rounded-3xl p-4 border border-primary/20 shadow-sm flex-row items-center justify-between mt-4">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-cream items-center justify-center mr-3 border border-mist">
          <Ionicons name="document-text-outline" size={20} color={Colors.forest} />
        </View>
        <View>
          <Text className="font-sansBold text-sm text-forest">{name}</Text>
          <Text className="font-sans text-xs text-slate mt-0.5">{formatBytes(size)}</Text>
        </View>
      </View>
      {isUploaded && (
        <Ionicons name="checkmark" size={24} color={Colors.primary} />
      )}
    </View>
  );
}
