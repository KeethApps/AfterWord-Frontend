import React, { useState } from 'react';
import { View, Text, Pressable, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../../constants/theme';
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

type Tab = (typeof TABS)[number];

/**
 * Responsive Navigation Bar.
 * Renders as a fixed bottom tab bar on mobile, and a side navigation menu on web.
 */
export const Navbar = ({ className = '' }: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  // Tracks which sidebar item is hovered (web only — Pressable's
  // onHoverIn/Out are no-ops on native, so this is safe to leave in).
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const isActiveTab = (tab: Tab) => pathname === tab.path;

  if (isWeb) {
    return (
      <View className={`w-64 bg-cream border-r border-border h-full ${className}`}>
        {/* Logo header */}
        <View className="px-6 pt-8 pb-6 border-b border-border">
          <Image
            source={require('../../../assets/logo/afterword-watermark-old.png')}
            resizeMode="contain"
            style={{ height: 90, width: 160 }}
            accessibilityLabel="AfterWord"
          />
        </View>

        <View className="px-4 pt-6 gap-y-1">
          {TABS.map((tab) => {
            const isActive = isActiveTab(tab);
            const isHovered = hoveredPath === tab.path;

            return (
              <Pressable
                key={tab.path}
                onPress={() => router.push(tab.path)}
                onHoverIn={() => setHoveredPath(tab.path)}
                onHoverOut={() => setHoveredPath(null)}
                className={`flex-row items-center px-3 py-2.5 rounded-lg ${
                  isActive ? 'bg-mist' : isHovered ? 'bg-mist/50' : 'bg-transparent'
                }`}
              >
                <Ionicons
                  name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
                  size={20}
                  color={isActive ? Colors.forest : Colors.slate}
                />
                <Text
                  className={`ml-3 font-sans text-[15px] ${
                    isActive ? 'font-sansBold text-forest' : 'text-slate'
                  }`}
                >
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Mobile bottom tab bar
  return (
    <View
      className={`absolute bottom-0 w-full border-t border-border flex-row justify-around items-center pt-3 ${className}`}
      style={{
        backgroundColor: Colors.white,
        paddingBottom: Math.max(insets.bottom, 12),
        ...Shadows.md,
      }}
    >
      {TABS.map((tab) => {
        const isActive = isActiveTab(tab);
        return (
          <Pressable
            key={tab.path}
            onPress={() => router.push(tab.path)}
            className="items-center justify-center flex-1"
          >
            {/* Active indicator bar */}
            <View
              className="h-0.5 w-6 rounded-full mb-1"
              style={{ backgroundColor: isActive ? Colors.forest : 'transparent' }}
            />
            <Ionicons
              name={(isActive ? tab.icon : `${tab.icon}-outline`) as any}
              size={22}
              color={isActive ? Colors.forest : Colors.slate}
            />
            <Text
              className={`text-[10px] mt-1 font-sans ${
                isActive ? 'text-forest font-sansBold' : 'text-slate'
              }`}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};