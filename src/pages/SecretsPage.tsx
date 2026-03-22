import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

export default function SecretsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, isLoading } = usePollingQuery<any>(["secrets"], "/api/v1/secrets/", { limit: 50 });
  const secrets = data?.secrets || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>JS Secrets</h1>

      <div className="flex items-center gap-2 rounded-lg border border-severity-high/30 bg-severity-high/10 px-4 py-2.5 text-sm text-severity-high">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Handle with care — these are live credentials
      </div>

      {isLoading ? <LoadingSkeleton rows={6} /> : !secrets.length ? <EmptyState message="No secrets found" sub="JS analysis is running" /> : (
        <div className="space-y-3">
          {secrets.map((s: any) => {
            const isOpen = expanded === s.secret_id;
            return (
              <div key={s.secret_id} className="rounded-lg border border-border bg-card animate-fade-up">
                <button onClick={() => setExpanded(isOpen ? null : s.secret_id)} className="flex w-full items-start gap-3 p-4 text-left">
                  {isOpen ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={s.severity} />
                      <span className="text-sm font-medium text-foreground">{s.secret_type}</span>
                      {s.is_new && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">New</span>}
                      {s.tool && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{s.tool}</span>}
                    </div>
                    <p className="truncate font-mono text-xs text-severity-high">{s.secret_value}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.domain} · line {s.line_number}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground" title={absoluteTime(s.first_seen)}>{relativeTime(s.first_seen)}</span>
                </button>
                {isOpen && s.context && (
                  <div className="border-t border-border px-4 pb-4 pt-3 animate-slide-down-in">
                    <span className="text-xs font-medium text-muted-foreground">Context:</span>
                    <pre className="mt-1 overflow-x-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">{s.context}</pre>
                    {s.source_url && (
                      <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-primary hover:underline">
                        View source →
                      </a>
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
