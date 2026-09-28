import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Info } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { getErrorMessage } from "../../api/client";
import * as surveyService from "../../api/surveyService";
import Screen, { ScreenLoading, ScreenError } from "../../components/Screen";
import QuestionRenderer from "../../components/QuestionRenderer";

// Owner-facing preview of the respondent experience. Answers are kept
// locally and never submitted, so previewing can't pollute real analytics.
// Note: the public endpoint only serves *published* surveys.
export default function SurveyPreviewScreen({ route }) {
  const { slug } = route.params;
  const { theme } = useTheme();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    surveyService
      .getPublicSurvey(slug)
      .then(setSurvey)
      .catch((err) => setError(getErrorMessage(err, "Preview is only available for published surveys")));
  }, [slug]);

  if (error) return <ScreenError message={error} />;
  if (!survey) return <ScreenLoading label="Loading preview…" />;

  return (
    <Screen edges={["left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.banner, { backgroundColor: theme.colors.primaryTint }]}>
          <Info size={14} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium, fontSize: 12.5, flex: 1 }}>
            Preview mode — answers here are not submitted.
          </Text>
        </View>

        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold, fontSize: 22 }}>{survey.title}</Text>
        {survey.description ? (
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
            {survey.description}
          </Text>
        ) : null}

        {survey.questions.map((q) => (
          <View key={q._id} style={[styles.question, { borderBottomColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.semibold, fontSize: 15, marginBottom: 10 }}>
              {q.question}
              {q.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
            </Text>
            <QuestionRenderer question={q} value={answers[q._id]} onChange={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))} />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12, marginBottom: 18 },
  question: { paddingVertical: 20, borderBottomWidth: 1 },
});
