import axios from "axios";
import Constants from "expo-constants";
import { tokenStorage } from "../utils/storage";

const { apiUrl, socketUrl, webUrl } = Constants.expoConfig?.extra || {};

export const API_URL = apiUrl || "http://localhost:5000/api";
export const SOCKET_URL = socketUrl || "http://localhost:5000";
export const WEB_URL = webUrl || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach the JWT to every request.
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Central place to react to an expired/invalid session. AuthContext registers
// a handler here so a 401 anywhere in the app triggers a clean logout rather
// than every screen having to check for it individually.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await tokenStorage.clear();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(err);
  }
);

// Normalizes axios errors into a plain, displayable message — screens can
// just do `catch (err) { showToast(getErrorMessage(err)) }` everywhere.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message === "Network Error") return "Can't reach the server. Check your connection.";
  if (err?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  return fallback;
}

export default api;
