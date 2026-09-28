import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const VARIANT_KEYS = {
  draft: { tint: "surfaceAlt", text: "textMuted" },
  published: { tint: "positiveTint", text: "positive" },
  closed: { tint: "dangerTint", text: "danger" },
  neutral: { tint: "surfaceAlt", text: "textMuted" },
};

export default function Badge({ label, variant = "neutral" }) {
  const { theme } = useTheme();
  const v = VARIANT_KEYS[variant] || VARIANT_KEYS.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: theme.colors[v.tint] }]}>
      <Text
        style={{
          color: theme.colors[v.text],
          fontSize: 10.5,
          fontFamily: theme.typography.fontFamily.semibold,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, alignSelf: "flex-start" },
});
