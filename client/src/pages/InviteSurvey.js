import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Mail, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import * as surveyService from "../services/surveyService";

export default function InviteSurvey() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [emailsText, setEmailsText] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    surveyService.getSurveyById(id).then(setSurvey).catch(() => {});
  }, [id]);

  async function handleSend(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    const emails = emailsText
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) {
      setError("Add at least one email address");
      return;
    }
    setBusy(true);
    try {
      const res = await surveyService.sendInvitations(id, emails, message);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send invitations");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Mail size={16} />
        </span>
        <div>
          <h1 className="text-2xl">Invite by email</h1>
          {survey && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{survey.title}</p>}
        </div>
      </div>

      {error && (
        <div className="field-error mb-4">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="card mb-6 flex flex-col gap-1 border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={15} /> Sent to {result.sent.length} recipient{result.sent.length !== 1 ? "s" : ""}
          </p>
          {result.failed.length > 0 && (
            <p className="text-red-600 dark:text-red-400">Failed: {result.failed.join(", ")}</p>
          )}
          {result.invalid.length > 0 && (
            <p className="text-gray-500 dark:text-gray-400">Skipped invalid: {result.invalid.join(", ")}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSend} className="card flex flex-col gap-4 p-6">
        <div>
          <label className="field-label" htmlFor="emails">Email addresses</label>
          <textarea
            id="emails"
            className="field-input min-h-[110px]"
            placeholder="one@example.com, two@example.com&#10;or one per line"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
          />
          <p className="field-hint mt-1">Separate with commas or new lines.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="message">Personal message (optional)</label>
          <textarea
            id="message"
            className="field-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary self-start" disabled={busy}>
          <Send size={14} />
          {busy ? "Sending…" : "Send invitations"}
        </button>
      </form>
    </div>
  );
}
