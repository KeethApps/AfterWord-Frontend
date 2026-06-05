import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

export type FoxVariant = "reading" | "laptop" | "happy" | "thinking" | "sad";

export interface FolioFoxProps {
  variant?: FoxVariant;
  size?: number;
  className?: string;
  style?: any; // Legacy support
}

/**
 * Mascot component for rendering the Folio Fox in various emotional states/poses.
 * Currently uses a single placeholder asset until specific variants are added.
 */
export const FolioFox = ({ variant = "happy", size = 200, className = '', style }: FolioFoxProps) => {
  // TODO: Map variants to specific local assets when available.
  // Using the fallback placeholder requested by the user.
  const source = require('../../../assets/fox/fox-icon.png');

  return (
    <View className={`items-center justify-center ${className}`} style={style}>
      <Image 
        source={source} 
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </View>
  );
};
