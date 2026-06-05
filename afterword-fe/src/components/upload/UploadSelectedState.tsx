import React from "react";
import { View, Text } from "react-native";
import { FolioFox } from "../FolioFox";
import { Button } from "../common/Button";
import { SectionLabel, FileCard } from "./UploadShared";

interface UploadSelectedStateProps {
  fileName: string;
  fileSize: number;
  onUpload: () => void;
  onReset: () => void;
}

export const UploadSelectedState: React.FC<UploadSelectedStateProps> = ({
  fileName,
  fileSize,
  onUpload,
  onReset,
}) => {
  return (
    <View className="flex-1 items-center justify-center mt-12 mb-8 px-4">
      <FileCard name={fileName} size={fileSize} isUploaded />
      
      <View className="items-center my-10">
        <FolioFox variant="thinking" size={140} className="mb-6" />
        <Text className="font-serifBold text-xl text-forest mb-2">Ready to upload?</Text>
        <Text className="font-sans text-sm text-slate text-center">We'll start importing your highlights.</Text>
      </View>

      <View className="w-full max-w-[280px] gap-3">
        <Button label="Upload file" onPress={onUpload} fullWidth />
        <Button label="Choose different file" variant="ghost" onPress={onReset} fullWidth />
      </View>
    </View>
  );
};
