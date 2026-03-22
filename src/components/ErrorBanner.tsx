import { AlertTriangle, Settings, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthErrorBanner() {
  return (
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-severity-critical/30 bg-severity-critical/10 px-4 py-3 text-severity-critical">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">Authentication failed — check your API key.</span>
      <Link to="/settings" className="ml-auto flex items-center gap-1 text-sm underline">
        <Settings className="h-4 w-4" /> Settings
      </Link>
    </div>
  );
}

export function ConnectionErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-severity-high/30 bg-severity-high/10 px-4 py-3 text-severity-high">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">Cannot connect to API</span>
      <button onClick={onRetry} className="ml-auto flex items-center gap-1 text-sm underline">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );
}
