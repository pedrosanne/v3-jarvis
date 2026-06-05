import { useEffect, useState } from "react";
import { Filter, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSETS, STRATEGIES, SESSIONS, BROKERS, ACCOUNTS } from "@/lib/trading-data";

export type FilterState = {
  dateRange: "7d" | "30d" | "90d" | "ytd" | "all";
  asset: string;
  strategy: string;
  side: "all" | "Long" | "Short";
  session: string;
  broker: string;
  account: string;
};

export const defaultFilters: FilterState = {
  dateRange: "30d",
  asset: "all",
  strategy: "all",
  side: "all",
  session: "all",
  broker: "all",
  account: "all",
};

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-full appearance-none rounded border border-input bg-background pl-2 pr-6 text-xs outline-none focus:ring-1 focus:ring-ring"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  );
}

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) => onChange({ ...filters, [k]: v });

  const activeCount = (Object.keys(filters) as (keyof FilterState)[]).filter((k) => {
    if (k === "dateRange") return filters[k] !== defaultFilters.dateRange;
    return filters[k] !== "all";
  }).length;

  useEffect(() => {
    if (!mobileOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [mobileOpen]);

  const selects = (
    <>
      <Select
        label="Período"
        value={filters.dateRange}
        onChange={(v) => set("dateRange", v as FilterState["dateRange"])}
        options={[
          { value: "7d", label: "Últimos 7 dias" },
          { value: "30d", label: "Últimos 30 dias" },
          { value: "90d", label: "Últimos 90 dias" },
          { value: "ytd", label: "Ano atual" },
          { value: "all", label: "Todo o período" },
        ]}
      />
      <Select
        label="Ativo"
        value={filters.asset}
        onChange={(v) => set("asset", v)}
        options={[{ value: "all", label: "Todos os ativos" }, ...ASSETS.map((a) => ({ value: a, label: a }))]}
      />
      <Select
        label="Estratégia"
        value={filters.strategy}
        onChange={(v) => set("strategy", v)}
        options={[{ value: "all", label: "Todas as estratégias" }, ...STRATEGIES.map((a) => ({ value: a, label: a }))]}
      />
      <Select
        label="Direção"
        value={filters.side}
        onChange={(v) => set("side", v as FilterState["side"])}
        options={[
          { value: "all", label: "CALL e PUT" },
          { value: "Long", label: "CALL (Alta)" },
          { value: "Short", label: "PUT (Baixa)" },
        ]}
      />
      <Select
        label="Expiração"
        value={filters.session}
        onChange={(v) => set("session", v)}
        options={[{ value: "all", label: "Todas as expirações" }, ...SESSIONS.map((a) => ({ value: a, label: a }))]}
      />
      <Select
        label="Corretora"
        value={filters.broker}
        onChange={(v) => set("broker", v)}
        options={[{ value: "all", label: "Todas as corretoras" }, ...BROKERS.map((a) => ({ value: a, label: a }))]}
      />
      <Select
        label="Conta"
        value={filters.account}
        onChange={(v) => set("account", v)}
        options={[{ value: "all", label: "Todas as contas" }, ...ACCOUNTS.map((a) => ({ value: a, label: a }))]}
      />
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] lg:hidden">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4 text-primary" /> Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
              {activeCount}
            </span>
          )}
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <SlidersHorizontal className="h-4 w-4" /> Abrir
        </button>
      </div>

      <div className="hidden rounded-lg border border-border bg-card px-3 py-2 shadow-[var(--shadow-card)] lg:block">
        <button
          className="flex w-full items-center justify-between gap-2"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <Filter className="h-3 w-3 text-primary" /> Filtros
          </span>
          <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {open && <div className="mt-2 grid grid-cols-3 gap-2 lg:grid-cols-7">{selects}</div>}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Filter className="h-4 w-4 text-primary" /> Filtros
              </h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{selects}</div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  onChange(defaultFilters);
                }}
                className="h-10 flex-1 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent"
              >
                Limpar
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-10 flex-1 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function applyFilters<T extends { date: string; asset: string; strategy: string; side: "Long" | "Short"; session: string; broker: string; account: string }>(
  data: T[],
  f: FilterState,
): T[] {
  const now = new Date();
  const cutoff = new Date(now);
  if (f.dateRange === "7d") cutoff.setDate(now.getDate() - 7);
  else if (f.dateRange === "30d") cutoff.setDate(now.getDate() - 30);
  else if (f.dateRange === "90d") cutoff.setDate(now.getDate() - 90);
  else if (f.dateRange === "ytd") cutoff.setMonth(0, 1);
  else cutoff.setFullYear(1970);
  return data.filter((t) => {
    if (new Date(t.date) < cutoff) return false;
    if (f.asset !== "all" && t.asset !== f.asset) return false;
    if (f.strategy !== "all" && t.strategy !== f.strategy) return false;
    if (f.side !== "all" && t.side !== f.side) return false;
    if (f.session !== "all" && t.session !== f.session) return false;
    if (f.broker !== "all" && t.broker !== f.broker) return false;
    if (f.account !== "all" && t.account !== f.account) return false;
    return true;
  });
}
