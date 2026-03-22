import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function PortsPage() {
  const [sevFilter, setSevFilter] = useState("");
  const { data, isLoading } = usePollingQuery<any>(["ports", sevFilter], "/api/v1/portfindings/", { severity: sevFilter || undefined, limit: 100 });
  const { data: stats } = usePollingQuery<any>(["port-stats-page"], "/api/v1/portfindings/stats");
  const findings = data?.findings || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Open Ports</h1>

      {/* Stats bar */}
      {stats && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Total: <strong className="text-foreground">{stats.total ?? 0}</strong></span>
          <span>Critical: <strong className="text-severity-critical">{stats.critical ?? 0}</strong></span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {["", "critical", "high", "medium", "low"].map(s => (
          <button key={s} onClick={() => setSevFilter(s)}
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              sevFilter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSkeleton rows={8} /> : !findings.length ? <EmptyState message="No open ports found" sub="Port scan is running" /> : (
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
                <tr key={f.finding_id} className={cn("border-b border-border transition-colors hover:bg-surface-elevated",
                  f.severity === "critical" && "border-l-2 border-l-severity-critical")}>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{f.ip}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{f.port}/{f.protocol}</td>
                  <td className="px-4 py-3 text-foreground">{f.service || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.product || "—"}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                  <td className="hidden max-w-[200px] truncate px-4 py-3 text-muted-foreground md:table-cell">{f.reason || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.domain}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" title={absoluteTime(f.first_seen)}>{relativeTime(f.first_seen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
