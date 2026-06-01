export type Trade = {
  id: string;
  date: string;
  time: string;
  asset: string;
  side: "Long" | "Short";
  strategy: string;
  session: "Asia" | "London" | "New York";
  broker: string;
  account: string;
  qty: number;
  entry: number;
  exit: number;
  pnl: number;
  rr: number;
  notes?: string;
};

const assets = ["EURUSD", "GBPUSD", "BTCUSD", "ETHUSD", "ES", "NQ", "SPY", "TSLA", "AAPL", "GOLD"];
const strategies = ["Breakout", "Pullback", "Trend Following", "Mean Reversion", "Scalping", "Opening Range"];
const sessions: Trade["session"][] = ["Asia", "London", "New York"];
const brokers = ["Interactive Brokers", "TD Ameritrade", "Tradovate", "MetaTrader 5"];
const accounts = ["Live #1", "Live #2", "Funded #A"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateTrades(count = 120): Trade[] {
  const r = rng(42);
  const trades: Trade[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(r() * 90));
    const asset = assets[Math.floor(r() * assets.length)];
    const side: Trade["side"] = r() > 0.5 ? "Long" : "Short";
    const entry = +(50 + r() * 450).toFixed(2);
    const isWin = r() > 0.42;
    const move = (r() * 0.04 + 0.005) * entry * (isWin ? 1 : -1) * (side === "Long" ? 1 : -1);
    const exit = +(entry + move * (side === "Long" ? 1 : -1)).toFixed(2);
    const qty = Math.floor(r() * 8 + 1) * 10;
    const pnl = +((side === "Long" ? exit - entry : entry - exit) * qty).toFixed(2);
    trades.push({
      id: `T-${1000 + i}`,
      date: d.toISOString().slice(0, 10),
      time: `${String(Math.floor(r() * 8) + 8).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`,
      asset,
      side,
      strategy: strategies[Math.floor(r() * strategies.length)],
      session: sessions[Math.floor(r() * sessions.length)],
      broker: brokers[Math.floor(r() * brokers.length)],
      account: accounts[Math.floor(r() * accounts.length)],
      qty,
      entry,
      exit,
      pnl,
      rr: +(Math.abs(pnl) / (qty * entry * 0.01)).toFixed(2),
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
  const losses = trades.filter((t) => t.pnl <= 0);
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
  const profitFactor = grossLoss ? grossWin / grossLoss : grossWin;
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const rr = avgLoss ? avgWin / avgLoss : 0;
  // equity curve & drawdown
  const sorted = [...trades].sort((a, b) => (a.date < b.date ? -1 : 1));
  let eq = 10000;
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
    maxDrawdown: maxDd,
    avgWin,
    avgLoss,
    trades: trades.length,
    wins: wins.length,
    losses: losses.length,
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
      key = `${d.getFullYear()}-W${w}`;
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