/**
 * AfterWord — Color Tokens
 * Sourced from the mockup's color palette swatch.
 */
export const colors = {
  // Core palette
  forest:    "#1E3A34",   // deep dark green — brand primary
  amber:     "#C89B3C",   // warm gold — accent, stars, CTAs
  cream:     "#F5F1E8",   // warm off-white — app background
  mist:      "#EBE6D8",   // slightly darker cream — card bg / dividers
  slate:     "#6B7280",   // muted gray — secondary text / icons
  crimson:   "#D64545",   // alert red — errors / danger

  // Semantic
  background:  "#F5F1E8",
  surface:     "#FAFBFC",
  surfaceAlt:  "#EBE6D8",
  border:      "#E0D8C8",
  borderDark:  "#C8BFA8",

  // Text
  textPrimary:   "#1C1C1C",
  textSecondary: "#4A5C58",
  textMuted:     "#6B7280",
  textInverse:   "#FAFBFC",

  // Interactive
  primary:       "#1E3A34",
  primaryHover:  "#152A25",
  accentHover:   "#A87B20",

  // Status
  success:  "#2E7D5A",
  warning:  "#C89B3C",
  error:    "#D64545",
  info:     "#4A8FAB",

  // Sidebar
  sidebarBg:          "#1E3A34",
  sidebarText:        "rgba(255,255,255,0.7)",
  sidebarActiveText:  "#FAFBFC",
  sidebarActiveBg:    "rgba(200,155,60,0.15)",
  sidebarActiveAccent:"#C89B3C",
} as const;

export type ColorKey = keyof typeof colors;
