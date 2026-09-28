import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../theme/ThemeContext";
import MainTabs from "./MainTabs";
import SurveyDetailScreen from "../screens/survey/SurveyDetailScreen";
import CreateSurveyScreen from "../screens/survey/CreateSurveyScreen";
import AnalyticsScreen from "../screens/survey/AnalyticsScreen";
import InviteScreen from "../screens/survey/InviteScreen";
import SurveyPreviewScreen from "../screens/survey/SurveyPreviewScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.bg },
        headerTitleStyle: { fontFamily: theme.typography.fontFamily.semibold, color: theme.colors.text, fontSize: 16 },
        headerTintColor: theme.colors.primary,
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="SurveyDetail" component={SurveyDetailScreen} options={{ title: "Survey" }} />
      <Stack.Screen name="CreateSurvey" component={CreateSurveyScreen} options={{ title: "New survey" }} />
      <Stack.Screen name="EditSurvey" component={CreateSurveyScreen} options={{ title: "Edit survey" }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: "Analytics" }} />
      <Stack.Screen name="Invite" component={InviteScreen} options={{ title: "Invite by email" }} />
      <Stack.Screen name="SurveyPreview" component={SurveyPreviewScreen} options={{ title: "Preview" }} />
    </Stack.Navigator>
  );
}
