const Survey = require("../models/Survey");
const { sendSurveyInvite } = require("../utils/mailer");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/invitations/:surveyId
// body: { emails: ["a@b.com", ...], message?: string }
exports.sendInvitations = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.surveyId, owner: req.user._id });
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    const { emails, message } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "emails[] is required" });
    }

    const valid = [...new Set(emails.map((e) => String(e).trim().toLowerCase()))].filter((e) =>
      EMAIL_RE.test(e)
    );
    const invalid = emails.filter((e) => !EMAIL_RE.test(String(e).trim()));

    if (valid.length === 0) {
      return res.status(400).json({ message: "No valid email addresses provided", invalid });
    }

    const surveyUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/s/${survey.shareSlug}`;

    const results = await Promise.allSettled(
      valid.map((to) =>
        sendSurveyInvite({
          to,
          surveyTitle: survey.title,
          surveyUrl,
          senderName: req.user.name,
          message,
        })
      )
    );

    const sent = valid.filter((_, i) => results[i].status === "fulfilled");
    const failed = valid.filter((_, i) => results[i].status === "rejected");

    res.json({ sent, failed, invalid });
  } catch (err) {
    next(err);
  }
};
