require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { initSocket } = require("./utils/socket");
const { startScheduler } = require("./utils/scheduler");

const authRoutes = require("./routes/authRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const responseRoutes = require("./routes/responseRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const invitationRoutes = require("./routes/invitationRoutes");

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    exposedHeaders: ["Content-Disposition"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/invitations", invitationRoutes);

app.use(notFound);
app.use(errorHandler);

// Only boot the HTTP server + sockets + scheduler outside of tests,
// where supertest drives the Express app directly against app.js.
if (require.main === module) {
  const server = http.createServer(app);
  initSocket(server);
  startScheduler();

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
