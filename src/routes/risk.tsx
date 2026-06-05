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
      { title: "Gestão de Risco — J.A.R.V.I.S." },
      { name: "description", content: "Drawdown, exposição e métricas de risco para opções binárias." },
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

  const accountSize = Number(profile?.account_size ?? 1000);
  const riskPct = Number(profile?.risk_per_trade_pct ?? 2) / 100;
  const maxRiskPerTrade = accountSize * riskPct;
  const ddPct = (k.maxDrawdown / accountSize) * 100;

  const rules = [
    { ok: ddPct < 10, label: "Drawdown abaixo de 10%", note: `Atual ${ddPct.toFixed(1)}%` },
    { ok: k.winRate > 55, label: "Taxa de acerto acima de 55%", note: `Atual ${k.winRate.toFixed(1)}%` },
    { ok: k.profitFactor > 1.2, label: "Fator de lucro acima de 1,2", note: `Atual ${k.profitFactor.toFixed(2)}` },
    { ok: k.roi > 0, label: "ROI positivo no período", note: `Atual ${k.roi.toFixed(1)}%` },
  ];

  return (
    <AppLayout title="Gestão de Risco">
      <div className="space-y-6">
        <FilterPanel filters={filters} onChange={setFilters} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Drawdown máx."
            value={`$${k.maxDrawdown.toFixed(0)}`}
            sub={`${ddPct.toFixed(1)}% da banca`}
            icon={<TrendingDown className="h-5 w-5" />}
            gradient="--gradient-kpi-4"
          />
          <KpiCard
            label="Risco máx. / operação"
            value={`$${maxRiskPerTrade.toFixed(0)}`}
            sub={`${(riskPct * 100).toFixed(1)}% da banca`}
            icon={<ShieldAlert className="h-5 w-5" />}
            gradient="--gradient-kpi-2"
          />
          <KpiCard
            label="Perda média"
            value={`$${k.avgLoss.toFixed(0)}`}
            sub={`${k.losses} perdas`}
            icon={<AlertTriangle className="h-5 w-5" />}
            gradient="--gradient-kpi-3"
          />
          <KpiCard
            label="Fator de Lucro"
            value={k.profitFactor.toFixed(2)}
            sub={k.profitFactor >= 1.2 ? "Saudável" : "Abaixo da meta"}
            icon={<ShieldCheck className="h-5 w-5" />}
            gradient="--gradient-kpi-1"
          />
        </div>
        <Panel title="Curva de Capital">
          <EquityCurveChart data={k.equityCurve} />
        </Panel>
        <Panel title="Conformidade com Regras de Risco">
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
                  {r.ok ? "Em dia" : "Violação"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppLayout>
  );
}
