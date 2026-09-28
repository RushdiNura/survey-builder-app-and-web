import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SurveyDetail from "./pages/SurveyDetail";
import CreateSurvey from "./pages/CreateSurvey";
import SurveyView from "./pages/SurveyView";
import Analytics from "./pages/Analytics";
import InviteSurvey from "./pages/InviteSurvey";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public — respondents fill this out, no login needed */}
              <Route path="/s/:slug" element={<SurveyView />} />

              {/* Owner-only */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/new"
                element={
                  <ProtectedRoute>
                    <CreateSurvey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/:id"
                element={
                  <ProtectedRoute>
                    <SurveyDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/:id/edit"
                element={
                  <ProtectedRoute>
                    <CreateSurvey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/:id/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/surveys/:id/invite"
                element={
                  <ProtectedRoute>
                    <InviteSurvey />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <p className="mx-auto max-w-lg px-6 py-24 text-center text-gray-500 dark:text-gray-400">
                    Page not found
                  </p>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
