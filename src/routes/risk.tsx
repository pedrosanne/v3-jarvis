import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, TrendingDown } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { EquityCurveChart, KpiCard, Panel } from "@/components/dashboard-widgets";
import { FilterPanel, applyFilters, defaultFilters } from "@/components/filter-panel";
import { computeKPIs } from "@/lib/trading-data";
import { useTrades } from "@/hooks/use-trades";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Management — DayTrader Pro" },
      { name: "description", content: "Drawdown, exposure, and risk metrics for your trading account." },
    ],
  }),
  component: Risk,
});

function Risk() {
  const [filters, setFilters] = useState(defaultFilters);
  const { data: all = [] } = useTrades();
  const { data: profile } = useProfile();
  const trades = useMemo(() => applyFilters(all, filters), [all, filters]);
  const k = useMemo(() => computeKPIs(trades), [trades]);

  const accountSize = Number(profile?.account_size ?? 50000);
  const riskPct = Number(profile?.risk_per_trade_pct ?? 1) / 100;
  const maxRiskPerTrade = accountSize * riskPct;
  const ddPct = (k.maxDrawdown / accountSize) * 100;

  const rules = [
    { ok: ddPct < 10, label: "Drawdown under 10%", note: `Currently ${ddPct.toFixed(1)}%` },
    { ok: k.winRate > 45, label: "Win rate above 45%", note: `Currently ${k.winRate.toFixed(1)}%` },
    { ok: k.profitFactor > 1.3, label: "Profit factor above 1.3", note: `Currently ${k.profitFactor.toFixed(2)}` },
    { ok: k.rr > 1, label: "Avg R:R above 1.0", note: `Currently ${k.rr.toFixed(2)}` },
  ];

  return (
    <AppLayout title="Risk Management">
      <div className="space-y-6">
        <FilterPanel filters={filters} onChange={setFilters} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Max Drawdown"
            value={`$${k.maxDrawdown.toFixed(0)}`}
            sub={`${ddPct.toFixed(1)}% of account`}
            icon={<TrendingDown className="h-5 w-5" />}
            gradient="--gradient-kpi-4"
          />
          <KpiCard
            label="Max Risk / Trade"
            value={`$${maxRiskPerTrade.toFixed(0)}`}
            sub="1% account rule"
            icon={<ShieldAlert className="h-5 w-5" />}
            gradient="--gradient-kpi-2"
          />
          <KpiCard
            label="Avg Loss"
            value={`$${k.avgLoss.toFixed(0)}`}
            sub={`${k.losses} losing trades`}
            icon={<AlertTriangle className="h-5 w-5" />}
            gradient="--gradient-kpi-3"
          />
          <KpiCard
            label="Profit Factor"
            value={k.profitFactor.toFixed(2)}
            sub={k.profitFactor >= 1.3 ? "Healthy" : "Below target"}
            icon={<ShieldCheck className="h-5 w-5" />}
            gradient="--gradient-kpi-1"
          />
        </div>
        <Panel title="Equity Drawdown View">
          <EquityCurveChart data={k.equityCurve} />
        </Panel>
        <Panel title="Risk Rule Compliance">
          <ul className="divide-y divide-border">
            {rules.map((r) => (
              <li key={r.label} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      r.ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {r.ok ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.note}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    r.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {r.ok ? "Passing" : "Breach"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppLayout>
  );
}