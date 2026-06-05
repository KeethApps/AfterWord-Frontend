import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NavbarProps {
  className?: string;
}

const TABS = [
  { name: 'Home', path: '/', icon: 'home' },
  { name: 'Library', path: '/library', icon: 'library' },
  { name: 'Search', path: '/search', icon: 'search' },
  { name: 'Highlights', path: '/highlights', icon: 'bookmark' },
  { name: 'Upload', path: '/upload', icon: 'cloud-upload' },
] as const;

/**
 * Responsive Navigation Bar.
 * Renders as a fixed bottom tab bar on mobile, and a side navigation menu on web.
 */
export const Navbar = ({ className = '' }: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View className={`w-64 bg-cream border-r border-border h-full p-6 ${className}`}>
        <View className="mb-8 flex-row items-center">
          <Ionicons name="book" size={28} color={Colors.forest} />
          <Text className="font-serifBold text-2xl text-forest ml-2">AfterWord</Text>
        </View>
        <View className="gap-y-4">
          {TABS.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Pressable 
                key={tab.path}
                onPress={() => router.push(tab.path)}
                className={`flex-row items-center p-3 rounded-lg ${isActive ? 'bg-mist' : 'bg-transparent'}`}
              >
                <Ionicons 
                  name={isActive ? tab.icon as any : `${tab.icon}-outline` as any} 
                  size={24} 
                  color={isActive ? Colors.forest : Colors.slate} 
                />
                <Text className={`ml-4 font-sans text-base ${isActive ? 'font-sansBold text-forest' : 'text-slate'}`}>
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Mobile Bottom Tab Bar
  return (
    <View 
      className={`absolute bottom-0 w-full bg-white border-t border-border flex-row justify-around items-center pt-3 shadow-md ${className}`}
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <Pressable 
            key={tab.path}
            onPress={() => router.push(tab.path)}
            className="items-center justify-center flex-1"
          >
            <Ionicons 
              name={isActive ? tab.icon as any : `${tab.icon}-outline` as any} 
              size={24} 
              color={isActive ? Colors.forest : Colors.slate} 
            />
            <Text 
              className={`text-[10px] mt-1 font-sans ${isActive ? 'text-forest font-sansBold' : 'text-slate'}`}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
