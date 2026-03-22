import { useState } from "react";
import { setApiConfig, getApiConfig } from "@/lib/api";
import { apiFetch } from "@/lib/api";
import { Crosshair, Loader2, CheckCircle2, XCircle } from "lucide-react";

export function SetupModal({ onComplete }: { onComplete: () => void }) {
  const cfg = getApiConfig();
  const [url, setUrl] = useState(cfg.baseUrl);
  const [key, setKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setTesting(true);
    setError("");
    setApiConfig(url, key);
    try {
      const res = await apiFetch<{ status: string }>("/api/v1/health");
      if (res.status === "ok") {
        onComplete();
      } else {
        setError("Unexpected response from API");
      }
    } catch (e: any) {
      if (e.message === "AUTH_FAILED") setError("Invalid API key");
      else setError("Cannot connect to API. Check the URL.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Crosshair className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">ZeroPoint</h1>
            <p className="text-sm text-muted-foreground">Connect to your instance</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">API Base URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="http://localhost:8000"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              placeholder="Enter your API key"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-severity-critical/10 px-3 py-2 text-sm text-severity-critical">
              <XCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!key || testing}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {testing ? "Testing..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
