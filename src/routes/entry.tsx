import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/dashboard-widgets";
import { ASSETS, STRATEGIES, SESSIONS, BROKERS, ACCOUNTS } from "@/lib/trading-data";
import { useCreateTrade } from "@/hooks/use-trades";

export const Route = createFileRoute("/entry")({
  head: () => ({
    meta: [
      { title: "Nova Operação — J.A.R.V.I.S." },
      { name: "description", content: "Registre uma nova operação de opções binárias." },
    ],
  }),
  component: Entry,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function Entry() {
  const nav = useNavigate();
  const [direction, setDirection] = useState<"Long" | "Short">("Long"); // Long=CALL, Short=PUT
  const [result, setResult] = useState<"win" | "loss" | "tie">("win");
  const [stake, setStake] = useState<number>(10);
  const [payout, setPayout] = useState<number>(85);
  const create = useCreateTrade();

  const exit = useMemo(() => {
    if (result === "win") return +(stake * (1 + payout / 100)).toFixed(2);
    if (result === "tie") return stake;
    return 0;
  }, [result, stake, payout]);

  const pnl = +(exit - stake).toFixed(2);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    try {
      await create.mutateAsync({
        trade_date: String(fd.get("date")),
        trade_time: String(fd.get("time")),
        asset: String(fd.get("asset")),
        side: direction,
        strategy: String(fd.get("strategy")),
        session: String(fd.get("session")),
        broker: String(fd.get("broker") ?? "Outra"),
        account: String(fd.get("account") ?? "Real"),
        qty: 1,
        entry_price: stake,
        exit_price: exit,
        stop_loss: null,
        take_profit: payout, // armazena payout % em take_profit -> rr
        fees: 0,
        setup_quality: fd.get("setup") ? Number(fd.get("setup")) : null,
        notes: (fd.get("notes") as string) || null,
      });
      toast.success("Operação registrada");
      nav({ to: "/journal" });
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar");
    }
  }

  return (
    <AppLayout title="Nova Operação">
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl">
        <Panel title="Detalhes da Operação">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Data">
              <input name="date" type="date" required className={inputCls} defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Horário">
              <input name="time" type="time" required className={inputCls} defaultValue={new Date().toTimeString().slice(0, 5)} />
            </Field>
            <Field label="Ativo">
              <select name="asset" required className={inputCls}>
                {ASSETS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>

            <Field label="Direção">
              <div className="flex h-10 overflow-hidden rounded-md border border-input">
                {([
                  { v: "Long" as const, label: "CALL (Alta)", cls: "bg-emerald-500" },
                  { v: "Short" as const, label: "PUT (Baixa)", cls: "bg-rose-500" },
                ]).map((d) => (
                  <button
                    type="button"
                    key={d.v}
                    onClick={() => setDirection(d.v)}
                    className={`flex-1 text-sm font-semibold ${
                      direction === d.v ? `${d.cls} text-white` : "bg-background text-muted-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Expiração">
              <select name="session" required className={inputCls} defaultValue="M5">
                {SESSIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Estratégia">
              <select name="strategy" required className={inputCls}>
                {STRATEGIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Valor da Entrada ($)">
              <input
                type="number"
                min={1}
                step="0.01"
                required
                className={inputCls}
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
              />
            </Field>

            <Field label="Payout (%)">
              <input
                type="number"
                min={1}
                max={100}
                step="0.1"
                required
                className={inputCls}
                value={payout}
                onChange={(e) => setPayout(Number(e.target.value))}
              />
            </Field>

            <Field label="Resultado">
              <div className="flex h-10 overflow-hidden rounded-md border border-input">
                {([
                  { v: "win" as const, label: "GANHO", cls: "bg-emerald-500" },
                  { v: "loss" as const, label: "PERDA", cls: "bg-rose-500" },
                  { v: "tie" as const, label: "EMPATE", cls: "bg-amber-500" },
                ]).map((r) => (
                  <button
                    type="button"
                    key={r.v}
                    onClick={() => setResult(r.v)}
                    className={`flex-1 text-xs font-semibold tracking-wide ${
                      result === r.v ? `${r.cls} text-white` : "bg-background text-muted-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Corretora">
              <select name="broker" className={inputCls}>
                {BROKERS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Conta">
              <select name="account" className={inputCls}>
                {ACCOUNTS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Qualidade do setup (1–5)">
              <input name="setup" type="number" min={1} max={5} className={inputCls} placeholder="4" />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-background/40 p-3 sm:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Entrada</div>
              <div className="text-lg font-semibold">${stake.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Retorno</div>
              <div className="text-lg font-semibold">${exit.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Resultado</div>
              <div className={`text-lg font-bold ${pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Field label="Anotações">
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Setup, contexto de mercado, lições aprendidas…"
              />
            </Field>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => nav({ to: "/journal" })}
              className="h-10 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {create.isPending ? "Salvando…" : "Salvar operação"}
            </button>
          </div>
        </Panel>
      </form>
    </AppLayout>
  );
}
