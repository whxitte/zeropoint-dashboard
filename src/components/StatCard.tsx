import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  to?: string;
  className?: string;
  accentClass?: string;
}

export function StatCard({ label, value, icon: Icon, to, className, accentClass }: StatCardProps) {
  const content = (
    <div className={cn("group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-semibold tracking-tight", accentClass || "text-foreground")}>{value}</p>
        </div>
        <Icon className="h-8 w-8 text-muted-foreground/40 transition-colors group-hover:text-primary/60" />
      </div>
    </div>
  );
  if (to) return <Link to={to}>{content}</Link>;
  return content;
}
