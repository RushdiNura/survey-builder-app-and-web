import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function useChartColors() {
  const { isDark } = useTheme();
  return isDark
    ? { line: "#818cf8", fill: "rgba(129,140,248,0.18)", bar: "#818cf8", text: "#9ca3af", grid: "#27272a" }
    : { line: "#4f46e5", fill: "rgba(79,70,229,0.10)", bar: "#4f46e5", text: "#6b7280", grid: "#e5e7eb" };
}

export function TrendChart({ trend }) {
  const c = useChartColors();
  const data = {
    labels: trend.map((t) => t.date),
    datasets: [
      {
        label: "Responses per day",
        data: trend.map((t) => t.count),
        borderColor: c.line,
        backgroundColor: c.fill,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: c.line,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: c.text, font: { family: "Inter" } }, grid: { color: "transparent" } },
      y: { ticks: { color: c.text, font: { family: "Inter" } }, grid: { color: c.grid }, beginAtZero: true },
    },
  };
  return <Line data={data} options={options} />;
}

export function BreakdownChart({ question }) {
  const c = useChartColors();
  if (!question.breakdown) return null;
  const labels = Object.keys(question.breakdown);
  const data = {
    labels,
    datasets: [
      {
        label: question.question,
        data: labels.map((l) => question.breakdown[l]),
        backgroundColor: c.bar,
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: c.text, font: { family: "Inter" } }, grid: { color: "transparent" } },
      y: { ticks: { color: c.text, font: { family: "Inter" } }, grid: { color: c.grid }, beginAtZero: true },
    },
  };
  return <Bar data={data} options={options} />;
}
