import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/theme";
import { FolioFox } from "../FolioFox";
import { SectionLabel } from "./UploadShared";

interface UploadInitialStateProps {
  onPickFile: () => void;
}

export const UploadInitialState: React.FC<UploadInitialStateProps> = ({ onPickFile }) => {
  return (
    <View className="mb-6">
      <SectionLabel title="Bring your highlights home." subtitle="We'll import, organize, and keep them safe." />
      
      <Pressable 
        onPress={onPickFile}
        className="mt-6 mb-10 items-center justify-center p-8 bg-cream border-2 border-dashed border-mist rounded-3xl"
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <FolioFox variant="drop" size={100} className="mb-4" />
        <Text className="font-sansBold text-base text-forest mb-1">Tap to choose your file</Text>
        <Text className="font-sans text-xs text-slate">My Clippings.txt only</Text>
      </Pressable>

      <Text className="font-sansBold text-sm text-forest mb-4">How it works</Text>
      
      <View className="bg-white rounded-3xl p-6 border border-mist shadow-sm mb-6">
        {[
          {
            icon: "laptop-outline" as const,
            label: "Connect your Kindle to your computer",
          },
          {
            icon: "document-text-outline" as const,
            label: "Find \"My Clippings.txt\" in the documents folder",
          },
          {
            icon: "cloud-upload-outline" as const,
            label: "Upload here and we'll take care of the rest",
          },
        ].map((step, i, arr) => (
          <View key={i} className="flex-row items-center mb-6 last:mb-0">
            <View className="w-6 h-6 rounded-full bg-cream items-center justify-center mr-4 border border-mist">
              <Text className="font-sansBold text-[10px] text-forest">{i + 1}</Text>
            </View>
            <Text className="font-sans text-sm text-forest flex-1 leading-tight">{step.label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-center mt-2 px-6">
        <Ionicons name="lock-closed-outline" size={14} color={Colors.slate} style={{ marginRight: 6 }} />
        <Text className="font-sans text-xs text-slate text-center leading-tight">
          Your file is private and secure. We never share your highlights.
        </Text>
      </View>
    </View>
  );
};
