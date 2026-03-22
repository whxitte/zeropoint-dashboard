import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITIES = ["", "critical", "high", "medium", "low", "info"];
const SEV_LABELS = ["All", "Critical", "High", "Medium", "Low", "Info"];

export default function FindingsPage() {
  const [sevFilter, setSevFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = usePollingQuery<any>(
    ["findings", sevFilter],
    "/api/v1/findings/",
    { severity: sevFilter || undefined, limit: 50 }
  );
  const { data: stats } = usePollingQuery<any>(["finding-stats-page"], "/api/v1/findings/stats/summary");

  const findings = data?.findings || [];

  const getCounts = (sev: string) => {
    if (!stats) return "";
    if (!sev) return data?.total ?? "";
    return stats[sev] ?? "";
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Findings</h1>

      {/* Severity tabs */}
      <div className="flex flex-wrap gap-2">
        {SEVERITIES.map((s, i) => (
          <button key={s} onClick={() => setSevFilter(s)}
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              sevFilter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            )}>
            {SEV_LABELS[i]} {getCounts(s) !== "" ? `(${getCounts(s)})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSkeleton rows={6} /> : !findings.length ? <EmptyState message="No findings yet" sub="Scanner is running — check back soon" /> : (
        <div className="space-y-3">
          {findings.map((f: any) => {
            const isOpen = expanded === f.finding_id;
            return (
              <div key={f.finding_id}
                className={cn("rounded-lg border border-border bg-card transition-all animate-fade-up",
                  f.is_new && "ring-1 ring-severity-info/30"
                )}>
                <button onClick={() => setExpanded(isOpen ? null : f.finding_id)}
                  className="flex w-full items-start gap-3 p-4 text-left">
                  {isOpen ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={f.severity} />
                      <span className="text-sm font-medium text-foreground">{f.template_name || f.template_id}</span>
                      {f.is_new && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">New</span>}
                      {f.confirmed ? (
                        <span className="flex items-center gap-1 text-[10px] text-severity-low"><CheckCircle2 className="h-3 w-3" />Confirmed</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-severity-medium"><AlertTriangle className="h-3 w-3" />Unconfirmed</span>
                      )}
                    </div>
                    <p className="truncate font-mono text-xs text-muted-foreground">{f.matched_at || f.domain}</p>
                    {f.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {f.tags.slice(0, 6).map((t: string) => (
                          <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground" title={absoluteTime(f.first_seen)}>{relativeTime(f.first_seen)}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3 animate-slide-down-in">
                    {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
                    {f.reference && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">References:</span>
                        <p className="mt-1 break-all text-xs text-primary">{f.reference}</p>
                      </div>
                    )}
                    {f.curl_command && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">cURL:</span>
                        <pre className="mt-1 overflow-x-auto rounded bg-background p-3 font-mono text-xs text-foreground">{f.curl_command}</pre>
                      </div>
                    )}
                    {f.request && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Request:</span>
                        <pre className="mt-1 max-h-40 overflow-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">{f.request}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
