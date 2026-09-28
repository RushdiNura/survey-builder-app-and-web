import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from "react-native";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { Sun, Moon, Smartphone, LogOut, Pencil } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/client";
import Screen from "../../components/Screen";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Smartphone },
];

export default function ProfileScreen() {
  const { theme, preference, setThemePreference } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [busy, setBusy] = useState(false);

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSaveName() {
    if (!name.trim()) {
      showToast("Name can't be empty", "error");
      return;
    }
    setBusy(true);
    try {
      await updateProfile({ name: name.trim() });
      showToast("Profile updated", "success");
      setEditing(false);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    Alert.alert("Log out?", "You'll need to sign in again to manage your surveys.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold, fontSize: 24, marginBottom: 18 }}>
          Profile
        </Text>

        <Card>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: "#FFFFFF", fontFamily: theme.typography.fontFamily.bold, fontSize: 18 }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.semibold, fontSize: 16 }}>{user?.name}</Text>
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 13 }}>{user?.email}</Text>
            </View>
            {!editing && (
              <Pressable onPress={() => setEditing(true)} hitSlop={8}>
                <Pencil size={16} color={theme.colors.textMuted} />
              </Pressable>
            )}
          </View>

          {editing && (
            <View style={{ marginTop: 16 }}>
              <Input label="Name" value={name} onChangeText={setName} />
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <Button title="Save" size="sm" onPress={handleSaveName} loading={busy} />
                <Button
                  title="Cancel"
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    setName(user?.name || "");
                    setEditing(false);
                  }}
                />
              </View>
            </View>
          )}
        </Card>

        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold }]}>
          Appearance
        </Text>
        <View style={[styles.segment, { backgroundColor: theme.colors.surfaceAlt }]}>
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = preference === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setThemePreference(value);
                }}
                style={[styles.segmentItem, active && { backgroundColor: theme.colors.surface }, active && theme.shadow]}
              >
                <Icon size={14} color={active ? theme.colors.primary : theme.colors.textMuted} />
                <Text
                  style={{
                    color: active ? theme.colors.text : theme.colors.textMuted,
                    fontFamily: theme.typography.fontFamily.medium,
                    fontSize: 13,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button title="Log out" icon={LogOut} variant="danger" onPress={handleLogout} fullWidth style={{ marginTop: 28 }} />

        <Text style={{ color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.regular, fontSize: 12, textAlign: "center", marginTop: 20 }}>
          SurveyBuilder v{Constants.expoConfig?.version || "1.0.0"}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  sectionLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 24, marginBottom: 10 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4 },
  segmentItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 9 },
});
