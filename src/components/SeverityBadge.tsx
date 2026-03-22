import { cn } from "@/lib/utils";

const severityMap: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-severity-critical/15", text: "text-severity-critical", border: "border-severity-critical/30" },
  high: { bg: "bg-severity-high/15", text: "text-severity-high", border: "border-severity-high/30" },
  medium: { bg: "bg-severity-medium/15", text: "text-severity-medium", border: "border-severity-medium/30" },
  low: { bg: "bg-severity-low/15", text: "text-severity-low", border: "border-severity-low/30" },
  info: { bg: "bg-severity-info/15", text: "text-severity-info", border: "border-severity-info/30" },
};

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const s = severity?.toLowerCase() || "unknown";
  const colors = severityMap[s] || { bg: "bg-severity-unknown/15", text: "text-severity-unknown", border: "border-severity-unknown/30" };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wide", colors.bg, colors.text, colors.border, className)}>
      {s}
    </span>
  );
}
