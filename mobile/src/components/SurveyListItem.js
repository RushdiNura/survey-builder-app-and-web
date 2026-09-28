import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { BarChart3, Mail, Copy, Check, Eye, EyeOff, Trash2, Calendar, ChevronRight } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../theme/ThemeContext";
import Card from "./Card";
import Badge from "./Badge";
import { useToast } from "../context/ToastContext";
import { WEB_URL } from "../api/client";

const STATUS_VARIANT = { draft: "draft", published: "published", closed: "closed" };

export default function SurveyListItem({ survey, onPress, onPublishToggle, onDelete }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await Clipboard.setStringAsync(`${WEB_URL}/s/${survey.shareSlug}`);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    showToast("Link copied", "success");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Pressable onPress={() => onPress(survey)}>
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.semibold }]}
          >
            {survey.title}
          </Text>
          <Badge label={survey.status} variant={STATUS_VARIANT[survey.status]} />
        </View>

        <Text
          numberOfLines={2}
          style={[styles.desc, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular }]}
        >
          {survey.description || "No description"}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.medium }]}>
            {survey.category} · {survey.questions.length} question{survey.questions.length !== 1 ? "s" : ""}
          </Text>
          {survey.scheduledPublishAt && (
            <View style={styles.scheduledChip}>
              <Calendar size={10} color={theme.colors.textFaint} />
              <Text style={[styles.metaText, { color: theme.colors.textFaint }]}>scheduled</Text>
            </View>
          )}
        </View>

        <View style={[styles.actionsRow, { borderTopColor: theme.colors.border }]}>
          <ActionButton
            icon={BarChart3}
            onPress={() => onPress(survey, "analytics")}
            color={theme.colors.textMuted}
          />
          <ActionButton icon={Mail} onPress={() => onPress(survey, "invite")} color={theme.colors.textMuted} />
          <ActionButton
            icon={copied ? Check : Copy}
            onPress={copyLink}
            color={copied ? theme.colors.positive : theme.colors.textMuted}
          />
          <ActionButton
            icon={survey.status === "published" ? EyeOff : Eye}
            onPress={() => onPublishToggle(survey)}
            color={theme.colors.textMuted}
          />
          <ActionButton icon={Trash2} onPress={() => onDelete(survey)} color={theme.colors.danger} />
          <View style={{ flex: 1 }} />
          <ChevronRight size={18} color={theme.colors.textFaint} />
        </View>
      </Card>
    </Pressable>
  );
}

function ActionButton({ icon: Icon, onPress, color }) {
  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation?.();
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      hitSlop={8}
      style={styles.actionButton}
    >
      <Icon size={16} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { fontSize: 15.5, flex: 1 },
  desc: { fontSize: 13, marginTop: 6, lineHeight: 18, minHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  metaText: { fontSize: 11 },
  scheduledChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  actionButton: { padding: 8, borderRadius: 8 },
});
