const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    // No SMTP configured — log to console instead of failing hard.
    // Keeps local dev / tests working without real credentials.
    transporter = {
      sendMail: async (opts) => {
        console.log("\n[mailer] SMTP not configured — email not actually sent.");
        console.log(`[mailer] To: ${opts.to}`);
        console.log(`[mailer] Subject: ${opts.subject}`);
        console.log(`[mailer] Body: ${opts.text}\n`);
        return { messageId: "dev-noop" };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

async function sendSurveyInvite({ to, surveyTitle, surveyUrl, senderName, message }) {
  const t = getTransporter();
  const subject = `${senderName} invited you to take a survey: ${surveyTitle}`;
  const text = [
    `${senderName} has invited you to complete a short survey: "${surveyTitle}".`,
    message ? `\nMessage: ${message}` : "",
    `\nTake the survey here: ${surveyUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
  const html = `
    <p>${senderName} has invited you to complete a short survey: <strong>${surveyTitle}</strong>.</p>
    ${message ? `<p>${message}</p>` : ""}
    <p><a href="${surveyUrl}">Take the survey</a></p>
  `;

  return t.sendMail({
    from: process.env.SMTP_FROM || "surveys@example.com",
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendSurveyInvite, getTransporter };
