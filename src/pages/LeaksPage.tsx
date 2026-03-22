import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

export default function LeaksPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, isLoading } = usePollingQuery<any>(["leaks"], "/api/v1/leaks/", { limit: 50 });
  const leaks = data?.leaks || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>GitHub Leaks</h1>
        <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">{data?.total ?? 0}</span>
      </div>

      {isLoading ? <LoadingSkeleton rows={6} /> : !leaks.length ? <EmptyState message="No leaks detected" sub="OSINT scan is active" /> : (
        <div className="space-y-3">
          {leaks.map((l: any) => {
            const isOpen = expanded === l.leak_id;
            return (
              <div key={l.leak_id} className="rounded-lg border border-border bg-card animate-fade-up">
                <button onClick={() => setExpanded(isOpen ? null : l.leak_id)} className="flex w-full items-start gap-3 p-4 text-left">
                  {isOpen ? <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={l.severity} />
                      <span className="text-sm font-medium text-foreground">{l.match_type}</span>
                      {l.is_new && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">New</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <a href={l.repo_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>
                        {l.repo_full_name} <ExternalLink className="ml-0.5 inline h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground">· {l.file_path}</span>
                    </div>
                    <p className="truncate font-mono text-xs text-severity-high">{l.match_value}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground" title={absoluteTime(l.first_seen)}>{relativeTime(l.first_seen)}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-2 animate-slide-down-in">
                    {l.match_context && <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">{l.match_context}</pre>}
                    <div className="flex gap-3">
                      {l.repo_url && <a href={l.repo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open repo →</a>}
                      {l.file_url && <a href={l.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open file →</a>}
                    </div>
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
