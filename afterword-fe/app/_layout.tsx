import React, { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Lora_400Regular, Lora_500Medium, Lora_700Bold } from "@expo-google-fonts/lora";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { OnboardingProvider, useOnboarding } from "../hooks/OnboardingContext";
import "../global.css";

// Prevent the splash screen from auto-hiding before fonts AND auth/onboarding
// state are both resolved. Hiding it on fonts alone (the old behavior) left
// a window where the Stack could mount with stale guard values and briefly
// flash the wrong screen before re-rendering correctly.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Lora_400Regular,
    Lora_500Medium,
    Lora_700Bold,
  });

  const fontsReady = fontsLoaded || fontError;

  // Fonts must load before anything renders, but auth/onboarding readiness
  // is checked inside RootNavigator (which is below the OnboardingProvider).
  if (!fontsReady) {
    return null;
  }

  return (
    <OnboardingProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </OnboardingProvider>
  );
}

/**
 * Inner component that consumes both auth and onboarding context.
 * Separated so OnboardingProvider is above useOnboarding().
 */
function RootNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { hasOnboarded } = useOnboarding();

  const authReady = !authLoading && hasOnboarded !== null;

  useEffect(() => {
    if (authReady) {
      SplashScreen.hideAsync();
    }
  }, [authReady]);

  // Keep the native splash screen visible (render nothing) until every
  // piece of state the routing guards depend on has actually loaded.
  if (!authReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#F5F1E8" },
        }}
      >
        {/*
          Order matters here, and it's deliberately NOT "auth first": the
          onboarding carousel is a pre-auth intro (its own CTAs route to
          sign-in/sign-up), so a first-time, signed-out user should see
          onboarding before they ever reach the auth screens — not after.
          Each guard is mutually exclusive, so exactly one group is ever
          reachable at a time.
        */}
        <Stack.Protected guard={!hasOnboarded}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={hasOnboarded && !session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={hasOnboarded && !!session}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}