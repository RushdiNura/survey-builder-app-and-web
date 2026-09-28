import React, { useState } from "react";
import { Paperclip, Upload, CheckCircle2, Loader2 } from "lucide-react";
import * as surveyService from "../services/surveyService";

export default function QuestionRenderer({ question, value, onChange }) {
  const id = question._id;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  switch (question.type) {
    case "short-answer":
      return (
        <input
          className="field-input"
          value={value || ""}
          required={question.required}
          onChange={(e) => onChange(id, e.target.value)}
        />
      );

    case "long-answer":
      return (
        <textarea
          className="field-input"
          value={value || ""}
          required={question.required}
          onChange={(e) => onChange(id, e.target.value)}
        />
      );

    case "multiple-choice":
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <label key={opt} className="option-tile">
              <input
                type="radio"
                name={id}
                value={opt}
                checked={value === opt}
                required={question.required}
                onChange={(e) => onChange(id, e.target.value)}
                className="h-4 w-4 shrink-0 text-indigo-600 focus:ring-indigo-500"
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case "checkboxes": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <label key={opt} className="option-tile">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  const next = e.target.checked ? [...selected, opt] : selected.filter((v) => v !== opt);
                  onChange(id, next);
                }}
                className="h-4 w-4 shrink-0 rounded text-indigo-600 focus:ring-indigo-500"
              />
              {opt}
            </label>
          ))}
        </div>
      );
    }

    case "dropdown":
      return (
        <select
          className="field-input"
          value={value || ""}
          required={question.required}
          onChange={(e) => onChange(id, e.target.value)}
        >
          <option value="" disabled>
            Select an option
          </option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "rating":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = Number(value) === n;
            return (
              <label
                key={n}
                className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors ${
                  active
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                }`}
              >
                <input
                  type="radio"
                  name={id}
                  value={n}
                  checked={active}
                  required={question.required}
                  onChange={() => onChange(id, n)}
                  className="sr-only"
                />
                {n}
              </label>
            );
          })}
        </div>
      );

    case "yes-no":
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => (
            <label key={opt} className="option-tile flex-1 justify-center">
              <input
                type="radio"
                name={id}
                value={opt}
                checked={value === opt}
                required={question.required}
                onChange={(e) => onChange(id, e.target.value)}
                className="h-4 w-4 shrink-0 text-indigo-600 focus:ring-indigo-500"
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case "image":
      // The owner-provided image is the prompt; respondents answer in the text box below it.
      return (
        <div className="flex flex-col gap-3">
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt="Question"
              className="max-h-80 w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700"
            />
          )}
          <input
            className="field-input"
            placeholder="Your answer"
            value={value || ""}
            required={question.required}
            onChange={(e) => onChange(id, e.target.value)}
          />
        </div>
      );

    case "file-upload": {
      async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        setUploadError("");
        setUploading(true);
        try {
          const uploaded = await surveyService.uploadFile(file);
          onChange(id, { url: uploaded.url, name: uploaded.originalName });
        } catch (err) {
          setUploadError(err.response?.data?.message || "Upload failed");
        } finally {
          setUploading(false);
        }
      }

      return (
        <div className="flex flex-col gap-2">
          <label className="btn w-fit cursor-pointer">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : "Choose file"}
            <input type="file" hidden onChange={handleFileSelect} disabled={uploading} />
          </label>
          {value?.name && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} /> {value.name}
            </p>
          )}
          {uploadError && <p className="field-error">{uploadError}</p>}
          <p className="field-hint flex items-center gap-1.5">
            <Paperclip size={12} /> Image, PDF, or text/Word doc — up to 10MB.
          </p>
        </div>
      );
    }

    default:
      return <p className="field-hint">Unsupported question type: {question.type}</p>;
  }
}
