import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AppLayout } from "@/components/app-layout";
import { JarvisVoice, type JarvisStep } from "@/components/jarvis-voice";
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
  Clock,
  Check,
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
} from "@/lib/jarvis-sounds";




export const Route = createFileRoute("/jarvis")({
  component: JARVISPage,
});

type AssetCategory =
  | "Opções (OTC)"
  | "Forex"
  | "Ações"
  | "Cripto"
  | "Commodities"
  | "ETFs"
  | "Índices";

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
  // --- Opções (OTC) ---
  { symbol: "EUR/USD (OTC)", code: "EUR-USD-OTC", name: "Euro / US Dollar OTC", category: "Opções (OTC)", payout: 93, flags: [flag("eu"), flag("us")] },
  { symbol: "GBP/USD (OTC)", code: "GBP-USD-OTC", name: "British Pound / US Dollar OTC", category: "Opções (OTC)", payout: 92, flags: [flag("gb"), flag("us")] },
  { symbol: "USD/JPY (OTC)", code: "USD-JPY-OTC", name: "US Dollar / Yen OTC", category: "Opções (OTC)", payout: 91, flags: [flag("us"), flag("jp")] },
  { symbol: "AUD/USD (OTC)", code: "AUD-USD-OTC", name: "Australian Dollar / US Dollar OTC", category: "Opções (OTC)", payout: 90, flags: [flag("au"), flag("us")] },
  { symbol: "EUR/GBP (OTC)", code: "EUR-GBP-OTC", name: "Euro / British Pound OTC", category: "Opções (OTC)", payout: 89, flags: [flag("eu"), flag("gb")] },
  { symbol: "USD/CAD (OTC)", code: "USD-CAD-OTC", name: "US Dollar / Canadian Dollar OTC", category: "Opções (OTC)", payout: 89, flags: [flag("us"), flag("ca")] },
  { symbol: "EUR/JPY (OTC)", code: "EUR-JPY-OTC", name: "Euro / Japanese Yen OTC", category: "Opções (OTC)", payout: 90, flags: [flag("eu"), flag("jp")] },
  { symbol: "GBP/JPY (OTC)", code: "GBP-JPY-OTC", name: "British Pound / Yen OTC", category: "Opções (OTC)", payout: 91, flags: [flag("gb"), flag("jp")] },
  { symbol: "USD/CHF (OTC)", code: "USD-CHF-OTC", name: "US Dollar / Swiss Franc OTC", category: "Opções (OTC)", payout: 91, flags: [flag("us"), flag("ch")] },
  { symbol: "EUR/CHF (OTC)", code: "EUR-CHF-OTC", name: "Euro / Swiss Franc OTC", category: "Opções (OTC)", payout: 88, flags: [flag("eu"), flag("ch")] },
  { symbol: "AUD/JPY (OTC)", code: "AUD-JPY-OTC", name: "Australian Dollar / Yen OTC", category: "Opções (OTC)", payout: 89, flags: [flag("au"), flag("jp")] },
  { symbol: "NZD/USD (OTC)", code: "NZD-USD-OTC", name: "NZ Dollar / US Dollar OTC", category: "Opções (OTC)", payout: 88, flags: [flag("nz"), flag("us")] },
  { symbol: "CAD/CHF (OTC)", code: "CAD-CHF-OTC", name: "Canadian Dollar / Swiss Franc OTC", category: "Opções (OTC)", payout: 87, flags: [flag("ca"), flag("ch")] },
  { symbol: "EUR/AUD (OTC)", code: "EUR-AUD-OTC", name: "Euro / Australian Dollar OTC", category: "Opções (OTC)", payout: 88, flags: [flag("eu"), flag("au")] },
  { symbol: "USD/BRL (OTC)", code: "USD-BRL-OTC", name: "US Dollar / Real Brasileiro OTC", category: "Opções (OTC)", payout: 95, flags: [flag("us"), flag("br")] },
  { symbol: "USD/INR (OTC)", code: "USD-INR-OTC", name: "US Dollar / Indian Rupee OTC", category: "Opções (OTC)", payout: 92, flags: [flag("us"), flag("in")] },
  { symbol: "USD/MXN (OTC)", code: "USD-MXN-OTC", name: "US Dollar / Peso Mexicano OTC", category: "Opções (OTC)", payout: 90, flags: [flag("us"), flag("mx")] },
  { symbol: "USD/TRY (OTC)", code: "USD-TRY-OTC", name: "US Dollar / Lira Turca OTC", category: "Opções (OTC)", payout: 94, flags: [flag("us"), flag("tr")] },
  { symbol: "USD/ARS (OTC)", code: "USD-ARS-OTC", name: "US Dollar / Peso Argentino OTC", category: "Opções (OTC)", payout: 96, flags: [flag("us"), flag("ar")] },
  { symbol: "Apple Inc. (OTC)", code: "AAPL-OTC", name: "Apple Inc. OTC", category: "Opções (OTC)", payout: 89, logo: clearbit("apple.com"), color: "#ffffff" },
  { symbol: "Microsoft (OTC)", code: "MSFT-OTC", name: "Microsoft Corp. OTC", category: "Opções (OTC)", payout: 89, logo: clearbit("microsoft.com"), color: "#00a4ef" },
  { symbol: "Tesla (OTC)", code: "TSLA-OTC", name: "Tesla Inc. OTC", category: "Opções (OTC)", payout: 92, logo: clearbit("tesla.com"), color: "#e82127" },
  { symbol: "Amazon (OTC)", code: "AMZN-OTC", name: "Amazon.com OTC", category: "Opções (OTC)", payout: 89, logo: clearbit("amazon.com"), color: "#ff9900" },
  { symbol: "Google (OTC)", code: "GOOGL-OTC", name: "Alphabet Inc. OTC", category: "Opções (OTC)", payout: 88, logo: clearbit("google.com"), color: "#4285f4" },
  { symbol: "Meta (OTC)", code: "META-OTC", name: "Meta Platforms OTC", category: "Opções (OTC)", payout: 90, logo: clearbit("meta.com"), color: "#0081fb" },
  { symbol: "Nvidia (OTC)", code: "NVDA-OTC", name: "Nvidia Corp. OTC", category: "Opções (OTC)", payout: 93, logo: clearbit("nvidia.com"), color: "#76b900" },
  { symbol: "Gold (OTC)", code: "XAU-USD-OTC", name: "Gold / Ouro OTC", category: "Opções (OTC)", payout: 92, color: "#ffd700" },
  { symbol: "Silver (OTC)", code: "XAG-USD-OTC", name: "Silver / Prata OTC", category: "Opções (OTC)", payout: 88, color: "#c0c0c0" },
  { symbol: "Bitcoin (OTC)", code: "BTC-OTC", name: "Bitcoin OTC", category: "Opções (OTC)", payout: 94, logo: crypto("btc"), color: "#f7931a" },
  { symbol: "Ethereum (OTC)", code: "ETH-OTC", name: "Ethereum OTC", category: "Opções (OTC)", payout: 91, logo: crypto("eth"), color: "#627eea" },

  // --- Forex ---
  { symbol: "EUR/USD", code: "EUR-USD", name: "Euro / US Dollar", category: "Forex", payout: 87, flags: [flag("eu"), flag("us")] },
  { symbol: "GBP/USD", code: "GBP-USD", name: "British Pound / US Dollar", category: "Forex", payout: 86, flags: [flag("gb"), flag("us")] },
  { symbol: "USD/JPY", code: "USD-JPY", name: "US Dollar / Japanese Yen", category: "Forex", payout: 85, flags: [flag("us"), flag("jp")] },
  { symbol: "AUD/USD", code: "AUD-USD", name: "Australian Dollar / US Dollar", category: "Forex", payout: 84, flags: [flag("au"), flag("us")] },
  { symbol: "USD/CAD", code: "USD-CAD", name: "US Dollar / Canadian Dollar", category: "Forex", payout: 83, flags: [flag("us"), flag("ca")] },
  { symbol: "USD/CHF", code: "USD-CHF", name: "US Dollar / Swiss Franc", category: "Forex", payout: 84, flags: [flag("us"), flag("ch")] },
  { symbol: "EUR/GBP", code: "EUR-GBP", name: "Euro / British Pound", category: "Forex", payout: 82, flags: [flag("eu"), flag("gb")] },
  { symbol: "EUR/JPY", code: "EUR-JPY", name: "Euro / Japanese Yen", category: "Forex", payout: 85, flags: [flag("eu"), flag("jp")] },
  { symbol: "GBP/JPY", code: "GBP-JPY", name: "British Pound / Japanese Yen", category: "Forex", payout: 87, flags: [flag("gb"), flag("jp")] },
  { symbol: "EUR/CHF", code: "EUR-CHF", name: "Euro / Swiss Franc", category: "Forex", payout: 82, flags: [flag("eu"), flag("ch")] },
  { symbol: "AUD/JPY", code: "AUD-JPY", name: "Australian Dollar / Japanese Yen", category: "Forex", payout: 83, flags: [flag("au"), flag("jp")] },
  { symbol: "NZD/USD", code: "NZD-USD", name: "New Zealand Dollar / US Dollar", category: "Forex", payout: 82, flags: [flag("nz"), flag("us")] },
  { symbol: "CAD/JPY", code: "CAD-JPY", name: "Canadian Dollar / Japanese Yen", category: "Forex", payout: 81, flags: [flag("ca"), flag("jp")] },
  { symbol: "CHF/JPY", code: "CHF-JPY", name: "Swiss Franc / Japanese Yen", category: "Forex", payout: 82, flags: [flag("ch"), flag("jp")] },
  { symbol: "EUR/CAD", code: "EUR-CAD", name: "Euro / Canadian Dollar", category: "Forex", payout: 83, flags: [flag("eu"), flag("ca")] },
  { symbol: "EUR/AUD", code: "EUR-AUD", name: "Euro / Australian Dollar", category: "Forex", payout: 82, flags: [flag("eu"), flag("au")] },
  { symbol: "GBP/CAD", code: "GBP-CAD", name: "British Pound / Canadian Dollar", category: "Forex", payout: 84, flags: [flag("gb"), flag("ca")] },
  { symbol: "GBP/CHF", code: "GBP-CHF", name: "British Pound / Swiss Franc", category: "Forex", payout: 83, flags: [flag("gb"), flag("ch")] },
  { symbol: "GBP/AUD", code: "GBP-AUD", name: "British Pound / Australian Dollar", category: "Forex", payout: 83, flags: [flag("gb"), flag("au")] },
  { symbol: "AUD/CAD", code: "AUD-CAD", name: "Australian Dollar / Canadian Dollar", category: "Forex", payout: 80, flags: [flag("au"), flag("ca")] },
  { symbol: "AUD/CHF", code: "AUD-CHF", name: "Australian Dollar / Swiss Franc", category: "Forex", payout: 80, flags: [flag("au"), flag("ch")] },
  { symbol: "AUD/NZD", code: "AUD-NZD", name: "Australian Dollar / NZ Dollar", category: "Forex", payout: 81, flags: [flag("au"), flag("nz")] },
  { symbol: "NZD/JPY", code: "NZD-JPY", name: "New Zealand Dollar / Yen", category: "Forex", payout: 81, flags: [flag("nz"), flag("jp")] },
  { symbol: "USD/BRL", code: "USD-BRL", name: "US Dollar / Real Brasileiro", category: "Forex", payout: 88, flags: [flag("us"), flag("br")] },
  { symbol: "USD/MXN", code: "USD-MXN", name: "US Dollar / Peso Mexicano", category: "Forex", payout: 84, flags: [flag("us"), flag("mx")] },

  // --- Ações ---
  { symbol: "Apple Inc.", code: "AAPL", name: "Apple Inc.", category: "Ações", payout: 85, logo: clearbit("apple.com"), color: "#ffffff" },
  { symbol: "Microsoft Corp.", code: "MSFT", name: "Microsoft Corp.", category: "Ações", payout: 85, logo: clearbit("microsoft.com"), color: "#00a4ef" },
  { symbol: "Amazon.com", code: "AMZN", name: "Amazon.com Inc.", category: "Ações", payout: 86, logo: clearbit("amazon.com"), color: "#ff9900" },
  { symbol: "Tesla Inc.", code: "TSLA", name: "Tesla Inc.", category: "Ações", payout: 88, logo: clearbit("tesla.com"), color: "#e82127" },
  { symbol: "Alphabet Google", code: "GOOGL", name: "Alphabet Inc.", category: "Ações", payout: 84, logo: clearbit("google.com"), color: "#4285f4" },
  { symbol: "Meta Platforms", code: "META", name: "Meta Platforms Inc.", category: "Ações", payout: 87, logo: clearbit("meta.com"), color: "#0081fb" },
  { symbol: "NVIDIA Corp.", code: "NVDA", name: "Nvidia Corporation", category: "Ações", payout: 90, logo: clearbit("nvidia.com"), color: "#76b900" },
  { symbol: "Netflix Inc.", code: "NFLX", name: "Netflix Inc.", category: "Ações", payout: 86, logo: clearbit("netflix.com"), color: "#e50914" },
  { symbol: "AMD", code: "AMD", name: "Advanced Micro Devices", category: "Ações", payout: 86, logo: clearbit("amd.com"), color: "#ed1c24" },
  { symbol: "Intel Corp.", code: "INTC", name: "Intel Corporation", category: "Ações", payout: 83, logo: clearbit("intel.com"), color: "#0071c5" },
  { symbol: "Coca-Cola Co.", code: "KO", name: "The Coca-Cola Company", category: "Ações", payout: 82, logo: clearbit("coca-cola.com"), color: "#f40009" },
  { symbol: "PepsiCo Inc.", code: "PEP", name: "PepsiCo Inc.", category: "Ações", payout: 81, logo: clearbit("pepsico.com"), color: "#00529b" },
  { symbol: "McDonald's", code: "MCD", name: "McDonald's Corp.", category: "Ações", payout: 82, logo: clearbit("mcdonalds.com"), color: "#ffbc0d" },
  { symbol: "Nike Inc.", code: "NKE", name: "Nike Inc.", category: "Ações", payout: 83, logo: clearbit("nike.com"), color: "#111111" },
  { symbol: "Walt Disney", code: "DIS", name: "The Walt Disney Company", category: "Ações", payout: 83, logo: clearbit("disney.com"), color: "#113ccf" },
  { symbol: "Boeing Co.", code: "BA", name: "The Boeing Company", category: "Ações", payout: 84, logo: clearbit("boeing.com"), color: "#0033a0" },
  { symbol: "Pfizer Inc.", code: "PFE", name: "Pfizer Inc.", category: "Ações", payout: 81, logo: clearbit("pfizer.com"), color: "#0000ff" },
  { symbol: "Walmart Inc.", code: "WMT", name: "Walmart Inc.", category: "Ações", payout: 82, logo: clearbit("walmart.com"), color: "#0071ce" },
  { symbol: "Visa Inc.", code: "V", name: "Visa Inc.", category: "Ações", payout: 83, logo: clearbit("visa.com"), color: "#1a1f71" },
  { symbol: "Mastercard", code: "MA", name: "Mastercard Inc.", category: "Ações", payout: 83, logo: clearbit("mastercard.com"), color: "#ff5f00" },
  { symbol: "Coinbase Global", code: "COIN", name: "Coinbase Global Inc.", category: "Ações", payout: 89, logo: clearbit("coinbase.com"), color: "#0052ff" },
  { symbol: "MicroStrategy", code: "MSTR", name: "MicroStrategy Inc.", category: "Ações", payout: 91, logo: clearbit("microstrategy.com"), color: "#d9232a" },
  { symbol: "Alibaba Group", code: "BABA", name: "Alibaba Group", category: "Ações", payout: 84, logo: clearbit("alibaba.com"), color: "#ff6a00" },
  { symbol: "Palantir Tech", code: "PLTR", name: "Palantir Technologies", category: "Ações", payout: 88, logo: clearbit("palantir.com"), color: "#101010" },

  // --- Cripto ---
  { symbol: "Bitcoin", code: "BTC-USDT", name: "Bitcoin / Tether", category: "Cripto", payout: 89, logo: crypto("btc"), color: "#f7931a" },
  { symbol: "Ethereum", code: "ETH-USDT", name: "Ethereum / Tether", category: "Cripto", payout: 89, logo: crypto("eth"), color: "#627eea" },
  { symbol: "Solana", code: "SOL-USDT", name: "Solana / Tether", category: "Cripto", payout: 89, logo: crypto("sol"), color: "#14f195" },
  { symbol: "BNB", code: "BNB-USDT", name: "Binance Coin", category: "Cripto", payout: 88, logo: crypto("bnb"), color: "#f3ba2f" },
  { symbol: "Ripple (XRP)", code: "XRP-USDT", name: "XRP / Tether", category: "Cripto", payout: 87, logo: crypto("xrp"), color: "#23292f" },
  { symbol: "Cardano", code: "ADA-USDT", name: "Cardano / Tether", category: "Cripto", payout: 86, logo: crypto("ada"), color: "#0033ad" },
  { symbol: "Dogecoin", code: "DOGE-USDT", name: "Dogecoin / Tether", category: "Cripto", payout: 88, logo: crypto("doge"), color: "#c2a633" },
  { symbol: "Avalanche", code: "AVAX-USDT", name: "Avalanche", category: "Cripto", payout: 87, logo: crypto("avax"), color: "#e84142" },
  { symbol: "Shiba Inu", code: "SHIB-USDT", name: "Shiba Inu", category: "Cripto", payout: 86, logo: crypto("shib"), color: "#ffa409" },
  { symbol: "Polkadot", code: "DOT-USDT", name: "Polkadot", category: "Cripto", payout: 86, logo: crypto("dot"), color: "#e6007a" },
  { symbol: "Polygon", code: "MATIC-USDT", name: "Polygon / MATIC", category: "Cripto", payout: 86, logo: crypto("matic"), color: "#8247e5" },
  { symbol: "Chainlink", code: "LINK-USDT", name: "Chainlink", category: "Cripto", payout: 86, logo: crypto("link"), color: "#375bd2" },
  { symbol: "Uniswap", code: "UNI-USDT", name: "Uniswap", category: "Cripto", payout: 85, logo: crypto("uni"), color: "#ff007a" },
  { symbol: "Litecoin", code: "LTC-USDT", name: "Litecoin", category: "Cripto", payout: 85, logo: crypto("ltc"), color: "#345d9d" },
  { symbol: "NEAR Protocol", code: "NEAR-USDT", name: "NEAR Protocol", category: "Cripto", payout: 86, logo: crypto("near"), color: "#000000" },
  { symbol: "Sui Network", code: "SUI-USDT", name: "Sui Network", category: "Cripto", payout: 88, logo: crypto("sui"), color: "#4fa8f6" },
  { symbol: "Aptos", code: "APT-USDT", name: "Aptos", category: "Cripto", payout: 86, logo: crypto("apt"), color: "#222222" },
  { symbol: "Toncoin", code: "TON-USDT", name: "Toncoin", category: "Cripto", payout: 87, logo: crypto("ton"), color: "#0088cc" },

  // --- Commodities ---
  { symbol: "Gold (XAU/USD)", code: "XAU-USD", name: "Ouro Spot / US Dollar", category: "Commodities", payout: 89, color: "#ffd700" },
  { symbol: "Silver (XAG/USD)", code: "XAG-USD", name: "Prata Spot / US Dollar", category: "Commodities", payout: 86, color: "#c0c0c0" },
  { symbol: "Crude Oil Brent", code: "BRENT", name: "Petróleo Brent Crude", category: "Commodities", payout: 87, color: "#222222" },
  { symbol: "WTI Crude Oil", code: "WTI", name: "Petróleo WTI Crude", category: "Commodities", payout: 86, color: "#333333" },
  { symbol: "Natural Gas", code: "NGAS", name: "Gás Natural Spot", category: "Commodities", payout: 84, color: "#00a8ff" },
  { symbol: "Copper", code: "COPPER", name: "Cobre Spot", category: "Commodities", payout: 83, color: "#b87333" },
  { symbol: "Platinum", code: "XPT-USD", name: "Platina Spot", category: "Commodities", payout: 82, color: "#e5e4e2" },

  // --- ETFs ---
  { symbol: "SPDR S&P 500 (SPY)", code: "SPY", name: "SPDR S&P 500 ETF Trust", category: "ETFs", payout: 85, logo: clearbit("ssga.com"), color: "#003366" },
  { symbol: "Invesco QQQ", code: "QQQ", name: "Invesco QQQ Trust Nasdaq", category: "ETFs", payout: 86, logo: clearbit("invesco.com"), color: "#004b87" },
  { symbol: "iShares MSCI Brazil (EWZ)", code: "EWZ", name: "iShares MSCI Brazil ETF", category: "ETFs", payout: 87, logo: clearbit("blackrock.com"), color: "#009c3b" },
  { symbol: "Vanguard Total Stock (VTI)", code: "VTI", name: "Vanguard Total Stock Market", category: "ETFs", payout: 84, logo: clearbit("vanguard.com"), color: "#96151d" },
  { symbol: "iShares Russell 2000 (IWM)", code: "IWM", name: "iShares Russell 2000 ETF", category: "ETFs", payout: 84, logo: clearbit("blackrock.com"), color: "#000000" },
  { symbol: "ARK Innovation (ARKK)", code: "ARKK", name: "ARK Innovation ETF", category: "ETFs", payout: 87, logo: clearbit("ark-invest.com"), color: "#22a6b3" },
  { symbol: "Semiconductor ETF (SMH)", code: "SMH", name: "VanEck Semiconductor ETF", category: "ETFs", payout: 88, logo: clearbit("vaneck.com"), color: "#005a9c" },

  // --- Índices ---
  { symbol: "S&P 500 (SPX500)", code: "SPX500", name: "S&P 500 Index", category: "Índices", payout: 88, color: "#003366" },
  { symbol: "Nasdaq 100 (NAS100)", code: "NAS100", name: "Nasdaq 100 Index", category: "Índices", payout: 89, color: "#004b87" },
  { symbol: "Dow Jones (US30)", code: "US30", name: "Dow Jones Industrial Average", category: "Índices", payout: 87, color: "#1e3799" },
  { symbol: "Germany DAX 40", code: "GER40", name: "Germany DAX 40 Index", category: "Índices", payout: 86, color: "#dd0000" },
  { symbol: "UK FTSE 100", code: "UK100", name: "UK FTSE 100 Index", category: "Índices", payout: 85, color: "#00247d" },
  { symbol: "Nikkei 225", code: "JPN225", name: "Japan Nikkei 225 Index", category: "Índices", payout: 86, color: "#bc002d" },
  { symbol: "Brazil Bovespa (IBOV)", code: "IBOV", name: "Índice Bovespa B3", category: "Índices", payout: 88, color: "#009c3b" },
];

const ASSETS = ASSET_CATALOG.map((a) => a.symbol);
const findAsset = (sym: string) => ASSET_CATALOG.find((a) => a.symbol === sym) ?? ASSET_CATALOG[0];


type Timeframe = { label: string; seconds: number; desc: string };

const TIMEFRAMES: Timeframe[] = [
  { label: "M1", seconds: 60, desc: "Scalping ultra-rápido" },
  { label: "M5", seconds: 300, desc: "Day trade padrão" },
  { label: "M15", seconds: 900, desc: "Swing intradiário" },
  { label: "M30", seconds: 1800, desc: "Tendência curta" },
  { label: "H1", seconds: 3600, desc: "Posicional 1h" },
];

function TimeframePicker({
  value,
  onChange,
  disabled,
  locked,
}: {
  value: Timeframe;
  onChange: (t: Timeframe) => void;
  disabled?: boolean;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative w-full lg:w-36">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex w-full items-center justify-between gap-2 rounded-md border border-cyan-500/40 bg-gradient-to-b from-black/70 to-cyan-950/30 px-3 py-2 font-mono text-sm text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.05),0_0_20px_-8px_rgba(34,211,238,0.6)_inset] outline-none transition-all hover:border-cyan-400/70 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_0_24px_-6px_rgba(34,211,238,0.8)_inset] focus:border-cyan-300",
          open && "border-cyan-300 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_28px_-4px_rgba(34,211,238,1)_inset]",
          (disabled || locked) && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-cyan-300" />
          <span className="font-bold tracking-[0.18em] text-cyan-100">{value.label}</span>
          <span className="hidden text-[10px] uppercase tracking-widest text-cyan-400/60 sm:inline">
            · {value.seconds < 3600 ? `${value.seconds / 60}m` : `${value.seconds / 3600}h`}
          </span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-cyan-300 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-cyan-400/40 bg-gradient-to-b from-black/95 to-cyan-950/80 p-1 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.8),0_0_24px_-4px_rgba(34,211,238,0.4)] backdrop-blur-xl">
          {/* HUD header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/80">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
              Timeframe
            </span>
            <span className="text-cyan-400/50">jarvis.tf</span>
          </div>
          <div className="py-1">
            {TIMEFRAMES.map((t) => {
              const active = t.label === value.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                  className={cn(
                    "group/item relative flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left font-mono transition-all",
                    active
                      ? "bg-gradient-to-r from-cyan-500/30 via-cyan-400/15 to-transparent text-cyan-100 ring-1 ring-cyan-400/40"
                      : "text-cyan-200/80 hover:bg-cyan-500/10 hover:text-cyan-100",
                  )}
                >
                  {active && (
                    <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,1)]" />
                  )}
                  <span className="flex items-baseline gap-2 pl-2">
                    <span className="text-sm font-bold tracking-[0.15em]">{t.label}</span>
                    <span className="text-[10px] uppercase tracking-widest text-cyan-400/60">
                      {t.desc}
                    </span>
                  </span>
                  {active ? (
                    <Check className="h-3.5 w-3.5 text-cyan-300" />
                  ) : (
                    <span className="font-mono text-[10px] text-cyan-400/40">
                      {t.seconds < 3600 ? `${t.seconds / 60}m` : `${t.seconds / 3600}h`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


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

function JARVISPage() {
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
  // Auto-scroll entre etapas do funil
  const accountSectionRef = useRef<HTMLDivElement>(null);
  const printSectionRef = useRef<HTMLDivElement>(null);
  const slideSectionRef = useRef<HTMLDivElement>(null);
  function scrollToRef(ref: RefObject<HTMLDivElement | null>) {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top - 90;
      window.scrollTo({ top, behavior: "smooth" });
      sfxWhoosh();
    }, 350);
  }



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
    if (typeof window !== "undefined" && localStorage.getItem("jarvis_onboarded_v1") === "1") {
      setTouchedSelect(true);
    }
  }, []);
  useEffect(() => {
    if (chartPrint && touchedSelect && typeof window !== "undefined") {
      localStorage.setItem("jarvis_onboarded_v1", "1");
    }
  }, [chartPrint, touchedSelect]);
  const brokerApproved = brokerStatus === "approved";
  const accountApproved = accountStatus === "approved";
  const printLocked = !brokerApproved || !accountApproved;
  const selectsLocked = !brokerApproved || !accountApproved || !chartPrint;
  const slideLocked = !brokerApproved || !accountApproved || !chartPrint || !touchedSelect;

  // JARVIS voice guide — etapa ativa em foco
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [voiceArmed, setVoiceArmed] = useState(false);
  const [assetPicked, setAssetPicked] = useState(false);
  const [tfPicked, setTfPicked] = useState(false);
  useEffect(() => {
    if (voiceArmed) return;
    const arm = () => {
      setVoiceArmed(true);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [voiceArmed]);
  const activeStep: JarvisStep | null = !voiceArmed
    ? null
    : !brokerApproved
      ? "broker-url"
      : !accountApproved
        ? "account-id"
        : !chartPrint
          ? "screenshot"
          : !assetPicked
            ? "asset"
            : !tfPicked
              ? "timeframe"
              : "slide-hack";

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

  // Auto-scroll para a próxima etapa quando cada uma é concluída
  useEffect(() => {
    if (brokerStatus === "approved") scrollToRef(accountSectionRef);
  }, [brokerStatus]);
  useEffect(() => {
    if (accountStatus === "approved") scrollToRef(printSectionRef);
  }, [accountStatus]);
  useEffect(() => {
    if (chartPrint) scrollToRef(slideSectionRef);
  }, [chartPrint]);


  // Broker verification ----------------------------------------------------
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
    primeAudio();
    sfxScanStart();
    const domain = parseDomain(raw);
    setBrokerDomain(domain);
    setBrokerStatus("checking");
    setBrokerProgress(0);

    const allowed = !!domain;

    const steps = [
      { label: "Resolvendo DNS", ms: 550 },
      { label: "Validando certificado TLS", ms: 650 },
      { label: "Consultando registro CVM/CySEC", ms: 800 },
      { label: "Auditando licença de operação", ms: 750 },
      { label: "Verificando compatibilidade com JARVIS", ms: 700 },
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
        if (i < steps.length - 1) sfxBeep();
        if (i === steps.length - 1) {
          if (allowed) {
            setBrokerStatus("approved");
            sfxSuccess();
            toast.success(`Corretora ${domain} verificada e aprovada`);
          } else {
            setBrokerStatus("rejected");
            sfxError();
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
    const saved = localStorage.getItem("jarvis_broker_url_v1");
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
    localStorage.setItem("jarvis_broker_url_v1", brokerUrl);
    setSavedBrokerUrl(brokerUrl);
    toast.success("URL da corretora salva como padrão");
  }

  function clearBrokerDefault() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("jarvis_broker_url_v1");
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
    if (v.length <= 4) return v;
    if (v.length <= 8) return v.slice(0, 2) + "•••••" + v.slice(-2);
    return v.slice(0, 3) + "••••••••" + v.slice(-3);
  }

  function startAccountCheck(raw: string) {
    clearAccountTimers();
    primeAudio();
    sfxScanStart();
    const v = raw.trim();
    setAccountStatus("checking");
    setAccountProgress(0);
    setAccountMeta(null);

    // Accept any non-empty account ID (numeric, alphanumeric, uuid, dashes, etc.)
    const valid = Boolean(v && v.length >= 2);

    const steps = [
      { label: "Conectando à API da corretora", ms: 600 },
      { label: "Autenticando ID da conta", ms: 700 },
      { label: "Sincronizando feed de ativos em tempo real", ms: 850 },
      { label: "Validando permissões de leitura", ms: 700 },
      { label: "Indexando book L2 na neural JARVIS", ms: 800 },
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
        if (i < steps.length - 1) sfxBeep();
        if (i === steps.length - 1) {
          if (valid) {
            setAccountStatus("approved");
            setAccountMeta({
              masked: maskAccountId(v),
              assets: 124 + Math.floor(Math.random() * 40),
              latency: 9 + Math.floor(Math.random() * 14),
              tier: "Pro · Tempo Real",
            });
            sfxSuccess();
            toast.success("ID da conta autenticado — feed em tempo real ativo");
          } else {
            setAccountStatus("rejected");
            sfxError();
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
    const saved = localStorage.getItem("jarvis_account_id_v1");
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
    localStorage.setItem("jarvis_account_id_v1", accountId);
    setSavedAccountId(accountId);
    toast.success("ID da conta salvo como padrão");
  }

  function clearAccountDefault() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("jarvis_account_id_v1");
    setSavedAccountId(null);
    toast.message("ID padrão removido");
  }





  function startPrintScan() {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setScanningPrint(true);
    setScanProgress(0);
    sfxSonar();
    const startT = Date.now();
    const duration = 2600;
    let lastTick = 0;
    scanTimerRef.current = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - startT) / duration) * 100));
      setScanProgress(p);
      if (p - lastTick >= 10) {
        lastTick = p;
        sfxScanTick();
      }
      if (p >= 100) {
        if (scanTimerRef.current) clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
        setScanningPrint(false);
        sfxSuccess();
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
      sfxUpload();
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
    idle: "JARVIS em standby",
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
    sfxType();
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

  async function runJARVIS() {
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
          [`> jarvis --target=${asset} --tf=${tf.label} --mode=scalp`, "ok"],
          [`[boot] Iniciando núcleo neural JARVIS v4.2.1`, "info"],
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
          [`[ai] Carregando modelo JARVIS-Transformer 12.4B`, "info"],
          [`[ai] Fusion: price-action + orderflow + news + onchain`, "info"],
          [`[ai] Backtest últimas 50k velas ............. 87.3% win`, "ok"],
          [`[ai] Monte Carlo 10.000 cenários — EV positiva`, "ok"],
          [`[ai] Confiança final calculada`, "ok"],
        ],
      },
    ];

    const total = steps.reduce((a, s) => a + s.ms, 0);
    let elapsed = 0;

    const phaseSfx: Record<Phase, (() => void) | undefined> = {
      idle: undefined,
      connecting: sfxConnecting,
      scanning: sfxSonar,
      intercepting: sfxIntercept,
      news: sfxNews,
      deep: sfxNeural,
      signal: undefined,
    };

    for (const step of steps) {
      setPhase(step.phase);
      phaseSfx[step.phase]?.();
      // pequena rajada de whoosh ao revelar painéis correspondentes
      if (step.phase === "scanning") sfxWhoosh();
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
    sfxSignalReady();
    stopAutoScroll();
  }

  function stop() {
    sfxAbort();
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
    <AppLayout title="JARVIS — AI Scalper">
      <div className="grid w-full max-w-full gap-4 overflow-x-hidden lg:grid-cols-12">
        {/* Hero / Controls */}
        <div className="min-w-0 lg:col-span-12">
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#070b10] p-4 text-cyan-200 shadow-[0_0_60px_-15px_rgba(34,211,238,0.4)] sm:p-5">
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(34,211,238,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.6)_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative flex flex-col gap-4">
              <JarvisVoice step={activeStep} muted={voiceMuted} onToggleMute={() => setVoiceMuted((m) => !m)} />
              <BrokerUrlGate
                url={brokerUrl}
                setUrl={setBrokerUrl}
                status={brokerStatus}
                progress={brokerProgress}
                steps={brokerSteps}
                domain={brokerDomain}
                savedUrl={savedBrokerUrl}
                onStart={startBrokerCheck}
                onReset={resetBroker}
                onSaveDefault={saveBrokerDefault}
                onClearDefault={clearBrokerDefault}
              />

              <div
                ref={accountSectionRef}
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
                  exampleId="195059771"
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
                ref={printSectionRef}

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
                            <span>jarvis.neural</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
              <div ref={slideSectionRef} className="grid w-full grid-cols-2 gap-2 sm:gap-3 lg:flex lg:w-auto lg:flex-wrap lg:items-end">
                <Field label="Ativo" locked={selectsLocked} hint={!brokerApproved ? "Verifique a corretora" : "Envie o print primeiro"}>
                  <AssetPickerDialog
                    value={asset}
                    onChange={(v) => {
                      setAsset(v);
                      setTouchedSelect(true);
                      setAssetPicked(true);
                    }}
                    disabled={running || selectsLocked}
                  />
                </Field>

                <Field label="Tempo" locked={selectsLocked}>
                  <TimeframePicker
                    value={tf}
                    onChange={(t) => {
                      setTf(t);
                      setTouchedSelect(true);
                      setTfPicked(true);
                    }}
                    disabled={running || selectsLocked}
                    locked={selectsLocked}
                  />
                </Field>

                {!running ? (
                  <SlideToHack
                    onUnlock={runJARVIS}
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
            <Panel title="Terminal JARVIS" icon={Terminal}>
              <div
                ref={logRef}
                className="h-[320px] overflow-y-auto rounded-md bg-[#04070a] p-3 font-mono text-[11px] leading-relaxed sm:h-[440px] sm:p-4 sm:text-[12.5px]"
              >
                {logs.length === 0 && (
                  <div className="text-cyan-500/40">
                    $ inicializando núcleo JARVIS...
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
              Nenhum sinal ativo. Inicie uma análise para que a JARVIS gere o próximo scalp.
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
          brokerUrl={brokerUrl || savedBrokerUrl || (brokerDomain ? `https://${brokerDomain}` : "")}
          onClose={() => {
            // força recarregar a página /jarvis do zero
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
  brokerUrl,
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
  brokerUrl?: string;
  onClose: () => void;
}) {
  const isBuy = signal.side === "BUY";
  const targetBrokerUrl = brokerUrl?.trim()
    ? (brokerUrl.startsWith("http") ? brokerUrl : `https://${brokerUrl}`)
    : "";
  
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestClose = () => {
    sfxAlert();
    setConfirmOpen(true);
  };

  useEffect(() => {
    sfxWhoosh();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sfxAlert();
        setConfirmOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const accentHex = isBuy ? "#22d3ee" : "#ef4444";
  const accentHex2 = isBuy ? "#7dffd4" : "#fb923c";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: "rgba(2,6,10,0.78)" }}
      onClick={requestClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-3xl border bg-gradient-to-b from-[#050a12] via-[#070b14] to-[#04080d] shadow-2xl",
          isBuy
            ? "border-cyan-400/50 shadow-[0_0_120px_-10px_rgba(34,211,238,0.7)]"
            : "border-red-500/50 shadow-[0_0_120px_-10px_rgba(239,68,68,0.7)]",
        )}
      >
        {/* Ambient gradient orb */}
        <div
          className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl animate-pulse"
          style={{ background: `radial-gradient(circle, ${accentHex}55 0%, transparent 70%)` }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(125,211,252,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.6)_1px,transparent_1px)] [background-size:24px_24px]" />
        {/* Corner brackets */}
        <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2" style={{ borderColor: `${accentHex}aa` }} />
        <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2" style={{ borderColor: `${accentHex}aa` }} />
        <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2" style={{ borderColor: `${accentHex}aa` }} />
        <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2" style={{ borderColor: `${accentHex}aa` }} />

        <button
          onClick={requestClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-30 rounded-full bg-white/5 p-1.5 text-white/60 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Confirmação ao fechar */}
        {confirmOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
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
          {/* Header HUD */}
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.28em]">
            <div className="flex items-center gap-2" style={{ color: accentHex }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: accentHex }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: accentHex }} />
              </span>
              J.A.R.V.I.S. // SIGNAL LOCKED
            </div>
            <div className="text-white/30">#{Math.floor(Math.random() * 9000 + 1000)}</div>
          </div>

          {/* 3D Floating Signal Icon */}
          <Signal3DIcon isBuy={isBuy} />

          {/* Side big */}
          <div className="text-center">
            <div className="relative inline-block">
              <div
                className="font-mono text-5xl font-black tracking-tight text-white sm:text-6xl"
                style={{
                  textShadow: `0 0 30px ${accentHex}, 0 0 60px ${accentHex}80`,
                  letterSpacing: "0.02em",
                }}
              >
                {signal.side}
              </div>
              <div
                className="absolute -inset-x-4 -bottom-1 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)` }}
              />
            </div>
            <div className="mt-3 font-mono text-lg font-bold tracking-wider text-white/90">{asset}</div>
            <div className="mt-1 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
              <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-white/70">{tf}</span>
              <span>expira às {signal.expiry}</span>
            </div>
          </div>

          {/* Confidence bar — HUD style */}
          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-3">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
              <span className="text-white/50">Confiança Neural</span>
              <span className="font-bold tabular-nums" style={{ color: accentHex }}>
                {signal.confidence.toString().padStart(2, "0")}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-white/5">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${signal.confidence}%`,
                  background: `linear-gradient(90deg, ${accentHex} 0%, ${accentHex2} 100%)`,
                  boxShadow: `0 0 12px ${accentHex}`,
                }}
              />
            </div>
            {/* Tick markers */}
            <div className="mt-1 flex justify-between font-mono text-[8px] text-white/20">
              {[0, 25, 50, 75, 100].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Level label="Entrada" value={signal.entry} tone="white" />
            <Level label="Stop Loss" value={signal.sl} tone="red" />
            <Level label="Take Profit" value={signal.tp} tone="green" />
          </div>

          {/* Data telemetry strip */}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1 w-1 animate-pulse rounded-full" style={{ background: accentHex }} />
              feed live
            </span>
            <span>lat: 12ms</span>
            <span>vol: ●●●○○</span>
          </div>

          {/* CTA */}
          <a
            href={targetBrokerUrl || undefined}
            target={targetBrokerUrl ? "_blank" : undefined}
            rel={targetBrokerUrl ? "noopener noreferrer" : undefined}
            onClick={(e) => {
              if (!targetBrokerUrl) {
                e.preventDefault();
              }
              sfxSuccess();
              const txt = `${signal.side} ${asset} @ ${signal.entry} | SL ${signal.sl} | TP ${signal.tp}`;
              navigator.clipboard?.writeText(txt).catch(() => {});
              toast.success("Sinal copiado", { description: targetBrokerUrl ? "Abrindo corretora..." : "Sinal copiado para a área de transferência!" });
            }}
            className={cn(
              "group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.18em] text-black transition-all hover:scale-[1.02]",
            )}
            style={{
              background: `linear-gradient(135deg, ${accentHex} 0%, ${accentHex2} 100%)`,
              boxShadow: `0 0 40px -5px ${accentHex}, inset 0 1px 0 rgba(255,255,255,0.4)`,
            }}
          >
            {/* Shimmer */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <Copy className="relative h-4 w-4" /> <span className="relative">Copiar Sinal</span>
            <ExternalLink className="relative h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5" />
          </a>

          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/40">
            <ShieldAlert className="h-3 w-3" /> Use gestão de risco — máx 1% por operação
          </div>
        </div>
      </div>
    </div>
  );
}

function Signal3DIcon({ isBuy }: { isBuy: boolean }) {
  const accent = isBuy ? "#22d3ee" : "#ef4444";
  const accent2 = isBuy ? "#a7f3d0" : "#fb923c";
  const accentDark = isBuy ? "#0e7490" : "#991b1b";

  return (
    <div className="relative mx-auto my-6 flex h-44 w-44 items-center justify-center">
      {/* Rotating outer ring with notches */}
      <svg className="absolute inset-0 h-full w-full animate-[spin_18s_linear_infinite]" viewBox="0 0 200 200">
        <defs>
          <radialGradient id={`ringGrad-${isBuy}`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 6" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x1 = 100 + Math.cos(a) * 84;
          const y1 = 100 + Math.sin(a) * 84;
          const x2 = 100 + Math.cos(a) * 90;
          const y2 = 100 + Math.sin(a) * 90;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeOpacity="0.6" strokeWidth="1.5" />;
        })}
      </svg>

      {/* Counter-rotating mid ring */}
      <svg className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] animate-[spin_12s_linear_infinite_reverse]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="78" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="14 4 2 4" />
        <circle cx="100" cy="8" r="3" fill={accent} />
        <circle cx="192" cy="100" r="2" fill={accent2} />
      </svg>

      {/* Pulsing glow ring */}
      <div
        className="absolute inset-6 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, ${accent}50 0%, transparent 65%)`,
          filter: "blur(8px)",
        }}
      />

      {/* 3D core orb */}
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${accent2} 0%, ${accent} 35%, ${accentDark} 100%)`,
          boxShadow: `
            0 0 40px ${accent}aa,
            0 0 80px ${accent}66,
            inset -8px -10px 20px rgba(0,0,0,0.5),
            inset 8px 10px 20px rgba(255,255,255,0.25)
          `,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute left-3 top-2 h-6 w-6 rounded-full opacity-70 blur-md"
          style={{ background: "rgba(255,255,255,0.8)" }}
        />
        {/* Arrow */}
        {isBuy ? (
          <TrendingUp className="relative h-12 w-12 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" strokeWidth={2.5} />
        ) : (
          <TrendingDown className="relative h-12 w-12 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" strokeWidth={2.5} />
        )}
        {/* bottom rim shadow for 3D depth */}
        <div
          className="pointer-events-none absolute -bottom-4 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full blur-md"
          style={{ background: `${accent}aa`, opacity: 0.7 }}
        />
      </div>

      {/* Orbiting particles */}
      <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
        <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: accent2, boxShadow: `0 0 10px ${accent}` }} />
      </div>
      <div className="absolute inset-0 animate-[spin_10s_linear_infinite_reverse]">
        <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
      </div>
      <div className="absolute inset-0 animate-[spin_14s_linear_infinite]">
        <div className="absolute right-2 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full" style={{ background: accent2 }} />
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
      sfxPowerUp();
      setTimeout(() => onUnlock(), 480);
    } else {
      setX(0);
      sfxClick();
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
  allowedBrokers?: string[];
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Only trigger verification when a valid TLD is present (.com, .net, .com.br, .online, etc.)
  // Accepts 2-24 char TLDs, optionally followed by a country code (.com.br, .co.uk...)
  const TLD_RE = /\.[a-z]{2,24}(?:\.[a-z]{2,8})?(?:[\/:?#]|$)/i;
  function trigger(value: string) {
    setUrl(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const cleaned = value.trim().replace(/^https?:\/\//i, "");
    if (cleaned.length >= 4 && TLD_RE.test(cleaned)) {
      debounceRef.current = setTimeout(() => onStart(value), 450);
    }
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
                "JARVIS é compatível com qualquer corretora do mercado."}
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
            <ShieldAlert className="h-3.5 w-3.5" /> URL Inválida
          </div>
          <p>
            A URL <span className="font-mono">{domain ?? "informada"}</span> é inválida. Digite o endereço da sua corretora (ex: app.suacorretora.com) para liberar o scalper neural.
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function trigger(value: string) {
    setAccountId(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => onStart(value.trim()), 350);
    }
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
                "A JARVIS precisa do ID da sua conta para puxar os dados dos ativos em tempo real diretamente da sua corretora."}
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && accountId.trim().length >= 2) {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              onStart(accountId.trim());
            }
          }}
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
    "Opções (OTC)": [],
    Forex: [],
    "Ações": [],
    Cripto: [],
    Commodities: [],
    ETFs: [],
    "Índices": [],
  };
  filtered.forEach((a) => {
    if (grouped[a.category]) {
      grouped[a.category].push(a);
    }
  });

  const tabs: ("Todos" | AssetCategory)[] = [
    "Todos",
    "Opções (OTC)",
    "Forex",
    "Ações",
    "Cripto",
    "Commodities",
    "ETFs",
    "Índices",
  ];

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

