import { useState } from "react";
import { api } from "../../services/api.js";
import { AUTH_SESSION_KEY, AUTH_USERS } from "./auth.data.js";

const API_ENABLED = import.meta.env.VITE_ENABLE_API === "true";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState(readSession);

  async function login(role, email, password) {
    if (!API_ENABLED) {
      const user = AUTH_USERS.find((candidate) =>
        candidate.role === role
        && candidate.email.toLowerCase() === email.trim().toLowerCase()
        && candidate.password === password
      );
      if (!user) return { ok: false, error: "Email, password, or selected role is incorrect." };
      const { password: _password, ...authenticatedUser } = user;
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authenticatedUser));
      setSession(authenticatedUser);
      return { ok: true, user: authenticatedUser };
    }

    try {
      const res = await api.post("/api/auth/login", { role, email, password });
      if (res) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(res));
        setSession(res);
        return { ok: true, user: res };
      }
    } catch (err) {
      return { ok: false, error: err.message || "Email, password, or selected role is incorrect." };
    }
    return { ok: false, error: "Invalid credentials" };
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setSession(null);
  }

  return { session, login, logout };
}
