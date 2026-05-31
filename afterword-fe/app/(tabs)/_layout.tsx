import React from 'react';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { ResponsiveTabBar } from '../../src/components/ResponsiveTabBar';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 700;

  return (
    <Tabs
      tabBar={(props) => <ResponsiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // On large screens, the sidebar is 240px wide and fixed to the left.
        // We offset the content area so it doesn't underlap the sidebar.
        sceneStyle: isLargeScreen ? { marginLeft: 240, backgroundColor: Colors.cream } : { backgroundColor: Colors.cream },
        // Use a subtle fade or no animation for tab switches
        animation: 'shift', // React Navigation 7 bottom tabs animation
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="upload" options={{ title: 'Upload' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
