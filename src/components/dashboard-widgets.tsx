import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function KpiCard({
  label,
  value,
  sub,
  icon,
  gradient,
  spark,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  gradient: string;
  spark?: { v: number }[];
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-[var(--shadow-kpi)]"
          style={{ background: `var(${gradient})` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold leading-tight tracking-tight">{value}</div>
          <div className="truncate text-xs font-medium text-muted-foreground">{label}</div>
          {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
        </div>
        {spark && (
          <div className="h-12 w-20 shrink-0">
            <ResponsiveContainer>
              <AreaChart data={spark}>
                <defs>
                  <linearGradient id={`g-${label}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill={`url(#g-${label})`}
                  className="text-primary"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]", className)}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="min-w-0 text-sm font-semibold tracking-tight">{title}</h3>}
          {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

const CHART_COLORS = [
  "oklch(0.6 0.22 290)",
  "oklch(0.7 0.2 35)",
  "oklch(0.72 0.15 210)",
  "oklch(0.68 0.21 10)",
  "oklch(0.7 0.18 145)",
  "oklch(0.75 0.17 70)",
];

export function EquityCurveChart({ data }: { data: { date: string; equity: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.6 0.22 290)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.6 0.22 290)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 270)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 270)" minTickGap={30} />
          <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 270)" width={50} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 270)", fontSize: 12 }}
            formatter={(v: number) => `$${v.toLocaleString()}`}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="oklch(0.55 0.22 290)"
            strokeWidth={2.5}
            fill="url(#equityFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({
  data,
  xKey,
  yKey,
  horizontal,
}: {
  data: any[];
  xKey: string;
  yKey: string;
  horizontal?: boolean;
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 270)" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 270)" />
              <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 270)" width={90} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 270)" />
              <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 270)" width={50} />
            </>
          )}
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 270)", fontSize: 12 }}
          />
          <Bar dataKey={yKey} radius={[6, 6, 6, 6]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d[yKey] < 0 ? "oklch(0.65 0.22 25)" : CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 270)", fontSize: 12 }} />
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineSpark({ data, color }: { data: { v: number }[]; color?: string }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color ?? "oklch(0.55 0.22 290)"} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}