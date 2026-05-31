import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/theme';

export function ResponsiveTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const handlePress = (route: any, isFocused: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const getIconName = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'index': return isFocused ? 'home' : 'home-outline';
      case 'library': return isFocused ? 'library' : 'library-outline';
      case 'search': return isFocused ? 'search' : 'search-outline';
      case 'upload': return isFocused ? 'cloud-upload' : 'cloud-upload-outline';
      case 'settings': return isFocused ? 'settings' : 'settings-outline';
      default: return 'ellipse';
    }
  };

  if (isLargeScreen) {
    // Sidebar for large screens (Web/Tablet)
    return (
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.logoText}>AfterWord</Text>
        </View>
        <View style={styles.sidebarNav}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.title !== undefined ? options.title : route.name;
            const isFocused = state.index === index;

            return (
              <Pressable
                key={route.key}
                onPress={() => handlePress(route, isFocused)}
                style={[styles.sidebarItem, isFocused && styles.sidebarItemActive]}
              >
                <Ionicons 
                  name={getIconName(route.name, isFocused)} 
                  size={20} 
                  color={isFocused ? Colors.gold : Colors.white} 
                  style={styles.sidebarIcon}
                />
                <Text style={[styles.sidebarLabel, isFocused && styles.sidebarLabelActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Bottom Tab Bar for small screens (Mobile)
  return (
    <View style={styles.bottomBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        return (
          <Pressable
            key={route.key}
            onPress={() => handlePress(route, isFocused)}
            style={styles.bottomBarItem}
          >
            <Ionicons 
              name={getIconName(route.name, isFocused)} 
              size={24} 
              color={isFocused ? Colors.forest : Colors.slate} 
            />
            <Text style={[styles.bottomBarLabel, isFocused && styles.bottomBarLabelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Sidebar Styles
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 240,
    backgroundColor: Colors.forest,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  sidebarHeader: {
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  logoText: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.white,
  },
  sidebarNav: {
    gap: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarIcon: {
    marginRight: 12,
  },
  sidebarLabel: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.white,
  },
  sidebarLabelActive: {
    fontWeight: '600',
    color: Colors.gold,
  },

  // Bottom Bar Styles
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  bottomBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    marginTop: 4,
    color: Colors.slate,
  },
  bottomBarLabelActive: {
    color: Colors.forest,
    fontWeight: '600',
  },
});
