import React from 'react';
import { View, ScrollView, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenContainerProps {
  children: React.ReactNode;
  padded?: boolean;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Main container for screens. Handles safe areas, scrolling, and responsive 
 * max-width constraints for web layouts.
 */
export const ScreenContainer = ({
  children,
  padded = true,
  scrollable = true,
  className = '',
  contentClassName = '',
}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  
  // Extra padding at bottom for the fixed navbar on mobile
  const bottomPadding = Platform.OS === 'web' ? 40 : Math.max(insets.bottom, 20) + 80;

  const innerContent = (
    <View 
      className={`flex-1 w-full max-w-[1000px] self-center ${padded ? 'px-4 web:px-10' : ''} ${contentClassName}`}
      style={{
        paddingTop: padded ? Math.max(insets.top, 20) : 0,
      }}
    >
      {children}
    </View>
  );

  if (!scrollable) {
    return (
      <View 
        className={`flex-1 bg-cream ${className}`}
        style={{ paddingBottom: bottomPadding }}
      >
        {innerContent}
      </View>
    );
  }

  return (
    <ScrollView
      className={`flex-1 bg-cream ${className}`}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      {innerContent}
    </ScrollView>
  );
};
