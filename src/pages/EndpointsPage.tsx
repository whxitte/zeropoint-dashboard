import { usePollingQuery } from "@/hooks/use-api";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { cn } from "@/lib/utils";

const TAGS = ["", "login", "api", "admin", "upload", "graphql", "ssrf", "idor"];

export default function EndpointsPage() {
  const [tagFilter, setTagFilter] = useState("");
  const { data, isLoading } = usePollingQuery<any>(["endpoints", tagFilter], "/api/v1/endpoints/", { is_interesting: true, limit: 100 });
  // fallback to assets
  const { data: fallback } = usePollingQuery<any>(["endpoints-fb"], "/api/v1/assets/", { interest_level: "high", limit: 100 }, !data);

  const items = data?.endpoints || data?.assets || fallback?.assets || [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Endpoints</h1>

      <div className="flex flex-wrap gap-2">
        {TAGS.map(t => (
          <button key={t} onClick={() => setTagFilter(t)}
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tagFilter === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
            {t || "All"}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSkeleton rows={8} /> : !items.length ? <EmptyState message="No endpoints crawled yet" sub="Crawler is running" /> : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">URL / Domain</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">First Seen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e: any, i: number) => (
                <tr key={e.url || e.domain || i} className="border-b border-border transition-colors hover:bg-surface-elevated">
                  <td className="px-4 py-3">
                    <a href={e.url || `https://${e.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">
                      {e.url || e.domain} <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(e.tags || e.interest_reasons || []).map((t: string) => (
                        <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" title={absoluteTime(e.first_seen)}>{relativeTime(e.first_seen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
