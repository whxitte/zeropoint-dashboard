import { usePollingQuery } from "@/hooks/use-api";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { cn } from "@/lib/utils";

const TAGS = ["", "login", "api", "admin", "upload", "graphql", "ssrf", "idor"];

export default function EndpointsPage() {
  const [tagFilter, setTagFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const { data, isLoading } = usePollingQuery<any>(["endpoints", tagFilter], "/api/v1/endpoints/", {
    is_interesting: true,
    limit: 200,
  });

  const endpoints = data?.endpoints || [];
  const filtered = useMemo(() => {
    if (!tagFilter) return endpoints;
    return endpoints.filter((e: any) => (e.interest_tags || []).some((t: string) => t.toLowerCase().includes(tagFilter)));
  }, [endpoints, tagFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
          Endpoints
        </h1>
        <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">{data?.total ?? 0}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTagFilter(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tagFilter === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : !filtered.length ? (
        <EmptyState message="No endpoints crawled yet" sub="Crawler is running" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">First Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: any, i: number) => (
                <tr
                  key={e.endpoint_id || e.url || i}
                  onClick={() => setSelected(e)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-surface-elevated"
                >
                  <td className="px-4 py-3">
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                      onClick={(evt) => evt.stopPropagation()}
                    >
                      {e.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-foreground">{e.method || "GET"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.status_code ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.source || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(e.interest_tags || []).slice(0, 4).map((t: string) => (
                        <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" title={absoluteTime(e.first_seen)}>
                    {relativeTime(e.first_seen)}
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
              <h2 className="font-mono text-sm text-primary">{selected.url}</h2>
              <button onClick={() => setSelected(null)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Endpoint ID", selected.endpoint_id],
                ["Domain", selected.domain],
                ["Path", selected.url_path],
                ["Method", selected.method],
                ["Status Code", selected.status_code],
                ["Content Type", selected.content_type],
                ["Source", selected.source],
                ["Interesting", String(!!selected.is_interesting)],
                ["Crawl Run", selected.crawl_run_id],
                ["First Seen", selected.first_seen ? absoluteTime(selected.first_seen) : "—"],
                ["Last Seen", selected.last_seen ? absoluteTime(selected.last_seen) : "—"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <span className="text-muted-foreground">{k}: </span>
                  <span className="text-foreground">{(v as string) || "—"}</span>
                </div>
              ))}
              {!!selected.interest_tags?.length && (
                <div>
                  <span className="text-muted-foreground">Interest Tags:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.interest_tags.map((t: string) => (
                      <span key={t} className="rounded bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
