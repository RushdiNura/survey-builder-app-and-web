import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertCircle } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import Button from "./Button";

// Consistent screen shell: safe-area background, and standard
// loading / error sub-states so every screen handles these the same way.
export default function Screen({ children, edges = ["top", "left", "right"], style, scroll = false }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenLoading({ label = "Loading…" }) {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
        {label}
      </Text>
    </View>
  );
}

export function ScreenError({ message, onRetry }) {
  const { theme } = useTheme();
  return (
    <View style={styles.center}>
      <AlertCircle size={26} color={theme.colors.danger} />
      <Text
        style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, textAlign: "center" }]}
      >
        {message}
      </Text>
      {onRetry && <Button title="Try again" variant="secondary" size="sm" onPress={onRetry} style={{ marginTop: 14 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 },
  label: { fontSize: 13.5, marginTop: 4 },
});
