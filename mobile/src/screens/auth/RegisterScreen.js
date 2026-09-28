import React, { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { Mail, Lock, User, ClipboardList } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/client";
import { validateRegister } from "../../utils/validators";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    const validation = validateRegister(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
    } catch (err) {
      showToast(getErrorMessage(err, "Registration failed"), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <ClipboardList size={26} color="#FFFFFF" />
        </View>
        <Text style={[styles.heading, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
          Create an account
        </Text>
        <Text style={[styles.subheading, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}>
          Start building surveys in minutes
        </Text>

        <Input
          label="Name"
          icon={User}
          autoComplete="name"
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          error={errors.name}
          containerStyle={{ marginTop: 28 }}
        />
        <Input
          label="Email"
          icon={Mail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          error={errors.email}
          containerStyle={{ marginTop: 14 }}
        />
        <Input
          label="Password"
          icon={Lock}
          secureTextEntry
          autoCapitalize="none"
          value={form.password}
          onChangeText={(t) => setForm({ ...form, password: t })}
          error={errors.password}
          hint={!errors.password ? "At least 6 characters" : undefined}
          containerStyle={{ marginTop: 14 }}
        />

        <Button title="Register" onPress={handleSubmit} loading={busy} fullWidth style={{ marginTop: 24 }} />

        <View style={styles.footerRow}>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 13.5 }}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => navigation.navigate("Login")} hitSlop={8}>
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semibold, fontSize: 13.5 }}>
              Log in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 40 },
  logo: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20 },
  heading: { fontSize: 24, textAlign: "center" },
  subheading: { fontSize: 14, textAlign: "center", marginTop: 6 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
});
