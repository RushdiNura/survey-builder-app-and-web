import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { appStorage } from "../utils/storage";
import { ScreenLoading } from "../components/Screen";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

const ONBOARDING_KEY = "onboarding-complete";

export default function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { theme, isDark } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState(null); // null = not yet known

  useEffect(() => {
    appStorage.get(ONBOARDING_KEY).then((v) => setOnboardingComplete(v === "true"));
  }, []);

  async function completeOnboarding() {
    await appStorage.set(ONBOARDING_KEY, "true");
    setOnboardingComplete(true);
  }

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.bg,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  if (authLoading || onboardingComplete === null) {
    return <ScreenLoading label="Loading your account…" />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!onboardingComplete ? (
        <OnboardingScreen onDone={completeOnboarding} />
      ) : user ? (
        <AppStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
