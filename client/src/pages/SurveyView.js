import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, ClipboardList } from "lucide-react";
import * as surveyService from "../services/surveyService";
import QuestionRenderer from "../components/QuestionRenderer";

function getRespondentToken() {
  let token = localStorage.getItem("respondentToken");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("respondentToken", token);
  }
  return token;
}

export default function SurveyView() {
  const { slug } = useParams();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    surveyService
      .getPublicSurvey(slug)
      .then(setSurvey)
      .catch((err) => setError(err.response?.data?.message || "Survey not found"));
  }, [slug]);

  function setAnswer(questionId, value) {
    setAnswers({ ...answers, [questionId]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = {
        respondentToken: getRespondentToken(),
        answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      };
      await surveyService.submitResponse(slug, payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit response");
    } finally {
      setBusy(false);
    }
  }

  if (error && !survey) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertCircle size={28} className="mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center text-gray-500 dark:text-gray-400">Loading…</div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-28 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 size={24} />
        </span>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">Thanks — your response has been recorded!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-start gap-3">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <ClipboardList size={16} />
        </span>
        <div>
          <h1 className="text-2xl">{survey.title}</h1>
          {survey.description && <p className="mt-1 text-gray-500 dark:text-gray-400">{survey.description}</p>}
        </div>
      </div>

      {error && (
        <div className="field-error mb-6">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {survey.questions.map((q) => (
          <div key={q._id} className="border-b border-gray-100 pb-8 last:border-b-0 dark:border-gray-800">
            <label className="mb-3 block text-[15px] font-semibold text-gray-900 dark:text-gray-50">
              {q.question}
              {q.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <QuestionRenderer question={q} value={answers[q._id]} onChange={setAnswer} />
          </div>
        ))}
        <button type="submit" className="btn-primary self-start" disabled={busy}>
          {busy ? "Submitting…" : "Submit"}
        </button>
      </form>
    </div>
  );
}
