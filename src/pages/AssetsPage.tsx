import { usePollingQuery } from "@/hooks/use-api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [probeFilter, setProbeFilter] = useState("alive");
  const [interestFilter, setInterestFilter] = useState("");
  const [limit, setLimit] = useState(50);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading, error } = usePollingQuery<any>(
    ["assets", search, probeFilter, interestFilter, String(limit)],
    "/api/v1/assets/",
    { limit, probe_status: probeFilter || undefined, interest_level: interestFilter || undefined }
  );

  const assets = (data?.assets || []).filter((a: any) =>
    !search || a.domain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Assets</h1>
        <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">{data?.total ?? 0} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domains..."
            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        {[{ val: "alive", label: "Alive" }, { val: "dead", label: "Dead" }, { val: "", label: "All" }].map(f => (
          <button key={f.val} onClick={() => setProbeFilter(f.val)}
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              probeFilter === f.val ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            )}>
            {f.label}
          </button>
        ))}
        {["high", "medium", "low"].map(l => (
          <button key={l} onClick={() => setInterestFilter(interestFilter === l ? "" : l)}
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              interestFilter === l ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
            )}>
            {l} interest
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSkeleton rows={8} /> : !assets.length ? <EmptyState message="No assets found" sub="Adjust filters or wait for discovery" /> : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">HTTP</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Technologies</th>
                  <th className="hidden px-4 py-3 md:table-cell">Title</th>
                  <th className="px-4 py-3">First Seen</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a: any) => (
                  <tr key={a.domain} onClick={() => setSelected(a)}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{a.domain}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-block h-2 w-2 rounded-full", a.probe_status === "alive" ? "bg-severity-low" : "bg-severity-unknown")} />
                    </td>
                    <td className="px-4 py-3"><SeverityBadge severity={a.interest_level || "unknown"} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.http_status || "—"}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(a.technologies || []).slice(0, 3).map((t: string) => (
                          <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden max-w-[200px] truncate px-4 py-3 text-muted-foreground md:table-cell">{a.http_title || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" title={absoluteTime(a.first_seen)}>{relativeTime(a.first_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {assets.length >= limit && (
            <button onClick={() => setLimit(l => l + 50)}
              className="mx-auto flex rounded-md bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground active:scale-[0.97]">
              Load more
            </button>
          )}
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-2xl animate-slide-down-in scrollbar-thin">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-sm text-primary">{selected.domain}</h2>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Probe Status", selected.probe_status],
                ["HTTP Status", selected.http_status],
                ["Title", selected.http_title],
                ["Interest Level", selected.interest_level],
              ].map(([k, v]) => (
                <div key={k as string}><span className="text-muted-foreground">{k}: </span><span className="text-foreground">{v || "—"}</span></div>
              ))}
              {selected.interest_reasons?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Interest Reasons:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.interest_reasons.map((r: string) => (
                      <span key={r} className="rounded bg-accent px-2 py-0.5 text-xs text-muted-foreground">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.technologies?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Technologies:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.technologies.map((t: string) => (
                      <span key={t} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {selected.ip_addresses?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">IPs:</span>
                  <div className="mt-1 font-mono text-xs text-foreground">{selected.ip_addresses.join(", ")}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
