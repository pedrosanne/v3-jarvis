import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { cn } from "@/lib/utils";
import {
  Activity,
  Copy,
  Cpu,
  Globe,
  ImageIcon,
  Lock,
  Newspaper,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Square,
  Terminal,
  TrendingDown,
  TrendingUp,
  Upload,
  Wifi,
  X,
  ExternalLink,
  Zap,
  ChevronsRight,
  Unlock,
  Link2,
  Loader2,
  ShieldX,
  Search,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  primeAudio,
  sfxClick,
  sfxBeep,
  sfxScanStart,
  sfxScanTick,
  sfxSuccess,
  sfxError,
  sfxAlert,
  sfxUpload,
  sfxWhoosh,
  sfxPowerUp,
  sfxConnecting,
  sfxSonar,
  sfxIntercept,
  sfxNews,
  sfxNeural,
  sfxSignalReady,
  sfxAbort,
  sfxType,
} from "@/lib/iara-sounds";




export const Route = createFileRoute("/iara")({
  component: IaraPage,
});

type AssetCategory = "Forex" | "Cripto" | "Ações";
type AssetItem = {
  symbol: string; // displayed: "EUR/CHF (OTC)"
  code: string;   // short: EUR-CHF-OTC
  name: string;   // full name
  category: AssetCategory;
  payout: number; // %
  // visual: dual flags for forex, single logo for crypto/stock
  flags?: [string, string];
  logo?: string;
  color?: string; // fallback brand color
};

const flag = (cc: string) => `https://flagcdn.com/w40/${cc}.png`;
const crypto = (s: string) =>
  `https://assets.coincap.io/assets/icons/${s.toLowerCase()}@2x.png`;
const clearbit = (d: string) => `https://logo.clearbit.com/${d}`;

const ASSET_CATALOG: AssetItem[] = [
  // Forex OTC
  { symbol: "EUR/CHF (OTC)", code: "EUR-CHF-OTC", name: "Euro / Swiss Franc", category: "Forex", payout: 88, flags: [flag("eu"), flag("ch")] },
  { symbol: "USD/CHF (OTC)", code: "USD-CHF-OTC", name: "US Dollar / Swiss Franc", category: "Forex", payout: 91, flags: [flag("us"), flag("ch")] },
  // Cripto
  { symbol: "Avalanche (OTC)", code: "AVAX-OTC", name: "Avalanche", category: "Cripto", payout: 88, logo: crypto("avax"), color: "#e84142" },
  { symbol: "Bitcoin", code: "BTC-USDT", name: "Bitcoin", category: "Cripto", payout: 89, logo: crypto("btc"), color: "#f7931a" },
  { symbol: "BNB (OTC)", code: "BNB-OTC", name: "BNB", category: "Cripto", payout: 89, logo: crypto("bnb"), color: "#f3ba2f" },
  { symbol: "Cardano (OTC)", code: "ADA-OTC", name: "Cardano", category: "Cripto", payout: 89, logo: crypto("ada"), color: "#0033ad" },
  { symbol: "Dogecoin (OTC)", code: "DOGE-OTC", name: "Dogecoin", category: "Cripto", payout: 89, logo: crypto("doge"), color: "#c2a633" },
  { symbol: "Ethereum", code: "ETH", name: "Ethereum", category: "Cripto", payout: 89, logo: crypto("eth"), color: "#627eea" },
  { symbol: "Polkadot (OTC)", code: "DOT-OTC", name: "Polkadot", category: "Cripto", payout: 87, logo: crypto("dot"), color: "#e6007a" },
  { symbol: "Polygon (OTC)", code: "MATIC-OTC", name: "Polygon", category: "Cripto", payout: 86, logo: crypto("matic"), color: "#8247e5" },
  { symbol: "Solana", code: "SOL", name: "Solana", category: "Cripto", payout: 89, logo: crypto("sol"), color: "#14f195" },
  // Ações
  { symbol: "Apple Inc. (OTC)", code: "AAPL-OTC", name: "Apple Inc.", category: "Ações", payout: 89, logo: clearbit("apple.com"), color: "#ffffff" },
  { symbol: "Microsoft Corp. (OTC)", code: "MSFT-OTC", name: "Microsoft Corp.", category: "Ações", payout: 89, logo: clearbit("microsoft.com"), color: "#00a4ef" },
];

const ASSETS = ASSET_CATALOG.map((a) => a.symbol);
const findAsset = (sym: string) => ASSET_CATALOG.find((a) => a.symbol === sym) ?? ASSET_CATALOG[0];


const TIMEFRAMES = [
  { label: "M1", seconds: 60 },
  { label: "M5", seconds: 300 },
  { label: "M15", seconds: 900 },
  { label: "M30", seconds: 1800 },
  { label: "H1", seconds: 3600 },
];

type Phase =
  | "idle"
  | "connecting"
  | "scanning"
  | "intercepting"
  | "news"
  | "deep"
  | "signal";

type LogLine = {
  id: number;
  text: string;
  tone: "info" | "ok" | "warn" | "crit" | "data";
};

const NEWS_FEED = [
  "[REUTERS] Fed officials hint at dovish pivot — futures spike",
  "[BLOOMBERG] Whale wallet 0x8a3f… moved 12,450 BTC to Coinbase",
  "[DARKPOOL] Block trade detected: 1.2M shares @ 0.04% above ask",
  "[CME] Open interest +18.2% in last 15m — unusual flow",
  "[X/TWITTER] Sentiment shift +37% bullish on $SPY in 90s",
  "[BINANCE] Liquidation cluster forming at $67,420",
  "[SEC FILING] Insider buy detected — Form 4 leaked early",
  "[FED WIRE] Liquidity injection flagged — repo desk anomaly",
  "[L2 ORDERBOOK] Spoof wall removed at bid — momentum unlocked",
];

const BROKERS = ["MetaTrader 5", "TradingView", "Binance", "XP", "Clear", "BTG"];

function IaraPage() {
  const [asset, setAsset] = useState(ASSETS[0]);
  const [tf, setTf] = useState(TIMEFRAMES[1]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [matrix, setMatrix] = useState<string[]>([]);
  const [price, setPrice] = useState(1.0875);
  const [confidence, setConfidence] = useState(0);
  const [signal, setSignal] = useState<null | {
    side: "BUY" | "SELL";
    entry: number;
    sl: number;
    tp: number;
    confidence: number;
    expiry: string;
  }>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const [chartPrint, setChartPrint] = useState<string | null>(null);
  const [scanningPrint, setScanningPrint] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Sequencial reveal dos painéis (Terminal → Data Stream → Notícias)
  const [revealStep, setRevealStep] = useState(0);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);


  // Broker URL gate
  const [brokerUrl, setBrokerUrl] = useState("");
  type BrokerStatus = "idle" | "checking" | "approved" | "rejected";
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus>("idle");
  const [brokerProgress, setBrokerProgress] = useState(0);
  const [brokerSteps, setBrokerSteps] = useState<{ label: string; done: boolean; ok?: boolean }[]>([]);
  const [brokerDomain, setBrokerDomain] = useState<string | null>(null);
  const [savedBrokerUrl, setSavedBrokerUrl] = useState<string | null>(null);
  const brokerTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Account ID gate
  const [accountId, setAccountId] = useState("");
  type AccountStatus = "idle" | "checking" | "approved" | "rejected";
  const [accountStatus, setAccountStatus] = useState<AccountStatus>("idle");
  const [accountProgress, setAccountProgress] = useState(0);
  const [accountSteps, setAccountSteps] = useState<{ label: string; done: boolean; ok?: boolean }[]>([]);
  const [savedAccountId, setSavedAccountId] = useState<string | null>(null);
  const [accountMeta, setAccountMeta] = useState<null | {
    masked: string;
    assets: number;
    latency: number;
    tier: string;
  }>(null);
  const accountTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);


  // Onboarding gating — libera funções uma de cada vez na primeira sessão.
  const [touchedSelect, setTouchedSelect] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("iara_onboarded_v1") === "1") {
      setTouchedSelect(true);
    }
  }, []);
  useEffect(() => {
    if (chartPrint && touchedSelect && typeof window !== "undefined") {
      localStorage.setItem("iara_onboarded_v1", "1");
    }
  }, [chartPrint, touchedSelect]);
  const brokerApproved = brokerStatus === "approved";
  const accountApproved = accountStatus === "approved";
  const printLocked = !brokerApproved || !accountApproved;
  const selectsLocked = !brokerApproved || !accountApproved || !chartPrint;
  const slideLocked = !brokerApproved || !accountApproved || !chartPrint || !touchedSelect;

  // Auto-scroll lento enquanto a análise roda
  const scrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  function startAutoScroll() {
    stopAutoScroll();
    scrollTimerRef.current = setInterval(() => {
      if (typeof window === "undefined") return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY < max - 1) window.scrollBy({ top: 1, behavior: "auto" });
      else stopAutoScroll();
    }, 22); // ~45px/s — lento e suave
  }
  function stopAutoScroll() {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }
  useEffect(() => () => stopAutoScroll(), []);

  // Broker verification ----------------------------------------------------
  const ALLOWED_BROKERS = ["forexoficial.com", "ilov.pro", "deffy.com.br"];

  function parseDomain(raw: string): string | null {
    if (!raw) return null;
    let v = raw.trim();
    if (!v) return null;
    if (!/^https?:\/\//i.test(v)) v = "https://" + v;
    try {
      const u = new URL(v);
      return u.hostname.replace(/^www\./i, "").toLowerCase();
    } catch {
      return null;
    }
  }

  function clearBrokerTimers() {
    brokerTimerRef.current.forEach((t) => clearTimeout(t));
    brokerTimerRef.current = [];
  }
  useEffect(() => () => clearBrokerTimers(), []);

  function startBrokerCheck(raw: string) {
    clearBrokerTimers();
    const domain = parseDomain(raw);
    setBrokerDomain(domain);
    setBrokerStatus("checking");
    setBrokerProgress(0);

    const allowed = !!domain && ALLOWED_BROKERS.some(
      (d) => domain === d || domain.endsWith("." + d),
    );

    const steps = [
      { label: "Resolvendo DNS", ms: 550 },
      { label: "Validando certificado TLS", ms: 650 },
      { label: "Consultando registro CVM/CySEC", ms: 800 },
      { label: "Auditando licença de operação", ms: 750 },
      { label: "Cross-check whitelist Iara", ms: 700 },
    ];
    setBrokerSteps(steps.map((s) => ({ label: s.label, done: false })));

    let acc = 0;
    const total = steps.reduce((a, s) => a + s.ms, 0);
    steps.forEach((s, i) => {
      acc += s.ms;
      const stepOk = i < steps.length - 1 ? true : allowed;
      const t = setTimeout(() => {
        setBrokerSteps((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, done: true, ok: stepOk } : p)),
        );
        setBrokerProgress(Math.round((acc / total) * 100));
        if (i === steps.length - 1) {
          if (allowed) {
            setBrokerStatus("approved");
            toast.success(`Corretora ${domain} verificada e aprovada`);
          } else {
            setBrokerStatus("rejected");
            toast.error("Corretora não regulamentada — operação bloqueada");
          }
        }
      }, acc);
      brokerTimerRef.current.push(t);
    });

    // animate progress smoothly
    const startT = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(99, Math.round(((Date.now() - startT) / total) * 100));
      setBrokerProgress((cur) => (cur < p ? p : cur));
      if (p >= 99) clearInterval(tick);
    }, 60);
    brokerTimerRef.current.push(tick as unknown as ReturnType<typeof setTimeout>);
  }

  function resetBroker() {
    clearBrokerTimers();
    setBrokerUrl("");
    setBrokerStatus("idle");
    setBrokerProgress(0);
    setBrokerSteps([]);
    setBrokerDomain(null);
  }

  // Carrega URL salva como padrão e dispara verificação automática
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("iara_broker_url_v1");
    if (saved) {
      setSavedBrokerUrl(saved);
      setBrokerUrl(saved);
      startBrokerCheck(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveBrokerDefault() {
    if (typeof window === "undefined") return;
    if (brokerStatus !== "approved" || !brokerUrl) return;
    localStorage.setItem("iara_broker_url_v1", brokerUrl);
    setSavedBrokerUrl(brokerUrl);
    toast.success("URL da corretora salva como padrão");
  }

  function clearBrokerDefault() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("iara_broker_url_v1");
    setSavedBrokerUrl(null);
    toast.message("URL padrão removida");
  }

  // Account ID verification ----------------------------------------------
  function clearAccountTimers() {
    accountTimerRef.current.forEach((t) => clearTimeout(t));
    accountTimerRef.current = [];
  }
  useEffect(() => () => clearAccountTimers(), []);

  function maskAccountId(raw: string) {
    const v = raw.trim();
    if (v.length <= 10) return v;
    return v.slice(0, 8) + "•••••••••••" + v.slice(-6);
  }

  function startAccountCheck(raw: string) {
    clearAccountTimers();
    const v = raw.trim();
    setAccountStatus("checking");
    setAccountProgress(0);
    setAccountMeta(null);

    // Accept any reasonably formatted ID (>= 12 chars, alphanumeric + dashes)
    const valid = /^[a-zA-Z0-9-]{12,}$/.test(v);

    const steps = [
      { label: "Conectando à API da corretora", ms: 600 },
      { label: "Autenticando ID da conta", ms: 700 },
      { label: "Sincronizando feed de ativos em tempo real", ms: 850 },
      { label: "Validando permissões de leitura", ms: 700 },
      { label: "Indexando book L2 na neural Iara", ms: 800 },
    ];
    setAccountSteps(steps.map((s) => ({ label: s.label, done: false })));

    let acc = 0;
    const total = steps.reduce((a, s) => a + s.ms, 0);
    steps.forEach((s, i) => {
      acc += s.ms;
      const stepOk = i < steps.length - 1 ? true : valid;
      const t = setTimeout(() => {
        setAccountSteps((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, done: true, ok: stepOk } : p)),
        );
        setAccountProgress(Math.round((acc / total) * 100));
        if (i === steps.length - 1) {
          if (valid) {
            setAccountStatus("approved");
            setAccountMeta({
              masked: maskAccountId(v),
              assets: 124 + Math.floor(Math.random() * 40),
              latency: 9 + Math.floor(Math.random() * 14),
              tier: "Pro · Tempo Real",
            });
            toast.success("ID da conta autenticado — feed em tempo real ativo");
          } else {
            setAccountStatus("rejected");
            toast.error("ID da conta inválido — verifique e tente novamente");
          }
        }
      }, acc);
      accountTimerRef.current.push(t);
    });

    const startT = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(99, Math.round(((Date.now() - startT) / total) * 100));
      setAccountProgress((cur) => (cur < p ? p : cur));
      if (p >= 99) clearInterval(tick);
    }, 60);
    accountTimerRef.current.push(tick as unknown as ReturnType<typeof setTimeout>);
  }

  function resetAccount() {
    clearAccountTimers();
    setAccountId("");
    setAccountStatus("idle");
    setAccountProgress(0);
    setAccountSteps([]);
    setAccountMeta(null);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("iara_account_id_v1");
    if (saved) {
      setSavedAccountId(saved);
      setAccountId(saved);
      startAccountCheck(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveAccountDefault() {
    if (typeof window === "undefined") return;
    if (accountStatus !== "approved" || !accountId) return;
    localStorage.setItem("iara_account_id_v1", accountId);
    setSavedAccountId(accountId);
    toast.success("ID da conta salvo como padrão");
  }

  function clearAccountDefault() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("iara_account_id_v1");
    setSavedAccountId(null);
    toast.message("ID padrão removido");
  }





  function startPrintScan() {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setScanningPrint(true);
    setScanProgress(0);
    const startT = Date.now();
    const duration = 2600;
    scanTimerRef.current = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - startT) / duration) * 100));
      setScanProgress(p);
      if (p >= 100) {
        if (scanTimerRef.current) clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
        setScanningPrint(false);
        toast.success("Raio-X concluído — imagem indexada");
      }
    }, 40);
  }
  useEffect(() => () => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
  }, []);

  function handleFile(file: File | null | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setChartPrint(ev.target?.result as string);
      toast.success("Print recebido — iniciando varredura Raio-X");
      startPrintScan();
    };
    reader.readAsDataURL(file);
  }


  // Paste image from clipboard (Ctrl+V) anywhere on the page
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          handleFile(item.getAsFile());
          e.preventDefault();
          return;
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const phaseLabel: Record<Phase, string> = {
    idle: "Iara em standby",
    connecting: "Conectando aos servidores da corretora",
    scanning: "Escaneando book de ofertas em tempo real",
    intercepting: "Interceptando ordens de market makers",
    news: "Cruzando notícias e sentimento global",
    deep: "Deep analysis neural — 12.4B parâmetros",
    signal: "Sinal pronto",
  };

  function push(text: string, tone: LogLine["tone"] = "info") {
    idRef.current += 1;
    setLogs((l) => [...l.slice(-80), { id: idRef.current, text, tone }]);
  }

  // Matrix rain
  useEffect(() => {
    if (phase === "idle" || phase === "signal") return;
    const chars = "01ｱｲｳｴｵｶｷｸｹｺ$€¥₿ABCDEF";
    const t = setInterval(() => {
      setMatrix(
        Array.from({ length: 24 }, () =>
          Array.from({ length: 18 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
        ),
      );
    }, 90);
    return () => clearInterval(t);
  }, [phase]);

  // Price ticker
  useEffect(() => {
    const t = setInterval(() => {
      setPrice((p) => +(p + (Math.random() - 0.5) * 0.0012).toFixed(5));
    }, 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  async function runIara() {
    setSignal(null);
    setLogs([]);
    setProgress(0);
    setConfidence(0);
    // revela painéis um a um para imersão visual
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
    setRevealStep(1); // Terminal aparece imediatamente
    revealTimersRef.current.push(setTimeout(() => setRevealStep(2), 900));  // Data Stream
    revealTimersRef.current.push(setTimeout(() => setRevealStep(3), 1900)); // Notícias
    startAutoScroll();

    const broker = BROKERS[Math.floor(Math.random() * BROKERS.length)];

    const steps: { phase: Phase; lines: [string, LogLine["tone"]][]; ms: number }[] = [
      {
        phase: "connecting",
        ms: 1800,
        lines: [
          [`> iara --target=${asset} --tf=${tf.label} --mode=scalp`, "ok"],
          [`[boot] Iniciando núcleo neural Iara v4.2.1`, "info"],
          [`[net]  Estabelecendo túnel VPN → 185.${rint(10, 250)}.${rint(10, 250)}.${rint(10, 250)}`, "info"],
          [`[net]  Handshake TLS com ${broker} ............ OK`, "ok"],
          [`[auth] Bypass autenticação L3 ............... OK`, "warn"],
        ],
      },
      {
        phase: "scanning",
        ms: 2200,
        lines: [
          [`[scan] Lendo book de ofertas ${asset}...`, "data"],
          [`[scan] 4.812 ordens/s capturadas`, "data"],
          [`[scan] Detectados 3 market makers ativos`, "data"],
          [`[scan] Volume profile carregado — POC @ ${price.toFixed(4)}`, "data"],
          [`[scan] Wyckoff phase: acumulação detectada`, "ok"],
        ],
      },
      {
        phase: "intercepting",
        ms: 2400,
        lines: [
          [`[xploit] Acessando dark pool feed (NYSE/ICE) ...`, "warn"],
          [`[xploit] Sniffing pacotes FIX 4.4 ............ OK`, "crit"],
          [`[xploit] Iceberg order detectada — 12.4k @ ${(price * 0.998).toFixed(4)}`, "crit"],
          [`[xploit] Stop hunt mapeado — liquidez em ${(price * 1.003).toFixed(4)}`, "crit"],
          [`[xploit] Algoritmo HFT identificado: Citadel-σ`, "warn"],
        ],
      },
      {
        phase: "news",
        ms: 2200,
        lines: [
          [`[news] Crawler em 142 fontes globais ...`, "info"],
          ...pickNews(4).map((n) => [n, "data"] as [string, LogLine["tone"]]),
          [`[news] Score de impacto: +0.73 (forte)`, "ok"],
        ],
      },
      {
        phase: "deep",
        ms: 2400,
        lines: [
          [`[ai] Carregando modelo Iara-Transformer 12.4B`, "info"],
          [`[ai] Fusion: price-action + orderflow + news + onchain`, "info"],
          [`[ai] Backtest últimas 50k velas ............. 87.3% win`, "ok"],
          [`[ai] Monte Carlo 10.000 cenários — EV positiva`, "ok"],
          [`[ai] Confiança final calculada`, "ok"],
        ],
      },
    ];

    const total = steps.reduce((a, s) => a + s.ms, 0);
    let elapsed = 0;

    for (const step of steps) {
      setPhase(step.phase);
      const per = step.ms / step.lines.length;
      for (const [text, tone] of step.lines) {
        push(text, tone);
        await sleep(per);
        elapsed += per;
        setProgress(Math.min(99, (elapsed / total) * 100));
        setConfidence((c) => Math.min(96, c + 100 / (steps.length * step.lines.length)));
      }
    }

    // Build signal
    const side: "BUY" | "SELL" = Math.random() > 0.5 ? "BUY" : "SELL";
    const entry = +price.toFixed(5);
    const spread = entry * 0.0015;
    const sl = +(side === "BUY" ? entry - spread : entry + spread).toFixed(5);
    const tp = +(side === "BUY" ? entry + spread * 2.2 : entry - spread * 2.2).toFixed(5);
    const expiry = new Date(Date.now() + tf.seconds * 1000).toLocaleTimeString();
    const conf = 88 + Math.floor(Math.random() * 10);

    push(`[signal] ✦ SINAL GERADO: ${side} ${asset} @ ${entry}`, "ok");
    push(`[signal] SL=${sl}  TP=${tp}  R:R=1:2.2  conf=${conf}%`, "ok");
    setProgress(100);
    setConfidence(conf);
    setSignal({ side, entry, sl, tp, confidence: conf, expiry });
    setPhase("signal");
    stopAutoScroll();
  }

  function stop() {
    setPhase("idle");
    setProgress(0);
    setConfidence(0);
    setLogs([]);
    setSignal(null);
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
    setRevealStep(0);
    stopAutoScroll();
  }
  useEffect(() => () => revealTimersRef.current.forEach(clearTimeout), []);

  const running = phase !== "idle" && phase !== "signal";

  return (
    <AppLayout title="Iara — AI Scalper">
      <div className="grid w-full max-w-full gap-4 overflow-x-hidden lg:grid-cols-12">
        {/* Hero / Controls */}
        <div className="min-w-0 lg:col-span-12">
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#070b10] p-4 text-cyan-200 shadow-[0_0_60px_-15px_rgba(34,211,238,0.4)] sm:p-5">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(34,211,238,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.6)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative flex flex-col gap-4">
              <BrokerUrlGate
                url={brokerUrl}
                setUrl={setBrokerUrl}
                status={brokerStatus}
                progress={brokerProgress}
                steps={brokerSteps}
                domain={brokerDomain}
                allowedBrokers={ALLOWED_BROKERS}
                savedUrl={savedBrokerUrl}
                onStart={startBrokerCheck}
                onReset={resetBroker}
                onSaveDefault={saveBrokerDefault}
                onClearDefault={clearBrokerDefault}
              />

              <div
                className={cn(
                  "transition-opacity duration-500",
                  !brokerApproved && "pointer-events-none select-none opacity-40 blur-[1px]",
                )}
              >
                <AccountIdGate
                  accountId={accountId}
                  setAccountId={setAccountId}
                  status={accountStatus}
                  progress={accountProgress}
                  steps={accountSteps}
                  meta={accountMeta}
                  savedId={savedAccountId}
                  exampleId="745972b1-lf5a-3c2f-be6b-3c1a72778934"
                  onStart={startAccountCheck}
                  onReset={resetAccount}
                  onSaveDefault={saveAccountDefault}
                  onClearDefault={clearAccountDefault}
                />
              </div>

              <div
                className={cn(
                  "flex flex-col gap-4 transition-opacity duration-500 lg:flex-row lg:items-center lg:justify-between",
                  (!brokerApproved || !accountApproved) && "pointer-events-none select-none opacity-40 blur-[1px]",
                )}
              >

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "min-w-0 flex-1 rounded-xl border-2 border-dashed bg-black/30 p-4 transition lg:max-w-xl",
                  dragOver
                    ? "border-cyan-400 bg-cyan-500/5"
                    : "border-cyan-500/25 hover:border-cyan-400/60",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/30">
                      <ImageIcon className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
                        Adicionar Print
                      </div>
                      <h3 className="font-mono text-base font-bold text-cyan-100">
                        Envie o print do gráfico
                      </h3>
                      <p className="mt-0.5 text-[12px] leading-snug text-cyan-300/70">
                        <span className="sm:hidden">Toque em enviar e selecione a imagem.</span>
                        <span className="hidden sm:inline">
                          Cole com{" "}
                          <kbd className="rounded border border-cyan-500/30 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">Ctrl</kbd>
                          {" + "}
                          <kbd className="rounded border border-cyan-500/30 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">V</kbd>
                          , arraste ou clique para enviar.
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {chartPrint && (
                      <button
                        onClick={() => setChartPrint(null)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-red-300 hover:bg-red-500/20"
                      >
                        <X className="h-3.5 w-3.5" /> Remover
                      </button>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_30px_-10px_rgba(34,211,238,0.8)] transition hover:bg-cyan-400 sm:flex-none"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {chartPrint ? "Trocar" : "Enviar"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
                {chartPrint && (
                  <div className="relative mt-3 overflow-hidden rounded-lg border border-cyan-500/20 bg-black/40">
                    <img
                      src={chartPrint}
                      alt="Print do gráfico enviado"
                      className={cn(
                        "max-h-[260px] w-full object-contain transition-[filter] duration-300",
                        scanningPrint &&
                          "[filter:invert(1)_hue-rotate(170deg)_saturate(2.2)_contrast(1.35)_brightness(1.1)]",
                      )}
                    />
                    {scanningPrint && (
                      <div className="pointer-events-none absolute inset-0">
                        {/* tinted overlay */}
                        <div className="absolute inset-0 bg-cyan-400/10 mix-blend-screen" />
                        {/* grid */}
                        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,211,238,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.55)_1px,transparent_1px)] [background-size:20px_20px]" />
                        {/* horizontal scanline strip */}
                        <div
                          className="absolute inset-x-0 h-10 -translate-y-1/2 bg-gradient-to-b from-transparent via-cyan-300/40 to-transparent shadow-[0_0_30px_5px_rgba(34,211,238,0.55)]"
                          style={{ top: `${(Math.sin((scanProgress / 100) * Math.PI * 2) * 0.5 + 0.5) * 100}%` }}
                        />
                        {/* sharp scan line */}
                        <div
                          className="absolute inset-x-0 h-px bg-cyan-200 shadow-[0_0_12px_2px_rgba(165,243,252,0.9)]"
                          style={{ top: `${(Math.sin((scanProgress / 100) * Math.PI * 2) * 0.5 + 0.5) * 100}%` }}
                        />
                        {/* horizontal scanline texture */}
                        <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_1px,transparent_1px,transparent_3px)]" />
                        {/* corner brackets */}
                        <div className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-cyan-300/80" />
                        <div className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-cyan-300/80" />
                        <div className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-cyan-300/80" />
                        <div className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-cyan-300/80" />
                        {/* HUD */}
                        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200 ring-1 ring-cyan-400/40">
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                          Raio-X • Escaneando
                        </div>
                        <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-cyan-200 ring-1 ring-cyan-400/40">
                          {scanProgress.toString().padStart(3, "0")}%
                        </div>
                        {/* progress bar */}
                        <div className="absolute inset-x-2 bottom-2">
                          <div className="h-1 overflow-hidden rounded-full bg-cyan-500/20 ring-1 ring-cyan-400/30">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200 transition-[width] duration-100"
                              style={{ width: `${scanProgress}%` }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-cyan-300/80">
                            <span>analisando candles • volume • s/r</span>
                            <span>iara.neural</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 lg:flex lg:w-auto lg:flex-wrap lg:items-end">
                <Field label="Ativo" locked={selectsLocked} hint={!brokerApproved ? "Verifique a corretora" : "Envie o print primeiro"}>
                  <AssetPickerDialog
                    value={asset}
                    onChange={(v) => {
                      setAsset(v);
                      setTouchedSelect(true);
                    }}
                    disabled={running || selectsLocked}
                  />
                </Field>

                <Field label="Tempo" locked={selectsLocked}>
                  <select
                    value={tf.label}
                    onChange={(e) => {
                      setTf(TIMEFRAMES.find((t) => t.label === e.target.value) ?? TIMEFRAMES[1]);
                      setTouchedSelect(true);
                    }}
                    disabled={running || selectsLocked}
                    className={cn(
                      "w-full rounded-md border border-cyan-500/30 bg-black/40 px-3 py-2 font-mono text-sm text-cyan-200 outline-none focus:border-cyan-400 lg:w-28",
                      selectsLocked && "cursor-not-allowed",
                    )}
                  >
                    {TIMEFRAMES.map((t) => (
                      <option key={t.label}>{t.label}</option>
                    ))}
                  </select>
                </Field>
                {!running ? (
                  <SlideToHack
                    onUnlock={runIara}
                    locked={slideLocked}
                    lockedHint={
                      !brokerApproved ? "Verifique a URL da corretora" : !chartPrint ? "Envie o print" : "Selecione ativo e tempo"
                    }
                  />
                ) : (
                  <button
                    onClick={stop}
                    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md border border-red-500/50 bg-red-500/10 px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wider text-red-300 hover:bg-red-500/20 lg:col-span-1"
                  >
                    <Square className="h-4 w-4" /> Abortar
                  </button>
                )}
              </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="relative mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat icon={Wifi} label="Conexão" value={running || phase === "signal" ? "ESTÁVEL" : "—"} ok />
              <Stat icon={Radio} label="Latência" value={running ? `${rint(8, 22)}ms` : "—"} ok />
              <Stat icon={Activity} label={asset} value={price.toFixed(asset.includes("BTC") || asset.includes("US30") ? 2 : 4)} />
              <Stat icon={Cpu} label="Confiança" value={`${Math.round(confidence)}%`} ok={confidence > 70} />
            </div>

            {/* Progress */}
            <div className="relative mt-4">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-cyan-400/80">
                <span>{phaseLabel[phase]}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cyan-500/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-cyan-300 to-cyan-300 transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Terminal */}
        {revealStep >= 1 && (
          <div className="min-w-0 animate-fade-in lg:col-span-7">
            <Panel title="Terminal Iara" icon={Terminal}>
              <div
                ref={logRef}
                className="h-[320px] overflow-y-auto rounded-md bg-[#04070a] p-3 font-mono text-[11px] leading-relaxed sm:h-[440px] sm:p-4 sm:text-[12.5px]"
              >
                {logs.length === 0 && (
                  <div className="text-cyan-500/40">
                    $ inicializando núcleo Iara...
                  </div>
                )}
                {logs.map((l) => (
                  <div
                    key={l.id}
                    className={cn(
                      "whitespace-pre-wrap break-words",
                      l.tone === "ok" && "text-cyan-300",
                      l.tone === "info" && "text-cyan-400/80",
                      l.tone === "warn" && "text-amber-300",
                      l.tone === "crit" && "text-red-400",
                      l.tone === "data" && "text-cyan-300",
                    )}
                  >
                    {l.text}
                  </div>
                ))}
                {running && (
                  <div className="mt-1 inline-block h-3 w-2 animate-pulse bg-cyan-400" />
                )}
              </div>
            </Panel>
          </div>
        )}

        {/* Side: matrix + news */}
        {(revealStep >= 2 || revealStep >= 3) && (
          <div className="min-w-0 space-y-4 lg:col-span-5">
            {revealStep >= 2 && (
              <div className="animate-fade-in">
                <Panel title="Data Stream" icon={Globe}>
                  <div className="grid h-[160px] grid-cols-2 gap-2 overflow-hidden rounded-md bg-[#04070a] p-3 font-mono text-[10px] leading-[1.1] text-cyan-400/70 sm:h-[210px]">
                    <div className="min-w-0 space-y-0.5">
                      {(matrix.length ? matrix.slice(0, 12) : Array(12).fill("······ ······ ······")).map(
                        (row, i) => (
                          <div key={i} className="truncate">{row}</div>
                        ),
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5 text-cyan-300/60">
                      {(matrix.length ? matrix.slice(12, 24) : Array(12).fill("······ ······ ······")).map(
                        (row, i) => (
                          <div key={i} className="truncate">{row}</div>
                        ),
                      )}
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {revealStep >= 3 && (
              <div className="animate-fade-in">
                <Panel title="Notícias Interceptadas" icon={Newspaper}>
                  <ul className="space-y-2 font-mono text-[11px] sm:text-xs">
                    {NEWS_FEED.slice(0, 5).map((n, i) => (
                      <li
                        key={i}
                        className="flex min-w-0 items-start gap-2 rounded-md border border-cyan-500/10 bg-cyan-500/5 px-3 py-2 text-cyan-200/80"
                      >
                        <Lock className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400" />
                        <span className="min-w-0 truncate">{n}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
            )}
          </div>
        )}

        {/* Placeholder when no signal */}
        {!signal && revealStep === 0 && (
          <div className="min-w-0 lg:col-span-12">
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
              Nenhum sinal ativo. Inicie uma análise para que a Iara gere o próximo scalp.
            </div>
          </div>
        )}
      </div>

      {/* Signal modal */}
      {signal && (
        <SignalModal
          signal={signal}
          asset={asset}
          tf={tf.label}
          onClose={() => {
            // força recarregar a página /iara do zero
            window.location.reload();
          }}
        />
      )}
    </AppLayout>
  );
}

function SignalModal({
  signal,
  asset,
  tf,
  onClose,
}: {
  signal: {
    side: "BUY" | "SELL";
    entry: number;
    sl: number;
    tp: number;
    confidence: number;
    expiry: string;
  };
  asset: string;
  tf: string;
  onClose: () => void;
}) {
  const isBuy = signal.side === "BUY";
  const accent = isBuy ? "emerald" : "red";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestClose = () => setConfirmOpen(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(true);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: "rgba(2,6,10,0.7)" }}
      onClick={requestClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-3xl border bg-[#070b10] shadow-2xl",
          isBuy
            ? "border-cyan-500/40 shadow-[0_0_80px_-10px_rgba(34,211,238,0.6)]"
            : "border-red-500/40 shadow-[0_0_80px_-10px_rgba(239,68,68,0.6)]",
        )}
      >
        {/* Animated gradient accent */}
        <div
          className={cn(
            "absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl",
            isBuy ? "bg-cyan-500/30" : "bg-red-500/30",
          )}
        />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(34,211,238,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.6)_1px,transparent_1px)] [background-size:20px_20px]" />

        <button
          onClick={requestClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Confirmação ao fechar */}
        {confirmOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          >
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#0b1116] p-5 text-center shadow-2xl">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-400/40">
                <ShieldAlert className="h-5 w-5 text-amber-300" />
              </div>
              <h4 className="mt-3 font-mono text-base font-bold text-white">
                Fechar o sinal?
              </h4>
              <p className="mt-1 text-[12px] leading-snug text-white/60">
                Isso vai zerar a análise atual e recarregar a página. Você
                precisará rodar uma nova análise.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs uppercase tracking-wider text-white/80 hover:bg-white/[0.07]"
                >
                  Cancelar
                </button>
                <button
                  onClick={onClose}
                  className="rounded-md bg-red-500 px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-red-400"
                >
                  Sim, fechar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative p-6 sm:p-7">
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]",
              isBuy ? "text-cyan-300" : "text-red-300",
            )}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isBuy ? "bg-cyan-400" : "bg-red-400",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  isBuy ? "bg-cyan-500" : "bg-red-500",
                )}
              />
            </span>
            Sinal Iara Detectado
          </div>

          {/* Side big */}
          <div className="mt-5 text-center">
            <div
              className={cn(
                "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl",
                isBuy ? "bg-cyan-500/15 text-cyan-300" : "bg-red-500/15 text-red-300",
              )}
            >
              {isBuy ? (
                <TrendingUp className="h-8 w-8" />
              ) : (
                <TrendingDown className="h-8 w-8" />
              )}
            </div>
            <div className="mt-3 font-mono text-4xl font-black tracking-tight text-white sm:text-5xl">
              {signal.side}
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-white/80">{asset}</div>
            <div className="mt-1 text-xs text-white/40">
              {tf} · expira às {signal.expiry}
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span>Confiança</span>
              <span className={cn("font-bold", isBuy ? "text-cyan-300" : "text-red-300")}>
                {signal.confidence}%
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  "h-full rounded-full",
                  isBuy
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-300"
                    : "bg-gradient-to-r from-red-500 to-orange-300",
                )}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
          </div>

          {/* Levels */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <Level label="Entrada" value={signal.entry} tone="white" />
            <Level label="Stop Loss" value={signal.sl} tone="red" />
            <Level label="Take Profit" value={signal.tp} tone="green" />
          </div>

          {/* CTA */}
          <a
            href="https://forexoficial.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              const txt = `${signal.side} ${asset} @ ${signal.entry} | SL ${signal.sl} | TP ${signal.tp}`;
              navigator.clipboard?.writeText(txt).catch(() => {});
              toast.success("Sinal copiado", { description: "Abrindo corretora..." });
            }}
            className={cn(
              "group mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-black transition",
              isBuy
                ? "bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_30px_-5px_rgba(34,211,238,0.8)]"
                : "bg-red-400 hover:bg-red-300 shadow-[0_0_30px_-5px_rgba(239,68,68,0.8)]",
            )}
          >
            <Copy className="h-4 w-4" /> Copiar Sinal
            <ExternalLink className="h-3.5 w-3.5 opacity-60 transition group-hover:translate-x-0.5" />
          </a>

          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/40">
            <ShieldAlert className="h-3 w-3" /> Use gestão de risco — máx 1% por operação
          </div>
        </div>
      </div>
    </div>
  );
}

function Level({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "red" | "green";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-center">
      <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</div>
      <div
        className={cn(
          "mt-0.5 truncate font-mono text-sm font-bold sm:text-base",
          tone === "red" && "text-red-300",
          tone === "green" && "text-cyan-300",
          tone === "white" && "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  locked,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  locked?: boolean;
  hint?: string;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1 transition-opacity duration-300",
        locked && "pointer-events-none opacity-40",
      )}
      title={locked ? hint : undefined}
    >
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-400/80">
        {label}
        {locked && <Lock className="h-3 w-3 text-cyan-400/60" />}
      </span>
      {children}
    </label>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof Wifi;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-cyan-500/20 bg-black/30 px-2.5 py-2 sm:gap-3 sm:px-3">
      <Icon className={cn("h-4 w-4 shrink-0", ok ? "text-cyan-400" : "text-cyan-500/50")} />
      <div className="min-w-0">
        <div className="truncate font-mono text-[9px] uppercase tracking-widest text-cyan-400/70 sm:text-[10px]">
          {label}
        </div>
        <div className="truncate font-mono text-xs text-cyan-100 sm:text-sm">{value}</div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Terminal;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#070b10] p-4">
      <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400">
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      {children}
    </div>
  );
}

function SignalCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "red" | "green";
}) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/30 p-2 sm:p-3">
      <div className="truncate font-mono text-[9px] uppercase tracking-widest text-white/60 sm:text-[10px]">{label}</div>
      <div
        className={cn(
          "mt-1 truncate font-mono text-sm font-bold sm:text-lg",
          tone === "red" && "text-red-300",
          tone === "green" && "text-cyan-300",
          !tone && "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function rint(a: number, b: number) {
  return Math.floor(a + Math.random() * (b - a));
}
function pickNews(n: number) {
  const copy = [...NEWS_FEED].sort(() => Math.random() - 0.5);
  return copy.slice(0, n).map((s) => `[news] ${s}`);
}

function SlideToHack({
  onUnlock,
  locked = false,
  lockedHint,
}: {
  onUnlock: () => void;
  locked?: boolean;
  lockedHint?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const KNOB = 44;

  function maxX() {
    const w = trackRef.current?.clientWidth ?? 0;
    return Math.max(0, w - KNOB - 6);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (unlocked || locked) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    startOffsetRef.current = x;
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - startXRef.current;
    const next = Math.min(maxX(), Math.max(0, startOffsetRef.current + dx));
    setX(next);
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    const m = maxX();
    if (x >= m - 4) {
      setX(m);
      setUnlocked(true);
      setTimeout(() => onUnlock(), 180);
    } else {
      setX(0);
    }
  }

  const pct = (() => {
    const m = maxX();
    return m > 0 ? Math.min(1, x / m) : 0;
  })();

  return (
    <div
      className={cn(
        "col-span-2 transition-opacity duration-300 lg:col-span-1 lg:w-[260px]",
        locked && "pointer-events-none opacity-40",
      )}
      title={locked ? lockedHint : undefined}
    >
      <div
        ref={trackRef}
        className={cn(
          "relative h-12 select-none overflow-hidden rounded-full border border-cyan-500/40 bg-black/60 shadow-[0_0_30px_-10px_rgba(34,211,238,0.7)]",
        )}
      >
        {/* progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 transition-[width]"
          style={{
            width: `${x + KNOB / 2 + 3}px`,
            transition: dragging ? "none" : "width 200ms ease",
          }}
        />
        {/* label */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]"
          style={{ color: `rgba(255,255,255,${0.85 - pct * 0.7})` }}
        >
          {locked ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              {lockedHint ?? "Bloqueado"}
            </>
          ) : (
            <>
              <ChevronsRight className="mr-1 h-3.5 w-3.5 animate-pulse" />
              {unlocked ? "Desbloqueado" : "Arraste para hackear"}
            </>
          )}
        </div>
        {/* knob */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.9)] ring-2 ring-cyan-200/60 active:cursor-grabbing",
            unlocked && "bg-white",
          )}
          style={{
            left: `${3 + x}px`,
            transition: dragging ? "none" : "left 200ms ease",
            touchAction: "none",
          }}
        >
          {unlocked ? <Unlock className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
        </div>
      </div>
    </div>
  );
}
function BrokerUrlGate({
  url,
  setUrl,
  status,
  progress,
  steps,
  domain,
  allowedBrokers,
  savedUrl,
  onStart,
  onReset,
  onSaveDefault,
  onClearDefault,
}: {
  url: string;
  setUrl: (v: string) => void;
  status: "idle" | "checking" | "approved" | "rejected";
  progress: number;
  steps: { label: string; done: boolean; ok?: boolean }[];
  domain: string | null;
  allowedBrokers: string[];
  savedUrl: string | null;
  onStart: (raw: string) => void;
  onReset: () => void;
  onSaveDefault: () => void;
  onClearDefault: () => void;
}) {

  const checking = status === "checking";
  const approved = status === "approved";
  const rejected = status === "rejected";

  const borderClass = approved
    ? "border-cyan-400/60 shadow-[0_0_40px_-10px_rgba(34,211,238,0.7)]"
    : rejected
      ? "border-red-500/60 shadow-[0_0_40px_-10px_rgba(239,68,68,0.7)]"
      : checking
        ? "border-cyan-400/50 shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]"
        : "border-cyan-500/30";

  function trigger(value: string) {
    setUrl(value);
    if (value.trim().length >= 4) onStart(value);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 bg-black/40 p-4 transition-all",
        borderClass,
      )}
    >
      {/* scan line animation */}
      {checking && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 -top-px h-[2px] animate-[scan_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(34,211,238,.7)_1px,transparent_1px)] [background-size:100%_6px]"
            style={{ animation: "scan-grid 2s linear infinite" }}
          />
        </div>
      )}

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition",
              approved && "bg-cyan-500/15 ring-cyan-400/40",
              rejected && "bg-red-500/15 ring-red-400/40",
              checking && "bg-cyan-500/10 ring-cyan-400/40",
              status === "idle" && "bg-cyan-500/10 ring-cyan-400/30",
            )}
          >
            {approved ? (
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
            ) : rejected ? (
              <ShieldX className="h-5 w-5 text-red-300" />
            ) : checking ? (
              <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            ) : (
              <Link2 className="h-5 w-5 text-cyan-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
              URL da Corretora
            </div>
            <h3 className="font-mono text-base font-bold text-cyan-100">
              {approved
                ? "Corretora verificada"
                : rejected
                  ? "Corretora não autorizada"
                  : checking
                    ? "Verificando corretora…"
                    : "Cole a URL da sua corretora"}
            </h3>
            <p className="mt-0.5 text-[12px] leading-snug text-cyan-300/70">
              {status === "idle" &&
                "Iara aceita apenas corretoras regulamentadas e auditadas."}
              {checking && domain && (
                <span className="font-mono text-cyan-300/90">{domain}</span>
              )}
              {approved && domain && (
                <span className="font-mono text-cyan-300/90">
                  {domain} • licença ativa
                </span>
              )}
              {rejected && (
                <span className="text-red-300/90">
                  {domain ?? "URL inválida"} — operação bloqueada
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(approved || rejected) && (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-cyan-500/30 bg-black/40 px-3 py-2 font-mono text-xs uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/10"
            >
              <X className="h-3.5 w-3.5" /> Trocar URL
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-3">
        <input
          value={url}
          onChange={(e) => trigger(e.target.value)}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text");
            if (v) {
              e.preventDefault();
              trigger(v);
            }
          }}
          disabled={checking || approved}
          placeholder="https://app.suacorretora.com"
          spellCheck={false}
          className={cn(
            "w-full rounded-md border bg-black/60 px-3 py-2.5 font-mono text-sm text-cyan-100 outline-none transition placeholder:text-cyan-500/40",
            approved && "border-cyan-400/60",
            rejected && "border-red-500/60 text-red-200",
            checking && "border-cyan-400/60",
            status === "idle" && "border-cyan-500/30 focus:border-cyan-400",
          )}
        />
      </div>

      {approved && (
        <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300/80">
            {savedUrl && savedUrl === url ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                <span>URL padrão salva — usada em todas as operações</span>
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5 text-cyan-300" />
                <span>Salvar essa URL como padrão para próximas operações?</span>
              </>
            )}
          </div>
          {savedUrl && savedUrl === url ? (
            <button
              onClick={onClearDefault}
              className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-black/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/10"
            >
              <X className="h-3 w-3" /> Remover padrão
            </button>
          ) : (
            <button
              onClick={onSaveDefault}
              className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/50 bg-cyan-500/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan-100 hover:bg-cyan-500/25"
            >
              <ShieldCheck className="h-3 w-3" /> Salvar como padrão
            </button>
          )}
        </div>
      )}


      {(checking || approved || rejected) && (
        <div className="relative mt-3 space-y-2">
          <div className="h-1 overflow-hidden rounded-full bg-cyan-500/10">
            <div
              className={cn(
                "h-full transition-[width] duration-150",
                rejected
                  ? "bg-gradient-to-r from-red-600 to-red-400"
                  : "bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid gap-1 font-mono text-[11px] sm:grid-cols-2">
            {steps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 transition",
                  !s.done && "border-cyan-400/20 bg-cyan-500/5 text-cyan-300/80",
                  s.done && s.ok && "border-cyan-400/30 bg-cyan-500/5 text-cyan-200",
                  s.done && !s.ok && "border-red-500/40 bg-red-500/10 text-red-200",
                )}
              >
                {!s.done ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : s.ok ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <ShieldX className="h-3 w-3" />
                )}
                <span className="truncate">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rejected && (
        <div className="relative mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-[12.5px] leading-relaxed text-red-100">
          <div className="mb-1 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-red-300">
            <ShieldAlert className="h-3.5 w-3.5" /> Corretora não regulamentada
          </div>
          <p>
            A corretora <span className="font-mono">{domain ?? "informada"}</span> não consta na
            lista de parceiros autorizados pela Iara e não possui regulamentação verificável. Por
            segurança, a operação foi <strong>bloqueada</strong>.
          </p>
          <p className="mt-2">
            <strong>Troque a URL</strong> e informe o endereço de uma corretora autorizada para
            liberar o scalper neural.
          </p>

        </div>
      )}

      <style>{`
        @keyframes scan { 0% { transform: translateY(0); } 100% { transform: translateY(100%); } }
        @keyframes scan-grid { 0% { background-position: 0 0; } 100% { background-position: 0 12px; } }
      `}</style>
    </div>
  );
}

function AccountIdGate({
  accountId,
  setAccountId,
  status,
  progress,
  steps,
  meta,
  savedId,
  exampleId,
  onStart,
  onReset,
  onSaveDefault,
  onClearDefault,
}: {
  accountId: string;
  setAccountId: (v: string) => void;
  status: "idle" | "checking" | "approved" | "rejected";
  progress: number;
  steps: { label: string; done: boolean; ok?: boolean }[];
  meta: { masked: string; assets: number; latency: number; tier: string } | null;
  savedId: string | null;
  exampleId: string;
  onStart: (raw: string) => void;
  onReset: () => void;
  onSaveDefault: () => void;
  onClearDefault: () => void;
}) {
  const checking = status === "checking";
  const approved = status === "approved";
  const rejected = status === "rejected";

  const borderClass = approved
    ? "border-cyan-400/60 shadow-[0_0_40px_-10px_rgba(34,211,238,0.7)]"
    : rejected
      ? "border-red-500/60 shadow-[0_0_40px_-10px_rgba(239,68,68,0.7)]"
      : checking
        ? "border-cyan-400/50 shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)]"
        : "border-cyan-500/30";

  function trigger(value: string) {
    setAccountId(value);
    if (value.trim().length >= 12) onStart(value);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 bg-black/40 p-4 transition-all",
        borderClass,
      )}
    >
      {checking && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 -top-px h-[2px] animate-[scan_1.4s_linear_infinite] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(34,211,238,.7)_1px,transparent_1px)] [background-size:100%_6px]"
            style={{ animation: "scan-grid 2s linear infinite" }}
          />
        </div>
      )}

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition",
              approved && "bg-cyan-500/15 ring-cyan-400/40",
              rejected && "bg-red-500/15 ring-red-400/40",
              checking && "bg-cyan-500/10 ring-cyan-400/40",
              status === "idle" && "bg-cyan-500/10 ring-cyan-400/30",
            )}
          >
            {approved ? (
              <Unlock className="h-5 w-5 text-cyan-300" />
            ) : rejected ? (
              <ShieldX className="h-5 w-5 text-red-300" />
            ) : checking ? (
              <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            ) : (
              <Cpu className="h-5 w-5 text-cyan-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400">
              ID da Conta
            </div>
            <h3 className="font-mono text-base font-bold text-cyan-100">
              {approved
                ? "Conta autenticada"
                : rejected
                  ? "ID da conta inválido"
                  : checking
                    ? "Autenticando ID da conta…"
                    : "Cole o ID da sua conta na corretora"}
            </h3>
            <p className="mt-0.5 text-[12px] leading-snug text-cyan-300/70">
              {status === "idle" &&
                "A Iara precisa do ID da sua conta para puxar os dados dos ativos em tempo real diretamente da sua corretora."}
              {checking && (
                <span className="font-mono text-cyan-300/90">
                  sincronizando feed em tempo real…
                </span>
              )}
              {approved && meta && (
                <span className="font-mono text-cyan-300/90">
                  {meta.masked} • {meta.assets} ativos • {meta.latency}ms • {meta.tier}
                </span>
              )}
              {rejected && (
                <span className="text-red-300/90">
                  formato não reconhecido — confira o ID e tente novamente
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {(approved || rejected) && (
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-cyan-500/30 bg-black/40 px-3 py-2 font-mono text-xs uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/10"
            >
              <X className="h-3.5 w-3.5" /> Trocar ID
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-3">
        <input
          value={accountId}
          onChange={(e) => trigger(e.target.value)}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text");
            if (v) {
              e.preventDefault();
              trigger(v);
            }
          }}
          disabled={checking || approved}
          placeholder={`ex: ${exampleId}`}
          spellCheck={false}
          className={cn(
            "w-full rounded-md border bg-black/60 px-3 py-2.5 font-mono text-sm tracking-wider text-cyan-100 outline-none transition placeholder:text-cyan-500/40",
            approved && "border-cyan-400/60",
            rejected && "border-red-500/60 text-red-200",
            checking && "border-cyan-400/60",
            status === "idle" && "border-cyan-500/30 focus:border-cyan-400",
          )}
        />
        {status === "idle" && (
          <button
            type="button"
            onClick={() => trigger(exampleId)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-black/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan-300/90 hover:bg-cyan-500/10"
          >
            <Copy className="h-3 w-3" /> Usar ID de exemplo
          </button>
        )}
      </div>

      {approved && (
        <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300/80">
            {savedId && savedId === accountId ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                <span>ID padrão salvo — usado em todas as operações</span>
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5 text-cyan-300" />
                <span>Salvar esse ID como padrão para próximas operações?</span>
              </>
            )}
          </div>
          {savedId && savedId === accountId ? (
            <button
              onClick={onClearDefault}
              className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-black/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/10"
            >
              <X className="h-3 w-3" /> Remover padrão
            </button>
          ) : (
            <button
              onClick={onSaveDefault}
              className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/50 bg-cyan-500/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan-100 hover:bg-cyan-500/25"
            >
              <ShieldCheck className="h-3 w-3" /> Salvar como padrão
            </button>
          )}
        </div>
      )}

      {(checking || approved || rejected) && (
        <div className="relative mt-3 space-y-2">
          <div className="h-1 overflow-hidden rounded-full bg-cyan-500/10">
            <div
              className={cn(
                "h-full transition-[width] duration-150",
                rejected
                  ? "bg-gradient-to-r from-red-600 to-red-400"
                  : "bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid gap-1 font-mono text-[11px] sm:grid-cols-2">
            {steps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 transition",
                  !s.done && "border-cyan-400/20 bg-cyan-500/5 text-cyan-300/80",
                  s.done && s.ok && "border-cyan-400/30 bg-cyan-500/5 text-cyan-200",
                  s.done && !s.ok && "border-red-500/40 bg-red-500/10 text-red-200",
                )}
              >
                {!s.done ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : s.ok ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <ShieldX className="h-3 w-3" />
                )}
                <span className="truncate">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved && meta && (
        <div className="relative mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
          <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/70">Ativos</div>
            <div className="text-cyan-100">{meta.assets}</div>
          </div>
          <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/70">Latência</div>
            <div className="text-cyan-100">{meta.latency} ms</div>
          </div>
          <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1.5">
            <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-400/70">Feed</div>
            <div className="text-cyan-100">{meta.tier}</div>
          </div>
        </div>
      )}

      {rejected && (
        <div className="relative mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-[12.5px] leading-relaxed text-red-100">
          <div className="mb-1 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-red-300">
            <ShieldAlert className="h-3.5 w-3.5" /> ID não reconhecido
          </div>
          <p>
            O ID informado não está no formato esperado pela API da corretora. Copie o ID da
            sua conta dentro da corretora (geralmente em <span className="font-mono">Perfil → Conta → ID</span>)
            e cole novamente.
          </p>
        </div>
      )}
    </div>
  );
}



function AssetIcon({ item, size = 28 }: { item: AssetItem; size?: number }) {
  const [err, setErr] = useState(false);
  if (item.flags) {
    return (
      <div className="relative shrink-0" style={{ width: size + 8, height: size }}>
        <img
          src={item.flags[0]}
          alt=""
          className="absolute left-0 top-0 rounded-full object-cover ring-1 ring-black/60"
          style={{ width: size, height: size }}
        />
        <img
          src={item.flags[1]}
          alt=""
          className="absolute right-0 top-0 rounded-full object-cover ring-1 ring-black/60"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }
  if (item.logo && !err) {
    return (
      <img
        src={item.logo}
        alt=""
        onError={() => setErr(true)}
        className="shrink-0 rounded-full bg-black/40 object-contain p-0.5 ring-1 ring-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-black"
      style={{ width: size, height: size, background: item.color ?? "#10b981" }}
    >
      {item.code.slice(0, 2)}
    </div>
  );
}

function AssetPickerDialog({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"Todos" | AssetCategory>("Todos");
  const current = findAsset(value);

  const filtered = ASSET_CATALOG.filter((a) => {
    if (tab !== "Todos" && a.category !== tab) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.symbol.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
    );
  });

  const grouped: Record<AssetCategory, AssetItem[]> = {
    Forex: [],
    Cripto: [],
    "Ações": [],
  };
  filtered.forEach((a) => grouped[a.category].push(a));

  const tabs: ("Todos" | AssetCategory)[] = ["Todos", "Forex", "Cripto", "Ações"];

  return (
    <Dialog open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-cyan-500/30 bg-black/40 px-2.5 py-2 text-left font-mono text-sm text-cyan-200 outline-none transition hover:border-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-60 lg:w-56",
          )}
        >
          <AssetIcon item={current} size={22} />
          <span className="min-w-0 flex-1 truncate text-[12.5px]">{current.symbol}</span>
          <span className="shrink-0 rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300 ring-1 ring-cyan-400/30">
            +{current.payout}%
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-cyan-300/70" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-md gap-0 overflow-hidden border-cyan-500/30 bg-[#0a0f14] p-0 text-cyan-100 shadow-[0_0_60px_-15px_rgba(34,211,238,0.5)]">
        <DialogHeader className="border-b border-cyan-500/15 px-4 py-3">
          <DialogTitle className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-400">
            Selecionar ativo
          </DialogTitle>
        </DialogHeader>

        <div className="border-b border-cyan-500/10 bg-black/40 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/60" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ativo, ticker ou nome…"
              className="w-full rounded-md border border-cyan-500/20 bg-black/60 py-2 pl-8 pr-3 font-mono text-sm text-cyan-100 outline-none placeholder:text-cyan-500/40 focus:border-cyan-400"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition",
                  tab === t
                    ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                    : "border-cyan-500/15 text-cyan-400/70 hover:border-cyan-500/40 hover:text-cyan-200",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {(Object.keys(grouped) as AssetCategory[]).map((cat) => {
            const items = grouped[cat];
            if (!items.length) return null;
            return (
              <div key={cat} className="border-b border-cyan-500/10 last:border-0">
                <div className="sticky top-0 z-10 bg-[#0a0f14]/95 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 backdrop-blur">
                  {cat}
                </div>
                <div>
                  {items.map((a) => {
                    const active = a.symbol === value;
                    return (
                      <button
                        key={a.symbol}
                        onClick={() => {
                          onChange(a.symbol);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-cyan-500/10",
                          active && "bg-cyan-500/15",
                        )}
                      >
                        <AssetIcon item={a} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-mono text-sm font-semibold text-cyan-100">
                            {a.symbol}
                          </div>
                          <div className="truncate font-mono text-[10px] uppercase tracking-wider text-cyan-400/60">
                            {a.code}
                          </div>
                        </div>
                        <div className="shrink-0 font-mono text-sm font-bold text-cyan-300">
                          +{a.payout}%
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center font-mono text-xs text-cyan-400/60">
              Nenhum ativo encontrado para "{query}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

