import { useState } from "react";
import { AUTH_SESSION_KEY, AUTH_USERS } from "./auth.data.js";
import { api } from "../../services/api.js";

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
    try {
      const user = await api.post("/api/auth/login", { email, password, role });
      
      const authenticatedUser = {
        id: user.id,
        studentId: user.studentId,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        role: user.role
      };

      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authenticatedUser));
      setSession(authenticatedUser);
      return { ok: true, user: authenticatedUser };
    } catch (e) {
      return { ok: false, error: e.message || "Email, password, or selected role is incorrect." };
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setSession(null);
  }

  return { session, login, logout };
}
