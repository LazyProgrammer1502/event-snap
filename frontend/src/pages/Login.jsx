import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      navigate(from, { replace: true }); // back to where they came from
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">EventSnap</h1>
        <p className="mt-2 text-sm text-muted">Scan, snap, and share the moment together.</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-canvas p-1 text-sm font-medium">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`rounded-lg py-2 capitalize transition-colors ${
                mode === m ? "bg-white text-ink shadow-sm" : "text-muted"
              }`}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <Field label="Name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </Field>
        )}
        <Field label="Email">
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </Field>
        <Field label="Password">
          <input
            type="password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••"
          />
        </Field>

        {error && <p className="mt-3 text-sm text-coral">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-coral py-3 text-sm font-semibold text-white transition-colors hover:bg-coral/90 disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/20";

function Field({ label, children }) {
  return (
    <label className="mb-3 block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
