import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Target,
  Activity,
  DollarSign,
  PercentIcon,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import {
  BarsChart,
  DonutChart,
  EquityCurveChart,
  KpiCard,
  Panel,
} from "@/components/dashboard-widgets";
import { FilterPanel, applyFilters, defaultFilters } from "@/components/filter-panel";
import { computeKPIs, pnlByPeriod, groupBy } from "@/lib/trading-data";
import { useTrades } from "@/hooks/use-trades";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — DayTrader Pro" },
      { name: "description", content: "Real-time portfolio overview for professional day traders." },
      { property: "og:title", content: "DayTrader Pro Dashboard" },
      { property: "og:description", content: "Professional day trading portfolio analytics." },
    ],
  }),
  component: Dashboard,
});

function fmtMoney(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function Dashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const { data: trades = [], isLoading } = useTrades();
  const filtered = useMemo(() => applyFilters(trades, filters), [trades, filters]);
  const k = useMemo(() => computeKPIs(filtered), [filtered]);

  const today = new Date().toISOString().slice(0, 10);
  const dayPnL = filtered.filter((t) => t.date === today).reduce((s, t) => s + t.pnl, 0);
  const weekPnL = filtered
    .filter((t) => new Date(t.date) >= new Date(Date.now() - 7 * 86400000))
    .reduce((s, t) => s + t.pnl, 0);
  const monthPnL = filtered
    .filter((t) => new Date(t.date) >= new Date(Date.now() - 30 * 86400000))
    .reduce((s, t) => s + t.pnl, 0);

  const spark = k.equityCurve.slice(-20).map((p) => ({ v: p.equity }));

  // by asset
  const byAsset = Array.from(groupBy(filtered, (t) => t.asset).entries())
    .map(([asset, arr]) => ({ asset, pnl: +arr.reduce((s, t) => s + t.pnl, 0).toFixed(2) }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 8);

  // by session
  const bySession = Array.from(groupBy(filtered, (t) => t.session).entries()).map(([name, arr]) => ({
    name,
    value: arr.length,
  }));

  // by strategy table
  const byStrategy = Array.from(groupBy(filtered, (t) => t.strategy).entries()).map(([strategy, arr]) => {
    const wins = arr.filter((t) => t.pnl > 0);
    return {
      strategy,
      trades: arr.length,
      winRate: arr.length ? (wins.length / arr.length) * 100 : 0,
      pnl: arr.reduce((s, t) => s + t.pnl, 0),
    };
  });

  const monthly = pnlByPeriod(filtered, "month").sort((a, b) => (a.key < b.key ? -1 : 1));

  return (
    <AppLayout title="Portfolio Overview">
      <div className="space-y-6">
        <FilterPanel filters={filters} onChange={setFilters} />
        {isLoading && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Carregando trades…
          </div>
        )}
        {!isLoading && trades.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <h3 className="text-base font-semibold">Nenhum trade ainda</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Registre seu primeiro trade em <span className="font-medium">Trade Entry</span> para ver
              as métricas aqui.
            </p>
          </div>
        )}
        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total P&L"
            value={fmtMoney(k.totalPnL)}
            sub={`${k.trades} trades`}
            icon={<DollarSign className="h-5 w-5" />}
            gradient="--gradient-kpi-1"
            spark={spark}
          />
          <KpiCard
            label="Win Rate"
            value={`${k.winRate.toFixed(1)}%`}
            sub={`${k.wins}W / ${k.losses}L`}
            icon={<Target className="h-5 w-5" />}
            gradient="--gradient-kpi-2"
            spark={spark}
          />
          <KpiCard
            label="Profit Factor"
            value={k.profitFactor.toFixed(2)}
            sub={`R:R ${k.rr.toFixed(2)}`}
            icon={<Activity className="h-5 w-5" />}
            gradient="--gradient-kpi-3"
            spark={spark}
          />
          <KpiCard
            label="Max Drawdown"
            value={fmtMoney(-k.maxDrawdown)}
            sub="Peak to trough"
            icon={<TrendingDown className="h-5 w-5" />}
            gradient="--gradient-kpi-4"
            spark={spark}
          />
        </div>

        {/* P&L breakdown */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PnlMini label="Daily P&L" value={dayPnL} />
          <PnlMini label="Weekly P&L" value={weekPnL} />
          <PnlMini label="Monthly P&L" value={monthPnL} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Equity Curve" className="lg:col-span-2">
            <EquityCurveChart data={k.equityCurve} />
          </Panel>
          <Panel title="Trades by Session">
            <DonutChart data={bySession} />
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
              {bySession.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{
                      background: ["oklch(0.6 0.22 290)", "oklch(0.7 0.2 35)", "oklch(0.72 0.15 210)"][i % 3],
                    }}
                  />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </Panel>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="P&L by Asset (Top 8)">
            <BarsChart data={byAsset} xKey="asset" yKey="pnl" horizontal />
          </Panel>
          <Panel title="Monthly P&L">
            <BarsChart data={monthly.map((m) => ({ month: m.key, pnl: m.pnl }))} xKey="month" yKey="pnl" />
          </Panel>
        </div>

        {/* Strategy table */}
        <Panel title="Strategy Performance">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Strategy</th>
                  <th className="py-2 pr-4 font-medium">Trades</th>
                  <th className="py-2 pr-4 font-medium">Win Rate</th>
                  <th className="py-2 pr-4 text-right font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {byStrategy.map((row) => (
                  <tr key={row.strategy} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium">{row.strategy}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.trades}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${row.winRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{row.winRate.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold ${
                        row.pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {fmtMoney(row.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppLayout>
  );
}

function PnlMini({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className={`mt-1 text-xl font-bold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
          {fmtMoney(value)}
        </div>
      </div>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        }`}
      >
        {positive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
      </div>
    </div>
  );
}
