import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface OfflineBannerProps {
  onRetry?: () => void;
}

/**
 * Global banner that appears at the top of the screen when the device loses network connectivity.
 */
export const OfflineBanner = ({ onRetry }: OfflineBannerProps) => {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();

  // Determine if offline. NetInfo can take a moment to resolve on mount, so we check for strict false.
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  if (!isOffline) return null;

  return (
    <View 
      className="bg-danger px-4 py-3 flex-row items-center justify-between z-50 absolute top-0 w-full shadow-sm"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons name="cloud-offline" size={20} color="#ffffff" />
        <Text className="font-sans text-white ml-2 flex-1">No internet connection</Text>
      </View>
      
      {onRetry && (
        <Pressable 
          onPress={onRetry} 
          className="px-3 py-1 bg-white/25 rounded-full ml-2"
        >
          <Text className="font-sansBold text-white text-xs">Retry</Text>
        </Pressable>
      )}
    </View>
  );
};
