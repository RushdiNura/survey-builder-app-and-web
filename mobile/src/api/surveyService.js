import * as FileSystem from "expo-file-system";
import api, { API_URL } from "./client";
import { tokenStorage } from "../utils/storage";

export const createSurvey = (data) => api.post("/surveys", data).then((r) => r.data);
export const getMySurveys = (params) => api.get("/surveys", { params }).then((r) => r.data);
export const getSurveyById = (id) => api.get(`/surveys/${id}`).then((r) => r.data);
export const updateSurvey = (id, data) => api.put(`/surveys/${id}`, data).then((r) => r.data);
export const updateSurveyStatus = (id, status) =>
  api.patch(`/surveys/${id}/status`, { status }).then((r) => r.data);
export const deleteSurvey = (id) => api.delete(`/surveys/${id}`).then((r) => r.data);

// Public (respondent-facing) — used by the in-app "Preview" screen
export const getPublicSurvey = (slug) => api.get(`/surveys/public/${slug}`).then((r) => r.data);
export const submitResponse = (slug, data) => api.post(`/responses/${slug}`, data).then((r) => r.data);

// Analytics
export const getAnalytics = (surveyId) => api.get(`/analytics/${surveyId}`).then((r) => r.data);

// Exports — mobile has no DOM/Blob, so we download straight to the file
// system with the auth header attached, then hand it to the native share
// sheet (see useExport hook) so the person can save or send it anywhere.
export async function downloadExportToFile(surveyId, format) {
  const token = await tokenStorage.get();
  const ext = format === "excel" ? "xlsx" : format;
  const fileUri = `${FileSystem.cacheDirectory}survey-${surveyId}-responses.${ext}`;

  const result = await FileSystem.downloadAsync(
    `${API_URL}/analytics/${surveyId}/export?format=${format}`,
    fileUri,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );

  if (result.status < 200 || result.status >= 300) {
    // The server returns JSON on error even though we asked for a file —
    // read it back so the person sees a real message instead of a silent failure.
    const text = await FileSystem.readAsStringAsync(result.uri).catch(() => null);
    let message = `Export failed (status ${result.status})`;
    if (text) {
      try {
        message = JSON.parse(text).message || message;
      } catch {
        // not JSON — keep the generic message
      }
    }
    throw new Error(message);
  }

  return result.uri;
}

// File uploads — used for image-question assets and file-upload answers.
// Accepts an Expo ImagePicker/DocumentPicker asset ({ uri, name, mimeType }).
export const uploadFile = (asset) => {
  const formData = new FormData();
  formData.append("file", {
    uri: asset.uri,
    name: asset.name || asset.fileName || `upload-${Date.now()}`,
    type: asset.mimeType || asset.type || "application/octet-stream",
  });
  return api
    .post("/uploads", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

// Email invitations
export const sendInvitations = (surveyId, emails, message) =>
  api.post(`/invitations/${surveyId}`, { emails, message }).then((r) => r.data);
