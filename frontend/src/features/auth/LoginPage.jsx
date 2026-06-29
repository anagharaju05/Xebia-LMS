import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("admin@xebia.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function selectRole(nextRole) {
    setRole(nextRole);
    setError("");
    if (nextRole === "admin") {
      setEmail("admin@xebia.com");
      setPassword("Admin@123");
    } else {
      setEmail("student@xebia.com");
      setPassword("Student@123");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = onLogin(role, email, password);
    if (!result.ok) setError(result.error);
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <img src="/brand/Logo-White.png" alt="Xebia" />
        <div>
          <span>Learning Management System</span>
          <h1>Learn, manage, and grow from one focused workspace.</h1>
          <p>Role-based access keeps course administration and student learning in their own secure experiences.</p>
        </div>
      </section>
      <section className="login-form-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <header>
            <img src="/brand/Logo-Purple.png" alt="" />
            <div><span>Welcome to Xebia LMS</span><h2>Sign in to continue</h2></div>
          </header>

          <div className="login-role-switch" aria-label="Select account role">
            <button type="button" className={role === "admin" ? "active" : ""} onClick={() => selectRole("admin")}>
              <ShieldCheck /><span><strong>Admin</strong><small>Manage learning</small></span>
            </button>
            <button type="button" className={role === "student" ? "active" : ""} onClick={() => selectRole("student")}>
              <GraduationCap /><span><strong>Student</strong><small>Continue learning</small></span>
            </button>
          </div>

          <label className="login-field">
            <span>Email address</span>
            <div><Mail /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></div>
          </label>

          <label className="login-field">
            <span>Password</span>
            <div>
              <LockKeyhole />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} title={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="primary login-submit" type="submit">
            Sign in as {role === "admin" ? "Admin" : "Student"} <ArrowRight />
          </button>
        </form>
      </section>
    </main>
  );
}
