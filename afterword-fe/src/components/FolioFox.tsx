import React, { useEffect, useRef } from "react";
import {
Animated,
Easing,
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
| "plant";

const foxVariants: Record<FolioFoxVariant, ImageSourcePropType> = {
reading: require("../../assets/fox/fox-reading.png"),
waving: require("../../assets/fox/fox-books.png"),
sleeping: require("../../assets/fox/fox-reading.png"),
thinking: require("../../assets/fox/fox-reading.png"),
happy: require("../../assets/fox/fox-reading.png"),
sad: require("../../assets/fox/fox-waiting.png"),
laptop: require("../../assets/fox/laptop.png"),
ghost: require("../../assets/fox/fox-reading.png"),
secondary: require("../../assets/fox/fox-reading.png"),
telescope: require("../../assets/fox/fox-reading.png"), // fallback placeholder
question: require("../../assets/fox/fox-reading.png"), // fallback placeholder
idea: require("../../assets/fox/fox-reading.png"), // fallback placeholder
heart: require("../../assets/fox/fox-reading.png"), // fallback placeholder
notebook: require("../../assets/fox/fox-reading.png"), // fallback placeholder
plant: require("../../assets/fox/fox-reading.png"), // fallback placeholder
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface FolioFoxProps {
size?: number;
style?: StyleProp<ImageStyle>;
variant?: FolioFoxVariant;

// Optional animation toggle
animated?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FolioFox({
size = 120,
style,
variant = "reading",
animated = true,
}: FolioFoxProps) {
// Subtle floating animation
const floatAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
if (!animated) return;


const loop = Animated.loop(
  Animated.sequence([
    Animated.timing(floatAnim, {
      toValue: -5,
      duration: 1800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(floatAnim, {
      toValue: 0,
      duration: 1800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
  ])
);

loop.start();

return () => {
  loop.stop();
};


}, [animated]);

return (
<Animated.Image
source={foxVariants[variant]}
resizeMode="contain"
style={[
{
width: size,
height: size,
transform: animated
? [{ translateY: floatAnim }]
: undefined,
},
style,
]}
/>
);
}
