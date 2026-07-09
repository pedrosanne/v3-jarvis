import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/dashboard-widgets";
import { FilterPanel, applyFilters, defaultFilters } from "@/components/filter-panel";
import { useDeleteTrade, useTrades } from "@/hooks/use-trades";
import { sideLabel } from "@/lib/trading-data";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Diário de Operações — J.A.R.V.I.S." },
      { name: "description", content: "Histórico completo de operações de opções binárias com filtros e exportação." },
    ],
  }),
  component: Journal,
});

function Journal() {
  const [filters, setFilters] = useState(defaultFilters);
  const [q, setQ] = useState("");
  const { data: allTrades = [], isLoading } = useTrades();
  const del = useDeleteTrade();
  const trades = useMemo(() => {
    let t = applyFilters(allTrades, filters);
    if (q) t = t.filter((x) => `${x.id} ${x.asset} ${x.strategy}`.toLowerCase().includes(q.toLowerCase()));
    return t;
  }, [allTrades, filters, q]);

  function exportCsv() {
    const headers = ["id","data","hora","ativo","direcao","estrategia","expiracao","entrada","retorno","payout%","resultado"];
    const rows = trades.map((t) => [t.id, t.date, t.time, t.asset, sideLabel(t.side), t.strategy, t.session, t.entry, t.exit, t.rr, t.pnl].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `operacoes-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout title="Diário de Operações">
      <div className="space-y-6">
        <FilterPanel filters={filters} onChange={setFilters} />
        <Panel
          title={`Histórico (${trades.length})`}
          action={
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-9 w-44 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Link
                to="/entry"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <PlusCircle className="h-4 w-4" /> Nova
              </Link>
              <button
                onClick={exportCsv}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent"
              >
                <Download className="h-4 w-4" /> Exportar
              </button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {["Data", "Hora", "Ativo", "Direção", "Estratégia", "Expiração", "Entrada", "Retorno", "Payout", "Resultado", ""].map(
                    (h) => (
                      <th key={h} className="px-3 py-2 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 100).map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-3 py-2 text-muted-foreground">{t.date}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.time}</td>
                    <td className="px-3 py-2 font-semibold">{t.asset}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          t.side === "Long" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {sideLabel(t.side)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{t.strategy}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.session}</td>
                    <td className="px-3 py-2">R$ ${t.entry.toFixed(2)}</td>
                    <td className="px-3 py-2">R$ ${t.exit.toFixed(2)}</td>
                    <td className="px-3 py-2">{t.rr?.toFixed(0)}%</td>
                    <td
                      className={`px-3 py-2 font-semibold ${
                        t.pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {t.pnl >= 0 ? "+" : ""}R$ ${t.pnl.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={async () => {
                          if (!confirm("Excluir esta operação?")) return;
                          try {
                            await del.mutateAsync(t.id);
                            toast.success("Operação excluída");
                          } catch (e: any) {
                            toast.error(e?.message ?? "Erro ao excluir");
                          }
                        }}
                        className="text-muted-foreground hover:text-rose-600"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && trades.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma operação encontrada. <Link to="/entry" className="font-medium text-primary hover:underline">Registrar primeira operação</Link>.
              </div>
            )}
          </div>
          {trades.length > 100 && (
            <div className="mt-3 text-center text-xs text-muted-foreground">
              Mostrando 100 de {trades.length} operações
            </div>
          )}
        </Panel>
      </div>
    </AppLayout>
  );
}
