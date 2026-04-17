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

function renderMaybeArray(value: unknown): string {
  if (!value) return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  return String(value);
}

export default function FindingsPage() {
  const [sevFilter, setSevFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const { data, isLoading } = usePollingQuery<any>(
    ["findings", sevFilter, String(limit)],
    "/api/v1/findings/",
    { severity: sevFilter || undefined, limit },
  );
  const { data: stats } = usePollingQuery<any>(["finding-stats-page"], "/api/v1/findings/stats/summary");

  const { data: findingDetail } = usePollingQuery<any>(
    ["finding-detail", expanded || ""],
    expanded ? `/api/v1/findings/${expanded}` : "/api/v1/findings/",
    undefined,
    !!expanded,
  );

  const findings = data?.findings || [];

  const getCounts = (sev: string) => {
    if (!stats) return "";
    if (!sev) return stats.total ?? data?.total ?? "";
    return stats.by_severity?.[sev] ?? 0;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>
        Findings
      </h1>

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
      ) : !findings.length ? (
        <EmptyState message="No findings yet" sub="Scanner is running — check back soon" />
      ) : (
        <>
          <div className="space-y-3">
            {findings.map((f: any) => {
              const isOpen = expanded === f.finding_id;
              const detail = isOpen ? findingDetail || f : f;
              return (
                <div
                  key={f.finding_id}
                  className={cn("rounded-lg border border-border bg-card transition-all animate-fade-up", f.is_new && "ring-1 ring-severity-info/30")}
                >
                  <button onClick={() => setExpanded(isOpen ? null : f.finding_id)} className="flex w-full items-start gap-3 p-4 text-left">
                    {isOpen ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={f.severity} />
                        <span className="text-sm font-medium text-foreground">{f.template_name || f.template_id}</span>
                        {f.is_new && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">New</span>}
                        {f.confirmed ? (
                          <span className="flex items-center gap-1 text-[10px] text-severity-low">
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-severity-medium">
                            <AlertTriangle className="h-3 w-3" />
                            Unconfirmed
                          </span>
                        )}
                      </div>
                      <p className="truncate font-mono text-xs text-muted-foreground">{f.matched_at || f.domain}</p>
                      {!!f.tags?.length && (
                        <div className="flex flex-wrap gap-1">
                          {f.tags.slice(0, 8).map((t: string) => (
                            <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground" title={absoluteTime(f.first_seen)}>
                      {relativeTime(f.first_seen)}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t border-border px-4 pb-4 pt-3 animate-slide-down-in">
                      {detail.description && <p className="text-sm text-muted-foreground">{detail.description}</p>}

                      <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">Domain: </span>
                          <span className="text-foreground">{detail.domain || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Template ID: </span>
                          <span className="font-mono text-foreground">{detail.template_id || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Matched At: </span>
                          <span className="font-mono text-foreground">{detail.matched_at || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Matcher: </span>
                          <span className="text-foreground">{detail.matcher_name || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scan Run: </span>
                          <span className="font-mono text-foreground">{detail.scan_run_id || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Severity: </span>
                          <span className="text-foreground">{detail.severity || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">First Seen: </span>
                          <span className="text-foreground">{detail.first_seen ? absoluteTime(detail.first_seen) : "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Seen: </span>
                          <span className="text-foreground">{detail.last_seen ? absoluteTime(detail.last_seen) : "—"}</span>
                        </div>
                      </div>

                      {!!detail.reference?.length && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">References:</span>
                          <div className="mt-1 space-y-1">
                            {detail.reference.map((ref: string) => (
                              <a key={ref} href={ref} target="_blank" rel="noopener noreferrer" className="block break-all text-xs text-primary hover:underline">
                                {ref}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Extracted Results:</span>
                        <p className="mt-1 break-all text-xs text-foreground">{renderMaybeArray(detail.extracted_results)}</p>
                      </div>

                      {detail.curl_command && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">cURL:</span>
                          <pre className="mt-1 overflow-x-auto rounded bg-background p-3 font-mono text-xs text-foreground">{detail.curl_command}</pre>
                        </div>
                      )}

                      {detail.request && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Raw Request:</span>
                          <pre className="mt-1 max-h-56 overflow-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">
                            {detail.request}
                          </pre>
                        </div>
                      )}

                      {detail.response && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Raw Response:</span>
                          <pre className="mt-1 max-h-56 overflow-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">
                            {detail.response}
                          </pre>
                        </div>
                      )}

                      {detail.extra && Object.keys(detail.extra).length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Extra Metadata:</span>
                          <pre className="mt-1 max-h-56 overflow-auto rounded bg-background p-3 font-mono text-xs text-foreground scrollbar-thin">
                            {JSON.stringify(detail.extra, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {findings.length < (data?.total ?? 0) && (
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
