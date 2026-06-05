import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { BarsChart, Panel } from "@/components/dashboard-widgets";
import { FilterPanel, applyFilters, defaultFilters } from "@/components/filter-panel";
import { pnlByPeriod, groupBy } from "@/lib/trading-data";
import { useTrades } from "@/hooks/use-trades";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios — J.A.R.V.I.S." },
      { name: "description", content: "Relatórios mensais de desempenho em opções binárias." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const [filters, setFilters] = useState(defaultFilters);
  const { data: all = [] } = useTrades();
  const trades = useMemo(() => applyFilters(all, filters), [all, filters]);
  const monthly = pnlByPeriod(trades, "month").sort((a, b) => (a.key < b.key ? -1 : 1));
  const monthlyDetailed = useMemo(() => {
    const byMonth = groupBy(trades, (t) => t.date.slice(0, 7));
    return Array.from(byMonth.entries())
      .map(([month, arr]) => {
        const wins = arr.filter((t) => t.pnl > 0);
        const pnl = arr.reduce((s, t) => s + t.pnl, 0);
        return {
          month,
          trades: arr.length,
          wins: wins.length,
          losses: arr.length - wins.length,
          winRate: arr.length ? (wins.length / arr.length) * 100 : 0,
          pnl,
        };
      })
      .sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [trades]);

  return (
    <AppLayout title="Relatórios Mensais">
      <div className="space-y-6">
        <FilterPanel filters={filters} onChange={setFilters} />
        <Panel
          title="Resultado Mensal"
          action={
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
              <Download className="h-4 w-4" /> Exportar PDF
            </button>
          }
        >
          <BarsChart data={monthly.map((m) => ({ month: m.key, pnl: m.pnl }))} xKey="month" yKey="pnl" />
        </Panel>
        <Panel title="Resumo Mensal">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Mês</th>
                  <th className="py-2 pr-4 font-medium">Operações</th>
                  <th className="py-2 pr-4 font-medium">Ganhos</th>
                  <th className="py-2 pr-4 font-medium">Perdas</th>
                  <th className="py-2 pr-4 font-medium">Taxa de Acerto</th>
                  <th className="py-2 pr-4 text-right font-medium">Resultado</th>
                  <th className="py-2 pr-2 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {monthlyDetailed.map((m) => (
                  <tr key={m.month} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium">{m.month}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{m.trades}</td>
                    <td className="py-3 pr-4 text-emerald-600">{m.wins}</td>
                    <td className="py-3 pr-4 text-rose-600">{m.losses}</td>
                    <td className="py-3 pr-4">{m.winRate.toFixed(1)}%</td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold ${
                        m.pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {m.pnl >= 0 ? "+" : ""}${m.pnl.toFixed(2)}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <button className="text-muted-foreground hover:text-primary">
                        <FileText className="h-4 w-4" />
                      </button>
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
