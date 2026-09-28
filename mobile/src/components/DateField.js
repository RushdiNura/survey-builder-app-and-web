import React, { useState } from "react";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, X } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";

// Wraps @react-native-community/datetimepicker with consistent styling and
// platform-appropriate behavior (Android shows a native dialog on tap; iOS
// shows an inline spinner until confirmed).
export default function DateField({ label, value, onChange, mode = "date", hint, minimumDate }) {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(event, selectedDate) {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selectedDate) onChange(selectedDate);
    } else {
      if (selectedDate) onChange(selectedDate);
    }
  }

  const formatted = value
    ? mode === "datetime"
      ? value.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
      : value.toLocaleDateString()
    : null;

  return (
    <View>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium }]}>
          {label}
        </Text>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[styles.field, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        >
          <Calendar size={16} color={theme.colors.textFaint} />
          <Text
            style={{
              color: formatted ? theme.colors.text : theme.colors.textFaint,
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: 14,
            }}
          >
            {formatted || (mode === "datetime" ? "Not scheduled" : "No expiration")}
          </Text>
        </Pressable>
        {value && (
          <Pressable onPress={() => onChange(null)} hitSlop={8} style={styles.clearButton}>
            <X size={15} color={theme.colors.textFaint} />
          </Pressable>
        )}
      </View>
      {hint && <Text style={[styles.hint, { color: theme.colors.textFaint }]}>{hint}</Text>}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}

      {showPicker && Platform.OS === "ios" && (
        <Pressable onPress={() => setShowPicker(false)} style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ color: "#FFFFFF", fontFamily: theme.typography.fontFamily.semibold, fontSize: 13 }}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  clearButton: { padding: 6 },
  hint: { fontSize: 12, marginTop: 6 },
  doneButton: { alignSelf: "flex-end", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginTop: 8 },
});
