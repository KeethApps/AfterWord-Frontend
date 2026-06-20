import React from "react";
import {
  Image,
  ImageStyle,
  ImageSourcePropType,
  StyleProp,
} from "react-native";

// ─── Variants ────────────────────────────────────────────────────────────────

export type FolioFoxVariant =
  | "reading"
  | "waving"
  | "sleeping"
  | "thinking"
  | "happy"
  | "sad"
  | "laptop"
  | "ghost"
  | "secondary"
  | "telescope"
  | "question"
  | "idea"
  | "heart"
  | "notebook"
  | "plant"
  | "drop"
  | "coffee"
  | "desk"
  | "jumping"
  | "confused"
  | "rain";

const foxVariants: Record<FolioFoxVariant, ImageSourcePropType> = {
  reading:   require("../../assets/crane/crane-reading.png"),
  waving:    require("../../assets/crane/crane-default.png"),
  sleeping:  require("../../assets/crane/crane-sleeping.png"),
  thinking:  require("../../assets/crane/crane-reading.png"),
  happy:     require("../../assets/crane/crane-default.png"),
  sad:       require("../../assets/crane/crane-sad.png"),
  laptop:    require("../../assets/crane/crane-laptop.png"),
  ghost:     require("../../assets/crane/crane-reading.png"),
  secondary: require("../../assets/crane/crane-reading.png"),
  telescope: require("../../assets/crane/crane-reading.png"),
  question:  require("../../assets/crane/crane-reading.png"),
  idea:      require("../../assets/crane/crane-reading.png"),
  heart:     require("../../assets/crane/crane-reading.png"),
  notebook:  require("../../assets/crane/crane-notebook.png"),
  plant:     require("../../assets/old_crane/crane-plant.png"),
  drop:      require("../../assets/crane/crane-reading.png"),
  coffee:    require("../../assets/old_crane/crane-coffee.png"),
  desk:      require("../../assets/crane/crane-books.png"),
  jumping:   require("../../assets/crane/crane-reading.png"),
  confused:  require("../../assets/crane/crane-reading.png"),
  rain:      require("../../assets/crane/crane-sad.png"),
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface FolioFoxProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
  variant?: FolioFoxVariant;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FolioFox({ size = 120, style, variant = "reading" }: FolioFoxProps) {
  return (
    <Image
      source={foxVariants[variant]}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}