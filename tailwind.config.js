/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // AfterWord design system colors from mockup
        forest:   "#0F2E28",   // deep dark green — primary brand
        amber:    "#E9C46A",   // warm gold — accent / highlights
        cream:    "#F4EFE6",   // warm off-white — background
        mist:     "#EDE6D5",   // slightly darker cream — card bg / borders
        slate:    "#6B7280",   // muted gray — secondary text
        crimson:  "#D64545",   // alert red
        // semantic aliases
        background:  "#F4EFE6",
        surface:     "#FFFFFF",
        surfaceAlt:  "#EDE6D5",
        primary:     "#0F2E28",
        accent:      "#E9C46A",
        textPrimary: "#0F2E28",
        textMuted:   "#6B7280",
        border:      "#E0D8C8",
        danger:      "#D64545",
      },
      fontFamily: {
        serif:   ["Georgia", "serif"],
        display: ["Georgia", "serif"],
        sans:    ["system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
        btn:  "10px",
      },
      boxShadow: {
        card:    "0 2px 12px rgba(15,46,40,0.06)",
        cardHov: "0 4px 24px rgba(15,46,40,0.12)",
        sidebar: "2px 0 16px rgba(15,46,40,0.06)",
      },
      spacing: {
        sidebar: "220px",
        header:  "64px",
      },
    },
  },
  plugins: [],
};
