import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/dashboard-widgets";
import { ASSETS, STRATEGIES, SESSIONS, BROKERS, ACCOUNTS } from "@/lib/trading-data";
import { useCreateTrade } from "@/hooks/use-trades";

export const Route = createFileRoute("/entry")({
  head: () => ({
    meta: [
      { title: "Trade Entry — DayTrader Pro" },
      { name: "description", content: "Log a new trade into your journal." },
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
  const [side, setSide] = useState<"Long" | "Short">("Long");
  const create = useCreateTrade();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const num = (k: string) => {
      const v = fd.get(k);
      return v === null || v === "" ? null : Number(v);
    };
    try {
      await create.mutateAsync({
        trade_date: String(fd.get("date")),
        trade_time: String(fd.get("time")),
        asset: String(fd.get("asset")),
        side,
        strategy: String(fd.get("strategy")),
        session: String(fd.get("session")),
        broker: String(fd.get("broker") ?? "Other"),
        account: String(fd.get("account") ?? "Main"),
        qty: Number(fd.get("qty")),
        entry_price: Number(fd.get("entry")),
        exit_price: Number(fd.get("exit")),
        stop_loss: num("stop"),
        take_profit: num("target"),
        fees: Number(fd.get("fees") ?? 0),
        setup_quality: num("setup"),
        notes: (fd.get("notes") as string) || null,
      });
      toast.success("Trade registrado");
      nav({ to: "/journal" });
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar");
    }
  }

  return (
    <AppLayout title="New Trade Entry">
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl">
        <Panel title="Trade Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Date">
              <input name="date" type="date" required className={inputCls} defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Time">
              <input name="time" type="time" required className={inputCls} defaultValue="09:30" />
            </Field>
            <Field label="Asset">
              <select name="asset" required className={inputCls}>
                {ASSETS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Side">
              <div className="flex h-10 overflow-hidden rounded-md border border-input">
                {(["Long", "Short"] as const).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSide(s)}
                    className={`flex-1 text-sm font-medium ${
                      side === s
                        ? s === "Long"
                          ? "bg-emerald-500 text-white"
                          : "bg-rose-500 text-white"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Strategy">
              <select name="strategy" required className={inputCls}>
                {STRATEGIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Session">
              <select name="session" required className={inputCls}>
                {SESSIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Quantity">
              <input name="qty" type="number" required min={1} step="any" className={inputCls} placeholder="100" />
            </Field>
            <Field label="Entry Price">
              <input name="entry" type="number" step="0.0001" required className={inputCls} placeholder="100.00" />
            </Field>
            <Field label="Exit Price">
              <input name="exit" type="number" step="0.0001" required className={inputCls} placeholder="102.50" />
            </Field>
            <Field label="Stop Loss">
              <input name="stop" type="number" step="0.0001" className={inputCls} placeholder="99.00" />
            </Field>
            <Field label="Take Profit">
              <input name="target" type="number" step="0.0001" className={inputCls} placeholder="103.00" />
            </Field>
            <Field label="Fees">
              <input name="fees" type="number" step="0.01" defaultValue={0} className={inputCls} placeholder="1.50" />
            </Field>
            <Field label="Broker">
              <select name="broker" className={inputCls}>
                {BROKERS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Account">
              <select name="account" className={inputCls}>
                {ACCOUNTS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Setup Quality (1–5)">
              <input name="setup" type="number" min={1} max={5} className={inputCls} placeholder="4" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notes">
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Setup, market context, lessons learned…"
              />
            </Field>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => nav({ to: "/journal" })}
              className="h-10 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {create.isPending ? "Salvando…" : "Save Trade"}
            </button>
          </div>
        </Panel>
      </form>
    </AppLayout>
  );
}