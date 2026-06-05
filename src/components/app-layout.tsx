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
  Brain,
  Chrome,
  LogOut,
  Cpu,
  Activity,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";

const NAV = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/iara", label: "Jarvis IA", icon: Brain },
  { to: "/journal", label: "Diário", icon: BookOpen },
  { to: "/entry", label: "Registrar", icon: PlusCircle },
  { to: "/analytics", label: "Análises", icon: BarChart3 },
  { to: "/risk", label: "Risco", icon: ShieldAlert },
  { to: "/reports", label: "Relatórios", icon: FileText },
  { to: "/extension", label: "Extensão", icon: Chrome },
  { to: "/settings", label: "Ajustes", icon: Settings },
] as const;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const now = useClock();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-primary">
          <span className="hud-dot" />
          Inicializando J.A.R.V.I.S.
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Operador";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div className="flex min-h-screen text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-24 transform border-r border-primary/20 bg-[oklch(0.1_0.05_250/0.85)] backdrop-blur-md transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 flex-col items-center justify-center gap-1 border-b border-primary/20">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary shadow-[0_0_18px_-2px_oklch(0.85_0.17_200/0.6)]">
            <Cpu className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-primary" />
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-primary/90">
            JARVIS
          </div>
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
                  "group relative flex flex-col items-center gap-1.5 rounded-lg px-2 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-all",
                  active
                    ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_oklch(0.85_0.17_200/0.4),0_0_20px_-6px_oklch(0.85_0.17_200/0.6)]"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-primary shadow-[0_0_10px_oklch(0.85_0.17_200/0.8)]" />
                )}
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
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-primary/20 bg-[oklch(0.12_0.05_250/0.7)] px-3 backdrop-blur-md sm:gap-3 sm:px-4 lg:px-8">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="hud-dot" />
              <h1 className="truncate text-sm font-semibold uppercase tracking-[0.25em] text-primary sm:text-base">
                {title}
              </h1>
            </div>
          </div>

          {/* Live system telemetry */}
          <div className="hidden items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground md:flex">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-primary" />
              <span>SYS</span>
              <span className="text-primary">ONLINE</span>
            </div>
            <div className="font-mono text-primary">{timeStr}</div>
          </div>

          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
            <input
              placeholder="Consultar sistema…"
              className="h-9 w-56 rounded-md border border-primary/25 bg-[oklch(0.18_0.06_240/0.5)] pl-9 pr-3 text-xs uppercase tracking-wider text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="relative rounded-md border border-primary/20 p-2 text-primary/80 hover:border-primary/50 hover:bg-primary/10">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_oklch(0.7_0.24_25/0.8)]" />
          </button>
          <div
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-xs font-semibold text-primary shadow-[0_0_14px_-2px_oklch(0.85_0.17_200/0.6)] sm:flex"
            title={displayName}
          >
            {initials}
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login", replace: true });
            }}
            className="rounded-md border border-primary/20 p-2 text-primary/80 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1 px-3 py-5 sm:px-4 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
