import { usePollingQuery } from "@/hooks/use-api";
import { StatCard } from "@/components/StatCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CardSkeleton, LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { relativeTime, absoluteTime } from "@/lib/time";
import { Search, X, Globe, Activity, Bug, Shield, KeyRound, GitBranch, Network } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: assetStats, isLoading: al } = usePollingQuery<any>(["asset-stats"], "/api/v1/assets/stats");
  const { data: findingStats, isLoading: fl } = usePollingQuery<any>(["finding-stats"], "/api/v1/findings/stats/summary");
  const { data: secretsStats } = usePollingQuery<any>(["secrets-stats"], "/api/v1/secrets/stats");
  const { data: leaksStats } = usePollingQuery<any>(["leaks-stats"], "/api/v1/leaks/stats");
  const { data: portStats } = usePollingQuery<any>(["port-stats"], "/api/v1/portfindings/stats");
  const { data: findings } = usePollingQuery<any>(["findings-recent"], "/api/v1/findings/", { limit: 10 });

  const chartData = findingStats?.by_severity ? [
    { name: "Critical", count: findingStats.by_severity.critical || 0, fill: "hsl(var(--severity-critical))" },
    { name: "High", count: findingStats.by_severity.high || 0, fill: "hsl(var(--severity-high))" },
    { name: "Medium", count: findingStats.by_severity.medium || 0, fill: "hsl(var(--severity-medium))" },
    { name: "Low", count: findingStats.by_severity.low || 0, fill: "hsl(var(--severity-low))" },
    { name: "Info", count: findingStats.by_severity.info || 0, fill: "hsl(var(--severity-info))" },
  ] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground" style={{ lineHeight: "1.1" }}>Dashboard</h1>

      {al ? <CardSkeleton count={7} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard label="Total Assets" value={assetStats?.total ?? 0} icon={Globe} to="/assets" />
          <StatCard label="Alive" value={assetStats?.alive ?? 0} icon={Activity} to="/assets" accentClass="text-severity-low" />
          <StatCard label="Critical" value={findingStats?.by_severity?.critical ?? 0} icon={Bug} to="/findings" accentClass="text-severity-critical" />
          <StatCard label="High" value={findingStats?.by_severity?.high ?? 0} icon={Shield} to="/findings" accentClass="text-severity-high" />
          <StatCard label="Secrets" value={secretsStats?.total ?? 0} icon={KeyRound} to="/secrets" accentClass="text-severity-medium" />
          <StatCard label="GH Leaks" value={leaksStats?.total ?? 0} icon={GitBranch} to="/leaks" />
          <StatCard label="Open Ports" value={portStats?.total ?? 0} icon={Network} to="/ports" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Findings by Severity</h2>
          {fl ? <div className="h-48 animate-pulse rounded bg-surface-elevated" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: "hsl(215 10% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 10% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(215 22% 11%)", border: "1px solid hsl(215 12% 21%)", borderRadius: 6, color: "hsl(213 14% 80%)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent findings feed */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Recent Findings</h2>
          {!findings?.findings?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No findings yet — scanner is running</p>
          ) : (
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 240 }}>
              {findings.findings.slice(0, 10).map((f: any) => (
                <div key={f.finding_id} className="flex items-center gap-3 rounded-md bg-surface-elevated px-3 py-2 animate-fade-up">
                  <SeverityBadge severity={f.severity} />
                  <span className="truncate text-sm text-foreground">{f.template_name || f.template_id}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground" title={absoluteTime(f.first_seen)}>
                    {relativeTime(f.first_seen)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
