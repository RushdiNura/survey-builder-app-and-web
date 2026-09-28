import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function Card({ children, style, noPadding = false }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: noPadding ? 0 : 16,
        },
        theme.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}
