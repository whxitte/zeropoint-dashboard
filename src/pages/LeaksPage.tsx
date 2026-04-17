import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { ChevronDown, ChevronRight, ExternalLink, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function LeaksPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const { data, isLoading } = usePollingQuery<any>(["leaks", String(limit)], "/api/v1/leaks/", { limit });
  const { data: leaksStats } = usePollingQuery<any>(["leaks-stats-page"], "/api/v1/leaks/stats");
  const leaks = data?.leaks || [];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Leak value copied to clipboard." });
    } catch (err) {
      toast({ title: "Copy failed", description: "Could not copy leak value.", variant: "destructive" });
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
          GitHub Leaks
        </h1>
        <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">{leaksStats?.total ?? data?.total ?? 0}</span>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : !leaks.length ? (
        <EmptyState message="No leaks detected" sub="OSINT scan is active" />
      ) : (
        <>
          <div className="space-y-3">
            {leaks.map((l: any) => {
              const isOpen = expanded === l.leak_id;
              return (
                <div key={l.leak_id} className="rounded-lg border border-border bg-card animate-fade-up">
                  <button onClick={() => setExpanded(isOpen ? null : l.leak_id)} className="flex w-full items-start gap-3 p-4 text-left">
                    {isOpen ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={l.severity} />
                        <span className="text-sm font-medium text-foreground">{l.match_type}</span>
                        {l.is_new && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">New</span>}
                        {l.is_verified && <span className="rounded bg-severity-low/20 px-1.5 py-0.5 text-[10px] font-semibold text-severity-low">Verified</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <a
                          href={l.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {l.repo_full_name} <ExternalLink className="ml-0.5 inline h-3 w-3" />
                        </a>
                        <span className="text-muted-foreground">· {l.file_path}</span>
                      </div>
                      <p className="truncate font-mono text-xs text-severity-high">{l.match_value}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground" title={absoluteTime(l.first_seen)}>
                      {relativeTime(l.first_seen)}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t border-border px-4 pb-4 pt-3 animate-slide-down-in">
                      <div className="flex items-center justify-between rounded bg-surface-elevated px-3 py-2">
                        <code className="max-w-[80%] truncate text-xs text-foreground">{l.match_value}</code>
                        <button
                          onClick={() => copyToClipboard(l.match_value)}
                          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>

                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">Domain: </span>
                          <span className="text-foreground">{l.domain || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Line: </span>
                          <span className="text-foreground">{l.line_number ?? "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Branch: </span>
                          <span className="text-foreground">{l.branch || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Commit: </span>
                          <span className="font-mono text-foreground">{l.commit_sha || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dork Query: </span>
                          <span className="font-mono text-foreground">{l.dork_query || "—"}</span>
                        </div>
                      </div>

                      {l.match_context && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Match Context:</span>
                          <pre className="mt-1 max-h-48 overflow-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">
                            {l.match_context}
                          </pre>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {l.repo_url && (
                          <a href={l.repo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            Open repo →
                          </a>
                        )}
                        {l.file_url && (
                          <a href={l.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            Open file →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {leaks.length < (data?.total ?? 0) && (
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
