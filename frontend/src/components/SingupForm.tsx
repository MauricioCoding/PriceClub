import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";

type LoginResponse = { token: string };

function getRedirect(state: unknown): string {
  if (typeof state === "object" && state !== null) {
    const s = state as Record<string, unknown>;
    if (typeof s.from === "string") return s.from;
  }
  return "/";
}

export default function Signup() {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const resS = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      });

      let sData: { error?: string } = {};
      try {
        sData = (await resS.json()) as { error?: string };
      } catch { /* empty */ }

      if (!resS.ok) throw new Error(sData.error || "Signup failed.");

      const resL = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      let lData: Partial<LoginResponse> & { error?: string } = {};
      try {
        lData = (await resL.json()) as Partial<LoginResponse> & { error?: string };
      } catch { /* empty */ }

      if (!resL.ok || !lData.token) throw new Error(lData.error || "Login failed.");

      setToken(lData.token);

      const to = getRedirect(location.state);
      navigate(to, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container px-3 py-3">
      <div className="mx-auto" style={{ maxWidth: 480 }}>
        <div className="bg-light rounded-4 shadow-sm p-4 p-sm-5">
          <h1 className="h3 fw-bold mb-1 text-center">Create your account</h1>
          <p className="text-muted mb-4 text-center">
            Join <span className="fw-semibold">Price Club</span>.
          </p>

          <div aria-live="polite" className="mb-3">
            {error && (
              <div role="alert" className="alert alert-danger mb-0">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">Name</label>
              <input
                id="name"
                className="form-control form-control-lg"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                required
                autoComplete="name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">Email</label>
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
              <label htmlFor="password" className="form-label fw-semibold">Password</label>
              <div className="input-group input-group-lg">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
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
              <div className="form-text">Use at least 6 characters.</div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg d-inline-flex justify-content-center align-items-center gap-2"
              disabled={submitting}
            >
              {submitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
              <span>{submitting ? "Creating account..." : "Create account"}</span>
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Already have an account? <Link to="/login" className="text-decoration-none">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
