import api from "./api";

export const createSurvey = (data) => api.post("/surveys", data).then((r) => r.data);
export const getMySurveys = (params) => api.get("/surveys", { params }).then((r) => r.data);
export const getSurveyById = (id) => api.get(`/surveys/${id}`).then((r) => r.data);
export const updateSurvey = (id, data) => api.put(`/surveys/${id}`, data).then((r) => r.data);
export const updateSurveyStatus = (id, status) =>
  api.patch(`/surveys/${id}/status`, { status }).then((r) => r.data);
export const deleteSurvey = (id) => api.delete(`/surveys/${id}`).then((r) => r.data);

// Public (respondent-facing)
export const getPublicSurvey = (slug) => api.get(`/surveys/public/${slug}`).then((r) => r.data);
export const submitResponse = (slug, data) => api.post(`/responses/${slug}`, data).then((r) => r.data);

// Analytics + export
export const getAnalytics = (surveyId) => api.get(`/analytics/${surveyId}`).then((r) => r.data);

// Exports must go through the authenticated axios instance (not a plain <a href>) —
// the export routes require a JWT, which a bare anchor tag has no way to send.
export const downloadExport = async (surveyId, format = "csv") => {
  let response;
  try {
    response = await api.get(`/analytics/${surveyId}/export`, {
      params: { format },
      responseType: "blob",
    });
  } catch (err) {
    // With responseType "blob", error bodies also arrive as a Blob instead of
    // parsed JSON — convert back so callers can read err.response.data.message.
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        err.response.data = JSON.parse(text);
      } catch {
        // not JSON — leave the error as-is
      }
    }
    throw err;
  }

  const disposition = response.headers["content-disposition"];
  const match = disposition && disposition.match(/filename="?([^"]+)"?/);
  const fallbackExt = format === "excel" ? "xlsx" : format;
  const filename = match ? match[1] : `survey-responses.${fallbackExt}`;

  const blob = new Blob([response.data], { type: response.headers["content-type"] });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// File uploads — used for image-question assets and file-upload answers
export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        : undefined,
    })
    .then((r) => r.data);
};

// Email invitations
export const sendInvitations = (surveyId, emails, message) =>
  api.post(`/invitations/${surveyId}`, { emails, message }).then((r) => r.data);
