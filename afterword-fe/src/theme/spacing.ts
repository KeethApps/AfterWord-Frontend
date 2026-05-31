/**
 * AfterWord — Spacing, Border Radius, Shadow Tokens
 */

export const spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
  // Layout
  sidebarWidth: 220,
  headerHeight: 64,
  contentPadding: 32,
} as const;

export const radius = {
  none:    0,
  sm:      6,
  md:      10,
  lg:      16,
  xl:      24,
  "2xl":   32,
  full:    9999,
  // Semantic
  card:    16,
  button:  10,
  pill:    9999,
  chip:    20,
  input:   10,
  modal:   20,
} as const;

export const shadows = {
  none: "none",
  sm:   "0 1px 4px rgba(15,46,40,0.06)",
  md:   "0 2px 12px rgba(15,46,40,0.08)",
  lg:   "0 4px 24px rgba(15,46,40,0.12)",
  xl:   "0 8px 40px rgba(15,46,40,0.16)",
  // Semantic
  card:    "0 2px 12px rgba(15,46,40,0.06)",
  cardHov: "0 4px 24px rgba(15,46,40,0.12)",
  sidebar: "2px 0 16px rgba(15,46,40,0.08)",
  modal:   "0 8px 48px rgba(15,46,40,0.20)",
} as const;
