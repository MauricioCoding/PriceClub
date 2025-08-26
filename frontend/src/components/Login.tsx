// src/components/Login.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";

type LoginResponse = { token: string };

// Safely read a redirect target from react-router's location.state
function getRedirect(state: unknown): string {
  if (typeof state === "object" && state !== null) {
    const s = state as Record<string, unknown>;
    if (typeof s.from === "string") return s.from;
  }
  return "/";
}

export default function Login() {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, go home
  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: { token?: string; error?: string } = {};
      try {
        data = (await res.json()) as Partial<LoginResponse> & { error?: string };
      } catch {
        // ignore JSON parse errors; we'll handle via res.ok below
      }

      if (!res.ok || !data.token) {
        throw new Error(data.error || "Invalid email or password.");
      }

      setToken(data.token);

      const to = getRedirect(location.state);
      navigate(to, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container px-3 py-3">
      <div className="mx-auto" style={{ maxWidth: 480 }}>
        <div className="bg-light rounded-4 shadow-sm p-4 p-sm-5">
          <h1 className="h3 fw-bold mb-1 text-center">Welcome back</h1>
          <p className="text-muted mb-4 text-center">
            Sign in to continue to <span className="fw-semibold">Price Club</span>.
          </p>

          {/* Error message region (announced to screen readers) */}
          <div aria-live="polite" className="mb-3">
            {error && (
              <div role="alert" className="alert alert-danger mb-0">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="form-control form-control-lg"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="mb-2">
              <label htmlFor="password" className="form-label fw-semibold">
                Password
              </label>
              <div className="input-group input-group-lg">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPw((v) => !v)}
                  aria-pressed={showPw}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  disabled={submitting}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                  disabled={submitting}
                />
                <label className="form-check-label" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <Link to="#" className="small text-decoration-none">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg d-inline-flex justify-content-center align-items-center gap-2"
              disabled={submitting}
            >
              {submitting && (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
              <span>{submitting ? "Signing in..." : "Sign in"}</span>
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Don’t have an account?{" "}
            <Link to="#" className="text-decoration-none">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
