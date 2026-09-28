import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function Input({
  label,
  error,
  hint,
  containerStyle,
  icon: Icon,
  rightElement,
  ...textInputProps
}) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border;

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.wrapper,
          {
            borderColor,
            backgroundColor: theme.colors.surface,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        {Icon && <Icon size={17} color={theme.colors.textFaint} style={{ marginRight: 8 }} />}
        <TextInput
          placeholderTextColor={theme.colors.textFaint}
          style={[styles.input, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular }]}
          onFocus={(e) => {
            setFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={[styles.hint, { color: theme.colors.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: theme.colors.textFaint }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  hint: { fontSize: 12, marginTop: 6 },
});
