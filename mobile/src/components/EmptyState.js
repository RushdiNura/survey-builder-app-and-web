import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import Button from "./Button";

export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      {Icon && (
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Icon size={28} color={theme.colors.textFaint} />
        </View>
      )}
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semibold }]}>
        {title}
      </Text>
      {message && (
        <Text style={[styles.message, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} size="sm" style={{ marginTop: 16 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 56, paddingHorizontal: 24 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { fontSize: 16, marginBottom: 4, textAlign: "center" },
  message: { fontSize: 13.5, textAlign: "center", lineHeight: 20 },
});
