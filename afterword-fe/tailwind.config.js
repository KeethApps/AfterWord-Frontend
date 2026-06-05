/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        forest: "#1E3A34",
        cream: "#F5F1E8",
        gold: "#C89B3C",
        slate: "#6B7280",
        border: "#E0D8C8",
        mist: "#E8E2D5",
        danger: "#D9383A",
        amber: "#D97706",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        sansBold: ["Inter_600SemiBold"],
        serif: ["Lora_400Regular"],
        serifBold: ["Lora_700Bold"],
      },
    },
  },
  plugins: [],
};
