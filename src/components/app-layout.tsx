import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  BarChart3,
  ShieldAlert,
  FileText,
  Settings,
  Search,
  Bell,
  Menu,
  TrendingUp,
  Brain,
  Chrome,
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/iara", label: "Iara AI", icon: Brain },
  { to: "/journal", label: "Trade Journal", icon: BookOpen },
  { to: "/entry", label: "Trade Entry", icon: PlusCircle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/risk", label: "Risk Management", icon: ShieldAlert },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/extension", label: "Extensão", icon: Chrome },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-24 transform border-r border-border bg-background transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 flex-col items-center justify-center gap-0.5 border-b border-border text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-[10px] font-semibold tracking-wide">DayTrader</div>
        </div>
        <nav className="mt-3 flex flex-col gap-1 px-2">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-[11px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur sm:gap-3 sm:px-4 lg:px-8">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg md:text-xl">{title}</h1>
          </div>
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search trades, assets…"
              className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground sm:flex"
            title={displayName}
          >
            {initials}
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login", replace: true });
            }}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 px-3 py-5 sm:px-4 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}