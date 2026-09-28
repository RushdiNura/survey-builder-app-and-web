# SurveyBuilder Mobile

React Native (Expo SDK 50) companion app for the SurveyBuilder backend. Create and manage surveys, watch live analytics, export data, and invite respondents — all from your phone.

## Quick start

```bash
npm install
# Start your backend first (see the server README), then:
API_URL=http://<YOUR-LAN-IP>:5000/api \
SOCKET_URL=http://<YOUR-LAN-IP>:5000 \
WEB_URL=http://<YOUR-LAN-IP>:3000 \
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android), or press `i` / `a` for a simulator.

> **Use your computer's LAN IP, not `localhost`.** On a physical phone, `localhost` means the phone itself. Find your IP with `ipconfig` (Windows) or `ifconfig` / System Settings (macOS). Phone and computer must be on the same Wi-Fi.

| Variable     | Purpose                                                      | Default                     |
|--------------|--------------------------------------------------------------|-----------------------------|
| `API_URL`    | REST API base (includes `/api`)                              | `http://localhost:5000/api` |
| `SOCKET_URL` | Socket.IO server (live analytics)                            | `http://localhost:5000`     |
| `WEB_URL`    | Public web client; used to build shareable `/s/:slug` links  | `http://localhost:3000`     |

## Backend compatibility

The app talks to the existing backend unchanged, with **one recommended one-line change** (already applied in the bundled `survey-builder.zip`):

```js
// server/server.js, right after `const app = express();`
app.set("trust proxy", 1);
```

Without it, behind a reverse proxy (Render, Railway, Heroku) the server builds `http://` upload URLs, which iOS App Transport Security blocks from loading in the app.

## Features

- **Auth**: register / login, JWT in the OS keychain (`expo-secure-store`), auto-login, centralized 401 → logout
- **Onboarding** (first launch only), branded splash screen, light / dark / system theme
- **Surveys**: list with debounced search, pull-to-refresh, skeleton loading, empty states, publish/unpublish, delete (with confirm)
- **Builder**: all 9 question types, dynamic options, required flag, image upload (photo library), expiration date, scheduled publish (native date/time pickers)
- **Detail view**: settings, response count, all questions; copy link, native share sheet, in-app preview
- **Analytics**: stats, trend + per-question charts, **live** new-response updates over Socket.IO
- **Export**: CSV / Excel / PDF downloaded with auth, then opened via the native share sheet
- **Email invitations** with per-address validation report
- **Polish**: haptics, toasts, press animations, error boundary, consistent loading/error states

## Design decisions worth knowing

- **Respondents use the web link.** This is the survey *owner's* app. Respondents open the shared `/s/:slug` link in their browser, so the app has a **Preview** screen (published surveys only; answers are never submitted) rather than a full submission flow.
- **Styling** uses plain `StyleSheet` + a central theme (`src/theme`) rather than a CSS-in-JS layer, so there is no extra build configuration to break.

## Project structure

```
App.js                     Entry: fonts, splash, providers, error boundary
app.config.js              Expo config (reads API_URL / SOCKET_URL / WEB_URL)
eas.json                   EAS build profiles (fill in production URLs)
assets/                    Icon, adaptive icon, splash (placeholders — replace with your brand)
src/
  api/                     axios client (auth interceptor), auth + survey services
  context/                 Auth, Toast
  theme/                   Design tokens, ThemeContext (light/dark/system)
  navigation/              Root (onboarding/auth/app), Auth stack, App stack, Tabs
  screens/                 onboarding, auth, dashboard, survey (detail/create/analytics/invite/preview), profile
  components/              Button, Input, Card, Badge, Skeleton, EmptyState, Charts, QuestionBuilder/Renderer, ...
  utils/                   storage (secure + async), validators
```

## Shipping to the stores

1. Replace `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png` with final brand artwork.
2. In `app.config.js`, set your real `bundleIdentifier` / `package`, and run `eas init` to set `extra.eas.projectId`.
3. Fill in the production URLs in `eas.json` (**use `https://`**).
4. `npx eas build --platform all --profile production`, then `eas submit`.

## Known limitations

- **Verified statically, not on a device.** Every file was parsed and every import/dependency cross-checked, but the app has not been run on a simulator or phone in the environment it was built in. Do a full click-through on iOS and Android before release.
- Uploaded files live on the server's local disk (`server/uploads/`); on most PaaS hosts this is ephemeral, so move to S3 or similar for production.
- Expo Go has limited support for some native modules; if anything misbehaves there, use a development build (`eas build --profile development`).
- Chart labels use `react-native-chart-kit`, which is functional but less customizable than Skia-based libraries.
