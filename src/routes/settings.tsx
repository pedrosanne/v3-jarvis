import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Panel } from "@/components/dashboard-widgets";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Ajustes — J.A.R.V.I.S." },
      { name: "description", content: "Gerencie sua conta, corretoras e padrões de risco." },
    ],
  }),
  component: Settings,
});

const inputCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function Settings() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [accountSize, setAccountSize] = useState<number>(50000);
  const [riskPct, setRiskPct] = useState<number>(1);
  const [maxDailyLossPct, setMaxDailyLossPct] = useState<number>(3);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setTimezone(profile.timezone);
    setBaseCurrency(profile.base_currency);
    setAccountSize(Number(profile.account_size));
    setRiskPct(Number(profile.risk_per_trade_pct));
    setMaxDailyLossPct(Number(profile.max_daily_loss_pct));
  }, [profile]);

  async function onSave() {
    try {
      await update.mutateAsync({
        display_name: displayName,
        timezone,
        base_currency: baseCurrency,
        account_size: accountSize,
        risk_per_trade_pct: riskPct,
        max_daily_loss_pct: maxDailyLossPct,
      });
      toast.success("Configurações salvas");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  }

  return (
    <AppLayout title="Ajustes">
      <div className="mx-auto max-w-4xl space-y-6">
        <Panel title="Perfil">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Nome</span>
              <input className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isLoading} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">E-mail</span>
              <input type="email" className={inputCls} value={user?.email ?? ""} disabled />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Fuso horário</span>
              <select className={inputCls} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option>America/Sao_Paulo</option>
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>Europe/London</option>
                <option>Asia/Tokyo</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Moeda base</span>
              <select className={inputCls} value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
                <option>USD</option>
                <option>BRL</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </label>
          </div>
        </Panel>
        <Panel title="Padrões de Risco">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tamanho da banca</span>
              <input type="number" className={inputCls} value={accountSize} onChange={(e) => setAccountSize(Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Risco por trade (%)</span>
              <input type="number" step="0.1" className={inputCls} value={riskPct} onChange={(e) => setRiskPct(Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Perda diária máx. (%)</span>
              <input type="number" step="0.1" className={inputCls} value={maxDailyLossPct} onChange={(e) => setMaxDailyLossPct(Number(e.target.value))} />
            </label>
          </div>
        </Panel>
        <Panel title="Conta">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Sessão ativa como <span className="font-medium text-foreground">{user?.email}</span>
            </div>
            <button
              onClick={async () => {
                await signOut();
                nav({ to: "/login", replace: true });
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </Panel>
        <div className="flex justify-end">
          <button
            onClick={onSave}
            disabled={update.isPending}
            className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {update.isPending ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}