import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export default function PortsPage() {
  const [sevFilter, setSevFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const { data, isLoading } = usePollingQuery<any>(["ports", sevFilter], "/api/v1/portfindings/", {
    severity: sevFilter || undefined,
    limit: 100,
  });
  const { data: stats } = usePollingQuery<any>(["port-stats-page"], "/api/v1/portfindings/stats");
  const findings = data?.findings || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
        Open Ports
      </h1>

      {stats && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            Total: <strong className="text-foreground">{stats.total ?? 0}</strong>
          </span>
          <span>
            Critical: <strong className="text-severity-critical">{stats.by_severity?.critical ?? 0}</strong>
          </span>
          <span>
            High: <strong className="text-severity-high">{stats.by_severity?.high ?? 0}</strong>
          </span>
          <span>
            Top service: <strong className="text-foreground">{Object.keys(stats.top_services || {})[0] || "—"}</strong>
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {["", "critical", "high", "medium", "low", "info"].map((s) => (
          <button
            key={s}
            onClick={() => setSevFilter(s)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              sevFilter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : !findings.length ? (
        <EmptyState message="No open ports found" sub="Port scan is running" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Port</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Severity</th>
                <th className="hidden px-4 py-3 md:table-cell">Reason</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">First Seen</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f: any) => (
                <tr
                  key={f.finding_id}
                  onClick={() => setSelected(f)}
                  className={cn(
                    "cursor-pointer border-b border-border transition-colors hover:bg-surface-elevated",
                    f.severity === "critical" && "border-l-2 border-l-severity-critical",
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{f.ip}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">
                    {f.port}/{f.protocol}
                  </td>
                  <td className="px-4 py-3 text-foreground">{f.service || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.product || "—"}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="hidden max-w-[220px] truncate px-4 py-3 text-muted-foreground md:table-cell">{f.reason || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.domain || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" title={absoluteTime(f.first_seen)}>
                    {relativeTime(f.first_seen)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-2xl animate-slide-down-in scrollbar-thin">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-sm text-primary">
                {selected.ip}:{selected.port}/{selected.protocol}
              </h2>
              <button onClick={() => setSelected(null)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Severity", selected.severity],
                ["Service", selected.service],
                ["Product", selected.product],
                ["Domain", selected.domain],
                ["Reason", selected.reason],
                ["Scan Run", selected.scan_run_id],
                ["First Seen", selected.first_seen ? absoluteTime(selected.first_seen) : "—"],
                ["Last Seen", selected.last_seen ? absoluteTime(selected.last_seen) : "—"],
                ["Suppress Until", selected.suppress_until ? absoluteTime(selected.suppress_until) : "—"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <span className="text-muted-foreground">{k}: </span>
                  <span className="text-foreground">{(v as string) || "—"}</span>
                </div>
              ))}
              {selected.banner && (
                <div>
                  <span className="text-muted-foreground">Banner:</span>
                  <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded border border-border bg-surface-elevated p-2 text-xs text-foreground">
                    {selected.banner}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
