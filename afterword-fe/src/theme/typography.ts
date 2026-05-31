import { Platform } from 'react-native';

/**
 * AfterWord — Typography Tokens
 */
export const typography = {
  fonts: Platform.select({
    ios: {
      display: "Lora_400Regular",
      displayBold: "Lora_700Bold",
      body: "Inter_400Regular",
      bodyMedium: "Inter_600SemiBold",
      bodyBold: "Inter_700Bold",
      mono: "Courier New",
    },
    default: {
      display: "Lora_400Regular",
      displayBold: "Lora_700Bold",
      body: "Inter_400Regular",
      bodyMedium: "Inter_600SemiBold",
      bodyBold: "Inter_700Bold",
      mono: "monospace",
    },
    web: {
      display: "Lora_400Regular, Georgia, 'Times New Roman', serif",
      displayBold: "Lora_700Bold, Georgia, 'Times New Roman', serif",
      body: "Inter_400Regular, system-ui, -apple-system, sans-serif",
      bodyMedium: "Inter_600SemiBold, system-ui, -apple-system, sans-serif",
      bodyBold: "Inter_700Bold, system-ui, -apple-system, sans-serif",
      mono: "'Courier New', monospace",
    }
  }),

  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   22,
    "2xl": 28,
    "3xl": 36,
    "4xl": 48,
  },

  weights: {
    light:    "300",
    regular:  "400",
    medium:   "500",
    semibold: "600",
    bold:     "700",
  },

  lineHeights: {
    tight:   1.2,
    snug:    1.4,
    normal:  1.6,
    relaxed: 1.8,
  },

  letterSpacing: {
    tight:  -0.5,
    normal:  0,
    wide:    0.5,
    wider:   1,
    widest:  2,
  },
} as const;
