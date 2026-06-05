import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { BarsChart, DonutChart, EquityCurveChart, Panel } from "@/components/dashboard-widgets";
import { FilterPanel, applyFilters, defaultFilters } from "@/components/filter-panel";
import { computeKPIs, groupBy, sideLabel } from "@/lib/trading-data";
import { useTrades } from "@/hooks/use-trades";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Análises — J.A.R.V.I.S." },
      { name: "description", content: "Análises detalhadas por estratégia, ativo e expiração em opções binárias." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const [filters, setFilters] = useState(defaultFilters);
  const { data: all = [] } = useTrades();
  const trades = useMemo(() => applyFilters(all, filters), [all, filters]);
  const k = useMemo(() => computeKPIs(trades), [trades]);

  const byAsset = Array.from(groupBy(trades, (t) => t.asset).entries())
    .map(([asset, arr]) => ({ asset, pnl: +arr.reduce((s, t) => s + t.pnl, 0).toFixed(2) }))
    .sort((a, b) => b.pnl - a.pnl);
  const byStrategy = Array.from(groupBy(trades, (t) => t.strategy).entries()).map(([name, arr]) => ({
    name,
    value: arr.length,
  }));
  const byExpiration = Array.from(groupBy(trades, (t) => t.session).entries()).map(([session, arr]) => ({
    session,
    pnl: +arr.reduce((s, t) => s + t.pnl, 0).toFixed(2),
  }));
  const sideSplit = Array.from(groupBy(trades, (t) => t.side).entries()).map(([name, arr]) => ({
    name: sideLabel(name),
    value: arr.length,
  }));

  return (
    <AppLayout title="Análises">
      <div className="space-y-6">
        <FilterPanel filters={filters} onChange={setFilters} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Curva de Capital" className="lg:col-span-2">
            <EquityCurveChart data={k.equityCurve} />
          </Panel>
          <Panel title="CALL vs PUT">
            <DonutChart data={sideSplit} />
          </Panel>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Desempenho por Ativo">
            <BarsChart data={byAsset} xKey="asset" yKey="pnl" horizontal />
          </Panel>
          <Panel title="Resultado por Expiração">
            <BarsChart data={byExpiration} xKey="session" yKey="pnl" />
          </Panel>
        </div>
        <Panel title="Operações por Estratégia">
          <DonutChart data={byStrategy} />
        </Panel>
      </div>
    </AppLayout>
  );
}
