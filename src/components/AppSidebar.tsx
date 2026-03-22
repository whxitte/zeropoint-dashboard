import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Globe, Bug, KeyRound, GitBranch,
  Network, Search, Link2, FileText, Settings, Menu, X, Crosshair
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/assets", label: "Assets", icon: Globe },
  { to: "/findings", label: "Findings", icon: Bug },
  { to: "/secrets", label: "Secrets", icon: KeyRound },
  { to: "/leaks", label: "Leaks", icon: GitBranch },
  { to: "/ports", label: "Ports", icon: Network },
  { to: "/dorks", label: "Dorks", icon: Search },
  { to: "/endpoints", label: "Endpoints", icon: Link2 },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-md border border-border bg-card p-2 text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Crosshair className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold tracking-tight text-foreground">ZeroPoint</span>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 scrollbar-thin">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to === "/dashboard" && location.pathname === "/");
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
