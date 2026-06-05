import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Trade } from "@/lib/trading-data";

export type TradeRow = {
  id: string;
  user_id: string;
  trade_date: string;
  trade_time: string;
  asset: string;
  side: "Long" | "Short";
  strategy: string;
  session: string;
  broker: string;
  account: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  fees: number;
  setup_quality: number | null;
  pnl: number;
  rr: number;
  notes: string | null;
};

export function rowToTrade(r: TradeRow): Trade {
  return {
    id: r.id,
    date: r.trade_date,
    time: r.trade_time?.slice(0, 5) ?? "",
    asset: r.asset,
    side: r.side,
    strategy: r.strategy,
    session: (r.session as Trade["session"]) ?? "M5",
    broker: r.broker,
    account: r.account,
    qty: Number(r.qty),
    entry: Number(r.entry_price),
    exit: Number(r.exit_price),
    pnl: Number(r.pnl),
    rr: Number(r.rr),
    notes: r.notes ?? undefined,
  };
}

export function useTrades() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["trades", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Trade[]> => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("trade_date", { ascending: false })
        .order("trade_time", { ascending: false });
      if (error) throw error;
      return (data as TradeRow[]).map(rowToTrade);
    },
  });
}

export type NewTradeInput = {
  trade_date: string;
  trade_time: string;
  asset: string;
  side: "Long" | "Short";
  strategy: string;
  session: string;
  broker: string;
  account: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  fees?: number;
  setup_quality?: number | null;
  notes?: string | null;
};

// Opções binárias: pnl = exit - entry - fees; rr armazena o payout %
export function computePnl(t: NewTradeInput): { pnl: number; rr: number } {
  const pnl = +(t.exit_price - t.entry_price - (t.fees ?? 0)).toFixed(2);
  const rr = t.take_profit ? Number(t.take_profit) : 0; // payout %
  return { pnl, rr };
}

export function useCreateTrade() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewTradeInput) => {
      if (!user) throw new Error("Não autenticado");
      const { pnl, rr } = computePnl(input);
      const { data, error } = await supabase
        .from("trades")
        .insert({
          user_id: user.id,
          trade_date: input.trade_date,
          trade_time: input.trade_time,
          asset: input.asset,
          side: input.side,
          strategy: input.strategy,
          session: input.session,
          broker: input.broker,
          account: input.account,
          qty: input.qty,
          entry_price: input.entry_price,
          exit_price: input.exit_price,
          stop_loss: input.stop_loss ?? null,
          take_profit: input.take_profit ?? null,
          fees: input.fees ?? 0,
          setup_quality: input.setup_quality ?? null,
          notes: input.notes ?? null,
          pnl,
          rr,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades", user?.id] });
    },
  });
}

export function useDeleteTrade() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades", user?.id] });
    },
  });
}