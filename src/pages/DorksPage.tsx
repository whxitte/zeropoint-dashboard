import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { relativeTime, absoluteTime } from "@/lib/time";

const CATEGORIES = ["", "exposed_files", "credentials", "admin_panels", "directory_listing", "sensitive_info"];

export default function DorksPage() {
  const [catFilter, setCatFilter] = useState("");
  const [limit, setLimit] = useState(50);

  const { data, isLoading } = usePollingQuery<any>(["dorks", catFilter, String(limit)], "/api/v1/dorks/", {
    dork_category: catFilter || undefined,
    limit,
  });
  const { data: stats } = usePollingQuery<any>(["dork-stats"], "/api/v1/dorks/stats");
  const results = data?.results || [];

  const topCategory = useMemo(() => {
    const entries = Object.entries(stats?.by_category || {}) as Array<[string, number]>;
    if (!entries.length) return "—";
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [stats]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
        Dork Results
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
            Top category: <strong className="text-foreground">{topCategory}</strong>
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCatFilter(c);
              setLimit(50);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize",
              catFilter === c ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : !results.length ? (
        <EmptyState message="No dork results" sub="Google dorking is in progress" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((r: any) => (
              <div key={r.result_id} className="rounded-lg border border-border bg-card p-4 space-y-2 animate-fade-up">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={r.severity} />
                  {r.dork_category && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{r.dork_category}</span>}
                  {r.is_new && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">New</span>}
                </div>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  {r.title || r.url} <ExternalLink className="h-3 w-3" />
                </a>
                {r.snippet && <p className="text-xs text-muted-foreground line-clamp-3">{r.snippet}</p>}
                <div className="space-y-1 text-xs">
                  <p className="truncate font-mono text-muted-foreground/80">Query: {r.dork_query || "—"}</p>
                  <p className="truncate text-muted-foreground">Domain: {r.domain || "—"}</p>
                  <p className="text-muted-foreground" title={absoluteTime(r.first_seen)}>
                    First seen: {relativeTime(r.first_seen)}
                  </p>
                  {!!r.reason && <p className="text-muted-foreground">Reason: {r.reason}</p>}
                </div>
              </div>
            ))}
          </div>
          {results.length < (data?.total ?? 0) && (
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
