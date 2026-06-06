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
| "plant"
| "drop"
| "coffee"
| "desk"
| "jumping"
| "confused"
| "rain";

const foxVariants: Record<FolioFoxVariant, ImageSourcePropType> = {
reading: require("../../assets/crane/crane-reading.png"),
waving: require("../../assets/crane/crane-default.png"),
books: require("../../assets/crane/crane-books.png"),
sleeping: require("../../assets/crane/crane-sleeping.png"),
thinking: require("../../assets/crane/crane-reading.png"),
happy: require("../../assets/crane/crane-default.png"),
sad: require("../../assets/crane/crane-reading.png"),
laptop: require("../../assets/crane/crane-laptop.png"),
ghost: require("../../assets/crane/crane-reading.png"),
secondary: require("../../assets/crane/crane-reading.png"),
telescope: require("../../assets/crane/crane-reading.png"), // fallback placeholder
question: require("../../assets/crane/crane-question.png"), // fallback placeholder
idea: require("../../assets/crane/crane-reading.png"), // fallback placeholder
heart: require("../../assets/crane/crane-reading.png"), // fallback placeholder
notebook: require("../../assets/crane/crane-notebook.png"), // fallback placeholder
plant: require("../../assets/crane/crane-plant.png"), // fallback placeholder
drop: require("../../assets/crane/crane-reading.png"), // fallback placeholder
coffee: require("../../assets/crane/crane-coffee.png"), // fallback placeholder
desk: require("../../assets/crane/crane-books.png"), // fallback placeholder
jumping: require("../../assets/crane/crane-reading.png"), // fallback placeholder
confused: require("../../assets/crane/crane-reading.png"), // fallback placeholder
rain: require("../../assets/crane/crane-sad.png"), // fallback placeholder
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
