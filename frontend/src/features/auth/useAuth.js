import { useState } from "react";
import { AUTH_SESSION_KEY, AUTH_USERS } from "./auth.data.js";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState(readSession);

  function login(role, email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = AUTH_USERS.find(
      (item) =>
        item.role === role &&
        item.email.toLowerCase() === normalizedEmail &&
        item.password === password
    );

    if (!user) {
      return { ok: false, error: "Email, password, or selected role is incorrect." };
    }

    const authenticatedUser = {
      id: user.id,
      studentId: user.studentId,
      name: user.name,
      email: user.email,
      role: user.role
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(authenticatedUser));
    setSession(authenticatedUser);
    return { ok: true, user: authenticatedUser };
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setSession(null);
  }

  return { session, login, logout };
}
