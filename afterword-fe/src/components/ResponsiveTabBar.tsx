import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Platform, Image } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/theme';
import { useLayoutStore } from '../../hooks/useLayoutStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Linking } from 'react-native';

export function ResponsiveTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { isSidebarCollapsed, toggleSidebar } = useLayoutStore();


  const APP_VERSION = Constants.expoConfig?.version ?? '2.1.0';

  // inside the component, alongside your other handlers
  const handleOpenGuides = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL('https://getafterword.vercel.app');
  };

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
              <Image
                source={require('../../assets/logo/logo-with-crane.png')}
                resizeMode="contain"
                style={{ height: 32, width: 160 }}
                accessibilityLabel="AfterWord"
              />
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

        {/* Account footer */}
        <View style={styles.sidebarFooter}>
          <View style={[styles.userProfile, isSidebarCollapsed && styles.userProfileCollapsed]}>
            {!isSidebarCollapsed && (
              <>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>AfterWord Preview</Text>
                  <Pressable onPress={handleOpenGuides} hitSlop={4}>
                    <Text style={styles.userMeta} numberOfLines={1}>
                      v{APP_VERSION} · <Text style={styles.guidesLink}>Learn More ↗</Text>
                    </Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
                  <Ionicons name="settings-outline" size={18} color={Colors.mist} />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Floating Pill Bottom Tab Bar for small screens (Mobile) — unchanged
  return (
    <View style={styles.bottomBarContainer}>
      <View style={[styles.pillBar, { height: 64 + insets.bottom, paddingBottom: insets.bottom }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;
          const isCenter = route.name === 'search';

          if (isCenter) {
            return (
              <Pressable key={route.key} onPress={() => handlePress(route, isFocused)} style={styles.pillItem}>
                <View style={styles.centerButtonContainer}>
                  <View style={[styles.floatingCircle, isFocused && styles.floatingCircleActive]}>
                    <Ionicons name={getIconName(route.name, isFocused)} size={28} color={Colors.white} />
                  </View>
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable key={route.key} onPress={() => handlePress(route, isFocused)} style={styles.pillItem}>
              <View style={styles.standardIconContainer}>
                <Ionicons name={getIconName(route.name, isFocused)} size={24} color={isFocused ? '#1c1c1c' : Colors.slate} />
                <Text style={[styles.standardLabel, isFocused && styles.activeText]}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRightColor: 'rgba(255, 255, 255, 0.08)', // was solid white — too stark against forest
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
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
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    color: Colors.white,
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

  // Pill Bar Styles (Mobile) — unchanged
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  pillBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 64,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    paddingHorizontal: 8,
  },
  pillItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  standardIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  standardLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: Colors.slate,
    marginTop: 4,
  },
  activeText: {
    color: '#1c1c1c',
    fontFamily: Fonts.sansBold,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
    width: 60,
  },
  floatingCircle: {
    position: 'absolute',
    top: -24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#353344',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  floatingCircleActive: {
    backgroundColor: '#2A2836',
  },

  // add to styles
userMeta: {
  fontFamily: Fonts.sans,
  color: Colors.mist,
  fontSize: 12,
  marginTop: 2,
},
guidesLink: {
  color: Colors.gold,
  fontFamily: Fonts.sansBold,
},
});