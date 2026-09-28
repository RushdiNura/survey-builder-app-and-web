import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 text-gray-900 dark:text-gray-50">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ClipboardList size={16} strokeWidth={2.4} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Survey Builder</span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              to="/dashboard"
              className={`hidden rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:block ${
                isActive("/dashboard")
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              Dashboard
            </Link>
          )}

          <ThemeToggle />

          {user ? (
            <>
              <span className="hidden rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300 md:inline-block">
                {user.name}
              </span>
              <button
                className="btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
