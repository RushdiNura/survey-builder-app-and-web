import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, Alert, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Search, Plus, Inbox } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../api/client";
import * as surveyService from "../../api/surveyService";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import { SurveyCardSkeleton } from "../../components/Skeleton";
import SurveyListItem from "../../components/SurveyListItem";

export default function DashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);
  const mountedRef = useRef(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        const data = await surveyService.getMySurveys(params);
        setSurveys(data);
      } catch (err) {
        showToast(getErrorMessage(err, "Could not load surveys"), "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, showToast]
  );

  useEffect(() => {
    // The focus listener below handles the initial load; only debounce real search edits.
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(), 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => load());
    return unsubscribe;
  }, [navigation, load]);

  function handleCardPress(survey, action) {
    if (action === "analytics") navigation.navigate("Analytics", { surveyId: survey._id });
    else if (action === "invite") navigation.navigate("Invite", { surveyId: survey._id });
    else navigation.navigate("SurveyDetail", { surveyId: survey._id });
  }

  async function handlePublishToggle(survey) {
    const nextStatus = survey.status === "published" ? "draft" : "published";
    try {
      await surveyService.updateSurveyStatus(survey._id, nextStatus);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showToast(nextStatus === "published" ? "Survey published" : "Survey unpublished", "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  }

  function handleDelete(survey) {
    Alert.alert("Delete survey?", `"${survey.title}" and all its responses will be permanently deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await surveyService.deleteSurvey(survey._id);
            showToast("Survey deleted", "success");
            load();
          } catch (err) {
            showToast(getErrorMessage(err), "error");
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.fontFamily.bold }]}>
            Your surveys
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, fontSize: 13 }}>
            {surveys.length} total
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            navigation.navigate("CreateSurvey");
          }}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        >
          <Plus size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Input icon={Search} placeholder="Search by title…" value={search} onChangeText={setSearch} />
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: 20 }}>
          <SurveyCardSkeleton />
          <SurveyCardSkeleton />
          <SurveyCardSkeleton />
        </View>
      ) : surveys.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No surveys yet"
          message="Create your first survey to start collecting responses."
          actionLabel="New survey"
          onAction={() => navigation.navigate("CreateSurvey")}
        />
      ) : (
        <FlatList
          data={surveys}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, paddingTop: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.colors.primary} />}
          renderItem={({ item }) => (
            <SurveyListItem
              survey={item}
              onPress={handleCardPress}
              onPublishToggle={handlePublishToggle}
              onDelete={handleDelete}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  title: { fontSize: 24 },
  fab: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 12 },
});
