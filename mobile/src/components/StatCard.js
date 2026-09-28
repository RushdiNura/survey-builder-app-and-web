import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import Card from "./Card";

export default function StatCard({ label, value, icon: Icon }) {
  const { theme } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {Icon && <Icon size={14} color={theme.colors.textFaint} />}
        <Text
          style={{
            color: theme.colors.textMuted,
            fontFamily: theme.typography.fontFamily.semibold,
            fontSize: 10.5,
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold, fontSize: 24, marginTop: 6 }}>
        {value}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
});
