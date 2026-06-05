import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

export interface SkeletonLoaderProps {
  variant: 'card' | 'listItem' | 'highlight';
  count?: number;
  className?: string;
}

const Shimmer = ({ className = '' }: { className?: string }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} className={`bg-mist ${className}`} />;
};

/**
 * Animated placeholder for loading states.
 * Replicates the shape of the main content blocks (cards, lists, highlights).
 */
export const SkeletonLoader = ({ variant, count = 5, className = '' }: SkeletonLoaderProps) => {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <View className={`flex-row flex-wrap gap-4 ${className}`}>
        {items.map((_, i) => (
          <View key={i} className="w-[120px] gap-y-2">
            <Shimmer className="w-full h-[180px] rounded-md" />
            <Shimmer className="w-3/4 h-4 rounded-full" />
            <Shimmer className="w-1/2 h-3 rounded-full" />
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'highlight') {
    return (
      <View className={`gap-y-4 ${className}`}>
        {items.map((_, i) => (
          <View key={i} className="bg-surface rounded-xl p-4 shadow-sm gap-y-3">
            <Shimmer className="w-full h-4 rounded-full" />
            <Shimmer className="w-5/6 h-4 rounded-full" />
            <Shimmer className="w-4/6 h-4 rounded-full" />
            <View className="flex-row justify-between mt-2">
              <Shimmer className="w-1/3 h-3 rounded-full" />
              <Shimmer className="w-6 h-6 rounded-full" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // listItem
  return (
    <View className={`gap-y-4 ${className}`}>
      {items.map((_, i) => (
        <View key={i} className="flex-row gap-x-4 p-2 items-center border-b border-mist">
          <View className="flex-1 gap-y-2">
            <Shimmer className="w-3/4 h-4 rounded-full" />
            <Shimmer className="w-1/2 h-3 rounded-full" />
          </View>
          <Shimmer className="w-6 h-6 rounded-full" />
        </View>
      ))}
    </View>
  );
};
