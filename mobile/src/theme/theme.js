// Central design tokens — mirrors the design language of the web app
// (indigo primary, neutral grays, Inter typeface) so the brand feels
// consistent across web and mobile.

const spacing = (n) => n * 4;

const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    mono: "Inter_500Medium", // no bundled mono face; medium-weight Inter stands in
  },
  size: {
    xs: 12,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
  },
};

const lightColors = {
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F4F6",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  text: "#111827",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  primary: "#4F46E5",
  primaryPressed: "#4338CA",
  primaryTint: "#EEF2FF",
  positive: "#059669",
  positiveTint: "#ECFDF5",
  danger: "#DC2626",
  dangerTint: "#FEF2F2",
  warning: "#D97706",
  warningTint: "#FFFBEB",
  overlay: "rgba(17,24,39,0.45)",
  chartGrid: "#E5E7EB",
  skeleton: "#E5E7EB",
};

const darkColors = {
  bg: "#030712",
  surface: "#111827",
  surfaceAlt: "#1F2937",
  border: "#1F2937",
  borderStrong: "#374151",
  text: "#F9FAFB",
  textMuted: "#9CA3AF",
  textFaint: "#6B7280",
  primary: "#818CF8",
  primaryPressed: "#A5B4FC",
  primaryTint: "rgba(129,140,248,0.14)",
  positive: "#34D399",
  positiveTint: "rgba(52,211,153,0.12)",
  danger: "#F87171",
  dangerTint: "rgba(248,113,113,0.12)",
  warning: "#FBBF24",
  warningTint: "rgba(251,191,36,0.12)",
  overlay: "rgba(0,0,0,0.6)",
  chartGrid: "#1F2937",
  skeleton: "#1F2937",
};

export function buildTheme(scheme) {
  const colors = scheme === "dark" ? darkColors : lightColors;
  return {
    scheme,
    colors,
    spacing,
    radii,
    typography,
    shadow:
      scheme === "dark"
        ? { shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 }
        : { shadowColor: "#111827", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  };
}

export const QUESTION_TYPES = [
  { value: "short-answer", label: "Short answer" },
  { value: "long-answer", label: "Long answer" },
  { value: "multiple-choice", label: "Multiple choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "rating", label: "Rating (1–5)" },
  { value: "yes-no", label: "Yes / No" },
  { value: "image", label: "Image question" },
  { value: "file-upload", label: "File upload" },
];

export const TYPE_LABEL = Object.fromEntries(QUESTION_TYPES.map((t) => [t.value, t.label]));
