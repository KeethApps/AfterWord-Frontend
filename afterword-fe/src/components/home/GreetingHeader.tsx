import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

interface GreetingHeaderProps {
  userName: string;
  hour: number; // 0-23
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName, hour }) => {
  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View className="flex-row items-start justify-between mb-8 mt-2">
      <View className="flex-1">
        <Text className="font-sans text-sm text-slate mb-1">{getGreeting()},</Text>
        <Text className="font-serif text-3xl text-forest mb-2">{userName} 🦊</Text>
        <Text className="font-sans text-sm text-slate">Let's revisit something meaningful.</Text>
      </View>
      <Pressable 
        className="h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm border border-mist"
        onPress={() => { /* Not implemented yet */ }}
      >
        <Ionicons name="notifications-outline" size={20} color={Colors.forest} />
      </Pressable>
    </View>
  );
};
