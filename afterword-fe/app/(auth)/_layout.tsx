import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "../../constants/theme";

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.forest} />
      </View>
    );
  }

  // If already authenticated, redirect into the app
  if (session) {
    return <Redirect href="/(app)/(tabs)/library" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: Colors.cream } }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
