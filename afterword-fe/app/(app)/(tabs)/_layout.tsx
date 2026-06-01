import React from 'react';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { ResponsiveTabBar } from "../../../src/components/ResponsiveTabBar";
import { Colors } from '../../../constants/theme';
import { useLayoutStore } from '../../../hooks/useLayoutStore';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { isSidebarCollapsed } = useLayoutStore();

  const sidebarWidth = isSidebarCollapsed ? 80 : 240;

  return (
    <Tabs
      tabBar={(props) => <ResponsiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // On large screens, offset the content area so it doesn't underlap the sidebar
        sceneStyle: isLargeScreen 
          ? { marginLeft: sidebarWidth, backgroundColor: Colors.cream } 
          : { backgroundColor: Colors.cream },
        // Use a subtle fade or no animation for tab switches
        animation: 'shift', // React Navigation 7 bottom tabs animation
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="upload" options={{ title: 'Upload' }} />
      <Tabs.Screen name="highlights" options={{ title: 'Highlights' }} />
    </Tabs>
  );
}
