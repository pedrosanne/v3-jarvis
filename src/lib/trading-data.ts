// Sistema adaptado para Opções Binárias (BO)
// Mapeamento de campos no banco:
// - side: "Long" = CALL (ALTA), "Short" = PUT (BAIXA)
// - entry_price: valor da entrada (stake) em $
// - exit_price: retorno total recebido (0 = perda, stake = empate, stake*(1+payout%) = ganho)
// - qty: sempre 1 (não usado em BO)
// - rr: payout % da operação
// - session: tempo de expiração (M1, M5, M15, M30, H1)

export type Trade = {
  id: string;
  date: string;
  time: string;
  asset: string;
  side: "Long" | "Short"; // Long=CALL, Short=PUT
  strategy: string;
  session: "M1" | "M5" | "M15" | "M30" | "H1";
  broker: string;
  account: string;
  qty: number;
  entry: number; // stake
  exit: number; // retorno
  pnl: number;
  rr: number; // payout %
  notes?: string;
};

export const sideLabel = (s: "Long" | "Short") => (s === "Long" ? "CALL" : "PUT");
export const sideLabelPt = (s: "Long" | "Short") => (s === "Long" ? "ALTA" : "BAIXA");

const assets = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "EUR/JPY",
  "USD/BRL",
  "EUR/USD-OTC",
  "GBP/USD-OTC",
  "BTC/USD",
  "ETH/USD",
];
const strategies = [
  "Price Action",
  "Suporte/Resistência",
  "Rompimento",
  "Reversão",
  "Tendência",
  "MHI",
  "Torres Gêmeas",
  "Padrão de Velas",
];
const sessions: Trade["session"][] = ["M1", "M5", "M15", "M30", "H1"];
const brokers = ["IQ Option", "Quotex", "Pocket Option", "Olymp Trade", "Binomo", "Avalon", "Outra"];
const accounts = ["Real", "Demo", "Torneio"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateTrades(count = 80): Trade[] {
  const r = rng(42);
  const trades: Trade[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(r() * 60));
    const asset = assets[Math.floor(r() * assets.length)];
    const side: Trade["side"] = r() > 0.5 ? "Long" : "Short";
    const stake = [5, 10, 20, 25, 50, 100][Math.floor(r() * 6)];
    const payout = 80 + Math.floor(r() * 15); // 80–94%
    const isWin = r() > 0.42;
    const exit = isWin ? +(stake * (1 + payout / 100)).toFixed(2) : 0;
    const pnl = +(exit - stake).toFixed(2);
    trades.push({
      id: `T-${1000 + i}`,
      date: d.toISOString().slice(0, 10),
      time: `${String(Math.floor(r() * 12) + 8).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
      asset,
      side,
      strategy: strategies[Math.floor(r() * strategies.length)],
      session: sessions[Math.floor(r() * sessions.length)],
      broker: brokers[Math.floor(r() * brokers.length)],
      account: accounts[Math.floor(r() * accounts.length)],
      qty: 1,
      entry: stake,
      exit,
      pnl,
      rr: payout,
    });
  }
  return trades.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const TRADES = generateTrades();

export const ASSETS = assets;
export const STRATEGIES = strategies;
export const SESSIONS = sessions;
export const BROKERS = brokers;
export const ACCOUNTS = accounts;

export function computeKPIs(trades: Trade[]) {
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const ties = trades.filter((t) => t.pnl === 0);
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
  const profitFactor = grossLoss ? grossWin / grossLoss : grossWin;
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const rr = avgLoss ? avgWin / avgLoss : 0;
  const totalStake = trades.reduce((s, t) => s + t.entry, 0);
  const roi = totalStake ? (totalPnL / totalStake) * 100 : 0;
  const avgPayout = trades.length
    ? trades.reduce((s, t) => s + (t.rr || 0), 0) / trades.length
    : 0;
  const sorted = [...trades].sort((a, b) => (a.date < b.date ? -1 : 1));
  let eq = 1000;
  let peak = eq;
  let maxDd = 0;
  const curve: { date: string; equity: number }[] = [];
  sorted.forEach((t) => {
    eq += t.pnl;
    peak = Math.max(peak, eq);
    maxDd = Math.max(maxDd, peak - eq);
    curve.push({ date: t.date, equity: +eq.toFixed(2) });
  });
  return {
    totalPnL,
    winRate,
    profitFactor,
    rr,
    roi,
    avgPayout,
    maxDrawdown: maxDd,
    avgWin,
    avgLoss,
    trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    ties: ties.length,
    equityCurve: curve,
  };
}

export function pnlByPeriod(trades: Trade[], period: "day" | "week" | "month") {
  const map = new Map<string, number>();
  trades.forEach((t) => {
    const d = new Date(t.date);
    let key = t.date;
    if (period === "week") {
      const onejan = new Date(d.getFullYear(), 0, 1);
      const w = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
      key = `${d.getFullYear()}-S${w}`;
    } else if (period === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    map.set(key, (map.get(key) ?? 0) + t.pnl);
  });
  return Array.from(map.entries()).map(([key, pnl]) => ({ key, pnl: +pnl.toFixed(2) }));
}

export function groupBy<T, K extends string>(arr: T[], fn: (t: T) => K) {
  const m = new Map<K, T[]>();
  arr.forEach((x) => {
    const k = fn(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(x);
  });
  return m;
}
