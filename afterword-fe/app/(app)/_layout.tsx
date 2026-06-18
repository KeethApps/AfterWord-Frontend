import React from "react";
import { Stack } from "expo-router";
import { Colors } from "../../constants/theme";

// Auth + onboarding gating now lives entirely in the root layout's
// Stack.Protected guards. By the time this layout mounts, the root has
// already guaranteed session && hasOnboarded are both true — so this file
// only needs to define the authenticated app's own internal stack.
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: Colors.cream },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}