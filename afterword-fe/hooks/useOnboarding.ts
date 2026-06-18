import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@afterword_has_onboarded";

export function useOnboarding() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasOnboarded(value === "");
      } catch (error) {
        setHasOnboarded(false);
      }
    }
    checkOnboarding();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      setHasOnboarded(true);
    } catch (error) {
      console.error("Failed to save onboarding state", error);
    }
  };

  return { hasOnboarded, completeOnboarding };
}
