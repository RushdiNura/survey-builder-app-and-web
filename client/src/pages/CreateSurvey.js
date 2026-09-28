import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Plus, Save } from "lucide-react";
import * as surveyService from "../services/surveyService";
import QuestionBuilder from "../components/QuestionBuilder";

const emptyQuestion = () => ({
  type: "short-answer",
  question: "",
  options: [],
  required: false,
});

export default function CreateSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [survey, setSurvey] = useState({
    title: "",
    description: "",
    category: "General",
    expiresAt: "",
    scheduledPublishAt: "",
    anonymousAllowed: true,
    questions: [emptyQuestion()],
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    surveyService.getSurveyById(id).then((data) =>
      setSurvey({
        ...data,
        expiresAt: data.expiresAt ? data.expiresAt.slice(0, 10) : "",
        scheduledPublishAt: data.scheduledPublishAt ? data.scheduledPublishAt.slice(0, 16) : "",
      })
    );
  }, [id, isEditing]);

  function updateQuestion(index, updated) {
    const questions = [...survey.questions];
    questions[index] = updated;
    setSurvey({ ...survey, questions });
  }

  function addQuestion() {
    setSurvey({ ...survey, questions: [...survey.questions, emptyQuestion()] });
  }

  function removeQuestion(index) {
    setSurvey({ ...survey, questions: survey.questions.filter((_, i) => i !== index) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!survey.title.trim()) {
      setError("Title is required");
      return;
    }
    if (survey.questions.some((q) => !q.question.trim())) {
      setError("Every question needs text");
      return;
    }
    setBusy(true);
    try {
      if (isEditing) {
        await surveyService.updateSurvey(id, survey);
      } else {
        await surveyService.createSurvey(survey);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save survey");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl">{isEditing ? "Edit survey" : "Create survey"}</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Set the survey details, then add as many questions as you need.
      </p>

      {error && (
        <div className="field-error mt-6">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <div className="card flex flex-col gap-4 p-6">
          <div>
            <label className="field-label" htmlFor="title">Title</label>
            <input
              id="title"
              className="field-input"
              required
              value={survey.title}
              onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="field-input"
              value={survey.description}
              onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="category">Category</label>
              <input
                id="category"
                className="field-input"
                value={survey.category}
                onChange={(e) => setSurvey({ ...survey, category: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="expiresAt">Expiration date</label>
              <input
                id="expiresAt"
                type="date"
                className="field-input"
                value={survey.expiresAt}
                onChange={(e) => setSurvey({ ...survey, expiresAt: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="scheduledPublishAt">
                Schedule publish (optional)
              </label>
              <input
                id="scheduledPublishAt"
                type="datetime-local"
                className="field-input"
                value={survey.scheduledPublishAt}
                onChange={(e) => setSurvey({ ...survey, scheduledPublishAt: e.target.value })}
              />
              <p className="field-hint mt-1">
                Leave blank to publish manually. Otherwise, saving as a draft will auto-publish at this time.
              </p>
            </div>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
                checked={survey.anonymousAllowed}
                onChange={(e) => setSurvey({ ...survey, anonymousAllowed: e.target.checked })}
              />
              Allow anonymous responses
            </label>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Questions
          </h2>
          <div className="flex flex-col gap-4">
            {survey.questions.map((q, i) => (
              <QuestionBuilder
                key={i}
                question={q}
                index={i}
                onChange={updateQuestion}
                onRemove={removeQuestion}
              />
            ))}
          </div>
          <button type="button" onClick={addQuestion} className="btn-ghost btn-sm mt-4">
            <Plus size={14} /> Add question
          </button>
        </div>

        <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-800">
          <button type="submit" className="btn-primary" disabled={busy}>
            <Save size={15} />
            {busy ? "Saving…" : "Save survey"}
          </button>
        </div>
      </form>
    </div>
  );
}
