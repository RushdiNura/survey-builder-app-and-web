import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Inbox } from "lucide-react";
import * as surveyService from "../services/surveyService";
import SurveyCard from "../components/SurveyCard";

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", status: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const data = await surveyService.getMySurveys(params);
      setSurveys(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handlePublishToggle(survey) {
    const nextStatus = survey.status === "published" ? "draft" : "published";
    await surveyService.updateSurveyStatus(survey._id, nextStatus);
    load();
  }

  async function handleDelete(survey) {
    if (!window.confirm(`Delete "${survey.title}"? This cannot be undone.`)) return;
    await surveyService.deleteSurvey(survey._id);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl">Your surveys</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, publish, and track responses across all your surveys.
          </p>
        </div>
        <Link to="/surveys/new" className="btn-primary">
          <Plus size={16} /> New survey
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="field-input pl-9"
            placeholder="Search by title…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <input
          className="field-input w-40"
          placeholder="Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <select
          className="field-input w-40"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
          <Inbox size={28} className="text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No surveys yet. Create your first one to get started.
          </p>
          <Link to="/surveys/new" className="btn-primary btn-sm mt-1">
            <Plus size={14} /> New survey
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surveys.map((s) => (
            <SurveyCard key={s._id} survey={s} onPublishToggle={handlePublishToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
