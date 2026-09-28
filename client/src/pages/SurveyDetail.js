import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  BarChart3,
  Mail,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  Users,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import * as surveyService from "../services/surveyService";
import { QUESTION_TYPES } from "../components/QuestionBuilder";

const STATUS_BADGE = {
  draft: "badge-draft",
  published: "badge-published",
  closed: "badge-closed",
};

const TYPE_LABEL = Object.fromEntries(QUESTION_TYPES.map((t) => [t.value, t.label]));

export default function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    surveyService
      .getSurveyById(id)
      .then(setSurvey)
      .catch((err) => setError(err.response?.data?.message || "Could not load this survey"));
  }, [id]);

  async function handlePublishToggle() {
    setBusy(true);
    try {
      const nextStatus = survey.status === "published" ? "draft" : "published";
      const updated = await surveyService.updateSurveyStatus(survey._id, nextStatus);
      setSurvey({ ...survey, status: updated.status });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${survey.title}"? This cannot be undone.`)) return;
    await surveyService.deleteSurvey(survey._id);
    navigate("/dashboard");
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/s/${survey.shareSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-gray-500 dark:text-gray-400">
        <AlertCircle size={24} className="mx-auto mb-2" />
        {error}
      </div>
    );
  }
  if (!survey) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-gray-500 dark:text-gray-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div className="card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl">{survey.title}</h1>
              <span className={STATUS_BADGE[survey.status]}>{survey.status}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{survey.category}</p>
          </div>
        </div>

        {survey.description && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{survey.description}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-1.5 stat-label">
              <Users size={12} /> Responses
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-gray-900 dark:text-gray-50">
              {survey.responseCount ?? 0}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 stat-label">
              <ShieldCheck size={12} /> Anonymous
            </div>
            <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-50">
              {survey.anonymousAllowed ? "Allowed" : "Not allowed"}
            </div>
          </div>
          {survey.scheduledPublishAt && (
            <div>
              <div className="flex items-center gap-1.5 stat-label">
                <Clock size={12} /> Scheduled
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-50">
                {new Date(survey.scheduledPublishAt).toLocaleString()}
              </div>
            </div>
          )}
          {survey.expiresAt && (
            <div>
              <div className="flex items-center gap-1.5 stat-label">
                <Calendar size={12} /> Expires
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-50">
                {new Date(survey.expiresAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-5 dark:border-gray-800">
          <Link to={`/surveys/${survey._id}/edit`} className="btn-primary btn-sm">
            <Pencil size={13} /> Edit
          </Link>
          <Link to={`/surveys/${survey._id}/analytics`} className="btn-ghost btn-sm">
            <BarChart3 size={13} /> Analytics
          </Link>
          <Link to={`/surveys/${survey._id}/invite`} className="btn-ghost btn-sm">
            <Mail size={13} /> Invite
          </Link>
          <button onClick={copyLink} className="btn-ghost btn-sm">
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <button onClick={handlePublishToggle} className="btn-ghost btn-sm" disabled={busy}>
            {survey.status === "published" ? <EyeOff size={13} /> : <Eye size={13} />}
            {survey.status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button onClick={handleDelete} className="btn-danger btn-sm ml-auto">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Questions ({survey.questions.length})
      </h2>
      <div className="flex flex-col gap-3">
        {survey.questions.map((q, i) => (
          <div key={q._id || i} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 px-1.5 font-mono text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15px] font-medium text-gray-900 dark:text-gray-50">{q.question}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {TYPE_LABEL[q.type] || q.type}
                    {q.required && <span className="ml-2 text-red-500">Required</span>}
                  </p>
                </div>
              </div>
            </div>

            {q.options?.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2 pl-9">
                {q.options.map((opt, oi) => (
                  <li
                    key={oi}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
                  >
                    {opt || <span className="italic text-gray-400">(empty option)</span>}
                  </li>
                ))}
              </ul>
            )}

            {q.type === "image" && q.imageUrl && (
              <img
                src={q.imageUrl}
                alt="Question asset"
                className="mt-3 ml-9 h-24 w-auto rounded-lg border border-gray-200 object-cover dark:border-gray-700"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
