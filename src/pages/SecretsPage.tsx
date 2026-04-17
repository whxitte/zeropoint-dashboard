import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { ChevronDown, ChevronRight, AlertTriangle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const SEVERITIES = ["", "critical", "high", "medium", "low", "info"];
const SEV_LABELS = ["All", "Critical", "High", "Medium", "Low", "Info"];

export default function SecretsPage() {
  const [sevFilter, setSevFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const { data, isLoading } = usePollingQuery<any>(["secrets", sevFilter, String(limit)], "/api/v1/secrets/", {
    severity: sevFilter || undefined,
    limit,
  });
  const { data: stats } = usePollingQuery<any>(["secrets-stats"], "/api/v1/secrets/stats");

  const secrets = data?.secrets || [];
  const totalSecrets = stats?.total ?? data?.total ?? 0;

  const getCounts = (sev: string) => {
    if (!stats) return "";
    if (!sev) return totalSecrets;
    return stats.by_severity?.[sev] ?? 0;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Secret value copied to clipboard." });
    } catch (err) {
      toast({ title: "Copy failed", description: "Could not copy value.", variant: "destructive" });
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
          JS Secrets
        </h1>
        <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">{totalSecrets} total</span>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-severity-high/30 bg-severity-high/10 px-4 py-2.5 text-sm text-severity-high">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Handle with care — these may include live credentials.
      </div>

      <div className="flex flex-wrap gap-2">
        {SEVERITIES.map((s, i) => (
          <button
            key={s}
            onClick={() => {
              setSevFilter(s);
              setExpanded(null);
              setLimit(50);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              sevFilter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {SEV_LABELS[i]} {getCounts(s) !== "" ? `(${getCounts(s)})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : !secrets.length ? (
        <EmptyState message="No secrets found" sub="JS analysis is running" />
      ) : (
        <>
          <div className="space-y-3">
            {secrets.map((s: any) => {
              const isOpen = expanded === s.secret_id;
              return (
                <div key={s.secret_id} className="rounded-lg border border-border bg-card animate-fade-up">
                  <button onClick={() => setExpanded(isOpen ? null : s.secret_id)} className="flex w-full items-start gap-3 p-4 text-left">
                    {isOpen ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={s.severity} />
                        <span className="text-sm font-medium text-foreground">{s.secret_type}</span>
                        {s.is_new && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">New</span>}
                        {s.tool && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{s.tool}</span>}
                      </div>
                      <p className="truncate font-mono text-xs text-severity-high">{s.secret_value}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.domain} {s.line_number ? `· line ${s.line_number}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground" title={absoluteTime(s.first_seen)}>
                      {relativeTime(s.first_seen)}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t border-border px-4 pb-4 pt-3 animate-slide-down-in">
                      <div className="flex items-center justify-between rounded bg-surface-elevated px-3 py-2">
                        <code className="max-w-[80%] truncate text-xs text-foreground">{s.secret_value}</code>
                        <button
                          onClick={() => copyToClipboard(s.secret_value)}
                          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>

                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">Domain: </span>
                          <span className="text-foreground">{s.domain || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Source URL: </span>
                          {s.source_url ? (
                            <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Open
                            </a>
                          ) : (
                            <span className="text-foreground">—</span>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Line: </span>
                          <span className="text-foreground">{s.line_number ?? "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tool: </span>
                          <span className="text-foreground">{s.tool || "—"}</span>
                        </div>
                      </div>

                      {s.context && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Context:</span>
                          <pre className="mt-1 max-h-40 overflow-x-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">{s.context}</pre>
                        </div>
                      )}

                      {s.extra && Object.keys(s.extra).length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Raw Data:</span>
                          <pre className="mt-1 max-h-56 overflow-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">
                            {JSON.stringify(s.extra, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {secrets.length < (data?.total ?? 0) && (
            <button
              onClick={() => setLimit((l) => l + 50)}
              className="mx-auto mt-4 flex rounded-md bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground active:scale-[0.97]"
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}
