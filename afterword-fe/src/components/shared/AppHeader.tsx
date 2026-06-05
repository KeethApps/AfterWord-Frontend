import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

export interface AppHeaderProps {
  onAvatarPress?: () => void;
  avatarUrl?: string;
  className?: string;
}

/**
 * Top application header showing the brand logo on the left
 * and a clickable user avatar on the right.
 */
export const AppHeader = ({ onAvatarPress, avatarUrl, className = '' }: AppHeaderProps) => {
  return (
    <View className={`flex-row justify-between items-center py-4 ${className}`}>
      {/* Logo Area */}
      <View className="flex-row items-center">
        <Ionicons name="book" size={24} color={Colors.forest} />
        <Text className="font-serifBold text-2xl text-forest ml-2">AfterWord</Text>
      </View>

      {/* Avatar Area */}
      <Pressable onPress={onAvatarPress}>
        {avatarUrl ? (
          <Image 
            source={{ uri: avatarUrl }} 
            className="w-10 h-10 rounded-full border border-border"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-mist items-center justify-center border border-border">
            <Ionicons name="person" size={20} color={Colors.slate} />
          </View>
        )}
      </Pressable>
    </View>
  );
};
