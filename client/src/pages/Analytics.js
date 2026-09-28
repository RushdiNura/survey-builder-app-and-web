import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { Download, FileSpreadsheet, FileText, Radio, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import * as surveyService from "../services/surveyService";
import { TrendChart, BreakdownChart } from "../charts/ResponseChart";

const SOCKET_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const EXPORT_BUTTONS = [
  { format: "csv", label: "CSV", icon: Download },
  { format: "excel", label: "Excel", icon: FileSpreadsheet },
  { format: "pdf", label: "PDF", icon: FileText },
];

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [liveCount, setLiveCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [exportError, setExportError] = useState("");
  const socketRef = useRef(null);

  const load = useCallback(() => {
    surveyService
      .getAnalytics(id)
      .then((d) => {
        setData(d);
        setLiveCount(0);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load analytics"));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: join a per-survey room and bump a "new responses" counter
  // whenever someone submits, instead of polling.
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join:survey", id);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("response:new", () => setLiveCount((n) => n + 1));

    return () => {
      socket.emit("leave:survey", id);
      socket.disconnect();
    };
  }, [id]);

  async function handleExport(format) {
    setExportError("");
    setExportingFormat(format);
    try {
      await surveyService.downloadExport(id, format);
    } catch (err) {
      setExportError(err.response?.data?.message || `Could not export as ${format.toUpperCase()}`);
    } finally {
      setExportingFormat(null);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-gray-500 dark:text-gray-400">
        <AlertCircle size={24} className="mx-auto mb-2" />
        {error}
      </div>
    );
  }
  if (!data) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-gray-500 dark:text-gray-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        to={`/surveys/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft size={14} /> Back to survey
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl">Analytics</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Radio size={13} className={connected ? "text-emerald-500" : "text-gray-400"} />
            {connected ? "Live" : "Connecting…"}
          </p>
        </div>
        <div className="flex gap-2">
          {EXPORT_BUTTONS.map(({ format, label, icon: Icon }) => (
            <button
              key={format}
              type="button"
              onClick={() => handleExport(format)}
              className="btn-ghost btn-sm"
              disabled={exportingFormat !== null}
            >
              {exportingFormat === format ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {exportError && (
        <div className="field-error mb-6">
          <AlertCircle size={16} className="shrink-0" />
          {exportError}
        </div>
      )}

      {liveCount > 0 && (
        <button
          onClick={load}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
        >
          {liveCount} new response{liveCount !== 1 ? "s" : ""} — click to refresh
        </button>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="stat-value">{data.totalResponses}</div>
          <div className="stat-label mt-1">Total responses</div>
        </div>
        <div className="card p-5">
          <div className="stat-value">{data.completionRate}%</div>
          <div className="stat-label mt-1">Completion rate</div>
        </div>
        <div className="card p-5">
          <div className="stat-value">{data.averageRating ?? "—"}</div>
          <div className="stat-label mt-1">Average rating</div>
        </div>
      </div>

      {data.trend.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Response trend
          </h2>
          <div className="card p-5">
            <TrendChart trend={data.trend} />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Per-question breakdown
        </h2>
        <div className="flex flex-col gap-4">
          {data.perQuestion.map((q) => (
            <div key={q.questionId} className="card p-5">
              <h3 className="text-[15px]">{q.question}</h3>
              <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                {q.responseCount} response{q.responseCount !== 1 ? "s" : ""}
              </p>
              {q.breakdown && (
                <div className="mt-4">
                  <BreakdownChart question={q} />
                </div>
              )}
              {q.average !== null && q.average !== undefined && (
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  Average: <span className="font-mono font-semibold">{q.average}</span> / 5
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
