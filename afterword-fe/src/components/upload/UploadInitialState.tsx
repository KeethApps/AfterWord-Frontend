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
        <FolioFox variant="desk" size={100} className="mb-4" />
        <Text className="font-sansBold text-base text-forest mb-1">Tap to choose your file</Text>
        <Text className="font-sans text-xs text-slate"></Text>
      </Pressable>
    </View>
  );
};
