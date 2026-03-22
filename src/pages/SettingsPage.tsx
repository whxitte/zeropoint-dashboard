import { useState } from "react";
import { getApiConfig, setApiConfig, apiFetch } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const cfg = getApiConfig();
  const [url, setUrl] = useState(cfg.baseUrl);
  const [key, setKey] = useState(cfg.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    setApiConfig(url, key);
    try {
      const res = await apiFetch<any>("/api/v1/health");
      setResult({ ok: true, msg: `Connected — status: ${res.status}, db: ${res.db}${res.version ? `, v${res.version}` : ""}` });
    } catch (e: any) {
      setResult({ ok: false, msg: e.message === "AUTH_FAILED" ? "Invalid API key" : "Cannot connect" });
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    setApiConfig(url, key);
    setResult({ ok: true, msg: "Settings saved" });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Settings</h1>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">API Base URL</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">API Key</label>
          <div className="relative">
            <input type={showKey ? "text" : "password"} value={key} onChange={e => setKey(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none focus:border-primary" />
            <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {result && (
          <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${result.ok ? "bg-severity-low/10 text-severity-low" : "bg-severity-critical/10 text-severity-critical"}`}>
            {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {result.msg}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={testConnection} disabled={testing}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-accent active:scale-[0.97] disabled:opacity-50">
            {testing && <Loader2 className="h-4 w-4 animate-spin" />}
            Test Connection
          </button>
          <button onClick={save}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.97]">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
