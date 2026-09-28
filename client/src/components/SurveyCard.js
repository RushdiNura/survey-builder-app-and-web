import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Copy, Check, Mail, Eye, EyeOff, Trash2, Pencil, Calendar } from "lucide-react";

const STATUS_BADGE = {
  draft: "badge-draft",
  published: "badge-published",
  closed: "badge-closed",
};

export default function SurveyCard({ survey, onPublishToggle, onDelete }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/s/${survey.shareSlug}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card flex flex-col gap-3 p-5">
      <Link to={`/surveys/${survey._id}`} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] leading-snug text-gray-900 hover:text-indigo-600 dark:text-gray-50 dark:hover:text-indigo-400">
            {survey.title}
          </h3>
          <span className={STATUS_BADGE[survey.status]}>{survey.status}</span>
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-gray-500 dark:text-gray-400">
          {survey.description || "No description"}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-gray-400 dark:text-gray-500">
          <span>{survey.category}</span>
          <span>·</span>
          <span>{survey.questions.length} question{survey.questions.length !== 1 ? "s" : ""}</span>
          {survey.scheduledPublishAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={11} /> scheduled
            </span>
          )}
        </div>
      </Link>

      <div className="mt-1 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-800">
        <Link to={`/surveys/${survey._id}/edit`} className="btn-ghost btn-sm">
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
        <button onClick={() => onPublishToggle(survey)} className="btn-ghost btn-sm">
          {survey.status === "published" ? <EyeOff size={13} /> : <Eye size={13} />}
          {survey.status === "published" ? "Unpublish" : "Publish"}
        </button>
        <button onClick={() => onDelete(survey)} className="btn-danger btn-sm ml-auto">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
