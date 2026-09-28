import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { io } from "socket.io-client";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { Download, FileSpreadsheet, FileText, Radio } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, SOCKET_URL } from "../../api/client";
import * as surveyService from "../../api/surveyService";
import Screen, { ScreenLoading, ScreenError } from "../../components/Screen";
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import { TrendChart, BreakdownChart } from "../../components/Charts";

const EXPORT_BUTTONS = [
  { format: "csv", label: "CSV", icon: Download },
  { format: "excel", label: "Excel", icon: FileSpreadsheet },
  { format: "pdf", label: "PDF", icon: FileText },
];

export default function AnalyticsScreen({ route }) {
  const { surveyId } = route.params;
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [liveCount, setLiveCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const socketRef = useRef(null);

  const load = useCallback(() => {
    surveyService
      .getAnalytics(surveyId)
      .then((d) => {
        setData(d);
        setLiveCount(0);
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load analytics")));
  }, [surveyId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:survey", surveyId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("response:new", () => {
      setLiveCount((n) => n + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    });
    return () => {
      socket.emit("leave:survey", surveyId);
      socket.disconnect();
    };
  }, [surveyId]);

  async function handleExport(format) {
    setExportingFormat(format);
    try {
      const uri = await surveyService.downloadExportToFile(surveyId, format);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        showToast(`Saved to ${uri}`, "success");
      }
    } catch (err) {
      showToast(err.message || `Could not export as ${format.toUpperCase()}`, "error");
    } finally {
      setExportingFormat(null);
    }
  }

  if (error) return <ScreenError message={error} onRetry={load} />;
  if (!data) return <ScreenLoading label="Loading analytics…" />;

  return (
    <Screen edges={["left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.liveRow}>
          <Radio size={12} color={connected ? theme.colors.positive : theme.colors.textFaint} />
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 12.5 }}>
            {connected ? "Live" : "Connecting…"}
          </Text>
        </View>

        {liveCount > 0 && (
          <Pressable onPress={load} style={[styles.liveBanner, { backgroundColor: theme.colors.primaryTint }]}>
            <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semibold, fontSize: 13 }}>
              {liveCount} new response{liveCount !== 1 ? "s" : ""} — tap to refresh
            </Text>
          </Pressable>
        )}

        <View style={styles.statsRow}>
          <StatCard label="Responses" value={data.totalResponses} />
          <StatCard label="Completion" value={`${data.completionRate}%`} />
          <StatCard label="Avg rating" value={data.averageRating ?? "—"} />
        </View>

        <View style={styles.exportRow}>
          {EXPORT_BUTTONS.map(({ format, label, icon: Icon }) => (
            <Pressable
              key={format}
              onPress={() => handleExport(format)}
              disabled={exportingFormat !== null}
              style={[styles.exportButton, { borderColor: theme.colors.border, opacity: exportingFormat && exportingFormat !== format ? 0.5 : 1 }]}
            >
              {exportingFormat === format ? (
                <ActivityIndicator size="small" color={theme.colors.textMuted} />
              ) : (
                <Icon size={14} color={theme.colors.textMuted} />
              )}
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium, fontSize: 12.5 }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {data.trend.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold }]}>
              Response trend
            </Text>
            <Card>
              <TrendChart trend={data.trend} />
            </Card>
          </>
        )}

        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold }]}>
          Per-question breakdown
        </Text>
        {data.perQuestion.map((q) => (
          <Card key={q.questionId} style={{ marginBottom: 12 }}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.semibold, fontSize: 14.5 }}>
              {q.question}
            </Text>
            <Text style={{ color: theme.colors.textFaint, fontFamily: theme.typography.fontFamily.regular, fontSize: 12, marginTop: 3 }}>
              {q.responseCount} response{q.responseCount !== 1 ? "s" : ""}
            </Text>
            {q.breakdown && (
              <View style={{ marginTop: 10 }}>
                <BreakdownChart question={q} />
              </View>
            )}
            {q.average !== null && q.average !== undefined && (
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fontFamily.regular, fontSize: 13, marginTop: 10 }}>
                Average: <Text style={{ fontFamily: theme.typography.fontFamily.semibold }}>{q.average}</Text> / 5
              </Text>
            )}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  liveBanner: { borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  exportRow: { flexDirection: "row", gap: 8, marginBottom: 22 },
  exportButton: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 },
  sectionLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10, marginTop: 4 },
});
