import React from "react";
import { Image, ImageStyle, ImageSourcePropType } from "react-native";

interface FolioFoxProps {
  size?: number;
  style?: ImageStyle;
  variant?: "reading" | "waving" | "sleeping" | "thinking";
}

const foxVariants: Record<string, ImageSourcePropType> = {
  default: require("../../assets/fox/fox-reading.png"),
  laptop: require("../../assets/fox/fox-reading.png"),
  happy: require("../../assets/fox/fox-reading.png"),
  thinking: require("../../assets/fox/fox-reading.png"),
  ghost: require("../../assets/fox/fox-reading.png"),
  secondary: require("../../assets/fox/fox-reading.png"),
  sad: require("../../assets/fox/fox-waiting.png"),

};

export function FolioFox({
  size = 120,
  style,
  variant = "reading",
}: FolioFoxProps) {
  return (
    <Image
      source={foxVariants[variant]}
      style={[
        {
          width: size,
          height: size,
          resizeMode: "contain",
        },
        style,
      ]}
    />
  );
}