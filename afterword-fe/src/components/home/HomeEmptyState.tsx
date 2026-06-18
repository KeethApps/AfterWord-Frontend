import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { FolioFox } from "../../components/shared/FolioFox";
import { Button } from "../../components/common/Button";

export const HomeEmptyState: React.FC = () => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center py-10">
      <FolioFox variant="reading" size={200} className="mb-6" />
      
      <Text className="font-serifBold text-2xl text-forest mb-3">
        Your library is empty
      </Text>
      
      <Text className="font-sans text-sm text-slate text-center mb-8 px-8 leading-relaxed">
        Upload your Kindle highlights to get started.
      </Text>
      
      <View className="w-full gap-y-4">
        <Button 
          label="Upload Highlights" 
          onPress={() => router.push("/upload")} 
          fullWidth
        />
        {/* <Button 
          label="Learn how it works" 
          variant="ghost" 
          onPress={() => {}} 
          fullWidth
        /> */}
      </View>
    </View>
  );
};
