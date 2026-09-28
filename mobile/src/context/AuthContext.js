import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authService from "../api/authService";
import { tokenStorage } from "../utils/storage";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    // Any 401 anywhere in the app funnels through here, so an expired
    // session always drops the person back to the login screen cleanly.
    setUnauthorizedHandler(() => setUser(null));

    (async () => {
      const token = await tokenStorage.get();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await authService.getMe();
        setUser(user);
      } catch {
        await tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await authService.login(email, password);
    await tokenStorage.set(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await authService.register(name, email, password);
    await tokenStorage.set(data.token);
    setUser(data.user);
    return data.user;
  }

  async function updateProfile(fields) {
    const data = await authService.updateProfile(fields);
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
