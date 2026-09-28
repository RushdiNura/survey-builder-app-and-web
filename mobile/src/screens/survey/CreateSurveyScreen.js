import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Switch, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Plus, AlertCircle } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/client";
import * as surveyService from "../../api/surveyService";
import Screen, { ScreenLoading } from "../../components/Screen";
import Input from "../../components/Input";
import Button from "../../components/Button";
import DateField from "../../components/DateField";
import QuestionBuilderCard from "../../components/QuestionBuilderCard";

const emptyQuestion = () => ({ type: "short-answer", question: "", options: [], required: false });

export default function CreateSurveyScreen({ route, navigation }) {
  const surveyId = route.params?.surveyId;
  const isEditing = Boolean(surveyId);
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [survey, setSurvey] = useState({
    title: "",
    description: "",
    category: "General",
    expiresAt: null,
    scheduledPublishAt: null,
    anonymousAllowed: true,
    questions: [emptyQuestion()],
  });
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    surveyService
      .getSurveyById(surveyId)
      .then((data) =>
        setSurvey({
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          scheduledPublishAt: data.scheduledPublishAt ? new Date(data.scheduledPublishAt) : null,
        })
      )
      .catch((err) => showToast(getErrorMessage(err, "Could not load this survey"), "error"))
      .finally(() => setLoading(false));
  }, [surveyId, isEditing, showToast]);

  function updateQuestion(index, updated) {
    const questions = [...survey.questions];
    questions[index] = updated;
    setSurvey({ ...survey, questions });
  }
  function addQuestion() {
    setSurvey({ ...survey, questions: [...survey.questions, emptyQuestion()] });
  }
  function removeQuestion(index) {
    setSurvey({ ...survey, questions: survey.questions.filter((_, i) => i !== index) });
  }

  async function handleSave() {
    setError("");
    if (!survey.title.trim()) {
      setError("Title is required");
      return;
    }
    if (survey.questions.length === 0) {
      setError("Add at least one question");
      return;
    }
    if (survey.questions.some((q) => !q.question.trim())) {
      setError("Every question needs text");
      return;
    }

    setBusy(true);
    try {
      if (isEditing) {
        await surveyService.updateSurvey(surveyId, survey);
        showToast("Survey updated", "success");
      } else {
        await surveyService.createSurvey(survey);
        showToast("Survey created", "success");
      }
      navigation.goBack();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not save survey"), "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <ScreenLoading label="Loading survey…" />;

  return (
    <Screen edges={["left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.dangerTint, borderColor: theme.colors.danger }]}>
              <AlertCircle size={15} color={theme.colors.danger} />
              <Text style={{ color: theme.colors.danger, fontFamily: theme.typography.fontFamily.medium, fontSize: 13, flex: 1 }}>
                {error}
              </Text>
            </View>
          ) : null}

          <Input label="Title" value={survey.title} onChangeText={(t) => setSurvey({ ...survey, title: t })} containerStyle={{ marginBottom: 14 }} />
          <Input
            label="Description"
            value={survey.description}
            onChangeText={(t) => setSurvey({ ...survey, description: t })}
            multiline
            numberOfLines={3}
            style={{ minHeight: 76, textAlignVertical: "top" }}
            containerStyle={{ marginBottom: 14 }}
          />
          <Input label="Category" value={survey.category} onChangeText={(t) => setSurvey({ ...survey, category: t })} containerStyle={{ marginBottom: 14 }} />

          <DateField
            label="Expiration date"
            value={survey.expiresAt}
            onChange={(d) => setSurvey({ ...survey, expiresAt: d })}
            mode="date"
          />

          <View style={{ marginTop: 14 }}>
            <DateField
              label="Schedule publish (optional)"
              value={survey.scheduledPublishAt}
              onChange={(d) => setSurvey({ ...survey, scheduledPublishAt: d })}
              mode="datetime"
              hint="Leave blank to publish manually."
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, fontSize: 14 }}>
              Allow anonymous responses
            </Text>
            <Switch
              value={survey.anonymousAllowed}
              onValueChange={(v) => setSurvey({ ...survey, anonymousAllowed: v })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold }]}>
            Questions
          </Text>

          {survey.questions.map((q, i) => (
            <QuestionBuilderCard key={i} question={q} index={i} onChange={updateQuestion} onRemove={removeQuestion} />
          ))}

          <Button title="Add question" icon={Plus} variant="secondary" size="sm" onPress={addQuestion} style={{ alignSelf: "flex-start" }} />

          <Button title={isEditing ? "Save changes" : "Create survey"} onPress={handleSave} loading={busy} fullWidth style={{ marginTop: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
  sectionLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 26, marginBottom: 12 },
});
