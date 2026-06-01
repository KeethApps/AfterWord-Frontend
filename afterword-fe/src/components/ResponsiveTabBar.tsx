import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/theme';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ResponsiveTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const insets = useSafeAreaInsets();
  
  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();

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
      case 'library': return isFocused ? 'library' : 'library-outline';
      case 'search': return isFocused ? 'search' : 'search-outline';
      case 'highlights': return isFocused ? 'bookmarks' : 'bookmarks-outline';
      case 'index': return isFocused ? 'home' : 'home-outline';
      case 'upload': return isFocused ? 'cloud-upload' : 'cloud-upload-outline';

      default: return 'ellipse';
    }
  };

  if (isLargeScreen) {
    // Sidebar for large screens (Web/Tablet)
    return (
      <View style={[styles.sidebar, { width: isSidebarCollapsed ? 80 : 240 }]}>
        <View style={styles.sidebarHeader}>
          {isSidebarCollapsed ? (
            <Pressable onPress={toggleSidebar} style={styles.collapseToggle}>
              <Ionicons name="menu" size={24} color={Colors.white} />
            </Pressable>
          ) : (
            <View style={styles.sidebarHeaderRow}>
              <Text style={styles.logoText}>AfterWord</Text>
              <Pressable onPress={toggleSidebar} style={styles.collapseToggle}>
                <Ionicons name="chevron-back" size={24} color={Colors.white} />
              </Pressable>
            </View>
          )}
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
                style={[
                  styles.sidebarItem,
                  isSidebarCollapsed && styles.sidebarItemCollapsed,
                  isFocused && styles.sidebarItemActive,
                ]}
              >
                <Ionicons 
                  name={getIconName(route.name, isFocused)} 
                  size={24} 
                  color={isFocused ? Colors.gold : Colors.mist} 
                  style={!isSidebarCollapsed && styles.sidebarIcon}
                />
                {!isSidebarCollapsed && (
                  <Text style={[styles.sidebarLabel, isFocused && styles.sidebarLabelActive]}>
                    {label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Floating Pill Bottom Tab Bar for small screens (Mobile)
  return (
    <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.pillBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;
          
          return (
            <Pressable
              key={route.key}
              onPress={() => handlePress(route, isFocused)}
              style={styles.pillItem}
            >
              {isFocused ? (
                <View style={styles.activeIconContainer}>
                  <View style={styles.floatingCircle}>
                    <Ionicons 
                      name={getIconName(route.name, isFocused)} 
                      size={24} 
                      color={Colors.white} 
                    />
                  </View>
                  <Text style={styles.activeLabel}>{label}</Text>
                </View>
              ) : (
                <View style={styles.inactiveIconContainer}>
                  <Ionicons 
                    name={getIconName(route.name, isFocused)} 
                    size={24} 
                    color={Colors.slate} 
                  />
                  <Text style={styles.inactiveLabel}>{label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
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
    backgroundColor: Colors.forest,
    paddingVertical: 32,
    display: 'flex',
    flexDirection: 'column',
    borderRightWidth: 1,
    borderRightColor: 'rgb(255, 255, 255)',
  },
  sidebarHeader: {
    marginBottom: 40,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
  },
  sidebarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapseToggle: {
    padding: 14,
  },
  logoText: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.white,
  },
  sidebarNav: {
    gap: 8,
    paddingHorizontal: 16,
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sidebarItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarIcon: {
    marginRight: 16,
  },
  sidebarLabel: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.mist,
  },
  sidebarLabelActive: {
    fontWeight: '700',
    color: Colors.white,
  },
  sidebarFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  userProfileCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontFamily: Fonts.sansBold,
    color: Colors.white,
    fontSize: 14,
  },
  userEmail: {
    fontFamily: Fonts.sans,
    color: Colors.mist,
    fontSize: 12,
    marginTop: 2,
  },

  // Pill Bar Styles (Mobile)
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  pillBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f1e8', // Dark pill background from image
    borderRadius: 40,
    height: 72,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    paddingHorizontal: 8,
  },
  pillItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  inactiveIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: Colors.slate,
    marginTop: 4,
  },
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
  },
  floatingCircle: {
    position: 'absolute',
    top: -18, // Break out of the pill
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E3A34', // Prominent purple/blue from image
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#1c1c1c',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.4,
    // shadowRadius: 8,
    elevation: 3,
    borderWidth: 4,
    borderColor: Colors.cream, // To give a cutout effect against background
  },
  activeLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    color: '#1c1c1c',
    position: 'absolute',
    bottom: 12, // Position text below the floating circle
  }
});
