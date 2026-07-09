import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Cpu,
  DollarSign,
  Radar,
  Radio,
  Signal,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  Radar as RadarShape,
  RadarChart,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/app-layout";
import { FilterPanel, applyFilters, defaultFilters } from "@/components/filter-panel";
import { computeKPIs, groupBy, pnlByPeriod } from "@/lib/trading-data";
import { useTrades } from "@/hooks/use-trades";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel — J.A.R.V.I.S." },
      { name: "description", content: "Painel HUD em tempo real para traders de opções binárias." },
    ],
  }),
  component: Dashboard,
});

const CYAN = "oklch(0.85 0.18 200)";
const CYAN_SOFT = "oklch(0.7 0.12 200)";
const MAGENTA = "oklch(0.75 0.22 340)";
const AMBER = "oklch(0.82 0.17 75)";
const GREEN = "oklch(0.82 0.18 150)";
const RED = "oklch(0.72 0.24 25)";

function fmtMoney(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}R$ ${Math.abs(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Dashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const { data: trades = [], isLoading } = useTrades();
  const filtered = useMemo(() => applyFilters(trades, filters), [trades, filters]);
  const k = useMemo(() => computeKPIs(filtered), [filtered]);
  const now = useClock();

  const today = new Date().toISOString().slice(0, 10);
  const dayPnL = filtered.filter((t) => t.date === today).reduce((s, t) => s + t.pnl, 0);
  const weekPnL = filtered
    .filter((t) => new Date(t.date) >= new Date(Date.now() - 7 * 86400000))
    .reduce((s, t) => s + t.pnl, 0);
  const monthPnL = filtered
    .filter((t) => new Date(t.date) >= new Date(Date.now() - 30 * 86400000))
    .reduce((s, t) => s + t.pnl, 0);

  const byAsset = Array.from(groupBy(filtered, (t) => t.asset).entries())
    .map(([asset, arr]) => ({ asset, pnl: +arr.reduce((s, t) => s + t.pnl, 0).toFixed(2) }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 6);

  const bySession = Array.from(groupBy(filtered, (t) => t.session).entries()).map(([name, arr]) => ({
    name,
    value: arr.length,
  }));

  const byStrategy = Array.from(groupBy(filtered, (t) => t.strategy).entries()).map(([strategy, arr]) => {
    const wins = arr.filter((t) => t.pnl > 0);
    return {
      strategy,
      trades: arr.length,
      winRate: arr.length ? (wins.length / arr.length) * 100 : 0,
      pnl: arr.reduce((s, t) => s + t.pnl, 0),
    };
  });

  const monthly = pnlByPeriod(filtered, "month").sort((a, b) => (a.key < b.key ? -1 : 1));

  // synthetic system metrics for HUD vibe
  const radarData = [
    { axis: "Velocidade", v: Math.min(100, 40 + k.winRate * 0.6) },
    { axis: "Edge", v: Math.min(100, k.profitFactor * 35) },
    { axis: "Risco", v: Math.max(10, 100 - k.maxDrawdown / 50) },
    { axis: "Volume", v: Math.min(100, k.trades * 1.5) },
    { axis: "Payout", v: Math.min(100, (k.avgPayout || 0)) },
    { axis: "Acerto%", v: k.winRate },
  ];

  return (
    <AppLayout title="Painel de Controle">
      <div className="hud-theme -mx-3 -my-5 min-h-[calc(100vh-4rem)] px-3 py-5 sm:-mx-4 sm:-my-6 sm:px-4 sm:py-6 lg:-mx-8 lg:px-8">
        <div className="space-y-5">
          {/* Top status bar */}
          <StatusBar now={now} trades={filtered.length} />

          <FilterPanel filters={filters} onChange={setFilters} />

          {isLoading && (
            <HudPanel title="Telemetria">
              <div className="py-8 text-center text-sm" style={{ color: "var(--hud-text-dim)" }}>
                Sincronizando feed…
              </div>
            </HudPanel>
          )}

          {!isLoading && trades.length === 0 && (
            <HudPanel title="Sem telemetria">
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: "var(--hud-text-dim)" }}>
                  Registre a primeira operação em <span className="hud-glow-text">Nova Operação</span> para ativar o painel.
                </p>
              </div>
            </HudPanel>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <HudKpi label="Resultado Total" value={fmtMoney(k.totalPnL)} sub={`${k.trades} ops`} icon={<DollarSign className="h-4 w-4" />} positive={k.totalPnL >= 0} />
            <HudKpi label="Taxa de Acerto" value={`${k.winRate.toFixed(1)}%`} sub={`${k.wins}G / ${k.losses}P`} icon={<Target className="h-4 w-4" />} positive={k.winRate >= 55} />
            <HudKpi label="Fator de Lucro" value={k.profitFactor.toFixed(2)} sub={`Payout médio ${(k.avgPayout || 0).toFixed(0)}%`} icon={<Activity className="h-4 w-4" />} positive={k.profitFactor >= 1} />
            <HudKpi label="Drawdown" value={fmtMoney(-k.maxDrawdown)} sub="Pico → Vale" icon={<TrendingDown className="h-4 w-4" />} positive={false} />
          </div>

          {/* Main HUD row: equity left, reactor center, radar right */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <HudPanel title="Curva de Capital · AO VIVO" rightSlot={<LiveDot />}>
                <div className="hud-scan h-64 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={k.equityCurve} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="hudEquity" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor={CYAN} stopOpacity={0.6} />
                          <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="oklch(0.82 0.16 200 / 0.15)" strokeDasharray="2 4" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.78 0.06 215)" }} minTickGap={30} stroke="oklch(0.82 0.16 200 / 0.3)" />
                      <YAxis tick={{ fontSize: 10, fill: "oklch(0.78 0.06 215)" }} width={48} stroke="oklch(0.82 0.16 200 / 0.3)" />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.16 0.05 250 / 0.92)",
                          border: "1px solid oklch(0.82 0.16 200 / 0.5)",
                          borderRadius: 8,
                          color: "oklch(0.95 0.03 200)",
                          fontSize: 12,
                          boxShadow: "0 0 20px oklch(0.82 0.16 200 / 0.3)",
                        }}
                        formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
                      />
                      <Area type="monotone" dataKey="equity" stroke={CYAN} strokeWidth={2.5} fill="url(#hudEquity)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </HudPanel>
            </div>

            <div className="lg:col-span-3">
              <HudPanel title="Reator">
                <Reactor pnl={dayPnL} score={k.winRate} />
              </HudPanel>
            </div>

            <div className="lg:col-span-4">
              <HudPanel title="Radar de Estratégias">
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="oklch(0.82 0.16 200 / 0.25)" />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "oklch(0.85 0.06 210)" }} />
                      <RadarShape
                        dataKey="v"
                        stroke={CYAN}
                        strokeWidth={2}
                        fill={CYAN}
                        fillOpacity={0.25}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </HudPanel>
            </div>
          </div>

          {/* P&L mini cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PnlMini label="Hoje" value={dayPnL} />
            <PnlMini label="Semana" value={weekPnL} />
            <PnlMini label="Mês" value={monthPnL} />
          </div>

          {/* Assets + Sessions + Monthly */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <HudPanel title="Desempenho por Ativo">
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <BarChart data={byAsset} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="oklch(0.82 0.16 200 / 0.12)" strokeDasharray="2 4" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(0.78 0.06 215)" }} stroke="oklch(0.82 0.16 200 / 0.3)" />
                      <YAxis type="category" dataKey="asset" tick={{ fontSize: 11, fill: "oklch(0.9 0.05 200)" }} width={70} stroke="oklch(0.82 0.16 200 / 0.3)" />
                      <Tooltip
                        cursor={{ fill: "oklch(0.82 0.16 200 / 0.08)" }}
                        contentStyle={{
                          background: "oklch(0.16 0.05 250 / 0.92)",
                          border: "1px solid oklch(0.82 0.16 200 / 0.5)",
                          borderRadius: 8,
                          color: "oklch(0.95 0.03 200)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="pnl" radius={[0, 6, 6, 0]}>
                        {byAsset.map((d, i) => (
                          <Cell key={i} fill={d.pnl < 0 ? RED : CYAN} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </HudPanel>
            </div>

            <div className="lg:col-span-3">
              <HudPanel title="Mix de Expirações">
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.16 0.05 250 / 0.92)",
                          border: "1px solid oklch(0.82 0.16 200 / 0.5)",
                          borderRadius: 8,
                          color: "oklch(0.95 0.03 200)",
                          fontSize: 12,
                        }}
                      />
                      <Pie data={bySession} innerRadius={48} outerRadius={78} paddingAngle={4} dataKey="value" nameKey="name" stroke="oklch(0.12 0.05 250)" strokeWidth={2}>
                        {bySession.map((_, i) => (
                          <Cell key={i} fill={[CYAN, MAGENTA, AMBER, GREEN][i % 4]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-3 text-[11px]">
                  {bySession.map((s, i) => (
                    <span key={s.name} className="flex items-center gap-1.5" style={{ color: "var(--hud-text-dim)" }}>
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: [CYAN, MAGENTA, AMBER, GREEN][i % 4] }} />
                      {s.name} · {s.value}
                    </span>
                  ))}
                </div>
              </HudPanel>
            </div>

            <div className="lg:col-span-4">
              <HudPanel title="Fluxo Mensal">
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <BarChart data={monthly.map((m) => ({ month: m.key, pnl: m.pnl }))} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="oklch(0.82 0.16 200 / 0.12)" strokeDasharray="2 4" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "oklch(0.78 0.06 215)" }} stroke="oklch(0.82 0.16 200 / 0.3)" />
                      <YAxis tick={{ fontSize: 10, fill: "oklch(0.78 0.06 215)" }} width={42} stroke="oklch(0.82 0.16 200 / 0.3)" />
                      <Tooltip
                        cursor={{ fill: "oklch(0.82 0.16 200 / 0.08)" }}
                        contentStyle={{
                          background: "oklch(0.16 0.05 250 / 0.92)",
                          border: "1px solid oklch(0.82 0.16 200 / 0.5)",
                          borderRadius: 8,
                          color: "oklch(0.95 0.03 200)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {monthly.map((m, i) => (
                          <Cell key={i} fill={m.pnl < 0 ? RED : CYAN} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </HudPanel>
            </div>
          </div>

          {/* Strategy grid */}
          <HudPanel title="Matriz de Estratégias" rightSlot={<span className="text-[10px]" style={{ color: "var(--hud-text-dim)" }}>{byStrategy.length} ATIVAS</span>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-left text-[10px] uppercase tracking-[0.18em]" style={{ borderColor: "var(--hud-border)", color: "var(--hud-cyan)" }}>
                    <th className="py-2 pr-4 font-medium">Estratégia</th>
                    <th className="py-2 pr-4 font-medium">Operações</th>
                    <th className="py-2 pr-4 font-medium">Taxa de Acerto</th>
                    <th className="py-2 pr-4 text-right font-medium">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {byStrategy.map((row) => (
                    <tr key={row.strategy} className="border-b last:border-0" style={{ borderColor: "oklch(0.82 0.16 200 / 0.12)" }}>
                      <td className="py-3 pr-4 font-medium">
                        <span className="hud-glow-text">{row.strategy}</span>
                      </td>
                      <td className="py-3 pr-4" style={{ color: "var(--hud-text-dim)" }}>{row.trades}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="hud-bar-track h-1.5 w-28">
                            <div className="hud-bar-fill" style={{ width: `${row.winRate}%` }} />
                          </div>
                          <span className="text-xs" style={{ color: "var(--hud-text-dim)" }}>{row.winRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold" style={{ color: row.pnl >= 0 ? GREEN : RED }}>
                        {fmtMoney(row.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </HudPanel>
        </div>
      </div>
    </AppLayout>
  );
}

/* -------- HUD subcomponents -------- */

function StatusBar({ now, trades }: { now: Date; trades: number }) {
  const time = now.toLocaleTimeString("pt-BR", { hour12: false });
  const date = now.toISOString().slice(0, 10);
  return (
    <div className="hud-panel flex flex-wrap items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[0.18em]">
      <span className="hud-corner-tr" />
      <span className="hud-corner-bl" />
      <span className="flex items-center gap-2 hud-glow-text">
        <Radio className="h-3.5 w-3.5" /> ONLINE
      </span>
      <Sep />
      <span style={{ color: "var(--hud-text-dim)" }}>
        SIST <span className="hud-glow-text">{date}</span> · <span className="hud-glow-text">{time}</span>
      </span>
      <Sep />
      <span style={{ color: "var(--hud-text-dim)" }}>
        FEED <span className="hud-glow-text">{trades}</span> OPS
      </span>
      <Sep />
      <span className="flex items-center gap-1.5" style={{ color: "var(--hud-text-dim)" }}>
        <Signal className="h-3.5 w-3.5" /> LAT <span className="hud-glow-text">12MS</span>
      </span>
      <Sep />
      <span className="flex items-center gap-1.5" style={{ color: "var(--hud-text-dim)" }}>
        <Cpu className="h-3.5 w-3.5" /> CORE <span className="hud-glow-text">98%</span>
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="hud-dot" />
        <span className="hud-glow-text">AO VIVO</span>
      </div>
    </div>
  );
}

function Sep() {
  return <span style={{ color: "var(--hud-border-strong)" }}>|</span>;
}

function LiveDot() {
  return (
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--hud-cyan)" }}>
        <span className="hud-dot" /> Transmitindo
      </span>
  );
}

function HudPanel({
  title,
  rightSlot,
  children,
}: {
  title: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="hud-panel p-4">
      <span className="hud-corner-tr" />
      <span className="hud-corner-bl" />
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="hud-title">{title}</h3>
        {rightSlot}
      </div>
      <div className="hud-divider mb-3" />
      {children}
    </div>
  );
}

function HudKpi({
  label,
  value,
  sub,
  icon,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  positive: boolean;
}) {
  const color = positive ? GREEN : RED;
  return (
    <div className="hud-panel hud-scan p-4">
      <span className="hud-corner-tr" />
      <span className="hud-corner-bl" />
      <div className="flex items-start justify-between">
        <span className="hud-title">{label}</span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: "oklch(0.82 0.16 200 / 0.12)", color: "var(--hud-cyan-strong)" }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight hud-glow-text hud-flicker" style={{ fontFeatureSettings: '"tnum"' }}>
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px]" style={{ color }}>
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span style={{ color: "var(--hud-text-dim)" }}>{sub}</span>
      </div>
    </div>
  );
}

function PnlMini({ label, value }: { label: string; value: number }) {
  const positive = value >= 0;
  const color = positive ? GREEN : RED;
  return (
    <div className="hud-panel relative flex items-center justify-between p-4">
      <span className="hud-corner-tr" />
      <span className="hud-corner-bl" />
      <div>
        <div className="hud-title">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight" style={{ color, textShadow: `0 0 14px ${color}` }}>
          {fmtMoney(value)}
        </div>
      </div>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full border"
        style={{
          borderColor: color,
          color,
          background: "oklch(0.82 0.16 200 / 0.08)",
          boxShadow: `0 0 18px ${positive ? "oklch(0.82 0.18 150 / 0.5)" : "oklch(0.72 0.24 25 / 0.5)"}`,
        }}
      >
        {positive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
      </div>
    </div>
  );
}

function Reactor({ pnl, score }: { pnl: number; score: number }) {
  const positive = pnl >= 0;
  const ringColor = positive ? GREEN : RED;
  return (
    <div className="relative flex h-64 items-center justify-center">
      {/* Outer rotating ring */}
      <svg className="hud-ring-rotate absolute" width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="100" fill="none" stroke={CYAN} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx="110" cy="110" r="100" fill="none" stroke={CYAN} strokeOpacity="0.8" strokeWidth="1.5" strokeDasharray="40 360" />
      </svg>
      {/* Middle counter-rotating ring */}
      <svg className="hud-ring-rotate-rev absolute" width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="80" fill="none" stroke={CYAN_SOFT} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="90" cy="90" r="80" fill="none" stroke={ringColor} strokeOpacity="0.9" strokeWidth="2" strokeDasharray={`${score * 2.5} 360`} />
      </svg>
      {/* Tick marks */}
      <svg className="absolute" width="240" height="240" viewBox="0 0 240 240">
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * 10 * Math.PI) / 180;
          const x1 = 120 + Math.cos(a) * 115;
          const y1 = 120 + Math.sin(a) * 115;
          const x2 = 120 + Math.cos(a) * (i % 3 === 0 ? 108 : 112);
          const y2 = 120 + Math.sin(a) * (i % 3 === 0 ? 108 : 112);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={CYAN} strokeOpacity={i % 3 === 0 ? 0.8 : 0.3} strokeWidth="1" />;
        })}
      </svg>
      {/* Core */}
      <div
        className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 40%, oklch(0.4 0.18 200 / 0.7), oklch(0.18 0.06 240 / 0.9))",
          boxShadow: `0 0 40px ${ringColor}, inset 0 0 30px oklch(0.82 0.16 200 / 0.5)`,
          border: `1px solid ${ringColor}`,
        }}
      >
        <Zap className="h-5 w-5 hud-flicker" style={{ color: ringColor }} />
        <div className="mt-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--hud-cyan)" }}>
          Hoje
        </div>
        <div className="text-base font-bold" style={{ color: ringColor, textShadow: `0 0 12px ${ringColor}` }}>
          {fmtMoney(pnl)}
        </div>
      </div>
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-3 text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--hud-text-dim)" }}>
        <span>ÍNDICE <span className="hud-glow-text">{score.toFixed(0)}</span></span>
        <span>·</span>
        <span className="flex items-center gap-1"><Radar className="h-3 w-3" /> ATIVO</span>
      </div>
    </div>
  );
}
