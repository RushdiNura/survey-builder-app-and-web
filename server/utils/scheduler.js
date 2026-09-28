const cron = require("node-cron");
const Survey = require("../models/Survey");

// Runs every minute:
//  - flips "draft" surveys to "published" once scheduledPublishAt has passed
//  - flips "published" surveys to "closed" once expiresAt has passed
function startScheduler() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    try {
      await Survey.updateMany(
        { status: "draft", scheduledPublishAt: { $ne: null, $lte: now } },
        { status: "published" }
      );
      await Survey.updateMany(
        { status: "published", expiresAt: { $ne: null, $lte: now } },
        { status: "closed" }
      );
    } catch (err) {
      console.error("[scheduler] error:", err.message);
    }
  });
  console.log("[scheduler] survey scheduling job started (runs every minute)");
}

module.exports = { startScheduler };
