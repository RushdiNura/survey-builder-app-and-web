# Online Survey Builder

Full-stack survey builder: create surveys, collect responses, view analytics, export data.

**Stack:** React (client) · Node/Express (server) · MongoDB (Mongoose) · JWT auth · Chart.js

## Structure

```
survey-builder/
├── client/     React app (CRA-style, plain JS)
└── server/     Express API
```

## Server setup

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev             # nodemon, http://localhost:5000
```

## Client setup

```bash
cd client
npm install
npm start                # http://localhost:3000
```

The client expects the API at `http://localhost:5000/api` (see `client/src/services/api.js`).

# Online Survey Builder

Full-stack survey builder: create surveys, collect responses, view analytics, export data, invite by email, and get live updates as responses come in.

**Stack:** React + Tailwind CSS (client) · Node/Express (server) · MongoDB (Mongoose) · JWT auth · Chart.js · Socket.IO · Nodemailer · node-cron

## Structure

```
survey-builder/
├── client/     React app (CRA + Tailwind CSS)
└── server/     Express API (REST + WebSocket)
```

## Server setup

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET at minimum
npm run dev             # nodemon, http://localhost:5000
```

Email invitations work out of the box in dev without any SMTP setup — if `SMTP_HOST` is unset, emails are logged to the console instead of sent. Fill in the `SMTP_*` vars in `.env` to send real email (e.g. via SendGrid, Mailgun, or Gmail SMTP).

### Run the test suite

```bash
npm test
```

Uses Jest + Supertest + `mongodb-memory-server` (spins up a real, throwaway MongoDB for each run — the first run downloads a `mongod` binary, so it needs network access once).

## Client setup

```bash
cd client
npm install
npm start                # http://localhost:3000
```

The client expects the API at `http://localhost:5000/api` (see `client/src/services/api.js`) and the WebSocket server at `http://localhost:5000` (see `client/src/pages/Analytics.js`). Override with `REACT_APP_API_URL` if deploying elsewhere.

## What's implemented

- **Auth**: register/login/me/update-profile with JWT + bcrypt, protected routes via middleware
- **Surveys**: CRUD, publish/unpublish/close, public fetch by share slug, **scheduled auto-publish** (`scheduledPublishAt`) and **scheduled auto-close** (`expiresAt`) via a `node-cron` job that runs every minute
- **Questions**: embedded sub-documents, 9 types — short-answer, long-answer, multiple-choice, checkboxes, dropdown, rating (1–5), yes/no, **image** (owner-uploaded image + text answer), **file-upload** (respondent uploads a file as their answer)
- **File uploads**: `multer`-backed `/api/uploads` endpoint (10MB limit, image/PDF/text/Word only), served statically from `/uploads`
- **Responses**: anonymous or authenticated submission, one-submission-per-browser guard, required-question validation
- **Analytics**: total responses, completion rate, average rating, per-question breakdown, response trend by day — updates **live** via Socket.IO as new responses arrive (no polling)
- **Export**: CSV, **Excel** (`exceljs`, styled header + autofilter), and **PDF** (`pdfkit`, formatted per-response report) — all three fully implemented
- **Email invitations**: send a survey link to a list of addresses via `nodemailer`, with per-address validation and a send report (sent / failed / invalid)
- **Tests**: Jest + Supertest integration tests covering auth, survey CRUD, publish flow, response submission (including duplicate-blocking and required-field validation), analytics, and CSV export
- **UI**: Tailwind CSS design system (buttons, cards, form fields, badges — see `client/src/index.css`), full dark mode with system-preference detection and persistence, `lucide-react` icons throughout, responsive grid layouts

## What's left as a natural next step

- Conditional/branching questions (show question B only if question A was answered a certain way)
- Team collaboration (shared survey ownership)
- Push/browser notifications on new responses (Socket.IO event already fires — just needs a notification UI)
- CI/CD pipeline (GitHub Actions) and deployment configs for Vercel/Render/Railway

