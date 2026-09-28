import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Share, Alert, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import {
  Pencil,
  BarChart3,
  Mail,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  PlayCircle,
  Share2,
} from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, WEB_URL } from "../../api/client";
import * as surveyService from "../../api/surveyService";
import { TYPE_LABEL } from "../../theme/theme";
import Screen, { ScreenLoading, ScreenError } from "../../components/Screen";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";

const STATUS_VARIANT = { draft: "draft", published: "published", closed: "closed" };

export default function SurveyDetailScreen({ route, navigation }) {
  const { surveyId } = route.params;
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [survey, setSurvey] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await surveyService.getSurveyById(surveyId);
      setSurvey(data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load this survey"));
    }
  }, [surveyId]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    return unsubscribe;
  }, [navigation, load]);

  const shareUrl = survey ? `${WEB_URL}/s/${survey.shareSlug}` : "";

  async function handlePublishToggle() {
    setBusy(true);
    try {
      const nextStatus = survey.status === "published" ? "draft" : "published";
      const updated = await surveyService.updateSurveyStatus(survey._id, nextStatus);
      setSurvey({ ...survey, status: updated.status });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showToast(nextStatus === "published" ? "Survey published" : "Survey unpublished", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  function handleDelete() {
    Alert.alert("Delete survey?", `"${survey.title}" and all its responses will be permanently deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await surveyService.deleteSurvey(survey._id);
            showToast("Survey deleted", "success");
            navigation.goBack();
          } catch (err) {
            showToast(getErrorMessage(err), "error");
          }
        },
      },
    ]);
  }

  async function copyLink() {
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    showToast("Link copied", "success");
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleNativeShare() {
    try {
      await Share.share({ message: `Take my survey: ${survey.title}\n${shareUrl}`, url: shareUrl });
    } catch {
      // user cancelled — nothing to do
    }
  }

  if (error) return <ScreenError message={error} onRetry={load} />;
  if (!survey) return <ScreenLoading label="Loading survey…" />;

  return (
    <Screen edges={["left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Card>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
              {survey.title}
            </Text>
            <Badge label={survey.status} variant={STATUS_VARIANT[survey.status]} />
          </View>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 13 }}>
            {survey.category}
          </Text>

          {survey.description ? (
            <Text
              style={{
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily.regular,
                fontSize: 13.5,
                lineHeight: 20,
                marginTop: 12,
              }}
            >
              {survey.description}
            </Text>
          ) : null}

          <View style={[styles.metaGrid, { borderTopColor: theme.colors.border }]}>
            <MetaItem icon={Users} label="Responses" value={String(survey.responseCount ?? 0)} theme={theme} />
            <MetaItem icon={ShieldCheck} label="Anonymous" value={survey.anonymousAllowed ? "Allowed" : "Not allowed"} theme={theme} />
            {survey.scheduledPublishAt && (
              <MetaItem icon={Clock} label="Scheduled" value={new Date(survey.scheduledPublishAt).toLocaleDateString()} theme={theme} />
            )}
            {survey.expiresAt && (
              <MetaItem icon={Calendar} label="Expires" value={new Date(survey.expiresAt).toLocaleDateString()} theme={theme} />
            )}
          </View>

          <View style={[styles.actionsGrid, { borderTopColor: theme.colors.border }]}>
            <Button title="Edit" icon={Pencil} variant="secondary" size="sm" onPress={() => navigation.navigate("EditSurvey", { surveyId })} />
            <Button title="Analytics" icon={BarChart3} variant="secondary" size="sm" onPress={() => navigation.navigate("Analytics", { surveyId })} />
            <Button title="Invite" icon={Mail} variant="secondary" size="sm" onPress={() => navigation.navigate("Invite", { surveyId })} />
            <Button title="Preview" icon={PlayCircle} variant="secondary" size="sm" onPress={() =>
                survey.status === "published"
                  ? navigation.navigate("SurveyPreview", { slug: survey.shareSlug })
                  : showToast("Publish the survey first to preview it", "info")
              } />
          </View>

          <View style={styles.rowButtons}>
            <Pressable onPress={copyLink} style={[styles.pillButton, { borderColor: theme.colors.border }]}>
              {copied ? <Check size={14} color={theme.colors.positive} /> : <Copy size={14} color={theme.colors.textMuted} />}
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 12.5 }}>
                {copied ? "Copied" : "Copy link"}
              </Text>
            </Pressable>
            <Pressable onPress={handleNativeShare} style={[styles.pillButton, { borderColor: theme.colors.border }]}>
              <Share2 size={14} color={theme.colors.textMuted} />
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 12.5 }}>
                Share
              </Text>
            </Pressable>
            <Pressable onPress={handlePublishToggle} disabled={busy} style={[styles.pillButton, { borderColor: theme.colors.border }]}>
              {survey.status === "published" ? (
                <EyeOff size={14} color={theme.colors.textMuted} />
              ) : (
                <Eye size={14} color={theme.colors.textMuted} />
              )}
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 12.5 }}>
                {survey.status === "published" ? "Unpublish" : "Publish"}
              </Text>
            </Pressable>
            <Pressable onPress={handleDelete} style={[styles.pillButton, { borderColor: theme.colors.danger }]}>
              <Trash2 size={14} color={theme.colors.danger} />
            </Pressable>
          </View>
        </Card>

        <Text
          style={[
            styles.sectionLabel,
            { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold },
          ]}
        >
          Questions ({survey.questions.length})
        </Text>

        {survey.questions.map((q, i) => (
          <Card key={q._id || i} style={{ marginBottom: 10 }}>
            <View style={styles.questionRow}>
              <View style={[styles.qIndex, { backgroundColor: theme.colors.primaryTint }]}>
                <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semibold, fontSize: 11 }}>
                  Q{String(i + 1).padStart(2, "0")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.medium, fontSize: 14.5 }}>
                  {q.question}
                </Text>
                <Text style={{ color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.regular, fontSize: 12, marginTop: 3 }}>
                  {TYPE_LABEL[q.type] || q.type}
                  {q.required ? "  ·  Required" : ""}
                </Text>
                {q.options?.length > 0 && (
                  <View style={styles.optionChips}>
                    {q.options.map((opt, oi) => (
                      <View key={oi} style={[styles.chip, { borderColor: theme.colors.border }]}>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 11.5, fontFamily: theme.typography.fontFamily.regular }}>
                          {opt || "(empty)"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

function MetaItem({ icon: Icon, label, value, theme }) {
  return (
    <View style={styles.metaItem}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Icon size={11} color={theme.colors.textFaint} />
        <Text style={{ color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.semibold, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>
          {label}
        </Text>
      </View>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.semibold, fontSize: 14, marginTop: 3 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  title: { fontSize: 20, flex: 1 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 18, marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  metaItem: { minWidth: "40%" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  rowButtons: { flexDirection: "row", gap: 8, marginTop: 10 },
  pillButton: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  sectionLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4, marginTop: 22, marginBottom: 10 },
  questionRow: { flexDirection: "row", gap: 10 },
  qIndex: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, height: 22, justifyContent: "center" },
  optionChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
});
