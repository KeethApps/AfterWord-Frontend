import React from 'react';
import { View, Text } from 'react-native';
import { FolioFox } from '../FolioFox';
import { Colors, Fonts, Spacing } from '../../../constants/theme';

interface GreetingHeaderProps {
  userName: string;
  hour: number; // 0-23
  hasContent: boolean; // true if library has books/highlights
  variant?: 'reading' | 'building' | 'loading' | 'thinking';
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName,
  hour,
  hasContent,
  variant = 'reading',
}) => {
  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getSubtext = () => {
    if (!hasContent) return "Let's build your library of ideas.";
    return "Let's revisit something meaningful.";
  };

  // Select fox variant based on library state
  const foxVariant = hasContent ? 'reading' : 'thinking';

  return (
    <View className="mb-6">
      {/* Greeting + Fox Row */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.sans,
              color: Colors.slate,
              marginBottom: 2,
            }}
          >
            {getGreeting()},
          </Text>
          <View className="flex-row items-center gap-2">
            <Text
              style={{
                fontSize: 32,
                fontFamily: Fonts.serif,
                fontWeight: '600',
                color: Colors.forest,
              }}
            >
              {userName}
            </Text>
            {/* Fox emoji as fallback; replace with FolioFox component */}
            <Text style={{ fontSize: 24 }}>🦊</Text>
          </View>
        </View>

        {/* FolioFox Illustration (Right side) */}
        <View className="ml-4">
          <FolioFox variant={foxVariant} size={140} />
        </View>
      </View>

      {/* Subtext Below */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: Fonts.sans,
          color: Colors.slate,
          lineHeight: 20,
        }}
      >
        {getSubtext()}
      </Text>
    </View>
  );
};