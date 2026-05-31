import { Platform } from 'react-native';

export const Colors = {
  forest: '#1E3A34',
  cream: '#F5F1E8',
  gold: '#C89B3C',
  black: '#1C1C1C',
  white: '#FAFBFC',
  slate: '#6B7280',
  border: '#E0D8C8',
  light: {
    text: '#1C1C1C',
    background: '#F5F1E8',
    tint: '#1E3A34',
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#1E3A34',
  },
  dark: {
    text: '#FAFBFC',
    background: '#1E3A34',
    tint: '#C89B3C',
    icon: '#E0D8C8',
    tabIconDefault: '#E0D8C8',
    tabIconSelected: '#C89B3C',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'Lora_400Regular',
    serifBold: 'Lora_700Bold',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'Lora_400Regular',
    serifBold: 'Lora_700Bold',
  },
  web: {
    sans: 'Inter_400Regular, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'Lora_400Regular, Georgia, "Times New Roman", serif',
    serifBold: 'Lora_700Bold, Georgia, "Times New Roman", serif',
  },
});
