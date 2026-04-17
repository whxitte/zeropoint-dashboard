import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Crosshair, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { User } from "@/lib/models"; // Assuming you'll create frontend models later

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Assuming your backend /login endpoint returns a structure with a 'user' object
      const res = await apiFetch<{ user: User }>(
        "/api/v1/auth/login",
        { method: "POST", body: { email, password }, suppressAuthRedirect: true },
      );
      if (res.user) {
        // Force app-level auth re-check after cookie is set.
        window.location.href = "/";
      } else {
        setError("Login failed: Unexpected response from server.");
      }
    } catch (e: any) {
      // Display specific error message from the backend if available
      setError(e.message || "Login failed: Could not connect to API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Crosshair className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">ZeroPoint</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="********"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-severity-critical/10 px-3 py-2 text-sm text-severity-critical">
              <XCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!email || !password || loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
