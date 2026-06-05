import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";

import brokerUrlAsset from "@/assets/iara-audio/broker-url.mp3.asset.json";
import accountIdAsset from "@/assets/iara-audio/account-id.mp3.asset.json";
import assetAsset from "@/assets/iara-audio/asset.mp3.asset.json";
import timeframeAsset from "@/assets/iara-audio/timeframe.mp3.asset.json";
import screenshotAsset from "@/assets/iara-audio/screenshot.mp3.asset.json";
import slideHackAsset from "@/assets/iara-audio/slide-hack.mp3.asset.json";

export type JarvisStep =
  | "broker-url"
  | "account-id"
  | "screenshot"
  | "asset"
  | "timeframe"
  | "slide-hack";

const STEP_META: Record<JarvisStep, { url: string; caption: string }> = {
  "broker-url": { url: brokerUrlAsset.url, caption: "Adicione o link da sua corretora." },
  "account-id": { url: accountIdAsset.url, caption: "Adicione o ID da sua conta na corretora." },
  screenshot: { url: screenshotAsset.url, caption: "Envie um print do gráfico." },
  asset: { url: assetAsset.url, caption: "Selecione um ativo." },
  timeframe: { url: timeframeAsset.url, caption: "Escolha um tempo." },
  "slide-hack": { url: slideHackAsset.url, caption: "Arraste para o lado para ativar o hack." },
};

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    try {
      const Ctor =
        (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      sharedCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (sharedCtx.state === "suspended") void sharedCtx.resume();
  return sharedCtx;
}

export function JarvisVoice({ step, muted, onToggleMute }: { step: JarvisStep | null; muted: boolean; onToggleMute: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState<string>("");
  const lastStepRef = useRef<JarvisStep | null>(null);

  // play on step change
  useEffect(() => {
    if (!step || muted) return;
    if (lastStepRef.current === step) return;
    lastStepRef.current = step;
    const meta = STEP_META[step];
    setCaption(meta.caption);

    const audio = audioRef.current;
    if (!audio) return;
    audio.src = meta.url;
    audio.currentTime = 0;

    // wire analyser once
    const ctx = getCtx();
    if (ctx && !srcRef.current) {
      try {
        const src = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.78;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        srcRef.current = src;
        analyserRef.current = analyser;
      } catch {
        /* ignore */
      }
    }

    const p = audio.play();
    if (p) p.then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [step, muted]);

  // render wave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const data = new Uint8Array(64);
    let t = 0;

    const draw = () => {
      t += 0.04;
      const W = canvas.width;
      const H = canvas.height;
      ctx2d.clearRect(0, 0, W, H);

      const analyser = analyserRef.current;
      let bins = data;
      if (analyser && playing) {
        analyser.getByteFrequencyData(bins);
      } else {
        // idle: gentle sine animation
        for (let i = 0; i < bins.length; i++) {
          bins[i] = 30 + Math.sin(t * 1.2 + i * 0.35) * 18 + Math.sin(t * 0.6 + i * 0.13) * 10;
        }
      }

      const cx = W / 2;
      const cy = H / 2;
      const N = bins.length;

      // 3D minimalistic stacked rings (perspective)
      const layers = 5;
      for (let L = layers - 1; L >= 0; L--) {
        const depth = L / (layers - 1); // 0..1
        const ySquash = 0.32 + depth * 0.08;
        const radiusBase = Math.min(W, H) * (0.18 + depth * 0.05);
        const yOffset = (L - (layers - 1) / 2) * H * 0.05;
        const alpha = (1 - depth) * 0.85 + 0.1;

        // ring path
        ctx2d.beginPath();
        for (let i = 0; i <= N; i++) {
          const idx = i % N;
          const a = (idx / N) * Math.PI * 2 - Math.PI / 2;
          const v = bins[idx] / 255;
          const r = radiusBase + v * Math.min(W, H) * 0.22 * (1 - depth * 0.5);
          const x = cx + Math.cos(a) * r;
          const y = cy + yOffset + Math.sin(a) * r * ySquash;
          if (i === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
        }
        ctx2d.closePath();
        ctx2d.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.55})`;
        ctx2d.lineWidth = (1 - depth) * 2.2 * dpr + 0.6;
        ctx2d.shadowColor = "rgba(34, 211, 238, 0.7)";
        ctx2d.shadowBlur = (1 - depth) * 18 * dpr;
        ctx2d.stroke();
      }
      ctx2d.shadowBlur = 0;

      // central bar wave (mirrored)
      const barW = (W * 0.6) / N;
      const startX = (W - barW * N) / 2;
      for (let i = 0; i < N; i++) {
        const v = bins[i] / 255;
        const h = Math.max(2 * dpr, v * H * 0.28);
        const x = startX + i * barW;
        const grad = ctx2d.createLinearGradient(0, cy - h, 0, cy + h);
        grad.addColorStop(0, "rgba(165, 243, 252, 0.95)");
        grad.addColorStop(0.5, "rgba(34, 211, 238, 0.85)");
        grad.addColorStop(1, "rgba(34, 211, 238, 0.2)");
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(x + barW * 0.18, cy - h / 2, barW * 0.55, h);
      }

      // center dot (pulse)
      const energy =
        bins.reduce((a, b) => a + b, 0) / (bins.length * 255);
      ctx2d.beginPath();
      ctx2d.arc(cx, cy, 4 * dpr + energy * 12 * dpr, 0, Math.PI * 2);
      ctx2d.fillStyle = "rgba(165, 243, 252, 0.9)";
      ctx2d.shadowColor = "rgba(34, 211, 238, 1)";
      ctx2d.shadowBlur = 24 * dpr;
      ctx2d.fill();
      ctx2d.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [playing]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/40 via-[#04080d] to-[#04080d] p-3 shadow-[0_0_60px_-20px_rgba(34,211,238,0.55)]">
      {/* grid backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(34,211,238,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.6)_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* corner brackets */}
      <div className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-cyan-300/60" />
      <div className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-cyan-300/60" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-cyan-300/60" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-cyan-300/60" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-cyan-400/30 bg-black/40 px-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              playing ? "animate-pulse bg-emerald-300 shadow-[0_0_8px_2px_rgba(110,231,183,0.8)]" : "bg-cyan-400/60",
            )}
          />
          JARVIS {playing ? "• Falando" : "• Online"}
        </div>

        <div className="relative h-14 flex-1 overflow-hidden rounded-lg bg-black/40 ring-1 ring-cyan-500/20">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>

        <button
          onClick={onToggleMute}
          aria-label={muted ? "Ativar voz" : "Silenciar voz"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-black/40 text-cyan-200 transition hover:bg-cyan-500/15"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {caption && (
        <div
          key={caption}
          className="relative mt-2 animate-fade-in text-center font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/90 sm:text-xs"
        >
          <span className="inline-block bg-gradient-to-r from-cyan-200 via-white to-cyan-200 bg-clip-text text-transparent">
            “{caption}”
          </span>
        </div>
      )}

      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        crossOrigin="anonymous"
        preload="auto"
      />
    </div>
  );
}
