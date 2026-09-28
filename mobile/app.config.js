// Using app.config.js (instead of app.json) so the API/socket URLs can be
// supplied via environment variables at build/start time — important because
// "localhost" only resolves to the phone itself when testing on a physical
// device with Expo Go, not to your dev machine. Run with e.g.:
//   API_URL=http://192.168.1.42:5000/api SOCKET_URL=http://192.168.1.42:5000 npx expo start
export default ({ config }) => ({
  ...config,
  expo: {
    name: "SurveyBuilder",
    slug: "survey-builder-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "surveybuilder",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#F9FAFB",
      dark: {
        image: "./assets/splash-icon.png",
        backgroundColor: "#030712",
      },
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.surveybuilder.app",
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "Allow photo access to attach images to survey questions or file-upload answers.",
        NSCameraUsageDescription: "Allow camera access to take a photo for image-based questions.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4F46E5",
      },
      package: "com.surveybuilder.app",
      permissions: ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "Allow photo access to attach images to survey questions or file-upload answers.",
        },
      ],
    ],
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:5000/api",
      socketUrl: process.env.SOCKET_URL || "http://localhost:5000",
      // Public URL of the web client, used to build shareable survey links (/s/:slug)
      webUrl: process.env.WEB_URL || "http://localhost:3000",
      eas: {
        projectId: "00000000-0000-0000-0000-000000000000",
      },
    },
  },
});
