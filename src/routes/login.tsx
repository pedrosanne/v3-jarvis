import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Cpu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — DayTrader Pro" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/", replace: true });
  }, [loading, user, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bem-vindo de volta!");
    nav({ to: "/", replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="hud-panel hud-scan w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary shadow-[0_0_24px_-4px_oklch(0.85_0.17_200/0.7)]">
            <Cpu className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
          </div>
          <h1 className="text-base font-semibold uppercase tracking-[0.3em] text-primary">
            J.A.R.V.I.S.
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Identificação necessária
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="E-MAIL DO OPERADOR"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-md border border-primary/25 bg-[oklch(0.18_0.06_240/0.5)] px-3 text-xs uppercase tracking-wider outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            type="password"
            required
            placeholder="SENHA DE ACESSO"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-md border border-primary/25 bg-[oklch(0.18_0.06_240/0.5)] px-3 text-xs uppercase tracking-wider outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-10 w-full rounded-md border border-primary/50 bg-primary/15 text-xs font-semibold uppercase tracking-[0.25em] text-primary shadow-[0_0_18px_-4px_oklch(0.85_0.17_200/0.7)] transition hover:bg-primary/25 disabled:opacity-60"
          >
            {submitting ? "Autenticando…" : "Entrar"}
          </button>
        </form>
        <div className="mt-4 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
          Sem acesso?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Solicitar credenciais
          </Link>
        </div>
      </div>
    </div>
  );
}