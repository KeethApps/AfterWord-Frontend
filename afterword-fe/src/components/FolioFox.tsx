import React from "react";
import { Image, ImageStyle } from "react-native";

interface FolioFoxProps {
  size?: number;
  style?: ImageStyle;
}

export function FolioFox({
  size = 120,
  style,
}: FolioFoxProps) {
  return (
    <Image
      source={require("../../assets/fox/fox-reading.png")}
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