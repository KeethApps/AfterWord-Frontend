import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/theme";

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.forest} />
      </View>
    );
  }

  // If no session, redirect to sign in
  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: Colors.cream } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
