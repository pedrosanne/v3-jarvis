import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Radio,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  X,
  Lock,
  Terminal,
  Cpu,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OfertaCheckoutModal } from "@/components/oferta-checkout-modal";

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "JARVIS — Lançamento: R$ 997 para os 30 primeiros" },
      {
        name: "description",
        content:
          "Condição de lançamento: os 30 primeiros ativam o JARVIS por R$ 997 (de R$ 4.997). Depois disso, o preço volta ao valor normal. Acesso vitalício + garantia de 7 dias.",
      },
      { property: "og:title", content: "JARVIS — R$ 997 no lançamento (30 primeiros)" },
      {
        property: "og:description",
        content:
          "Preço de lançamento: R$ 997 para os 30 primeiros. Depois volta a R$ 4.997. Co-piloto de IA para traders, com garantia de 7 dias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "JARVIS — R$ 997 no lançamento" },
      {
        name: "twitter:description",
        content:
          "Os 30 primeiros ativam o JARVIS por R$ 997 (de R$ 4.997). Depois o preço volta ao normal.",
      },
    ],
  }),
  component: OfertaPage,
});

// ---------- Config de lançamento ----------
const LAUNCH_PRICE = 997;
const REGULAR_PRICE = 4997;
const TOTAL_SLOTS = 30;
const SLOTS_REMAINING = 23; // ajustar conforme vendas

// ---------- Wave canvas (mini, sem áudio) ----------
function WaveCanvas({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    let raf = 0;
    let t = 0;
    const bins = new Uint8Array(64);
    const draw = () => {
      t += 0.035;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < bins.length; i++) {
        bins[i] =
          40 +
          Math.sin(t * 1.2 + i * 0.35) * 22 * intensity +
          Math.sin(t * 0.6 + i * 0.13) * 14 * intensity +
          Math.sin(t * 2.4 + i * 0.7) * 8 * intensity;
      }
      const cx = W / 2;
      const cy = H / 2;
      const N = bins.length;
      const layers = 5;
      for (let L = layers - 1; L >= 0; L--) {
        const depth = L / (layers - 1);
        const ySquash = 0.32 + depth * 0.08;
        const radiusBase = Math.min(W, H) * (0.16 + depth * 0.05);
        const yOffset = (L - (layers - 1) / 2) * H * 0.05;
        const alpha = (1 - depth) * 0.85 + 0.1;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const idx = i % N;
          const a = (idx / N) * Math.PI * 2 - Math.PI / 2;
          const v = bins[idx] / 255;
          const r = radiusBase + v * Math.min(W, H) * 0.22 * (1 - depth * 0.5);
          const x = cx + Math.cos(a) * r;
          const y = cy + yOffset + Math.sin(a) * r * ySquash;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.55})`;
        ctx.lineWidth = (1 - depth) * 2.2 * dpr + 0.6;
        ctx.shadowColor = "rgba(34, 211, 238, 0.7)";
        ctx.shadowBlur = (1 - depth) * 18 * dpr;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.beginPath();
      const energy = bins.reduce((a, b) => a + b, 0) / (bins.length * 255);
      ctx.arc(cx, cy, 3 * dpr + energy * 14 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(165, 243, 252, 0.9)";
      ctx.shadowColor = "rgba(34, 211, 238, 1)";
      ctx.shadowBlur = 24 * dpr;
      ctx.fill();
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [intensity]);
  return <canvas ref={ref} className={className} />;
}

// ---------- Countdown (SSR-safe) ----------
function useCountdown(endsAt: number | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null || endsAt === null) return { h: 0, m: 0, s: 0, ready: false };
  const diff = Math.max(0, endsAt - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s, ready: true };
}

const pad = (n: number) => String(n).padStart(2, "0");

// ---------- BG grid ----------
function GridBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(34,211,238,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.6)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.08),transparent_60%)]" />
    </div>
  );
}

// ---------- Money ----------
const fmt = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CHECKOUT_URL = "#comprar"; // placeholder até definir o gateway

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
function OfertaPage() {
  // Countdown de 48h persistido por navegador — SSR-safe
  const [endsAt, setEndsAt] = useState<number | null>(null);
  useEffect(() => {
    const k = "oferta_ends_v1";
    const saved = Number(localStorage.getItem(k) || 0);
    if (saved > Date.now()) {
      setEndsAt(saved);
      return;
    }
    const next = Date.now() + 48 * 3600 * 1000;
    localStorage.setItem(k, String(next));
    setEndsAt(next);
  }, []);
  const { h, m, s, ready } = useCountdown(endsAt);
  const timer = ready ? `${pad(h)}:${pad(m)}:${pad(s)}` : "--:--:--";

  const [modalOpen, setModalOpen] = useState(false);
  const openCheckout = () => setModalOpen(true);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070c] text-cyan-50 antialiased">
      <GridBackdrop />

      {/* URGÊNCIA TOPO */}
      <div className="relative z-20 border-b border-cyan-400/20 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-cyan-200 sm:text-xs">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(110,231,183,0.8)]" />
            Lançamento • {SLOTS_REMAINING}/{TOTAL_SLOTS} vagas a R$ 997
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <Clock className="h-3.5 w-3.5 text-cyan-300" />
            Preço sobe em <span className="font-bold text-cyan-100">{timer}</span>
          </span>
        </div>
      </div>



      {/* HERO */}
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pt-16 pb-24 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-200 shadow-[0_0_24px_-6px_rgba(251,191,36,0.7)]">
          <Sparkles className="h-3 w-3" /> Condição de lançamento • 30 primeiros
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          Ative o JARVIS por{" "}
          <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(251,191,36,0.5)]">
            R$ 997
          </span>
          <br className="hidden sm:block" />
          <span className="text-cyan-300">antes do preço voltar a R$ 4.997.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-base text-cyan-100/80 sm:text-lg">
          Estamos abrindo <b className="text-amber-200">apenas 30 vagas</b> nessa condição para validar
          o núcleo neural v4.2 com operadores reais. Depois disso, o acesso volta ao valor cheio de
          <b> R$ 4.997</b> — sem exceção, sem &quot;cupom&quot;, sem &quot;me manda no direct&quot;.
        </p>


        {/* Wave visual */}
        <div className="relative mt-10 h-64 w-full max-w-3xl overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/40 via-[#04080d] to-[#04080d] shadow-[0_0_80px_-20px_rgba(34,211,238,0.6)]">
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(34,211,238,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.6)_1px,transparent_1px)] [background-size:20px_20px]" />
          <WaveCanvas className="absolute inset-0 h-full w-full" intensity={1.15} />
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/80">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            JARVIS • processando fluxo em tempo real
          </div>
          <div className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
            confidence 92.7%
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={openCheckout}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 px-8 py-4 font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_40px_-6px_rgba(251,191,36,0.9)] transition-transform hover:scale-[1.03]"
          >
            <Zap className="h-4 w-4" /> Garantir vaga por R$ 997
            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </button>
          <a
            href="/jarvis"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-black/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.22em] text-cyan-200 hover:bg-cyan-500/10"
          >
            Ver demo ao vivo
          </a>
        </div>


        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300/70">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Garantia 7 dias</span>
          <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Pagamento seguro</span>
          <span className="inline-flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> +12.400 sinais gerados</span>
        </div>
      </section>

      {/* DOR */}
      <section className="relative z-10 border-y border-cyan-500/10 bg-black/40">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Você já perdeu dinheiro suficiente <span className="text-red-400">operando no achismo</span>.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-cyan-100/70">
            Todo trader amador vive esse ciclo. Se você se reconhecer em pelo menos 2, o JARVIS foi feito para você.
          </p>
          <ul className="mx-auto mt-10 grid max-w-2xl gap-3">
            {[
              "Você entra numa operação e o mercado vira contra você em 30 segundos.",
              "Passa horas olhando gráfico e ainda perde para quem opera 5 minutos por dia.",
              "Já testou 3, 4 cursos de trading e continua no zero a zero.",
              "Sabe que os grandes usam IA — e você ainda opera no feeling.",
              "Erra o ponto de entrada por segundos e vê o lucro escorrer pelos dedos.",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 text-cyan-50/90"
              >
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-10 max-w-2xl text-center text-lg text-cyan-100">
            O problema nunca foi você. Foi a <b className="text-cyan-300">ferramenta</b>.
          </p>
        </div>
      </section>

      {/* APRESENTAÇÃO */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="relative h-80 overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/40 to-[#04080d] shadow-[0_0_80px_-24px_rgba(34,211,238,0.6)]">
              <WaveCanvas className="absolute inset-0 h-full w-full" intensity={0.9} />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/80">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> Neural Core
                </span>
                <span>v4.2.1</span>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                <span>EUR/USD • M1</span>
                <span className="text-emerald-300">▲ BUY 92.7%</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">
              <Brain className="h-3 w-3" /> Conheça o JARVIS
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Uma IA de mercado com <span className="text-cyan-300">7 camadas</span> de análise
              rodando em paralelo.
            </h2>
            <p className="mt-4 text-cyan-100/80">
              Enquanto um trader comum olha o gráfico, o JARVIS lê tudo o que move o preço
              <b> antes </b> do preço se mover.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: Cpu,
                  title: "Análise multi-camada em 8s",
                  desc: "Orderbook, fluxo de baleias, sentimento em X/Twitter, filings da SEC, spoof walls e mais.",
                },
                {
                  icon: TrendingUp,
                  title: "Sinais com confidence ≥ 87%",
                  desc: "Só entra quando a probabilidade justifica. Zero sinal aleatório.",
                },
                {
                  icon: Radio,
                  title: "Roda em qualquer corretora",
                  desc: "Quotex, IQ Option, Binance, MT5, TradingView, XP, Clear, BTG.",
                },
                {
                  icon: Newspaper,
                  title: "Leitura de notícias em tempo real",
                  desc: "Reuters, Bloomberg, Fed Wire, darkpool — tudo integrado ao sinal final.",
                },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_-6px_rgba(34,211,238,0.9)]">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-cyan-100">{f.title}</div>
                    <p className="text-sm text-cyan-100/70">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DEMO CTA */}
      <section className="relative z-10 border-y border-cyan-500/10 bg-gradient-to-b from-[#050b12] to-black/60">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">
            <Terminal className="h-3 w-3" /> Demo interativa
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Não acredite em palavras. <span className="text-cyan-300">Veja o JARVIS operando.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-cyan-100/70">
            Antes de comprar, entre no painel e observe o núcleo neural rodando uma análise real,
            sinal ao vivo, wave 3D e terminal de log institucional.
          </p>
          <Link
            to="/jarvis"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-black/60 px-7 py-3 font-mono text-xs uppercase tracking-[0.22em] text-cyan-200 shadow-[0_0_40px_-10px_rgba(34,211,238,0.9)] transition-colors hover:bg-cyan-500/10"
          >
            <Zap className="h-4 w-4" /> Abrir demo ao vivo →
          </Link>
        </div>
      </section>

      {/* PROVA */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Operadores JARVIS geraram <span className="text-emerald-300">R$ 8.720.400</span> este mês.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-cyan-100/70">
          Prints reais de contas reais. Você é o próximo.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "Rafael M.", city: "Curitiba/PR", pnl: 12480, days: 9, quote: "Em 9 dias fiz o que não consegui em 6 meses operando sozinho. A leitura de notícias antes do sinal é surreal." },
            { name: "Camila S.", city: "São Paulo/SP", pnl: 8940, days: 11, quote: "Nunca mais entrei numa operação sem o confidence do JARVIS acima de 88%. Mudou meu jogo." },
            { name: "Diego L.", city: "Belo Horizonte/MG", pnl: 21300, days: 14, quote: "Assinei achando que ia ser mais uma decepção. Em 2 semanas paguei o investimento 4 vezes." },
          ].map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/30 to-[#04080d] p-6 shadow-[0_0_40px_-24px_rgba(34,211,238,0.7)]"
            >
              <div className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-cyan-300/60" />
              <div className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-cyan-300/60" />
              <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-cyan-300/60" />
              <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-cyan-300/60" />
              <div className="mb-4 flex items-baseline justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">
                  PNL {t.days}d
                </div>
                <div className="text-2xl font-bold text-emerald-300 drop-shadow-[0_0_12px_rgba(110,231,183,0.5)]">
                  + {fmt(t.pnl)}
                </div>
              </div>
              <p className="text-sm text-cyan-100/85">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-2 border-t border-cyan-500/15 pt-3 text-xs text-cyan-200/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-[11px] font-bold text-cyan-200">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-semibold text-cyan-100">{t.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/60">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/60">
          <span>Compatível com:</span>
          {["Quotex", "IQ Option", "Binance", "MetaTrader 5", "TradingView", "XP", "Clear", "BTG"].map((b) => (
            <span key={b} className="rounded-md border border-cyan-500/20 bg-black/40 px-2.5 py-1 text-cyan-200/80">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* STACK DE VALOR */}
      <section id="valor" className="relative z-10 border-y border-cyan-500/10 bg-black/50">
        <div className="mx-auto max-w-4xl px-4 py-24">
          <div className="mb-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles className="h-3 w-3" /> Tudo que você leva
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Um arsenal de <span className="text-cyan-300">R$ 21.200</span> por uma fração disso.
          </h2>

          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/30 to-[#04080d] shadow-[0_0_60px_-24px_rgba(34,211,238,0.7)]">
            {[
              { title: "Acesso vitalício ao JARVIS (núcleo neural v4.2)", price: 9800 },
              { title: "Extensão para navegador (slide-hack de corretora)", price: 1500 },
              { title: "Módulo de análise de notícias em tempo real", price: 2400 },
              { title: "Diário de trades com IA (journal + reports)", price: 1200 },
              { title: "Comunidade privada de operadores JARVIS", price: 1800 },
              { title: "Atualizações e novos módulos por 12 meses", price: 3000 },
              { title: "Suporte prioritário 1-a-1", price: 1500 },
            ].map((item, i) => (
              <div
                key={item.title}
                className={cn(
                  "flex items-center justify-between gap-4 px-5 py-4 sm:px-8",
                  i > 0 && "border-t border-cyan-500/15",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-cyan-100 sm:text-base">{item.title}</span>
                </div>
                <div className="font-mono text-sm text-cyan-300/80">{fmt(item.price)}</div>
              </div>
            ))}

            <div className="flex items-center justify-between gap-4 border-t border-cyan-400/30 bg-cyan-500/[0.06] px-5 py-4 sm:px-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200">
                Valor total
              </span>
              <span className="font-mono text-lg text-cyan-100/80 line-through decoration-red-400/70">
                {fmt(21200)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-cyan-500/15 px-5 py-4 sm:px-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">
                Preço normal
              </span>
              <span className="font-mono text-base text-cyan-100/70 line-through decoration-red-400/70">
                {fmt(REGULAR_PRICE)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-amber-400/20 via-amber-300/10 to-transparent px-5 py-6 sm:px-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-100">
                Lançamento • 30 primeiros
              </span>
              <span className="text-2xl font-black text-amber-100 drop-shadow-[0_0_16px_rgba(251,191,36,0.7)] sm:text-3xl">
                {fmt(LAUNCH_PRICE)}
              </span>
            </div>
          </div>


          <div className="mt-8 text-center">
            <button
              onClick={openCheckout}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-200 px-7 py-3 font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_40px_-6px_rgba(251,191,36,0.9)] transition-transform hover:scale-[1.03]"
            >
              <Zap className="h-4 w-4" /> Garantir uma das 30 vagas
            </button>
          </div>

        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          O JARVIS não é para todo mundo.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-cyan-100/70">
          Antes de comprar, veja se você se encaixa. Preferimos perder uma venda a ter um cliente frustrado.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.04] p-6 shadow-[0_0_60px_-24px_rgba(52,211,153,0.5)]">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300">
              <Check className="h-4 w-4" /> É para você se
            </div>
            <ul className="space-y-3 text-cyan-100">
              {[
                "Quer parar de operar no achismo e ter um sistema por trás de cada entrada.",
                "Tem no mínimo R$ 500 de banca disponível.",
                "É disciplinado o suficiente para seguir os sinais do JARVIS sem improvisar.",
                "Já opera (mesmo perdendo) e quer virar o jogo com tecnologia real.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-red-400/30 bg-red-500/[0.04] p-6 shadow-[0_0_60px_-24px_rgba(248,113,113,0.4)]">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-red-300">
              <X className="h-4 w-4" /> Não é para você se
            </div>
            <ul className="space-y-3 text-cyan-100">
              {[
                "Procura “robô mágico que dobra a banca em 1 dia”. Isso não existe.",
                "Não vai seguir os sinais e ainda quer culpar a ferramenta.",
                "Quer ficar rico sem esforço, sem estudo e sem paciência.",
                "Não está disposto a investir R$ 997 agora — sabendo que amanhã pode custar R$ 4.997.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="relative z-10 border-y border-cyan-500/10 bg-black/40">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-300/60 bg-cyan-500/10 shadow-[0_0_60px_-8px_rgba(34,211,238,0.9)]">
            <ShieldCheck className="h-12 w-12 text-cyan-200" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Garantia incondicional de <span className="text-cyan-300">7 dias</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-cyan-100/80">
            Ativou, testou, não gostou por qualquer motivo? Devolvemos <b>100% do valor</b> — sem perguntas, sem burocracia, sem letra miúda.
            O risco é <b>todo nosso</b>. O seu é apenas <b>não experimentar</b>.
          </p>
        </div>
      </section>

      {/* OFERTA / CHECKOUT */}
      <section id="oferta" className="relative z-10 mx-auto max-w-4xl px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-b from-amber-950/30 via-[#04080d] to-[#04080d] p-8 shadow-[0_0_120px_-20px_rgba(251,191,36,0.7)] sm:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(251,191,36,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,.6)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-200">
              <Clock className="h-3 w-3" /> Lançamento encerra em {timer}
            </div>

            <h2 className="mt-6 text-3xl font-black sm:text-5xl">
              Garantir minha vaga no{" "}
              <span className="text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.6)]">
                lançamento
              </span>
              .
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-cyan-100/70">
              Depois das <b className="text-amber-200">30 vagas</b> preenchidas, o acesso volta ao
              preço cheio de <b>{fmt(REGULAR_PRICE)}</b>. Não haverá nova rodada nessa condição.
            </p>

            <div className="mt-8 flex flex-col items-center gap-1">
              <div className="font-mono text-sm text-cyan-100/70 line-through decoration-red-400/70">
                De {fmt(REGULAR_PRICE)}
              </div>
              <div className="text-6xl font-black text-amber-100 drop-shadow-[0_0_28px_rgba(251,191,36,0.9)] sm:text-7xl">
                {fmt(LAUNCH_PRICE)}
              </div>
              <div className="mt-2 font-mono text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                ou <b className="text-cyan-100">10x de R$ 99,70</b> sem juros no cartão
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300">
                PIX à vista • acesso liberado em segundos
              </div>
            </div>

            <a
              href="#" onClick={(e) => { e.preventDefault(); openCheckout(); }}
              className="group mt-10 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 px-8 py-5 text-base font-black uppercase tracking-[0.16em] text-black shadow-[0_0_60px_-6px_rgba(251,191,36,1)] transition-transform hover:scale-[1.02] sm:text-lg"
            >
              <Zap className="h-5 w-5" /> Ativar JARVIS por R$ 997
              <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </a>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
              <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Ambiente seguro SSL</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Garantia 7 dias</span>
              <span>Visa • Master • Elo • PIX</span>
            </div>

            {/* Progress de vagas */}
            <div className="mt-8 rounded-xl border border-amber-300/30 bg-black/50 px-5 py-4">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.22em] text-amber-200/90">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                  Vagas restantes
                </span>
                <span>
                  <b className="text-amber-100">{SLOTS_REMAINING}</b> / {TOTAL_SLOTS}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cyan-950/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.9)]"
                  style={{ width: `${((TOTAL_SLOTS - SLOTS_REMAINING) / TOTAL_SLOTS) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
                {TOTAL_SLOTS - SLOTS_REMAINING} pessoas já ativaram nas últimas horas
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-24">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
        <div className="mt-10 space-y-3">
          {[
            {
              q: "Por que R$ 997 se o preço normal é R$ 4.997?",
              a: "É a nossa condição de lançamento para os 30 primeiros operadores. Queremos rodar o núcleo neural v4.2 com traders reais, coletar cases e depoimentos. Após as 30 vagas serem preenchidas, o preço volta automaticamente para R$ 4.997 — sem exceção.",
            },
            {
              q: "O preço volta mesmo depois das 30 vagas?",
              a: "Volta. Não há segunda rodada, não há cupom, não há 'me manda no direct'. Quem entrar depois paga R$ 4.997.",
            },
            {
              q: "Preciso ter experiência com trading?",
              a: "Não é obrigatório, mas ajuda. O JARVIS entrega o sinal pronto (entrada, stop e alvo). Iniciantes aprendem operando junto; experientes tiram o máximo desde o dia 1.",
            },
            {
              q: "Funciona em qualquer corretora?",
              a: "Sim. É compatível com Quotex, IQ Option, Binance, MT5, TradingView, XP, Clear, BTG e outras. Você opera na corretora que já usa.",
            },
            {
              q: "E se eu não gostar?",
              a: "Você tem 7 dias de garantia incondicional. Basta mandar um e-mail e devolvemos 100% do valor — sem perguntas.",
            },
            {
              q: "O acesso é vitalício mesmo?",
              a: "Sim. Pagamento único, sem mensalidade. Inclui todas as atualizações e novos módulos por 12 meses.",
            },
            {
              q: "Como recebo o acesso após pagar?",
              a: "Assim que o pagamento é confirmado (segundos no PIX, poucos minutos no cartão), você recebe o login por e-mail e já entra no painel.",
            },
            {
              q: "Posso parcelar? Tem PIX?",
              a: "Sim. Até 10x de R$ 99,70 sem juros no cartão, ou PIX à vista com liberação imediata.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-cyan-500/20 bg-black/40 px-5 py-4 open:border-cyan-400/50 open:bg-cyan-500/[0.05]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-cyan-100">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-cyan-300 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-cyan-100/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 border-t border-cyan-500/15 bg-gradient-to-b from-black/60 to-[#020508]">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <div className="relative mx-auto mb-8 h-40 w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/40 to-[#04080d] shadow-[0_0_80px_-24px_rgba(34,211,238,0.8)]">
            <WaveCanvas className="absolute inset-0 h-full w-full" intensity={1.3} />
          </div>
          <h2 className="text-3xl font-black sm:text-5xl">
            R$ 997 <span className="text-amber-300">hoje</span>. <br className="sm:hidden" />
            R$ 4.997 <span className="text-red-400">depois das 30 vagas</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cyan-100/80">
            Você não vai receber outro e-mail lembrando dessa condição. Ou você entra agora,
            ou paga 5x mais no próximo lote. A escolha é sua.
          </p>
          <a
            href="#" onClick={(e) => { e.preventDefault(); openCheckout(); }}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-200 px-8 py-4 font-black uppercase tracking-[0.18em] text-black shadow-[0_0_60px_-6px_rgba(251,191,36,1)] transition-transform hover:scale-[1.03]"
          >
            <Zap className="h-5 w-5" /> Garantir minha vaga por R$ 997 →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-cyan-500/10 bg-black/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/60 sm:flex-row sm:text-left">
          <div>© {new Date().getFullYear()} JARVIS Systems • Todos os direitos reservados</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-cyan-200">Termos</a>
            <a href="#" className="hover:text-cyan-200">Privacidade</a>
            <a href="mailto:contato@jarvis.pro" className="hover:text-cyan-200">Contato</a>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-8 text-center text-[10px] leading-relaxed text-cyan-300/40">
          Aviso legal: trading envolve risco. Resultados passados não garantem resultados futuros.
          O JARVIS é uma ferramenta de análise e decisão — o usuário é responsável pelas próprias operações.
        </div>
      </footer>
    </div>
  );
}
