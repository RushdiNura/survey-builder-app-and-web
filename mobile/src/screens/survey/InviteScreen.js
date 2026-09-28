import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Send, CheckCircle2 } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/client";
import * as surveyService from "../../api/surveyService";
import { parseEmailList, isValidEmail } from "../../utils/validators";
import Screen from "../../components/Screen";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Card from "../../components/Card";

export default function InviteScreen({ route }) {
  const { surveyId } = route.params;
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [survey, setSurvey] = useState(null);
  const [emailsText, setEmailsText] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    surveyService.getSurveyById(surveyId).then(setSurvey).catch(() => {});
  }, [surveyId]);

  async function handleSend() {
    setError("");
    setResult(null);
    const emails = parseEmailList(emailsText);
    if (emails.length === 0) {
      setError("Add at least one email address");
      return;
    }
    if (!emails.some(isValidEmail)) {
      setError("None of those look like valid email addresses");
      return;
    }
    setBusy(true);
    try {
      const res = await surveyService.sendInvitations(surveyId, emails, message.trim() || undefined);
      setResult(res);
      showToast(`Sent to ${res.sent.length} recipient${res.sent.length !== 1 ? "s" : ""}`, "success");
      if (res.failed.length === 0 && res.invalid.length === 0) setEmailsText("");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not send invitations"), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={["left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {survey && (
            <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 13.5, marginBottom: 16 }}>
              Invite people to “{survey.title}”
            </Text>
          )}

          <Input
            label="Email addresses"
            value={emailsText}
            onChangeText={setEmailsText}
            placeholder="one@example.com, two@example.com"
            multiline
            numberOfLines={4}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ minHeight: 96, textAlignVertical: "top" }}
            hint="Separate with commas or new lines."
            error={error}
          />
          <Input
            label="Personal message (optional)"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: "top" }}
            containerStyle={{ marginTop: 14 }}
          />

          <Button title="Send invitations" icon={Send} onPress={handleSend} loading={busy} fullWidth style={{ marginTop: 22 }} />

          {result && (
            <Card style={{ marginTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} color={theme.colors.positive} />
                <Text style={{ color: theme.colors.positive, fontFamily: theme.typography.fontFamily.semibold, fontSize: 14 }}>
                  Sent to {result.sent.length} recipient{result.sent.length !== 1 ? "s" : ""}
                </Text>
              </View>
              {result.failed.length > 0 && (
                <Text style={{ color: theme.colors.danger, fontFamily: theme.typography.fontFamily.regular, fontSize: 12.5, marginTop: 8 }}>
                  Failed: {result.failed.join(", ")}
                </Text>
              )}
              {result.invalid.length > 0 && (
                <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 12.5, marginTop: 6 }}>
                  Skipped invalid: {result.invalid.join(", ")}
                </Text>
              )}
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
