import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["", "exposed_files", "credentials", "admin_panels", "directory_listing", "sensitive_info"];

export default function DorksPage() {
  const [catFilter, setCatFilter] = useState("");
  const { data, isLoading } = usePollingQuery<any>(["dorks", catFilter], "/api/v1/dorks/", { limit: 50 });
  const results = data?.results || [];
  const filtered = catFilter ? results.filter((r: any) => r.dork_category === catFilter) : results;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Dork Results</h1>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize",
              catFilter === c ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
            {c || "All"}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSkeleton rows={6} /> : !filtered.length ? <EmptyState message="No dork results" sub="Google dorking is in progress" /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((r: any) => (
            <div key={r.result_id} className="rounded-lg border border-border bg-card p-4 space-y-2 animate-fade-up">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={r.severity} />
                {r.dork_category && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{r.dork_category}</span>}
              </div>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                {r.title || r.url} <ExternalLink className="h-3 w-3" />
              </a>
              {r.snippet && <p className="text-xs text-muted-foreground line-clamp-2">{r.snippet}</p>}
              {r.dork_query && <p className="truncate font-mono text-[10px] text-muted-foreground/60">{r.dork_query}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
