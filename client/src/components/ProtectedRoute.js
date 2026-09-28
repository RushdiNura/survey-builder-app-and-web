import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="mx-auto max-w-lg px-6 py-24 text-center text-gray-500 dark:text-gray-400">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
